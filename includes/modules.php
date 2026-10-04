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
 * A version stamp for a plugin file, so browsers fetch fresh copies after each deploy. The host
 * caches these files for a year, and ES modules import each other by plain URL, so without this
 * a car could keep running old code long after a deploy.
 */
function voiceboard_versioned( string $url ): string {
	$file = WP_PLUGIN_DIR . '/' . ltrim( (string) preg_replace( '#^.*?/plugins/#', '', (string) wp_parse_url( $url, PHP_URL_PATH ) ), '/' );
	return wp_make_link_relative( $url ) . ( is_file( $file ) ? '?v=' . filemtime( $file ) : '' );
}

/**
 * Modules resolve 'voiceboard' through this map. It also maps every script under the plugin to its
 * versioned URL, which busts the cache for imports between modules as well.
 */
function voiceboard_import_map(): string {
	$root    = dirname( VOICEBOARD_FILE );
	$imports = array( 'voiceboard' => voiceboard_versioned( plugins_url( 'js/voiceboard.js', VOICEBOARD_FILE ) ) );
	$files   = new RecursiveIteratorIterator( new RecursiveDirectoryIterator( $root, FilesystemIterator::SKIP_DOTS ) );
	foreach ( $files as $file ) {
		$path = substr( $file->getPathname(), strlen( $root ) + 1 );
		if ( 'js' === $file->getExtension() && preg_match( '#^(js|plugins)/#', $path ) ) {
			$url             = plugins_url( $path, VOICEBOARD_FILE );
			$imports[ wp_make_link_relative( $url ) ] = voiceboard_versioned( $url );
		}
	}
	$imports = apply_filters( 'voiceboard_import_map', $imports );
	return (string) wp_json_encode( array( 'imports' => $imports ), JSON_UNESCAPED_SLASHES );
}

function voiceboard_module_scripts(): array {
	$scripts = array();
	foreach ( voiceboard_modules() as $module ) {
		foreach ( (array) $module['scripts'] as $url ) {
			$scripts[] = voiceboard_versioned( $url );
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
