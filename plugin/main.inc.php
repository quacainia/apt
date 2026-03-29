<?php
/*
Plugin Name: Apt API Extension
Version: 1.0.0
Description: Adds API functionality that makes the Apt Theme more efficient.
Plugin URI: http://piwigo.org/ext/extension_view.php?eid=
Author: Ben
*/

if (!defined('PHPWG_ROOT_PATH')) die('Hacking attempt!');

define('APT_PATH', PHPWG_PLUGINS_PATH . basename(dirname(__FILE__)) . '/');

// Register the API method
add_event_handler('ws_add_methods', 'custom_api_register');

function custom_api_register($arr)
{
  global $conf;

  $service = &$arr[0];

  include_once(PHPWG_ROOT_PATH . 'include/ws_functions.inc.php');
  include_once(APT_PATH . 'include/ws_functions.inc.php');
  include_once(APT_PATH . 'include/ws_functions.inc.php');
  include_once(APT_PATH . 'include/image_fields.inc.php');

  $f_params = array(
    'f_min_rate' => array(
      'default' => null,
      'type' => WS_TYPE_FLOAT
    ),
    'f_max_rate' => array(
      'default' => null,
      'type' => WS_TYPE_FLOAT
    ),
    'f_min_hit' =>  array(
      'default' => null,
      'type' => WS_TYPE_INT | WS_TYPE_POSITIVE
    ),
    'f_max_hit' =>  array(
      'default' => null,
      'type' => WS_TYPE_INT | WS_TYPE_POSITIVE
    ),
    'f_min_ratio' => array(
      'default' => null,
      'type' => WS_TYPE_FLOAT | WS_TYPE_POSITIVE
    ),
    'f_max_ratio' => array(
      'default' => null,
      'type' => WS_TYPE_FLOAT | WS_TYPE_POSITIVE
    ),
    'f_max_level' => array(
      'default' => null,
      'type' => WS_TYPE_INT | WS_TYPE_POSITIVE
    ),
    'f_min_date_available' => array('default' => null),
    'f_max_date_available' => array('default' => null),
    'f_min_date_created' =>   array('default' => null),
    'f_max_date_created' =>   array('default' => null),
  );

  $service->addMethod(
    'apt.images.search',
    'ws_apt_images_search',
    array_merge(array(
      'query' =>        array(),
      'image_fields' => array('default' => implode(', ', APT_IMAGE_FIELDS_DEFAULT)),
      'derivatives' => array('default' => ''),
      'per_page' =>     array(
        'default' => 100,
        'maxValue' => $conf['ws_max_images_per_page'],
        'type' => WS_TYPE_INT | WS_TYPE_POSITIVE
      ),
      'page' =>         array(
        'default' => 0,
        'type' => WS_TYPE_INT | WS_TYPE_POSITIVE
      ),
      'order' =>        array(
        'default' => null,
        'info' => 'id, file, name, hit, rating_score, date_creation, date_available, random'
      ),
    ), $f_params),
    'Returns elements for the corresponding query search.',
    APT_PATH . 'include/ws_functions.inc.php' // Lazy load the logic
  );

  $service->addMethod(
    'apt.categories.getImages',
    'ws_apt_categories_getImages',
    array_merge(array(
      'cat_id' =>     array(
        'default' => null,
        'flags' => WS_PARAM_FORCE_ARRAY,
        'type' => WS_TYPE_INT | WS_TYPE_POSITIVE
      ),
      'recursive' =>  array(
        'default' => false,
        'type' => WS_TYPE_BOOL
      ),
      'per_page' =>   array(
        'default' => 100,
        'maxValue' => $conf['ws_max_images_per_page'],
        'type' => WS_TYPE_INT | WS_TYPE_POSITIVE
      ),
      'page' =>       array(
        'default' => 0,
        'type' => WS_TYPE_INT | WS_TYPE_POSITIVE
      ),
      'order' =>      array(
        'default' => null,
        'info' => 'id, file, name, hit, rating_score, date_creation, date_available, random'
      ),
      'image_fields' => array('default' => implode(', ', APT_IMAGE_FIELDS_DEFAULT)),
      'derivatives' => array('default' => ''),
    ), $f_params),
    'Returns elements for the corresponding categories.
<br><b>cat_id</b> can be empty if <b>recursive</b> is true.
<br><b>order</b> comma separated fields for sorting',
    APT_PATH . 'include/ws_apt_categories_getImages.inc.php' // Lazy load the logic
  );
}
