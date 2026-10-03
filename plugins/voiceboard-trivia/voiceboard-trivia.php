<?php
/**
 * Plugin Name:       Voiceboard Trivia
 * Description:       Trivia for Voiceboard: multiple choice or open-ended questions, with turns and reveals.
 * Requires Plugins:  voiceboard
 * License:           GPL-3.0-or-later
 * Copyright (C) 2026 Joseph M. Fusco III. See LICENSE in Voiceboard for the attribution terms.
 *
 * Bundled with Voiceboard and loaded automatically; copy this folder to wp-content/plugins to run it on its own.
 */

defined( 'ABSPATH' ) || exit;
if ( defined( 'VOICEBOARD_TRIVIA' ) ) {
	return; // Already loaded (bundled and standalone copies both present).
}
define( 'VOICEBOARD_TRIVIA', __FILE__ );

add_action(
	'voiceboard_register',
	static function () {
		voiceboard_register_module(
			'trivia',
			array(
				'scripts'      => array( plugins_url( 'trivia.js', __FILE__ ) ),
				'instructions' => (string) file_get_contents( __DIR__ . '/instructions.md' ),
				'order'        => 10,
			)
		);
	}
);
