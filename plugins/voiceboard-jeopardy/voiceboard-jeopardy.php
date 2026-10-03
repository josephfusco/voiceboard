<?php
/**
 * Plugin Name:       Voiceboard Jeopardy
 * Description:       A Jeopardy-style category board for Voiceboard.
 * Requires Plugins:  voiceboard
 * License:           GPL-3.0-or-later
 * Copyright (C) 2026 Joseph M. Fusco III. See LICENSE in Voiceboard for the attribution terms.
 *
 * Bundled with Voiceboard and loaded automatically; copy this folder to wp-content/plugins to run it on its own.
 */

defined( 'ABSPATH' ) || exit;
if ( defined( 'VOICEBOARD_JEOPARDY' ) ) {
	return; // Already loaded (bundled and standalone copies both present).
}
define( 'VOICEBOARD_JEOPARDY', __FILE__ );

add_action(
	'voiceboard_register',
	static function () {
		voiceboard_register_module(
			'jeopardy',
			array(
				'scripts'      => array( plugins_url( 'jeopardy.js', __FILE__ ) ),
				'instructions' => (string) file_get_contents( __DIR__ . '/instructions.md' ),
				'order'        => 20,
			)
		);
	}
);
