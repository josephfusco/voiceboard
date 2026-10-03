<?php
/**
 * Abilities API (in core since 6.9): read-only tools an MCP-capable assistant can call through
 * the MCP Adapter. Nothing here runs on older WordPress, where these hooks never fire.
 */

defined( 'ABSPATH' ) || exit;

add_action(
	'wp_abilities_api_categories_init',
	static function () {
		wp_register_ability_category(
			'voiceboard',
			array(
				'label'       => __( 'Voiceboard', 'voiceboard' ),
				'description' => __( 'Voice-hosted game boards for the car screen.', 'voiceboard' ),
			)
		);
	}
);

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

		wp_register_ability(
			'voiceboard/get-transcript',
			array(
				'label'               => __( 'Get a session transcript', 'voiceboard' ),
				'description'         => __( 'Players, scores, the screen showing now, and the questions already asked in a session.', 'voiceboard' ),
				'category'            => 'voiceboard',
				'input_schema'        => array(
					'type'       => 'object',
					'properties' => array(
						'code' => array(
							'type'        => 'string',
							'description' => __( 'The session code from the code= URL parameter.', 'voiceboard' ),
						),
					),
					'required'   => array( 'code' ),
				),
				'output_schema'       => array( 'type' => 'string' ),
				'execute_callback'    => static function ( $input ) {
					$session = voiceboard_session( voiceboard_clean_code( $input['code'] ?? '' ) );
					return $session ? voiceboard_transcript( $session ) : new WP_Error( 'voiceboard_no_session', __( 'No session with that code.', 'voiceboard' ) );
				},
				'permission_callback' => static fn () => current_user_can( 'read' ),
				'meta'                => $read_only,
			)
		);
	}
);
