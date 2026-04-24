<?php
$jsonPath = $_SERVER['DOCUMENT_ROOT'] . '/data/childArtMagazineData.json';
$data = json_decode(file_get_contents($jsonPath), true);
if (!is_array($data) || empty($data)) {
    http_response_code(500);
    exit('Magazine data unavailable');
}

$MAG_ELIGIBLE_COUNT = 73;   // how many magazines are in rotation
$MAG_MIN_RECENT     = 4;    // never include the N most recent magazines
$MAG_TZ_OFFSET_SEC  = -5 * 3600; // EST; day flips at midnight ET, not UTC
$MAG_RESHUFFLE_MONTH = 2;   // Feb 1 reshuffle
$MAG_RESHUFFLE_DAY   = 1;

$slugs = [];
foreach ($data as $m) {
    if (empty($m['link'])) continue;
    $parts = explode('/', trim($m['link'], '/'));
    $last = end($parts);
    if ($last !== false && $last !== '') $slugs[] = $last;
}
if (count($slugs) < 5) {
    http_response_code(500);
    exit('Need at least 5 magazines');
}

$maxAllowed = max(1, count($slugs) - $MAG_MIN_RECENT);
$eligibleCount = min($MAG_ELIGIBLE_COUNT, $maxAllowed);

$eligible = array_slice($slugs, count($slugs) - $eligibleCount);

$nowLocal = time() + $MAG_TZ_OFFSET_SEC;
$dayNum = (int) floor($nowLocal / 86400);

$y = (int) gmdate('Y', $nowLocal);
$m = (int) gmdate('n', $nowLocal);
$d = (int) gmdate('j', $nowLocal);
$beforeReshuffle = ($m < $MAG_RESHUFFLE_MONTH)
    || ($m === $MAG_RESHUFFLE_MONTH && $d < $MAG_RESHUFFLE_DAY);
$sortEpoch = $beforeReshuffle ? $y - 1 : $y;

usort($eligible, function ($a, $b) use ($sortEpoch) {
    $ha = substr(hash('sha256', $a . '|' . $sortEpoch), 0, 16);
    $hb = substr(hash('sha256', $b . '|' . $sortEpoch), 0, 16);
    $cmp = strcmp($ha, $hb);
    return $cmp !== 0 ? $cmp : strcmp($a, $b);
});

$today = $eligible[$dayNum % count($eligible)];

$requested = $_GET['path'] ?? 'index.html';
$requested = ltrim($requested, '/');
if (strpos($requested, '..') !== false || strpos($requested, "\0") !== false) {
    http_response_code(403);
    exit;
}
$base     = $_SERVER['DOCUMENT_ROOT'] . '/ChildArt/' . $today;
$realBase = realpath($base);
$file     = realpath($base . '/' . $requested);
if ($realBase === false || $file === false) {
    http_response_code(404);
    exit;
}
$insideBase = ($file === $realBase)
    || strpos($file, $realBase . DIRECTORY_SEPARATOR) === 0;
if (!$insideBase) {
    http_response_code(404);
    exit;
}
if (!is_file($file)) {
    http_response_code(404);
    exit;
}
$ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
$mimes = [
    'html' => 'text/html',         'htm'  => 'text/html',
    'css'  => 'text/css',          'js'   => 'application/javascript',
    'mjs'  => 'application/javascript',
    'json' => 'application/json',  'xml'  => 'application/xml',
    'webp' => 'image/webp',        'jpg'  => 'image/jpeg',
    'jpeg' => 'image/jpeg',        'png'  => 'image/png',
    'gif'  => 'image/gif',         'svg'  => 'image/svg+xml',
    'ico'  => 'image/x-icon',      'avif' => 'image/avif',
    'woff' => 'font/woff',         'woff2'=> 'font/woff2',
    'ttf'  => 'font/ttf',          'eot'  => 'application/vnd.ms-fontobject',
    'mp4'  => 'video/mp4',         'webm' => 'video/webm',
    'ogv'  => 'video/ogg',         'mp3'  => 'audio/mpeg',
    'pdf'  => 'application/pdf',   'txt'  => 'text/plain',
    'wasm' => 'application/wasm',
];
$mime = $mimes[$ext] ?? (function_exists('mime_content_type') ? mime_content_type($file) : 'application/octet-stream');
header('Content-Type: ' . $mime);
if ($ext === 'html' || $ext === 'htm') {
    header('Cache-Control: no-cache, no-store, must-revalidate');
} else {
    header('Cache-Control: public, max-age=3600');
}
header('Content-Length: ' . filesize($file));
readfile($file);