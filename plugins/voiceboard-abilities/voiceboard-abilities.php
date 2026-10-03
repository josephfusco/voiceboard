<?php
/**
 * Plugin Name:       Voiceboard Abilities
 * Description:       Read-only abilities (hosting instructions, build a board URL) for assistants that call tools through the MCP Adapter.
 * Requires Plugins:  voiceboard
 * License:           GPL-2.0-or-later
 *
 * Bundled with Voiceboard and loaded automatically. Uses the Abilities API (core since 6.9);
 * on older WordPress these hooks never fire.
 */

defined( 'ABSPATH' ) || exit;
if ( defined( 'VOICEBOARD_ABILITIES' ) ) {
	return;
}
define( 'VOICEBOARD_ABILITIES', __FILE__ );

add_action(
	'wp_abilities_api_init',
	static function () {
		$read_only = array(
			'annotations'  => array( 'readonly' => true ),
			'show_in_rest' => true,
			'mcp'          => array( 'public' => true ),
		);

		wp_register_ability(
			'voiceboard/get-instructions',
			array(
				'label'               => __( 'Get hosting instructions', 'voiceboard' ),
				'description'         => __( 'How to host games on this board: the URL format, every parameter, and examples.', 'voiceboard' ),
				'category'            => 'voiceboard',
				'output_schema'       => array( 'type' => 'string' ),
				'execute_callback'    => static fn () => voiceboard_instructions(),
				'permission_callback' => '__return_true',
				'meta'                => $read_only,
			)
		);

		wp_register_ability(
			'voiceboard/build-url',
			array(
				'label'               => __( 'Build a board URL', 'voiceboard' ),
				'description'         => __( 'Turns board parameters (g, st, q, c, a, p, add, and so on) into a correctly encoded URL to open on the screen.', 'voiceboard' ),
				'category'            => 'voiceboard',
				'input_schema'        => array(
					'type'                 => 'object',
					'additionalProperties' => array( 'type' => array( 'string', 'number' ) ),
				),
				'output_schema'       => array( 'type' => 'string' ),
				'execute_callback'    => static fn ( $params = array() ) => voiceboard_url() . ( $params ? '?' . http_build_query( (array) $params, '', '&', PHP_QUERY_RFC3986 ) : '' ),
				'permission_callback' => '__return_true',
				'meta'                => $read_only,
			)
		);
	}
);
