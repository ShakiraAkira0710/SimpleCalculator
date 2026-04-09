<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$uploadDir = __DIR__ . '/../json_data/';
$filename = isset($_GET['file']) ? basename($_GET['file']) : 'history.json';

$filepath = $uploadDir . $filename;

// Create directory if it doesn't exist
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if (!file_exists($filepath)) {
    // Create default history file
    $defaultData = [
        'filename' => $filename,
        'lastUpdated' => date('c'),
        'totalCalculations' => 0,
        'calculations' => []
    ];
    
    file_put_contents($filepath, json_encode($defaultData, JSON_PRETTY_PRINT));
    
    echo json_encode([
        'success' => true,
        'data' => $defaultData,
        'message' => 'New history file created'
    ]);
    exit;
}

$content = file_get_contents($filepath);
$data = json_decode($content, true);

if ($data) {
    echo json_encode([
        'success' => true,
        'data' => $data,
        'filename' => $filename
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON format']);
}
?>