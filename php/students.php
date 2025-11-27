<?php
header('Content-Type: application/json');
require __DIR__ . '/db.php';

$result = $mysqli->query('SELECT * FROM students ORDER BY id DESC');
$rows = [];
if ($result) {
  while ($row = $result->fetch_assoc()) { $rows[] = $row; }
}
echo json_encode($rows);


