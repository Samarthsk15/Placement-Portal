<?php
// Simple MySQL connector for XAMPP (phpMyAdmin)
// Edit these if your XAMPP MySQL runs on a different port or has a password

$DB_HOST = getenv('DB_HOST') ?: 'localhost';
$DB_USER = getenv('DB_USER') ?: 'root';
$DB_PASS = getenv('DB_PASSWORD') ?: '';
$DB_NAME = getenv('DB_NAME') ?: 'placement_portal';
$DB_PORT = intval(getenv('DB_PORT') ?: 3307);

$mysqli = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME, $DB_PORT);
if ($mysqli->connect_errno) {
  http_response_code(500);
  header('Content-Type: application/json');
  echo json_encode(['error' => 'MySQL connection failed: ' . $mysqli->connect_error]);
  exit;
}

// Ensure UTF-8
$mysqli->set_charset('utf8mb4');

// Optional: create students table if it doesn't exist
$mysqli->query("CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  usn VARCHAR(20) UNIQUE NOT NULL,
  gender ENUM('Male','Female','Other') NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  department VARCHAR(50) NOT NULL,
  batch VARCHAR(10) NOT NULL,
  skills TEXT NOT NULL,
  domain VARCHAR(255) NOT NULL,
  resume_path VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");


