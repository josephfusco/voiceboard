<?php
/**
 * Plugin Name:       Voiceboard
 * Description:       Voice-hosted game boards for the car screen. A voice assistant opens /board/?… URLs; the page renders them.
 * x-release-please-start-version
 * Version:           0.11.0
 * x-release-please-end
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * License:           GPL-3.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain:       voiceboard
 *
 * Copyright (C) 2026 Joseph M. Fusco III. Licensed under the GPL v3 or later with additional
 * attribution terms; see LICENSE.
 */

defined( 'ABSPATH' ) || exit;

define( 'VOICEBOARD_FILE', __FILE__ );

// Core: the board, its routes, screen reporting, and the module registry. Everything else
// (games, effects, sessions, presence, abilities) is a module in plugins/, built on these hooks.
require_once __DIR__ . '/includes/modules.php';
require_once __DIR__ . '/includes/screens.php';
require_once __DIR__ . '/includes/hardening.php';

// Modules clean up scheduled work here (the sessions module stops its pruning).
register_deactivation_hook( __FILE__, static fn () => do_action( 'voiceboard_deactivate' ) );

/**
 * The board's path below the site root ("" = the root itself).
 */
function voiceboard_path(): string {
	return trim( (string) apply_filters( 'voiceboard_path', get_option( 'voiceboard_path', 'board' ) ), '/' );
}

/**
 * The board's absolute URL on the host the visitor actually used, e.g. https://example.com/board/.
 *
 * A site can answer on several domains; instructions and redirects should match the one that was typed.
 */
function voiceboard_url(): string {
	$path = voiceboard_path();
	$url  = home_url( '' === $path ? '/' : "/$path/" );
	$host = preg_replace( '/[^a-z0-9.\-:]/i', '', (string) ( $_SERVER['HTTP_HOST'] ?? '' ) );
	return $host ? (string) preg_replace( '#^(https?://)[^/]+#', '${1}' . $host, $url ) : $url;
}

/**
 * Assistant instructions: the core llms.txt with each module's section in place of {modules},
 * and this site's board URL filled in.
 */
function voiceboard_instructions(): string {
	$sections = array_filter( array_map( static fn ( $module ) => trim( (string) $module['instructions'] ), voiceboard_modules() ) );
	$text     = str_replace( '{modules}', implode( "\n\n", $sections ), (string) file_get_contents( __DIR__ . '/llms.txt' ) );
	return str_replace( '{board}', voiceboard_url(), (string) apply_filters( 'voiceboard_instructions', $text ) );
}

/**
 * Settings → Reading → "Voiceboard path". Blank serves the board at the site root.
 */
add_action(
	'admin_init',
	static function () {
		register_setting(
			'reading',
			'voiceboard_path',
			array(
				'type'              => 'string',
				'default'           => 'board',
				'sanitize_callback' => static fn ( $value ) => trim( sanitize_text_field( $value ), '/' ),
			)
		);
		add_settings_field(
			'voiceboard_path',
			__( 'Voiceboard path', 'voiceboard' ),
			static function () {
				printf(
					'<code>%s/</code><input name="voiceboard_path" id="voiceboard_path" type="text" class="regular-text code" value="%s"><p class="description">%s</p>',
					esc_html( untrailingslashit( home_url() ) ),
					esc_attr( get_option( 'voiceboard_path', 'board' ) ),
					esc_html__( 'Leave blank to serve the board at the site root. Otherwise the home page redirects here.', 'voiceboard' )
				);
			},
			'reading'
		);
	}
);

/**
 * Routes: the board, /llms.txt, and a home page redirect to the board.
 *
 * Runs on parse_request, before WP_Query, so board params like p= and w= are
 * never mistaken for WordPress query vars. No rewrite rules, nothing to flush.
 */
add_action(
	'parse_request',
	static function ( WP $wp ) {
		$home    = trim( (string) wp_parse_url( home_url(), PHP_URL_PATH ), '/' );
		$request = trim( (string) wp_parse_url( wp_unslash( $_SERVER['REQUEST_URI'] ?? '' ), PHP_URL_PATH ), '/' );
		$route   = static fn ( string $path ): string => trim( "$home/$path", '/' );

		// Leave WordPress's own home URLs alone (?p=123, ?s=, ?preview=…), even when the board
		// lives at the root. The board reuses p= and w= for players and wagers, which are never numeric.
		if ( $route( '' ) === $request ) {
			$wp_params = array_filter(
				array_intersect( array_keys( $_GET ), $wp->public_query_vars ), // phpcs:ignore WordPress.Security.NonceVerification
				static fn ( $key ) => ! in_array( $key, array( 'p', 'w' ), true ) || is_numeric( $_GET[ $key ] ) // phpcs:ignore WordPress.Security.NonceVerification
			);
			if ( $wp_params ) {
				return;
			}
		}

		// Module routes below the board path: array( 'regex' => callback( $matches ) ). The callback sends the response.
		foreach ( (array) apply_filters( 'voiceboard_routes', array() ) as $pattern => $callback ) {
			if ( preg_match( '#^' . preg_quote( $route( voiceboard_path() ), '#' ) . '/?' . $pattern . '$#', $request, $match ) ) {
				voiceboard_common_headers();
				call_user_func( $callback, $match );
				exit;
			}
		}

		switch ( $request ) {
			case $route( voiceboard_path() ):
				$html       = (string) file_get_contents( __DIR__ . '/index.html' );
				$import_map = voiceboard_import_map();
				// Every registered module, and the import map they use to reach the core API.
				$html = preg_replace_callback( '#<script type="importmap">.*?</script>#s', static fn () => "<script type=\"importmap\">$import_map</script>", $html );
				$html = preg_replace_callback( '#<meta name="voiceboard-modules"[^>]*>#', static fn () => sprintf( '<meta name="voiceboard-modules" content="%s">', esc_attr( implode( ' ', voiceboard_module_scripts() ) ) ), $html );
				// Versioned entry points; everything they import is versioned through the import map.
				$html = str_replace(
					array( 'href="board.css"', 'src="js/main.js"' ),
					array( 'href="' . esc_attr( voiceboard_versioned( plugins_url( 'board.css', __FILE__ ) ) ) . '"', 'src="' . esc_attr( voiceboard_versioned( plugins_url( 'js/main.js', __FILE__ ) ) ) . '"' ),
					$html
				);
				// Path-only <base>, so relative assets load from the plugin on whatever host served the page.
				// The REST base tells the board where to report screens (sessions, URL log, presence).
				$html = str_replace(
					'<head>',
					sprintf(
						"<head>\n\t<base href=\"%s\">\n\t<meta name=\"voiceboard-api\" content=\"%s\">",
						esc_url( wp_make_link_relative( plugins_url( '/', __FILE__ ) ) ),
						esc_url( wp_make_link_relative( rest_url( 'voiceboard/v1/' ) ) )
					),
					$html
				);
				// Full instructions for assistants that read the page without running JavaScript.
				$html = preg_replace( '#<main id="board">.*?</main>#s', '<main id="board"><pre>' . esc_html( voiceboard_instructions() ) . '</pre></main>', $html );

				// Static shell (state lives in the query string), so it caches. Kept short so a deploy shows up within a minute.
				status_header( 200 );
				header( 'Content-Type: text/html; charset=utf-8' );
				header( 'Cache-Control: public, max-age=60' );
				voiceboard_board_headers();
				echo $html; // phpcs:ignore WordPress.Security.EscapeOutput
				exit;

			// The spoken address ("read example.com/rules, then host trivia"). A browser, which is the car
			// opening the link, gets the board; an assistant fetching the page gets the instructions as text.
			case $route( 'rules' ):
				header( 'Vary: Accept' );
				if ( false !== strpos( (string) ( $_SERVER['HTTP_ACCEPT'] ?? '' ), 'text/html' ) ) {
					header( 'Cache-Control: public, max-age=300' );
					wp_safe_redirect( wp_make_link_relative( voiceboard_url() ), 302, 'Voiceboard' );
					exit;
				}
				// Falls through to the instructions.
			case $route( 'llms.txt' ):
				status_header( 200 );
				header( 'Content-Type: text/plain; charset=utf-8' );
				header( 'Cache-Control: public, max-age=300' );
				voiceboard_common_headers();
				echo voiceboard_instructions(); // phpcs:ignore WordPress.Security.EscapeOutput
				exit;

			case $route( '' ):
				if ( ! apply_filters( 'voiceboard_redirect_home', true ) ) {
					return;
				}
				// Keep any board params ("open example.com/?g=trivia…" still works). Encode what
				// wp_sanitize_redirect() would strip, such as | and ', so choices survive.
				$query = preg_replace_callback(
					'/[^a-z0-9\-~+_.?#=&;,\/:%!*\[\]()@]/i',
					static fn ( $m ) => rawurlencode( $m[0] ),
					(string) wp_unslash( $_SERVER['QUERY_STRING'] ?? '' )
				);
				// Relative, so the visitor stays on the domain they typed.
				wp_safe_redirect( wp_make_link_relative( voiceboard_url() ) . ( '' === $query ? '' : "?$query" ), 302, 'Voiceboard' );
				exit;
		}
	}
);
