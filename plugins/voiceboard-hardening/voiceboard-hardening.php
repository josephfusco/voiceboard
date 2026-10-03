<?php
/**
 * Plugin Name:       Voiceboard Hardening
 * Description:       Site hardening for a public Voiceboard site: the users endpoint is closed to visitors who aren't logged in, so it can't list usernames.
 * Requires Plugins:  voiceboard
 * License:           GPL-3.0-or-later
 * Copyright (C) 2026 Joseph M. Fusco III. See LICENSE in Voiceboard for the attribution terms.
 *
 * Bundled with Voiceboard and loaded automatically. Turn it off with the voiceboard_load_bundled_module filter.
 */

defined( 'ABSPATH' ) || exit;
if ( defined( 'VOICEBOARD_HARDENING' ) ) {
	return;
}
define( 'VOICEBOARD_HARDENING', __FILE__ );

add_filter(
	'rest_endpoints',
	static function ( array $endpoints ): array {
		if ( ! is_user_logged_in() ) {
			unset( $endpoints['/wp/v2/users'], $endpoints['/wp/v2/users/(?P<id>[\d]+)'] );
		}
		return $endpoints;
	}
);
