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

$path = (string)$body['path'];
$path = parse_url($path, PHP_URL_PATH) ?? '/';
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