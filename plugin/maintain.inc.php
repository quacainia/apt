<?php
if (!defined('PHPWG_ROOT_PATH')) die('Hacking attempt!');

class apt_maintain extends PluginMaintain
{
  function __construct($plugin_id)
  {
    parent::__construct($plugin_id); // always call parent constructor
  }

  function install($plugin_version, &$errors = array())
  {
    global $conf;

    // add config parameter
    if (empty($conf['vjs_conf'])) {
      // conf_update_param('vjs_conf', $this->default_conf, true);

      /* Add a comment to the entry */
      // $q = 'UPDATE '.CONFIG_TABLE.' SET `comment` = "Player settings for piwigo-videojs plugin" WHERE `param` = "vjs_conf";';
      // pwg_query( $q );
    } else {
      // $old_conf = safe_unserialize($conf['vjs_conf']);

      // conf_update_param('vjs_conf', $old_conf, true);
    }


    // add a new table
    //     pwg_query('
    // CREATE TABLE IF NOT EXISTS `'.$this->table.'` (
    //   `id` mediumint(8) unsigned NOT NULL,
    //   `metadata` text DEFAULT NULL,
    //   `date_metadata_update` DATE DEFAULT NULL,
    //   PRIMARY KEY (id)
    // ) ENGINE=MyISAM DEFAULT CHARSET=utf8
    // ;');
  }
  function activate($plugin_version, &$errors = array()) {}
  function deactivate() {}
  function update($old_version, $new_version, &$errors = array()) {}
  function uninstall() {}
}
