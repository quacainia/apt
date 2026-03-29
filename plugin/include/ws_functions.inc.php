<?php
if (!defined('PHPWG_ROOT_PATH')) die('Hacking attempt!');

include_once(APT_PATH . 'include/image_fields.inc.php');

/**
 * API method
 * Returns a list of elements corresponding to a query search
 * This function is entirely based off of `ws_images_search` it just allows for
 * more or less data to be rreturned.
 * 
 * @param mixed[] $params
 *    @option string query - A bit of an unknown, trying to figure it out.
 *    @option string image_fields - comma delimited list of fields from `APT_IMAGE_FIELDS`
 *    @option string derivatives - comma delimited list of fields from `APT_IMAGE_DERIVATIVE_NAMES`
 *    @option int per_page - number of images per page (max 500)
 *    @option int page - which page number to return
 *    @option string order (optional)
 */
function ws_apt_images_search($params, $service)
{
  include_once(PHPWG_ROOT_PATH . 'include/functions_search.inc.php');

  $images = array();
  $where_clauses = ws_std_image_sql_filter($params, 'i.');
  $order_by = ws_std_image_sql_order($params, 'i.');

  $super_order_by = false;
  if (!empty($order_by)) {
    global $conf;
    $conf['order_by'] = 'ORDER BY ' . $order_by;
    $super_order_by = true; // quick_search_result might be faster
  }

  $search_result = get_quick_search_results(
    $params['query'],
    array(
      'super_order_by' => $super_order_by,
      'images_where' => implode(' AND ', $where_clauses)
    )
  );

  $image_ids = array_slice(
    $search_result['items'],
    $params['page'] * $params['per_page'],
    $params['per_page']
  );

  $requested_fields_str = $params['image_fields'];
  $requested_fields = array_map('trim', explode(',', $requested_fields_str));
  if (!in_array("id", $requested_fields)) {
    array_unshift($requested_fields, "id");
  }

  $requested_derivatives_str = $params['derivatives'];
  $requested_derivatives = array_map('trim', explode(',', $requested_derivatives_str));
  $requested_derivatives = array_diff($requested_derivatives, array(''));

  if (count($requested_derivatives) && !in_array("derivatives", $requested_fields)) {
    array_push($requested_fields, "derivatives");
  }

  if (count($image_ids)) {
    $query = '
SELECT *
  FROM ' . IMAGES_TABLE . '
  WHERE id IN (' . implode(',', $image_ids) . ')
;';
    $result = pwg_query($query);
    $image_ids = array_flip($image_ids);
    $favorite_ids = get_user_favorites();

    $int_columns = array_intersect(APT_IMAGES_INT_FIELDS, $requested_fields);
    $str_columns = array_intersect(APT_IMAGES_STRING_FIELDS, $requested_fields);
    $bool_columns = array_intersect(APT_IMAGES_BOOL_FIELDS, $requested_fields);
    $float_columns = array_intersect(APT_IMAGES_FLOAT_FIELDS, $requested_fields);

    while ($row = pwg_db_fetch_assoc($result)) {
      $image = array();
      if (in_array("is_favorte", $requested_fields)) {
        $image['is_favorite'] = isset($favorite_ids[$row['id']]);
      }
      foreach ($int_columns as $k) {
        if (isset($row[$k])) {
          $image[$k] = (int)$row[$k];
        }
      }
      foreach ($str_columns as $k) {
        $image[$k] = $row[$k];
      }
      foreach ($bool_columns as $k) {
        $image[$k] = (bool)$row[$k];
      }
      foreach ($float_columns as $k) {
        $image[$k] = (float)$row[$k];
      }

      $std_urls = ws_std_get_urls($row);
      if (count($requested_derivatives) > 0) {
        $std_urls['derivatives'] = array_intersect_key($std_urls['derivatives'], array_flip($requested_derivatives));
      }
      $filtered_std_urls = array_intersect_key($std_urls, array_flip($requested_fields));
      $image = array_merge($image, $filtered_std_urls);
      $images[$image_ids[$image['id']]] = $image;
    }
    ksort($images, SORT_NUMERIC);
    $images = array_values($images);
  }

  return array(
    'paging' => new PwgNamedStruct(
      array(
        'page' => $params['page'],
        'per_page' => $params['per_page'],
        'count' => count($images),
        'total_count' => count($search_result['items']),
      )
    ),
    'images' => new PwgNamedArray(
      $images,
      'image',
      ws_std_get_image_xml_attributes()
    )
  );
}
