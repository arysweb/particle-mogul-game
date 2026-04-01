<?php
header('Content-Type: application/json');
require '../admin/auth_check.php';
require 'db.php';

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['id'])) {
    echo json_encode(['error' => 'Missing ID']);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO research_items (id, name, description, image_url, grid_x, grid_y, cost_json, duration_ms, effect_json) 
        VALUES (:id, :name, :description, :image_url, :grid_x, :grid_y, :cost_json, :duration_ms, :effect_json)
        ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url), grid_x=VALUES(grid_x), grid_y=VALUES(grid_y), cost_json=VALUES(cost_json), duration_ms=VALUES(duration_ms), effect_json=VALUES(effect_json)");
    
    $stmt->execute([
        'id' => $input['id'],
        'name' => $input['name'],
        'description' => $input['description'],
        'image_url' => $input['image_url'],
        'grid_x' => (int)$input['grid_x'],
        'grid_y' => (int)$input['grid_y'],
        'cost_json' => $input['cost_json'],
        'duration_ms' => (int)$input['duration_ms'],
        'effect_json' => $input['effect_json']
    ]);

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
