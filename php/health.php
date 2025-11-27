<?php
header('Content-Type: application/json');
require __DIR__ . '/db.php';

$ok = $mysqli->query('SELECT 1') ? true : false;
$dbInfo = $mysqli->query('SELECT DATABASE() as db, @@port as port')->fetch_assoc();
$count = $mysqli->query('SELECT COUNT(*) as total FROM students')->fetch_assoc();

echo json_encode([
  'status' => $ok ? 'OK' : 'FAIL',
  'database' => $dbInfo['db'] ?? null,
  'port' => intval($dbInfo['port'] ?? 0),
  'students' => intval($count['total'] ?? 0)
]);


