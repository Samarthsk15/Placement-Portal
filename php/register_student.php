<?php
header('Content-Type: application/json');

// Allow CORS for local testing (optional)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

require __DIR__ . '/db.php';

// Validate required fields
$required = ['first_name','last_name','usn','gender','email','phone','department','batch','skills','domain'];
foreach ($required as $key) {
  if (!isset($_POST[$key]) || trim($_POST[$key]) === '') {
    http_response_code(400);
    echo json_encode(['error' => 'All fields are required']);
    exit;
  }
}

$first_name = trim($_POST['first_name']);
$last_name = trim($_POST['last_name']);
$usn = trim($_POST['usn']);
$gender = trim($_POST['gender']);
$email = trim($_POST['email']);
$phone = trim($_POST['phone']);
$department = trim($_POST['department']);
$batch = trim($_POST['batch']);
$skills = trim($_POST['skills']);
$domain = trim($_POST['domain']);

// Handle resume upload (PDF only)
$resume_path = null;
if (!empty($_FILES['resume']) && $_FILES['resume']['error'] === UPLOAD_ERR_OK) {
  $tmp = $_FILES['resume']['tmp_name'];
  $name = $_FILES['resume']['name'];
  $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
  if ($ext !== 'pdf') {
    http_response_code(400);
    echo json_encode(['error' => 'Only PDF files are allowed']);
    exit;
  }
  $uploadsDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'resumes';
  if (!is_dir($uploadsDir)) { mkdir($uploadsDir, 0777, true); }
  $unique = time() . '-' . mt_rand(100000000, 999999999) . '.pdf';
  $dest = $uploadsDir . DIRECTORY_SEPARATOR . $unique;
  if (!move_uploaded_file($tmp, $dest)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save uploaded file']);
    exit;
  }
  // Public path relative to project root
  $resume_path = 'uploads/resumes/' . $unique;
}

// Insert into MySQL
$sql = "INSERT INTO students (first_name,last_name,usn,gender,email,phone,department,batch,skills,domain,resume_path)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)";
$stmt = $mysqli->prepare($sql);
if (!$stmt) {
  http_response_code(500);
  echo json_encode(['error' => 'Prepare failed: ' . $mysqli->error]);
  exit;
}

$stmt->bind_param(
  'sssssssssss',
  $first_name,
  $last_name,
  $usn,
  $gender,
  $email,
  $phone,
  $department,
  $batch,
  $skills,
  $domain,
  $resume_path
);

if (!$stmt->execute()) {
  if ($mysqli->errno === 1062) { // duplicate key
    $field = (strpos($mysqli->error, 'usn') !== false) ? 'USN' : ((strpos($mysqli->error, 'email') !== false) ? 'email' : 'data');
    http_response_code(409);
    echo json_encode(['error' => "Student with this $field already exists"]);
  } else {
    http_response_code(500);
    echo json_encode(['error' => 'Insert failed: ' . $mysqli->error]);
  }
  exit;
}

echo json_encode([
  'message' => 'Student registered successfully',
  'studentId' => $stmt->insert_id,
  'resumePath' => $resume_path
]);


