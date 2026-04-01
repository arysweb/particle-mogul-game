<?php
header('Content-Type: application/json');
require 'db.php';

$playerUid = $_GET['player_uid'] ?? null;

if (!$playerUid) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing player_uid']);
    exit;
}

try {
    // 1. Find Player
    $stmt = $pdo->prepare("SELECT player_id, player_name FROM players WHERE player_uid = ?");
    $stmt->execute([$playerUid]);
    $player = $stmt->fetch();

    if (!$player) {
        echo json_encode(['success' => false, 'message' => 'Player not found']);
        exit;
    }

    $playerId = $player['player_id'];

    // 2. Fetch Latest Save (Slot 1)
    $stmt = $pdo->prepare("SELECT save_data, updated_at FROM game_saves WHERE player_id = ? AND save_slot = 1");
    $stmt->execute([$playerId]);
    $save = $stmt->fetch();

    if (!$save) {
        echo json_encode(['success' => false, 'message' => 'No save data found for this player']);
        exit;
    }

    // Return the save data
    echo json_encode([
        'success' => true,
        'player_name' => $player['player_name'],
        'save_data' => json_decode($save['save_data'], true),
        'updated_at' => $save['updated_at']
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
