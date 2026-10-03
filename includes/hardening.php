<?php
/**
 * Security headers on Voiceboard's own responses.
 */

defined( 'ABSPATH' ) || exit;

/**
 * Headers for the board page. It loads only same-origin scripts, styles, and API calls, plus the
 * inline import map, allowed by its hash.
 */
function voiceboard_board_headers( string $import_map_hash = '' ): void {
	header( "Content-Security-Policy: default-src 'self'; script-src 'self' $import_map_hash; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'" );
	voiceboard_common_headers();
}

function voiceboard_common_headers(): void {
	header( 'X-Content-Type-Options: nosniff' );
	header( 'Referrer-Policy: strict-origin-when-cross-origin' );
}
