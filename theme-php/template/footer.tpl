<script>
</script>

{if isset($debug.QUERIES_LIST)}
  <div id="debug">
    {$debug.QUERIES_LIST}
  </div>
{/if}

<script type="text/javascript">
  // Fix body height to be exactly 100vh even if margin gets messed with (e.g. by the admin panel)
  const observer = new MutationObserver(() => {
    const marginTop = document.body.style.marginTop;
    const marginBottom = document.body.style.marginBottom;
    document.body.style.height = 'calc(100vh' + (marginBottom ? ' - ' + marginBottom : '') + (marginTop ? ' - ' +
      marginTop : '');
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['style']
  });
</script>
<!-- BEGIN get_combined -->
{get_combined_scripts load='footer'}
<!-- END get_combined -->

<script type="text/javascript">
  window.piwigoData = {
    // Basic context
    pageTitle: "{$PAGE_TITLE|escape:'javascript'}",
    banner: "{$GALLERY_TITLE|default:''|escape:'javascript'}",

    // Arrays from Smarty
    headerMsgs: [
      {if not empty($header_msgs)}
        {foreach from=$header_msgs item=elt name=msg_loop}
          "{$elt|escape:'javascript'}"{if not $smarty.foreach.msg_loop.last},{/if}
        {/foreach}
      {/if}
    ],

    headerNotes: [
      {if not empty($header_notes)}
        {foreach from=$header_notes item=elt name=note_loop}
          "{$elt|escape:'javascript'}"{if not $smarty.foreach.note_loop.last},{/if}
        {/foreach}
      {/if}
    ],

    // Content/Plugin Data (like OpenStreetMap descriptions)
    contentDescription: "{$CONTENT_DESCRIPTION|default:''|escape:'javascript'}",

    // Theme Config (if you're using Bootstrap Darkroom style objects)
    themeConfig: {
      thumbnailCatDesc: "{$theme_config->thumbnail_cat_desc|default:'standard'}"
    },

    footerConfig: {
      {if isset($debug.TIME)}
      pageGeneratedIn: '{'Page generated in'|translate|escape:'javascript'}',
      debugTime: '{$debug.TIME|escape:'javascript'}',
      debugQueries: {$debug.NB_QUERIES|escape:'javascript'},
      sqlTime: '{$debug.SQL_TIME|escape:'javascript'}',
      sqlQueriesIn: '{'SQL queries in'|translate|escape:'javascript'}',
      {/if}
      poweredBy: '{'Powered by'|translate|escape:'javascript'}',
      phpwgUrl: '{$PHPWG_URL|escape:'javascript'}',
      version: '{$VERSION|escape:'javascript'}',
      {if isset($CONTACT_MAIL)}
      contactMail: '{$CONTACT_MAIL|escape:'javascript'}',
      contactLabel: '{'Contact webmaster'|translate|escape:'javascript'}',
      contactSubject: '{'A comment on your site'|translate|@escape:url}',
      {/if}
      {if isset($TOGGLE_MOBILE_THEME_URL)}
      toggleMobileUrl: '{$TOGGLE_MOBILE_THEME_URL|escape:'javascript'}',
      viewIn: '{'View in'|translate|escape:'javascript'}',
      mobileLabel: '{'Mobile'|translate|escape:'javascript'}',
      desktopLabel: '{'Desktop'|translate|escape:'javascript'}',
      {/if}
      {if isset($footer_elements)}
      footerElements: [
        {foreach from=$footer_elements item=elt}
        '{$elt|escape:'javascript'}',
        {/foreach}
      ],
      {/if}
    },
  };
</script>

</body>

</html>