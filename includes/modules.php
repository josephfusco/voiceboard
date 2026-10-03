<?php
/**
 * Module registry. Games, effects, and server features are modules: plugins that register
 * themselves on `voiceboard_register`. The bundled ones in plugins/ load like drop-ins; any of
 * them can also be installed as its own plugin, and then that copy wins.
 */

defined( 'ABSPATH' ) || exit;

/**
 * Registers a module.
 *
 * @param string $name   Unique name, e.g. 'trivia'.
 * @param array  $module {
 *     @type string[] $scripts      ES module URLs the board loads, in order. They import the core as 'voiceboard'.
 *     @type string   $instructions Markdown appended to llms.txt for assistants.
 *     @type int      $order        Lower loads first; games appear in the sidebar in this order. Default 50.
 * }
 */
function voiceboard_register_module( string $name, array $module ): void {
	$GLOBALS['voiceboard_modules'][ $name ] = wp_parse_args(
		$module,
		array(
			'scripts'      => array(),
			'instructions' => '',
			'order'        => 50,
		)
	);
}

/**
 * Every registered module, sorted by order (which is also the board's sidebar order).
 */
function voiceboard_modules(): array {
	if ( ! did_action( 'voiceboard_register' ) ) {
		do_action( 'voiceboard_register' );
	}
	$modules = $GLOBALS['voiceboard_modules'] ?? array();
	uasort( $modules, static fn ( $a, $b ) => $a['order'] <=> $b['order'] );
	return (array) apply_filters( 'voiceboard_modules', $modules );
}

/**
 * The board loads the core runtime and every module script; modules resolve 'voiceboard' through this map.
 */
function voiceboard_import_map(): string {
	$imports = apply_filters( 'voiceboard_import_map', array( 'voiceboard' => wp_make_link_relative( plugins_url( 'js/voiceboard.js', VOICEBOARD_FILE ) ) ) );
	return (string) wp_json_encode( array( 'imports' => $imports ), JSON_UNESCAPED_SLASHES );
}

function voiceboard_module_scripts(): array {
	$scripts = array();
	foreach ( voiceboard_modules() as $module ) {
		foreach ( (array) $module['scripts'] as $url ) {
			$scripts[] = wp_make_link_relative( $url );
		}
	}
	return $scripts;
}

// Bundled modules: plugins/<name>/<name>.php. A copy that's active as its own plugin loads first and wins.
add_action(
	'plugins_loaded',
	static function () {
		foreach ( glob( dirname( VOICEBOARD_FILE ) . '/plugins/*/*.php' ) as $file ) {
			if ( basename( $file, '.php' ) === basename( dirname( $file ) ) && apply_filters( 'voiceboard_load_bundled_module', true, basename( dirname( $file ) ) ) ) {
				require_once $file;
			}
		}
	},
	5
);

// One ability category for every module's abilities.
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
