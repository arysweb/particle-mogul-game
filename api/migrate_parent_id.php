<?php
require 'db.php';
try {
    $pdo->exec("ALTER TABLE research_items ADD COLUMN parent_id VARCHAR(50) DEFAULT NULL");
    echo json_encode(['success' => true, 'message' => 'Table updated with parent_id']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
