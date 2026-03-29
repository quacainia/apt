<?php
if (!defined('PHPWG_ROOT_PATH')) die('Hacking attempt!');

define('APT_IMAGES_INT_FIELDS_DEFAULT', [
  "id",
  "hit",
  "width",
  "height",
]);
define('APT_IMAGES_INT_FIELDS', [
  ...APT_IMAGES_INT_FIELDS_DEFAULT,
  "filesize",
  "level", // Privacy levels: (0) Admins Only, (1) Contacts, (2) Friends, (4) Family, (8) Admins, (16) Everyone
  "added_by",
  "rotation",
  "lastmodified",
]);
define('APT_IMAGES_BOOL_FIELDS', [
  "is_sphere",

]);
define('APT_IMAGES_FLOAT_FIELDS', [
  "rating_score",
  "latitude",
  "longitude",
]);
define('APT_IMAGES_STRING_FIELDS_DEFAULT', [
  "file",
  "date_available",
  "date_creation",
  "name",
  "comment",
]);
define('APT_IMAGES_STRING_FIELDS', [
  ...APT_IMAGES_STRING_FIELDS_DEFAULT,
  "author",
  "coi",
  "representative_ext",
  "date_metadata_update",
  "storage_category_id", // Which category the image is physically stored in
  "md5sum",
]);
define('APT_IMAGES_GENERATED_FIELDS', [
  // String fields
  "page_url",
  "element_url",
  "download_url",
  "derivatives",

  // Boolean fields
  "is_favorite",
]);
define('APT_IMAGE_DERIVATIVE_NAMES', array(
  IMG_SQUARE,
  IMG_THUMB,
  IMG_XXSMALL,
  IMG_XSMALL,
  IMG_SMALL,
  IMG_MEDIUM,
  IMG_LARGE,
  IMG_XLARGE,
  IMG_XXLARGE,
  // Maybe add IMG_CUSTOM later
));
define('APT_IMAGE_FIELDS', array(
  ...APT_IMAGES_INT_FIELDS,
  ...APT_IMAGES_BOOL_FIELDS,
  ...APT_IMAGES_FLOAT_FIELDS,
  ...APT_IMAGES_STRING_FIELDS,
  ...APT_IMAGES_GENERATED_FIELDS,
));
define('APT_IMAGE_FIELDS_DEFAULT', array(
  ...APT_IMAGES_INT_FIELDS_DEFAULT,
  ...APT_IMAGES_STRING_FIELDS_DEFAULT,
  ...APT_IMAGES_GENERATED_FIELDS,
));
