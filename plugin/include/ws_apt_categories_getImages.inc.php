<?php
if (!defined('PHPWG_ROOT_PATH')) die('Hacking attempt!');

include_once(APT_PATH . 'include/image_fields.inc.php');

/**
 * API method
 * Returns images per category
 * @param mixed[] $params
 *    @option int[] cat_id (optional)
 *    @option bool recursive
 *    @option int per_page
 *    @option int page
 *    @option string order (optional)
 *    @option string image_fields - comma delimited list of fields from `APT_IMAGE_FIELDS`
 *    @option string derivatives - comma delimited list of fields from `APT_IMAGE_DERIVATIVE_NAMES`
 */
function ws_apt_categories_getImages($params, &$service)
{
  global $user, $conf;

  $params['cat_id'] = array_unique($params['cat_id']);

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

  if (count($params['cat_id']) > 0) {
    // do the categories really exist?
    $query = '
SELECT id
  FROM ' . CATEGORIES_TABLE . '
  WHERE id IN (' . implode(',', $params['cat_id']) . ')
;';
    $db_cat_ids = query2array($query, null, 'id');
    $missing_cat_ids = array_diff($params['cat_id'], $db_cat_ids);

    if (count($missing_cat_ids) > 0) {
      return new PwgError(404, 'cat_id {' . implode(',', $missing_cat_ids) . '} not found');
    }
  }

  $images = array();
  $image_ids = array();
  $total_images = 0;

  //------------------------------------------------- get the related categories
  $where_clauses = array();
  foreach ($params['cat_id'] as $cat_id) {
    if ($params['recursive']) {
      $where_clauses[] = 'uppercats ' . DB_REGEX_OPERATOR . ' \'(^|,)' . $cat_id . '(,|$)\'';
    } else {
      $where_clauses[] = 'id=' . $cat_id;
    }
  }
  if (!empty($where_clauses)) {
    $where_clauses = array('(' . implode("\n    OR ", $where_clauses) . ')');
  }
  $where_clauses[] = get_sql_condition_FandF(
    array('forbidden_categories' => 'id'),
    null,
    true
  );

  $query = '
SELECT
    id,
    image_order
  FROM ' . CATEGORIES_TABLE . '
  WHERE ' . implode("\n    AND ", $where_clauses) . '
;';
  $result = pwg_query($query);

  $cats = array();
  while ($row = pwg_db_fetch_assoc($result)) {
    $row['id'] = (int)$row['id'];
    $cats[$row['id']] = $row;
  }

  //-------------------------------------------------------- get the images
  if (!empty($cats)) {
    $where_clauses = ws_std_image_sql_filter($params, 'i.');
    $where_clauses[] = 'category_id IN (' . implode(',', array_keys($cats)) . ')';
    $where_clauses[] = get_sql_condition_FandF(
      array('visible_images' => 'i.id'),
      null,
      true
    );

    $order_by = ws_std_image_sql_order($params, 'i.');
    if (
      empty($order_by)
      and count($params['cat_id']) == 1
      and isset($cats[$params['cat_id'][0]]['image_order'])
    ) {
      $order_by = $cats[$params['cat_id'][0]]['image_order'];
    }
    $order_by = empty($order_by) ? $conf['order_by'] : 'ORDER BY ' . $order_by;
    $favorite_ids = get_user_favorites();

    $query = '
SELECT SQL_CALC_FOUND_ROWS i.*
  FROM ' . IMAGES_TABLE . ' i
    INNER JOIN ' . IMAGE_CATEGORY_TABLE . ' ON i.id=image_id
  WHERE ' . implode("\n    AND ", $where_clauses) . '
  GROUP BY i.id
  ' . $order_by . '
  LIMIT ' . $params['per_page'] . '
  OFFSET ' . ($params['per_page'] * $params['page']) . '
;';
    $result = pwg_query($query);


    while ($row = pwg_db_fetch_assoc($result)) {
      $image_ids[] = $row['id'];

      $image = array();
      $image['is_favorite'] = isset($favorite_ids[$row['id']]);
      foreach (APT_IMAGES_INT_FIELDS as $k) {
        if (isset($row[$k])) {
          $image[$k] = (int)$row[$k];
        }
      }
      foreach (APT_IMAGES_STRING_FIELDS as $k) {
        $image[$k] = $row[$k];
      }
      foreach (APT_IMAGES_BOOL_FIELDS as $k) {
        if (isset($row[$k])) {
          $image[$k] = (bool)$row[$k];
        }
      }
      foreach (APT_IMAGES_FLOAT_FIELDS as $k) {
        if (isset($row[$k])) {
          $image[$k] = (float)$row[$k];
        }
      }

      $std_urls = ws_std_get_urls($row);
      if (count($requested_derivatives) > 0) {
        $std_urls['derivatives'] = array_intersect_key($std_urls['derivatives'], array_flip($requested_derivatives));
      }
      $image = array_merge($image, $std_urls);

      $images[] = $image;
    }

    list($total_images) = pwg_db_fetch_row(pwg_query('SELECT FOUND_ROWS()'));
    $total_images = (int)$total_images;

    // let's take care of adding the related albums to each photo
    if (count($image_ids) > 0) {
      $category_ids = array();

      // find the complete list (given permissions) of albums linked to photos
      $query = '
SELECT
    image_id,
    category_id
  FROM ' . IMAGE_CATEGORY_TABLE . '
  WHERE image_id IN (' . implode(',', $image_ids) . ')
    AND ' . get_sql_condition_FandF(array('forbidden_categories' => 'category_id'), null, true) . '
;';
      $result = pwg_query($query);
      while ($row = pwg_db_fetch_assoc($result)) {
        $category_ids[] = $row['category_id'];
        @$categories_of_image[$row['image_id']][] = $row['category_id'];
      }

      if (count($category_ids) > 0) {
        // find details (for URL generation) about each album
        $query = '
SELECT
    id,
    name,
    permalink
  FROM ' . CATEGORIES_TABLE . '
  WHERE id IN (' . implode(',', $category_ids) . ')
;';
        $details_for_category = query2array($query, 'id');
      }

      foreach ($images as $idx => $image) {
        $image_cats = array();

        // it should not be possible at this point, but let's consider a photo can be in no album
        if (!isset($categories_of_image[$image['id']])) {
          continue;
        }

        foreach ($categories_of_image[$image['id']] as $cat_id) {
          $url = make_index_url(array('category' => $details_for_category[$cat_id]));

          $page_url = make_picture_url(
            array(
              'category' => $details_for_category[$cat_id],
              'image_id' => $image['id'],
              'image_file' => $image['file'],
            )
          );

          $image_cats[] = array(
            'id' => (int)$cat_id,
            'url' => $url,
            'page_url' => $page_url,
          );
        }

        $images[$idx]['categories'] = new PwgNamedArray(
          $image_cats,
          'category',
          array('id', 'url', 'page_url')
        );
      }
    }

    # Filter to only the requested fields
    $images = array_map(fn($item) => array_intersect_key($item, array_flip($requested_fields)), $images);
  }

  return array(
    'paging' => new PwgNamedStruct(
      array(
        'page' => $params['page'],
        'per_page' => $params['per_page'],
        'count' => count($images),
        'total_count' => $total_images
      )
    ),
    'images' => new PwgNamedArray(
      $images,
      'image',
      ws_std_get_image_xml_attributes()
    )
  );
}
