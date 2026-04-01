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
    $stmt = $pdo->prepare("DELETE FROM research_items WHERE id = ?");
    $stmt->execute([$input['id']]);
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
