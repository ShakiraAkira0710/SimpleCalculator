<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$uploadDir = __DIR__ . '/../json_data/';

// Create directory if it doesn't exist
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['filename']) || !isset($input['data'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid data']);
    exit;
}

$filename = basename($input['filename']);
$filepath = $uploadDir . $filename;

// Save JSON data
if (file_put_contents($filepath, json_encode($input['data'], JSON_PRETTY_PRINT))) {
    echo json_encode([
        'success' => true,
        'message' => 'History saved successfully',
        'filename' => $filename,
        'total' => count($input['data']['calculations'])
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to save file']);
}
?>