<?php
/**
 * Plugin Name:       Voiceboard
 * Description:       Voice-hosted game boards for the car screen. A voice assistant opens /board/?… URLs; the page renders them.
 * Version:           0.2.0
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
 * The board's absolute URL, e.g. https://example.com/board/.
 */
function voiceboard_url(): string {
	$path = voiceboard_path();
	return home_url( '' === $path ? '/' : user_trailingslashit( $path ) );
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
	static function () {
		$home    = trim( (string) wp_parse_url( home_url(), PHP_URL_PATH ), '/' );
		$request = trim( (string) wp_parse_url( wp_unslash( $_SERVER['REQUEST_URI'] ?? '' ), PHP_URL_PATH ), '/' );
		$route   = static fn ( string $path ): string => trim( "$home/$path", '/' );

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
				wp_safe_redirect( voiceboard_url() . ( '' === $query ? '' : "?$query" ), 302, 'Voiceboard' );
				exit;
		}
	}
);
