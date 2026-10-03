<?php
/**
 * Plugin Name:       Voiceboard
 * Description:       Voice-hosted game boards for the car screen. A voice assistant opens /board/?… URLs; the page renders them.
 * x-release-please-start-version
 * Version:           0.1.0
 * x-release-please-end
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * License:           GPL-2.0-or-later
 * Text Domain:       voiceboard
 */

defined( 'ABSPATH' ) || exit;

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
 * Assistant instructions from llms.txt, with this site's board URL filled in.
 */
function voiceboard_instructions(): string {
	return str_replace( '{board}', voiceboard_url(), (string) file_get_contents( __DIR__ . '/llms.txt' ) );
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

		switch ( $request ) {
			case $route( voiceboard_path() ):
				// Static shell (state lives in the query string), so it caches well.
				status_header( 200 );
				header( 'Content-Type: text/html; charset=utf-8' );
				header( 'Cache-Control: public, max-age=300' );

				$html = (string) file_get_contents( __DIR__ . '/index.html' );
				// Path-only <base>, so relative assets load from the plugin on whatever host served the page.
				$html = str_replace( '<head>', sprintf( "<head>\n\t<base href=\"%s\">", esc_url( wp_make_link_relative( plugins_url( '/', __FILE__ ) ) ) ), $html );
				// Full instructions for assistants that read the page without running JavaScript.
				$html = preg_replace( '#<main id="board">.*?</main>#s', '<main id="board"><pre>' . esc_html( voiceboard_instructions() ) . '</pre></main>', $html );
				echo $html; // phpcs:ignore WordPress.Security.EscapeOutput
				exit;

			case $route( 'llms.txt' ):
				status_header( 200 );
				header( 'Content-Type: text/plain; charset=utf-8' );
				header( 'Cache-Control: public, max-age=300' );
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
