<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$dataDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

function clean_client_id(string $clientId): string {
    $clientId = preg_replace('/[^a-zA-Z0-9_-]/', '', $clientId) ?? '';
    return substr($clientId, 0, 80);
}

function data_file(string $dataDir, string $clientId): string {
    return $dataDir . DIRECTORY_SEPARATOR . 'rewire-' . $clientId . '.json';
}

if ($method === 'GET') {
    $clientId = clean_client_id($_GET['clientId'] ?? '');
    if ($clientId === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Missing clientId']);
        exit;
    }

    $file = data_file($dataDir, $clientId);
    if (!is_file($file)) {
        http_response_code(404);
        echo json_encode(['error' => 'No data found']);
        exit;
    }

    readfile($file);
    exit;
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input') ?: '';
    $body = json_decode($raw, true);
    if (!is_array($body)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
        exit;
    }

    $clientId = clean_client_id((string)($body['clientId'] ?? ''));
    $payload = $body['payload'] ?? null;
    if ($clientId === '' || !is_array($payload)) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing clientId or payload']);
        exit;
    }

    $payload['serverSavedAt'] = gmdate('c');
    $json = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    if ($json === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Unable to encode payload']);
        exit;
    }

    file_put_contents(data_file($dataDir, $clientId), $json, LOCK_EX);
    echo json_encode(['ok' => true, 'savedAt' => $payload['serverSavedAt']]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
