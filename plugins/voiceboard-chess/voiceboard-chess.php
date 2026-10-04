<?php
/**
 * Plugin Name:       Voiceboard Chess
 * Description:       Chess by voice for Voiceboard. The board replays the move list with real rules and tells the assistant the position and legal moves.
 * Requires Plugins:  voiceboard
 * License:           GPL-3.0-or-later
 * Copyright (C) 2026 Joseph M. Fusco III. See LICENSE in Voiceboard for the attribution terms.
 *
 * Bundled with Voiceboard and loaded automatically; copy this folder to wp-content/plugins to run it on its own.
 */

defined( 'ABSPATH' ) || exit;
if ( defined( 'VOICEBOARD_CHESS' ) ) {
	return; // Already loaded (bundled and standalone copies both present).
}
define( 'VOICEBOARD_CHESS', __FILE__ );

add_action(
	'voiceboard_register',
	static function () {
		voiceboard_register_module(
			'chess',
			array(
				'scripts'      => array( plugins_url( 'chess.js', __FILE__ ) ),
				'instructions' => (string) file_get_contents( __DIR__ . '/instructions.md' ),
				'order'        => 30,
			)
		);
	}
);
