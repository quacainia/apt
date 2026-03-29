<!DOCTYPE html>
<html lang="{$lang_info.code}" dir="{$lang_info.direction}">

<head>
  <meta charset="{$CONTENT_ENCODING}">
  <meta name="generator" content="Piwigo (aka PWG), see piwigo.org">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  {if isset($meta_ref)}
    {if isset($INFO_AUTHOR)}
      <meta name="author" content="{$INFO_AUTHOR|strip_tags:false|replace:'"':' '}">
  {/if}
  {if isset($related_tags)}
  <meta name="keywords"
    content="{foreach from=$related_tags item=tag name=tag_loop}{if !$smarty.foreach.tag_loop.first}, {/if}{$tag.name}{/foreach}">
  {/if}
  {if isset($COMMENT_IMG)}
  <meta name="description"
    content="{$COMMENT_IMG|strip_tags:false|replace:'"':' '}{if isset($INFO_FILE)} - {$INFO_FILE}{/if}">
    {else}
      <meta name="description" content="{$PAGE_TITLE}{if isset($INFO_FILE)} - {$INFO_FILE}{/if}">
    {/if}
  {/if}

  <title>{if $PAGE_TITLE!=l10n('Home') && $PAGE_TITLE!=$GALLERY_TITLE}{$PAGE_TITLE} | {/if}{$GALLERY_TITLE}</title>
  <link rel="shortcut icon" type="image/x-icon" href="{$ROOT_URL}{$themeconf.icon_dir}/favicon.ico">

  {* Change these *}
  <link rel="start" title="{'Home'|translate}" href="{$U_HOME}">
  <link rel="search" title="{'Search'|translate}" href="{$ROOT_URL}search.php">

  {if isset($first.U_IMG)   }
  <link rel="first" title="{'First'|translate}" href="{$first.U_IMG}">{/if}
  {if isset($previous.U_IMG)}
  <link rel="prev" title="{'Previous'|translate}" href="{$previous.U_IMG}">{/if}
  {if isset($next.U_IMG)    }
  <link rel="next" title="{'Next'|translate}" href="{$next.U_IMG}">{/if}
  {if isset($last.U_IMG)    }
  <link rel="last" title="{'Last'|translate}" href="{$last.U_IMG}">{/if}
  {if isset($U_UP)          }
  <link rel="up" title="{'Thumbnails'|translate}" href="{$U_UP}">{/if}

  {if isset($U_PREFETCH)    }
  <link rel="prefetch" href="{$U_PREFETCH}">{/if}
  {if isset($U_CANONICAL)   }
  <link rel="canonical" href="{$U_CANONICAL}">{/if}

  {if not empty($page_refresh)}
  <meta http-equiv="refresh" content="{$page_refresh.TIME};url={$page_refresh.U_REFRESH}">{/if}

  {strip}
    {foreach from=$themes item=theme}
      {if $theme.load_css}
        {combine_css path="themes/`$theme.id`/theme.css" order=-10}
      {/if}
      {if !empty($theme.local_head)}
        {include file=$theme.local_head load_css=$theme.load_css}
      {/if}
    {/foreach}

    {combine_script id="jquery" load="footer"}
  {/strip}

  <!-- BEGIN get_combined -->
  {get_combined_css}

  {get_combined_scripts load='header'}
  <!-- END get_combined -->

  <!--[if lt IE 7]>
<script type="text/javascript" src="{$ROOT_URL}themes/default/js/pngfix.js"></script>
<![endif]-->

  {if not empty($head_elements)}
    {foreach from=$head_elements item=elt}
      {$elt}
    {/foreach}
  {/if}
</head>

<body id="{$BODY_ID}" class="{foreach from=$BODY_CLASSES item=class}{$class} {/foreach}" data-infos='{$BODY_DATA}'
  style="display: flex; flex-direction:column; height: 100vh; box-sizing: border-box; margin: 0 !important">


  <script type="text/javascript">
    {if not empty($header_msgs)}
      const HEADER_MSGS = [
        {foreach from=$header_msgs item=elt}
          "{$elt}",
        {/foreach}
      ];
    {/if}

    {if not empty($header_notes)}
      const HEADER_NOTES = [
        {foreach from=$header_notes item=elt}
          "{$elt}",
        {/foreach}
      ];
    {/if}
  </script>

{* end header.tpl *}