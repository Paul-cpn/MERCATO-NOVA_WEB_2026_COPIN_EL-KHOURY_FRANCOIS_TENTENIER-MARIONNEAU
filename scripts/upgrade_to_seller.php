<?php
require_once '../bdd/connexion.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id_user'])) {
    echo json_encode(['error' => 'ID utilisateur manquant']);
    exit;
}

$id_user = intval($data['id_user']);

try {
    // Mettre à jour le rôle de l'utilisateur
    $stmt = $pdo->prepare("UPDATE user SET role_user = 'vendeur' WHERE id_user = :id AND role_user = 'acheteur'");
    $stmt->execute(['id' => $id_user]);

    if ($stmt->rowCount() > 0) {
        // Récupérer les nouvelles infos utilisateur
        $stmt = $pdo->prepare("SELECT id_user, nom_user, prenom_user, email_user, pseudo_user, adresse_user, role_user FROM user WHERE id_user = :id");
        $stmt->execute(['id' => $id_user]);
        $user = $stmt->fetch();
        
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['error' => 'Impossible de mettre à jour le rôle (déjà vendeur ou admin ?)']);
    }
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
