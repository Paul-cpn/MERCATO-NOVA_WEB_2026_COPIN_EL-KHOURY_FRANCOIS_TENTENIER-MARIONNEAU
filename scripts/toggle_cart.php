<?php
require_once '../bdd/connexion.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id_annonce']) || !isset($data['id_user'])) {
    echo json_encode(['error' => 'Données manquantes']);
    exit;
}

$id_annonce = intval($data['id_annonce']);
$id_user = intval($data['id_user']);

try {
    // Vérifier si déjà dans le panier
    $stmt = $pdo->prepare("SELECT id_panier FROM panier WHERE id_user = :u AND id_annonce = :a");
    $stmt->execute(['u' => $id_user, 'a' => $id_annonce]);
    $exists = $stmt->fetch();

    if ($exists) {
        // Retirer du panier
        $stmt = $pdo->prepare("DELETE FROM panier WHERE id_user = :u AND id_annonce = :a");
        $stmt->execute(['u' => $id_user, 'a' => $id_annonce]);
        echo json_encode(['success' => true, 'action' => 'removed']);
    } else {
        // Ajouter au panier
        $stmt = $pdo->prepare("INSERT INTO panier (id_user, id_annonce) VALUES (:u, :a)");
        $stmt->execute(['u' => $id_user, 'a' => $id_annonce]);
        echo json_encode(['success' => true, 'action' => 'added']);
    }
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
