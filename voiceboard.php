<?php
/**
 * Plugin Name:       Voiceboard
 * Description:       Voice-hosted game boards for the car screen. A voice assistant opens /board/?… URLs; the page renders them.
 * Version:           0.1.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * License:           GPL-2.0-or-later
 * Text Domain:       voiceboard
 */

defined( 'ABSPATH' ) || exit;

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
					esc_html__( 'Leave blank to serve the board at the site root.', 'voiceboard' )
				);
			},
			'reading'
		);
	}
);

/**
 * Serve the board at the configured path (also filterable via `voiceboard_path`).
 *
 * Runs on parse_request, before WP_Query, so board params like p= and w= are
 * never mistaken for WordPress query vars. No rewrite rules, nothing to flush.
 */
add_action(
	'parse_request',
	static function () {
		$path    = trim( (string) apply_filters( 'voiceboard_path', get_option( 'voiceboard_path', 'board' ) ), '/' );
		$home    = trim( (string) wp_parse_url( home_url(), PHP_URL_PATH ), '/' );
		$request = trim( (string) wp_parse_url( wp_unslash( $_SERVER['REQUEST_URI'] ?? '' ), PHP_URL_PATH ), '/' );

		if ( trim( "$home/$path", '/' ) !== $request ) {
			return;
		}

		// The shell is static and every state lives in the query string, so it caches well.
		status_header( 200 );
		header( 'Content-Type: text/html; charset=utf-8' );
		header( 'Cache-Control: public, max-age=300' );

		// One source of truth: index.html, with a <base> so its relative asset paths resolve to the plugin.
		// Path-only, so assets load from whatever host served the page (no cross-origin module requests).
		$base = sprintf( '<base href="%s">', esc_url( wp_make_link_relative( plugins_url( '/', __FILE__ ) ) ) );
		echo str_replace( '<head>', "<head>\n\t$base", file_get_contents( __DIR__ . '/index.html' ) ); // phpcs:ignore WordPress.Security.EscapeOutput
		exit;
	}
);
