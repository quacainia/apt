<?php
/*
Theme Name: Apt
Version: 1.0.0
Description: Alternative Piwigo Theme that uses a React SPA and APIs
Theme URI: http://piwigo.org/ext/extension_view.php?eid=
Author: Ben Becker
Author URI: https://www.github.com/quacainia
*/

$themeconf = array(
  'name'         => 'APT',
  'parent'       => 'default',
  'load_parent_css' => false, // We'll handle our own styling in React
  'load_parent_local_head' => true,
  'ext_header_footer' => false,
  'use_standard_header_footer' => false,
);

define('APT_THEME_PATH', 'themes/apt/');
define('APT_THEME_DIST_PATH', APT_THEME_PATH . '/dist/');
define('APT_THEME_DEV_SERVER', 'http://localhost:5173/');

// Add a listener to the header initialization
add_event_handler('loc_begin_page_header', 'inject_react_assets');


function inject_react_assets()
{
  global $template;

  // Toggle this for production
  $is_dev = true;
  $theme_url = PHPWG_ROOT_PATH . APT_THEME_PATH;

  if ($is_dev) {
    $server = APT_THEME_DEV_SERVER;
    // DEV MODE: Point to Vite Dev Server
    $template->append('head_elements', <<<SCRIPT
<script type="module">
    import RefreshRuntime from '$server@react-refresh'
    RefreshRuntime.injectIntoGlobalHook(window)
    window.\$RefreshReg\$ = () => {}
    window.\$RefreshSig\$ = () => (type) => type
    window.__vite_plugin_react_preamble_installed__ = true
    window.viteDevServer = '$server';
</script>
SCRIPT);
    $template->append('head_elements', '<script type="module" src="' . APT_THEME_DEV_SERVER . '@vite/client"></script>');
    $template->append('head_elements', '<script type="module" src="' . APT_THEME_DEV_SERVER . 'src/main.tsx"></script>');
  } else {
    // PROD MODE: Parse manifest.json
    $manifest_path = $theme_url . 'dist/manifest.json';

    // Newer Vite versions might hide it in dist/.vite/manifest.json
    if (!file_exists($manifest_path)) {
      $manifest_path = $theme_url . 'dist/.vite/manifest.json';
    }

    if (file_exists($manifest_path)) {
      $manifest = json_decode(file_get_contents($manifest_path), true);

      // 'src/main.tsx' matches the 'input' in your vite.config.ts
      $main = $manifest['src/main.tsx'];

      // Inject JS
      $template->append(
        'head_elements',
        '<script type="module" src="' . APT_THEME_DIST_PATH . $main['file'] . '"></script>'
      );

      // Inject CSS (Vite bundles CSS separately)
      if (isset($main['css'])) {
        foreach ($main['css'] as $css_file) {
          $template->append(
            'head_elements',
            '<link rel="stylesheet" href="' . APT_THEME_DIST_PATH . $css_file . '">'
          );
        }
      }
    }
  }
}
