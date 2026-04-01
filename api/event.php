<?php
header('Content-Type: application/json');
require 'db.php';

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    echo json_encode(['error' => 'Invalid JSON input']);
    exit;
}

$playerUid = $input['player_uid'] ?? null;
$eventType = $input['event_type'] ?? null;
$eventData = $input['event_data'] ?? [];

if (!$playerUid || !$eventType) {
    echo json_encode(['error' => 'Missing player_uid or event_type']);
    exit;
}

try {
    // Get Player ID
    $stmt = $pdo->prepare("SELECT player_id FROM players WHERE player_uid = ?");
    $stmt->execute([$playerUid]);
    $player = $stmt->fetch();
    if (!$player) {
        echo json_encode(['error' => 'Player not found']);
        exit;
    }
    $playerId = $player['player_id'];

    switch ($eventType) {
        case 'market_trade':
            $stmt = $pdo->prepare("INSERT INTO market_trades (player_id, from_particle_type, to_particle_type, from_amount, to_amount, trade_rate) 
                                 VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $playerId,
                $eventData['from_type'],
                $eventData['to_type'],
                $eventData['from_amount'],
                $eventData['to_amount'],
                $eventData['rate']
            ]);
            break;

        case 'session_start':
            $stmt = $pdo->prepare("INSERT INTO play_sessions (player_id, session_start) VALUES (?, CURRENT_TIMESTAMP)");
            $stmt->execute([$playerId]);
            $sessionId = $pdo->lastInsertId();
            echo json_encode(['success' => true, 'session_id' => $sessionId]);
            exit;

        case 'session_update':
            $sessionId = $eventData['session_id'] ?? null;
            if ($sessionId) {
                $stmt = $pdo->prepare("UPDATE play_sessions SET 
                                     session_end = CURRENT_TIMESTAMP, 
                                     duration_seconds = TIMESTAMPDIFF(SECOND, session_start, CURRENT_TIMESTAMP),
                                     particles_dropped = ?,
                                     money_earned = ?
                                     WHERE session_id = ? AND player_id = ?");
                $stmt->execute([
                    $eventData['particles_dropped'] ?? 0,
                    $eventData['money_earned'] ?? 0,
                    $sessionId,
                    $playerId
                ]);
            }
            break;
    }

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
