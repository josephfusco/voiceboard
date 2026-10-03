<?php
/**
 * Plugin Name:       Voiceboard Presence
 * Description:       Shows which boards are open right now, using the Presence API feature plugin: a voiceboard/session/<code> room per game and a voiceboard/cars room for all boards.
 * Requires Plugins:  voiceboard
 * License:           GPL-2.0-or-later
 *
 * Bundled with Voiceboard and loaded automatically. Does nothing unless the Presence API is active.
 */

defined( 'ABSPATH' ) || exit;
if ( defined( 'VOICEBOARD_PRESENCE' ) ) {
	return;
}
define( 'VOICEBOARD_PRESENCE', __FILE__ );

// Every report (including heartbeats) refreshes the board's entry; one that stops reporting expires.
add_action(
	'voiceboard_screen',
	static function ( array $context ) {
		if ( ! function_exists( 'wp_set_presence' ) ) {
			return;
		}
		$client = 'voiceboard-' . $context['car'];
		$who    = array( 'session' => $context['code'], 'app' => $context['state']['app'], 'screen' => $context['state']['screen'], 'browser' => $context['browser'] );
		wp_set_presence( 'voiceboard/cars', $client, $who );
		if ( ! $context['browsing'] ) {
			wp_set_presence( 'voiceboard/session/' . $context['code'], $client, $who );
		}
	}
);

// The page closed: leave both rooms right away.
add_action(
	'voiceboard_leave',
	static function ( array $context ) {
		if ( function_exists( 'wp_remove_presence' ) ) {
			wp_remove_presence( 'voiceboard/cars', 'voiceboard-' . $context['car'] );
			wp_remove_presence( 'voiceboard/session/' . $context['code'], 'voiceboard-' . $context['car'] );
		}
	}
);
