<?php
/**
 * Screen reporting. The board posts each screen to /voiceboard/v1/ping; the core validates,
 * rate limits, and sanitizes it, then hands it to modules:
 *
 *   filter voiceboard_screen_check( true|WP_Error, $context )  veto a report (e.g. session ownership)
 *   action voiceboard_screen( $context )                       react to a report (store it, update presence)
 *   filter voiceboard_screen_response( $response, $context )   shape the reply
 *   action voiceboard_leave( $context )                        the board closed (pagehide beacon)
 *
 * $context: car, code, has_code, browsing, beat, state, query, diag, browser.
 * state.note is a module's plain-text summary for the assistant; apps set state.note in pick().
 */

defined( 'ABSPATH' ) || exit;

// Limits can be raised in wp-config.php (the test sites do).
defined( 'VOICEBOARD_PINGS_PER_MIN' ) || define( 'VOICEBOARD_PINGS_PER_MIN', 60 ); // per board
defined( 'VOICEBOARD_IP_PER_MIN' ) || define( 'VOICEBOARD_IP_PER_MIN', 120 );      // per network address, so rotating board IDs doesn't help

/**
 * Session codes and board IDs: lowercase letters, digits, and hyphens, up to 40 characters.
 */
function voiceboard_clean_code( $code ): string {
	return substr( (string) preg_replace( '/[^a-z0-9-]/', '', strtolower( (string) $code ) ), 0, 40 );
}

/**
 * Counts hits per key in a short-lived transient. Network addresses are only ever hashed with
 * the site salt and kept for the length of the window; they're never stored with game data.
 */
function voiceboard_rate_limited( string $key, int $limit, int $window = MINUTE_IN_SECONDS ): bool {
	$key  = 'voiceboard_rate_' . md5( wp_salt() . $key );
	$hits = (int) get_transient( $key );
	set_transient( $key, $hits + 1, $window );
	return $hits >= $limit;
}

function voiceboard_client(): string {
	return (string) ( $_SERVER['REMOTE_ADDR'] ?? '' );
}

/**
 * A short label for the reporting browser, read on the server from the User-Agent.
 */
function voiceboard_browser_label(): string {
	$agent = (string) ( $_SERVER['HTTP_USER_AGENT'] ?? '' );
	if ( preg_match( '#Tesla/(?:feature-)?([\w.]+)#', $agent, $match ) ) {
		return 'Tesla ' . $match[1];
	}
	return preg_match( '#Android.*Automotive#i', $agent ) ? 'Android Automotive' : 'Browser';
}

/**
 * The parts of a screen worth keeping, trimmed and sanitized.
 */
function voiceboard_clean_state( array $state ): array {
	$text    = static fn ( $value, int $max ): string => mb_substr( sanitize_text_field( (string) $value ), 0, $max );
	$players = array();
	foreach ( array_slice( (array) ( $state['players'] ?? array() ), 0, 6 ) as $player ) {
		$players[] = array(
			'name'  => $text( $player['name'] ?? '', 40 ),
			'score' => (int) ( $player['score'] ?? 0 ),
		);
	}
	return array(
		'app'     => $text( $state['app'] ?? '', 20 ),
		'screen'  => $text( $state['screen'] ?? '', 20 ),
		'title'   => $text( $state['title'] ?? '', 80 ),
		'n'       => (int) ( $state['n'] ?? 0 ),
		'of'      => (int) ( $state['of'] ?? 0 ),
		'q'       => $text( $state['q'] ?? '', 500 ),
		'a'       => $text( $state['a'] ?? '', 200 ),
		'r'       => $text( $state['r'] ?? '', 40 ),
		'up'      => $text( $state['up'] ?? '', 40 ),
		// A module's plain-text summary for the assistant (chess: the position and legal moves).
		'note'    => $text( $state['note'] ?? '', 1500 ),
		'players' => $players,
	);
}

/**
 * POST /voiceboard/v1/ping: one per screen, plus a heartbeat (beat=true) while the screen stays open.
 */
function voiceboard_ping( WP_REST_Request $request ) {
	$car = voiceboard_clean_code( $request['car'] );
	if ( '' === $car ) {
		return new WP_Error( 'voiceboard_bad_ping', 'Missing car ID.', array( 'status' => 400 ) );
	}
	if ( voiceboard_rate_limited( "car:$car", VOICEBOARD_PINGS_PER_MIN ) || voiceboard_rate_limited( 'ip:' . voiceboard_client(), VOICEBOARD_IP_PER_MIN ) ) {
		return new WP_Error( 'voiceboard_slow_down', 'Too many pings.', array( 'status' => 429 ) );
	}

	$code  = voiceboard_clean_code( $request['code'] );
	$query = mb_substr( (string) $request['query'], 0, 4000 );
	parse_str( $query, $params );
	$context = array(
		'car'      => $car,
		'code'     => '' !== $code ? $code : "car-$car",
		'has_code' => '' !== $code,
		// Browsing (home page, sidebar taps) without a session code says nothing about how an assistant writes URLs.
		'browsing' => '' === $code && ! array_diff( array_keys( $params ), array( 'g', 'theme', 'lang' ) ),
		'beat'     => (bool) $request['beat'],
		'state'    => voiceboard_clean_state( (array) $request['state'] ),
		'query'    => $query,
		'diag'     => array_slice( array_map( 'sanitize_text_field', (array) $request['diag'] ), 0, 20 ),
		'browser'  => voiceboard_browser_label(),
	);

	$check = apply_filters( 'voiceboard_screen_check', true, $context );
	if ( is_wp_error( $check ) ) {
		return $check;
	}
	do_action( 'voiceboard_screen', $context );
	return apply_filters( 'voiceboard_screen_response', array( 'session' => $context['browsing'] ? null : $context['code'] ), $context );
}

/**
 * POST /voiceboard/v1/bye: sent as the page closes.
 */
function voiceboard_bye( WP_REST_Request $request ): array {
	$car = voiceboard_clean_code( $request['car'] );
	if ( '' !== $car ) {
		$code = voiceboard_clean_code( $request['code'] );
		do_action( 'voiceboard_leave', array( 'car' => $car, 'code' => '' !== $code ? $code : "car-$car" ) );
	}
	return array( 'ok' => true );
}

add_action(
	'rest_api_init',
	static function () {
		// Public, because the car can't log in; limited to requests from this site and rate limited.
		$same_site = static function ( WP_REST_Request $request ): bool {
			$origin = $request->get_header( 'origin' );
			return ! $origin || wp_parse_url( $origin, PHP_URL_HOST ) === wp_parse_url( '//' . ( $_SERVER['HTTP_HOST'] ?? '' ), PHP_URL_HOST );
		};
		register_rest_route( 'voiceboard/v1', '/ping', array( 'methods' => 'POST', 'callback' => 'voiceboard_ping', 'permission_callback' => $same_site ) );
		register_rest_route( 'voiceboard/v1', '/bye', array( 'methods' => 'POST', 'callback' => 'voiceboard_bye', 'permission_callback' => $same_site ) );
	}
);
