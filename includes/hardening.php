<?php
/**
 * Small hardening for a public site: security headers on Voiceboard's own responses, and the
 * users endpoint closed to visitors who aren't logged in (it would otherwise list usernames).
 */

defined( 'ABSPATH' ) || exit;

/**
 * Headers for the board page. It loads only same-origin scripts, styles, and API calls.
 */
function voiceboard_board_headers(): void {
	header( "Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'" );
	voiceboard_common_headers();
}

function voiceboard_common_headers(): void {
	header( 'X-Content-Type-Options: nosniff' );
	header( 'Referrer-Policy: strict-origin-when-cross-origin' );
}

add_filter(
	'rest_endpoints',
	static function ( array $endpoints ): array {
		if ( ! is_user_logged_in() && apply_filters( 'voiceboard_hide_users_endpoint', true ) ) {
			unset( $endpoints['/wp/v2/users'], $endpoints['/wp/v2/users/(?P<id>[\d]+)'] );
		}
		return $endpoints;
	}
);
