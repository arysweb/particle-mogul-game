<?php
header('Content-Type: application/json');
require 'db.php';

// Read JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['error' => 'Invalid JSON input']);
    exit;
}

$playerUid = $input['player_uid'] ?? null;
$playerName = $input['player_name'] ?? 'Anonymous';
$saveDataStr = $input['save_data'] ?? null; // Expects JSON structure or string

if (!$playerUid || !$saveDataStr) {
    echo json_encode(['error' => 'Missing player_uid or save_data']);
    exit;
}

$saveData = is_string($saveDataStr) ? json_decode($saveDataStr, true) : $saveDataStr;

try {
    $pdo->beginTransaction();

    // 1. Upsert Player
    $stmt = $pdo->prepare("SELECT player_id FROM players WHERE player_uid = ?");
    $stmt->execute([$playerUid]);
    $player = $stmt->fetch();

    if (!$player) {
        $stmt = $pdo->prepare("INSERT INTO players (player_uid, player_name) VALUES (?, ?)");
        $stmt->execute([$playerUid, $playerName]);
        $playerId = $pdo->lastInsertId();
    } else {
        $playerId = $player['player_id'];
        $stmt = $pdo->prepare("UPDATE players SET last_login_at = CURRENT_TIMESTAMP, player_name = ? WHERE player_id = ?");
        $stmt->execute([$playerName, $playerId]);
    }

    // 2. Upsert Game Save (Slot 1)
    $stmt = $pdo->prepare("SELECT save_id FROM game_saves WHERE player_id = ? AND save_slot = 1");
    $stmt->execute([$playerId]);
    $save = $stmt->fetch();
    
    $jsonData = is_string($saveDataStr) ? $saveDataStr : json_encode($saveDataStr);

    if (!$save) {
        $stmt = $pdo->prepare("INSERT INTO game_saves (player_id, save_slot, save_data) VALUES (?, 1, ?)");
        $stmt->execute([$playerId, $jsonData]);
    } else {
        $stmt = $pdo->prepare("UPDATE game_saves SET save_data = ?, updated_at = CURRENT_TIMESTAMP WHERE save_id = ?");
        $stmt->execute([$jsonData, $save['save_id']]);
    }

    // 3. Upsert Player Statistics
    // Extract stats from saveData
    $totalParticles = $saveData['totalParticlesDropped'] ?? 0;
    $walletBalance  = $saveData['state']['walletBalance'] ?? 0;
    $extractorLvl   = $saveData['extractorLevel'] ?? 1;
    $goldDrops      = $saveData['state']['goldDrops'] ?? 0;
    $rareUnlocked   = ($saveData['state']['rareParticlesUnlocked'] ?? false) ? 1 : 0;

    $stmt = $pdo->prepare("SELECT stat_id FROM player_statistics WHERE player_id = ?");
    $stmt->execute([$playerId]);
    $stats = $stmt->fetch();

    if (!$stats) {
        $stmt = $pdo->prepare("INSERT INTO player_statistics (player_id, total_particles_dropped, highest_wallet_balance, extractor_level_reached, rare_particles_unlocked, total_gold_drops) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$playerId, $totalParticles, $walletBalance, $extractorLvl, $rareUnlocked, $goldDrops]);
    } else {
        // Update keeping the highest values where it makes sense
        $stmt = $pdo->prepare("UPDATE player_statistics SET 
            total_particles_dropped = GREATEST(total_particles_dropped, ?),
            highest_wallet_balance = GREATEST(highest_wallet_balance, ?),
            extractor_level_reached = GREATEST(extractor_level_reached, ?),
            rare_particles_unlocked = GREATEST(rare_particles_unlocked, ?),
            total_gold_drops = GREATEST(total_gold_drops, ?),
            updated_at = CURRENT_TIMESTAMP
            WHERE player_id = ?");
        $stmt->execute([$totalParticles, $walletBalance, $extractorLvl, $rareUnlocked, $goldDrops, $playerId]);
    }

    $pdo->commit();
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(['error' => $e->getMessage()]);
}
?>
