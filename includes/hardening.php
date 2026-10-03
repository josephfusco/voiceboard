<?php
/**
 * Security headers on Voiceboard's own responses.
 */

defined( 'ABSPATH' ) || exit;

/**
 * Headers for the board page. Script files, styles, and API calls are same-origin only. Inline
 * scripts are allowed because hosts' edge networks inject bot-detection scripts that change on
 * every request (so no hash can cover them), and blocking those can get real visitors challenged.
 * The board puts no visitor-supplied content into its HTML, so this costs little.
 */
function voiceboard_board_headers(): void {
	header( "Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'" );
	voiceboard_common_headers();
}

function voiceboard_common_headers(): void {
	header( 'X-Content-Type-Options: nosniff' );
	header( 'Referrer-Policy: strict-origin-when-cross-origin' );
}
