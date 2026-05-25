<?php
require_once '../bdd/connexion.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id_user'])) {
    echo json_encode(['error' => 'ID utilisateur manquant']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE notification SET lu_notification = TRUE WHERE id_user = :u AND lu_notification = FALSE");
    $stmt->execute(['u' => intval($data['id_user'])]);

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
