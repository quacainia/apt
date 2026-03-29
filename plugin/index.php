<?php
// +-----------------------------------------------------------------------+
// | This file is part of apt plugin for piwigo.                            |
// |                                                                       |
// | No copyright and license information at this time                     |
// +-----------------------------------------------------------------------+

// Recursive call
$url = '../';
header('Request-URI: ' . $url);
header('Content-Location: ' . $url);
header('Location: ' . $url);
exit();
