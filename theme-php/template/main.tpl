<!DOCTYPE html>
<html lang="{$lang_info.code}">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{$GALLERY_TITLE}</title>

    {* This is where your React JS/CSS gets injected by inject_react_assets *}
    {if isset($head_elements)}
        {foreach from=$head_elements item=elt}{$elt}
        {/foreach}
    {/if}
</head>

<body>
    <div id="root"></div>

    {* If you still want the admin bar for yourself, you can add this: *}
    {if isset($footer_elements)}
        {foreach from=$footer_elements item=elt}{$elt}
        {/foreach}
    {/if}
</body>

</html>