<?php
require_once '../bdd/connexion.php';
header('Content-Type: application/json');

$id_user = isset($_GET['id_user']) ? intval($_GET['id_user']) : 0;

if ($id_user <= 0) {
    echo json_encode([]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM notification WHERE id_user = :u ORDER BY date_notification DESC LIMIT 50");
    $stmt->execute(['u' => $id_user]);
    $notifications = $stmt->fetchAll();

    echo json_encode($notifications);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
