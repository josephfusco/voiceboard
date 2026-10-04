<?php
/**
 * Plugin Name:       Voiceboard Adventure
 * Description:       A story game for Voiceboard: the assistant narrates while the board keeps characters, scenes, and dice.
 * Requires Plugins:  voiceboard
 * License:           GPL-3.0-or-later
 * Copyright (C) 2026 Joseph M. Fusco III. See LICENSE in Voiceboard for the attribution terms.
 *
 * Bundled with Voiceboard and loaded automatically; copy this folder to wp-content/plugins to run it on its own.
 */

defined( 'ABSPATH' ) || exit;
if ( defined( 'VOICEBOARD_ADVENTURE' ) ) {
	return; // Already loaded (bundled and standalone copies both present).
}
define( 'VOICEBOARD_ADVENTURE', __FILE__ );

add_action(
	'voiceboard_register',
	static function () {
		voiceboard_register_module(
			'adventure',
			array(
				'scripts'      => array( plugins_url( 'adventure.js', __FILE__ ) ),
				'instructions' => (string) file_get_contents( __DIR__ . '/instructions.md' ),
				'order'        => 40,
			)
		);
	}
);
