<?php
header('Content-Type: application/json');
require 'db.php';

try {
    $stmt = $pdo->query("SELECT * FROM research_items ORDER BY created_at ASC");
    $items = $stmt->fetchAll();

    $formattedItems = array_map(function($item) {
        return [
            'id' => $item['id'],
            'name' => $item['name'],
            'description' => $item['description'],
            'image' => $item['image_url'],
            'gridPosition' => [
                'x' => (int)$item['grid_x'],
                'y' => (int)$item['grid_y']
            ],
            'cost' => json_decode($item['cost_json'], true),
            'durationMs' => (int)$item['duration_ms'],
            'effect' => json_decode($item['effect_json'], true)
        ];
    }, $items);

    echo json_encode($formattedItems);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
