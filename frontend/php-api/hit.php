<?php
declare(strict_types=1);

header('Content-Type: application/json');
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$body = json_decode($raw, true);
if (!is_array($body) || !isset($body['path'])) {
    http_response_code(400);
    echo json_encode(['error' => 'missing path']);
    exit;
}

function clean_gallery_value($value): ?string {
    if (!is_string($value) || $value === '') {
        return null;
    }

    $value = substr($value, 0, 120);
    return preg_match('/^[A-Za-z0-9._~-]+$/', $value) ? $value : null;
}

function normalized_hit_path(string $rawPath): string {
    $path = parse_url($rawPath, PHP_URL_PATH) ?? '/';
    $query = parse_url($rawPath, PHP_URL_QUERY) ?? '';

    if ($path !== '/gallery' && $path !== '/gallery/slideshow') {
        return $path;
    }

    parse_str($query, $params);

    $artworkId = clean_gallery_value($params['id'] ?? null);
    if ($artworkId !== null) {
        return $path . '?id=' . rawurlencode($artworkId);
    }

    $groupId = clean_gallery_value($params['group'] ?? null);
    if ($groupId !== null) {
        return $path . '?group=' . rawurlencode($groupId);
    }

    if (($params['view'] ?? null) === 'group') {
        return $path . '?view=group';
    }

    return $path;
}

$path = normalized_hit_path((string)$body['path']);
if (strlen($path) > 512) {
    http_response_code(400);
    echo json_encode(['error' => 'path too long']);
    exit;
}

// ignore obvious bots
$ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
if ($ua === '' || preg_match('/bot|crawl|spider|slurp|bingpreview|headless|curl|wget|python-requests/i', $ua)) {
    echo json_encode(['ok' => true, 'skipped' => 'bot']);
    exit;
}

$dbPath = $_SERVER['DOCUMENT_ROOT'] . '/analytics/hits.db';

try {
    $pdo = new PDO('sqlite:' . $dbPath, null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 5,
    ]);
    $pdo->exec('PRAGMA journal_mode=WAL');
    $pdo->exec('PRAGMA synchronous=NORMAL');
    $pdo->exec('
        CREATE TABLE IF NOT EXISTS hits (
            path TEXT NOT NULL,
            day  TEXT NOT NULL,
            count INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (path, day)
        )
    ');

    $day = gmdate('Y-m-d');
    $stmt = $pdo->prepare('
        INSERT INTO hits (path, day, count) VALUES (:p, :d, 1)
        ON CONFLICT(path, day) DO UPDATE SET count = count + 1
    ');
    $stmt->execute([':p' => $path, ':d' => $day]);

    echo json_encode(['ok' => true]);
} catch (Throwable $e) {
    http_response_code(500);
    error_log('hit.php error: ' . $e->getMessage());
    echo json_encode(['error' => 'server']);
}
