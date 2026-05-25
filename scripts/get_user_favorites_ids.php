<?php
require_once '../bdd/connexion.php';
header('Content-Type: application/json');

$id_user = isset($_GET['id_user']) ? intval($_GET['id_user']) : 0;

if ($id_user <= 0) {
    echo json_encode([]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id_annonce FROM favoris WHERE id_user = :u");
    $stmt->execute(['u' => $id_user]);
    $ids = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode($ids);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
