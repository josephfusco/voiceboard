<?php
/**
 * Plugin Name:       Voiceboard Effects
 * Description:       Countdown timer and confetti for any Voiceboard game.
 * Requires Plugins:  voiceboard
 * License:           GPL-3.0-or-later
 * Copyright (C) 2026 Joseph M. Fusco III. See LICENSE in Voiceboard for the attribution terms.
 *
 * Bundled with Voiceboard and loaded automatically; copy this folder to wp-content/plugins to run it on its own.
 */

defined( 'ABSPATH' ) || exit;
if ( defined( 'VOICEBOARD_EFFECTS' ) ) {
	return; // Already loaded (bundled and standalone copies both present).
}
define( 'VOICEBOARD_EFFECTS', __FILE__ );

add_action(
	'voiceboard_register',
	static function () {
		voiceboard_register_module(
			'effects',
			array(
				'scripts'      => array( plugins_url( 'confetti.js', __FILE__ ), plugins_url( 'timer.js', __FILE__ ), plugins_url( 'auto.js', __FILE__ ) ),
				'instructions' => (string) file_get_contents( __DIR__ . '/instructions.md' ),
				'order'        => 90,
			)
		);
	}
);
