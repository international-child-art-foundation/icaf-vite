<?php
declare(strict_types=1);

require $_SERVER['DOCUMENT_ROOT'] . '/config/config.php';

// Gate: 404 (not 403) so Google won't index even if discovered
if (!isset($stats_key) || ($_GET['key'] ?? '') !== $stats_key) {
    http_response_code(404);
    exit;
}

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');

$dbPath = $_SERVER['DOCUMENT_ROOT'] . '/analytics/hits.db';
$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$days   = max(1, min(365, (int)($_GET['days'] ?? 30)));
$cutoff = gmdate('Y-m-d', time() - $days * 86400);

$topPages = $pdo->prepare('
    SELECT path, SUM(count) AS total
    FROM hits WHERE day >= :c
    GROUP BY path ORDER BY total DESC LIMIT 50
');
$topPages->execute([':c' => $cutoff]);
$topRows = $topPages->fetchAll(PDO::FETCH_ASSOC);

$daily = $pdo->prepare('
    SELECT day, SUM(count) AS total
    FROM hits WHERE day >= :c
    GROUP BY day ORDER BY day ASC
');
$daily->execute([':c' => $cutoff]);
$dailyRows = $daily->fetchAll(PDO::FETCH_ASSOC);

$grandTotal = array_sum(array_column($dailyRows, 'total'));
?><!doctype html>
<html><head><meta charset="utf-8">
<meta name="robots" content="noindex, nofollow">
<title>Stats</title>
<style>
  body { font: 14px system-ui, sans-serif; max-width: 900px; margin: 2em auto; padding: 0 1em; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 2em; }
  th, td { text-align: left; padding: 6px 10px; border-bottom: 1px solid #ddd; }
  th { background: #f5f5f5; }
  td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
  .meta { color: #666; margin-bottom: 1.5em; }
</style></head><body>
<h1>Hits — last <?= $days ?> days (UTC)</h1>
<div class="meta">Total: <strong><?= (int)$grandTotal ?></strong> hits across <?= count($topRows) ?> paths</div>

<h2>Daily totals</h2>
<table><tr><th>Day</th><th class="num">Hits</th></tr>
<?php foreach ($dailyRows as $r): ?>
  <tr><td><?= htmlspecialchars($r['day']) ?></td><td class="num"><?= (int)$r['total'] ?></td></tr>
<?php endforeach; ?>
</table>

<h2>Top pages</h2>
<table><tr><th>Path</th><th class="num">Hits</th></tr>
<?php foreach ($topRows as $r): ?>
  <tr><td><?= htmlspecialchars($r['path']) ?></td><td class="num"><?= (int)$r['total'] ?></td></tr>
<?php endforeach; ?>
</table>
</body></html>