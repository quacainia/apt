{if strpos($smarty.server.HTTP_ACCEPT, "application/json") === false}
  <div id="root" style="flex-grow: 1; overflow: hidden;"></div>
{/if}

{* Get breadcrumbs from preprocessed HTML, convert to JSON *}
{assign var="crumbs" value=$SECTION_TITLE|split:" / "}
{assign var="json_parts" value=[]}
{foreach from=$crumbs item=crumb}
  {assign var="url" value=$crumb|regex_replace:'/.*href="([^"]+)".*/':'$1'|trim}
  {assign var="title" value=$crumb|regex_replace:'/<[^>]*>/':''|trim}

  {if $url && $title}
    {capture assign="json_obj"}
      {ldelim}"title": "{$title}", "url": "{$url}"{rdelim}
    {/capture}
    {$json_parts[] = $json_obj}
  {/if}
{/foreach}

<script id="apt-theme-json" type="application/json">
  {
    "displayInfo": {$display_info|json_encode},
    "images": {
      "{$current.id}": {
      "info": {$current|json_encode},
      "categoryPosition": "{$PHOTO}",
      "nextId": "{$next.id|default:''}",
      "prevId": "{$previous.id|default:''}",
      "file": "{$INFO_FILE}",
      "relatedTags": {if isset($related_tags)}
        {$related_tags|json_encode}
      {else}
        []
      {/if},
      "breadcrumbs": [{$json_parts|join:","}]
    }
  }
  }
</script>