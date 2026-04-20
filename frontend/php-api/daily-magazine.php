<?php
$jsonPath = $_SERVER['DOCUMENT_ROOT'] . '/data/childArtMagazineData.json';
$data = json_decode(file_get_contents($jsonPath), true);

if (!is_array($data) || empty($data)) {
    http_response_code(500);
    exit('Magazine data unavailable');
}

// Extract the directory name from links like "/ChildArt/Happiness"
$magazines = array_values(array_filter(array_map(function($m) {
    if (empty($m['link'])) return null;
    $parts = explode('/', trim($m['link'], '/'));
    return end($parts) ?: null;
}, $data)));

if (empty($magazines)) {
    http_response_code(500);
    exit('No magazines configured');
}

$today = $magazines[(int)(floor(time() / 86400)) % count($magazines)];

$requested = $_GET['path'] ?? 'index.html';
$requested = ltrim($requested, '/');

// Block directory traversal
if (strpos($requested, '..') !== false || strpos($requested, "\0") !== false) {
    http_response_code(403);
    exit;
}

$base = $_SERVER['DOCUMENT_ROOT'] . '/ChildArt/' . $today;
$file = realpath($base . '/' . $requested);

// Ensure resolved path is still inside the magazine directory
if ($file === false || strpos($file, realpath($base) . DIRECTORY_SEPARATOR) !== 0 && $file !== realpath($base)) {
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

// Cache assets aggressively, but never the HTML (which changes daily)
if ($ext === 'html' || $ext === 'htm') {
    header('Cache-Control: no-cache, no-store, must-revalidate');
} else {
    header('Cache-Control: public, max-age=3600');
}

header('Content-Length: ' . filesize($file));
readfile($file);