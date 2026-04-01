<?php
require 'db.php';

try {
    // 1. Create Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `research_items` (
      `id` VARCHAR(50) PRIMARY KEY,
      `name` VARCHAR(100) NOT NULL,
      `description` TEXT,
      `image_url` VARCHAR(255),
      `grid_x` INT DEFAULT 0,
      `grid_y` INT DEFAULT 0,
      `cost_json` JSON,
      `duration_ms` INT DEFAULT 5000,
      `effect_json` JSON,
      `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    // 2. Initial Data Migration
    $initialResearches = [
        [
            'id' => 'unlock-trader',
            'name' => 'Trader',
            'description' => 'Auto-sells particles.',
            'image_url' => 'https://pub-136c85f7b0db4549ba25bf23723988bf.r2.dev/assets/image/research-item.png',
            'grid_x' => 0,
            'grid_y' => 0,
            'cost_json' => json_encode(['coins' => 100, 'particles' => ['sand' => 100]]),
            'duration_ms' => 5000,
            'effect_json' => json_encode(['type' => 'unlock_trader'])
        ],
        [
            'id' => 'extractor-output-boost-1',
            'name' => 'Extractor',
            'description' => 'Boosts extractor output by 5%.',
            'image_url' => 'https://pub-136c85f7b0db4549ba25bf23723988bf.r2.dev/assets/image/extractor.png',
            'grid_x' => 2,
            'grid_y' => 0,
            'cost_json' => json_encode(['coins' => 250, 'particles' => ['sand' => 250, 'iron' => 10]]),
            'duration_ms' => 7000,
            'effect_json' => json_encode(['type' => 'extractor_output_multiplier', 'value' => 1.05])
        ],
        [
            'id' => 'storage-boost-1',
            'name' => 'Storage',
            'description' => 'Increases sell capacity by +50.',
            'image_url' => 'https://pub-136c85f7b0db4549ba25bf23723988bf.r2.dev/assets/image/sell-cap.png',
            'grid_x' => -2,
            'grid_y' => 0,
            'cost_json' => json_encode(['coins' => 500, 'particles' => ['iron' => 25, 'copper' => 10]]),
            'duration_ms' => 12000,
            'effect_json' => json_encode(['type' => 'sell_cap_boost', 'value' => 50])
        ]
    ];

    foreach ($initialResearches as $res) {
        $stmt = $pdo->prepare("INSERT INTO research_items (id, name, description, image_url, grid_x, grid_y, cost_json, duration_ms, effect_json) 
            VALUES (:id, :name, :description, :image_url, :grid_x, :grid_y, :cost_json, :duration_ms, :effect_json)
            ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url), grid_x=VALUES(grid_x), grid_y=VALUES(grid_y), cost_json=VALUES(cost_json), duration_ms=VALUES(duration_ms), effect_json=VALUES(effect_json)");
        $stmt->execute($res);
    }

    echo "Research table initialized and seeded successfully!\n";
} catch (Exception $e) {
    die("Database Error: " . $e->getMessage());
}
?>
