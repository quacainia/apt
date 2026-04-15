{if strpos($smarty.server.HTTP_ACCEPT, "application/json") === false}
  <div id="root" style="flex-grow: 1; overflow: hidden;"></div>
{/if}
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
{/if}
      }
    }
  }
</script>