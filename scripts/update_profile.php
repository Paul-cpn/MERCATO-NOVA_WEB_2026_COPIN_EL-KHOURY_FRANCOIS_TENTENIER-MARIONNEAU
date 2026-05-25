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
    $sql = "UPDATE user SET 
            nom_user = :nom, 
            prenom_user = :prenom, 
            email_user = :email, 
            pseudo_user = :pseudo, 
            adresse_user = :adresse 
            WHERE id_user = :id";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'nom'     => $data['nom'],
        'prenom'  => $data['prenom'],
        'email'   => $data['email'],
        'pseudo'  => $data['pseudo'],
        'adresse' => $data['adresse'],
        'id'      => $id_user
    ]);

    // Récupérer les nouvelles infos pour mettre à jour le localStorage
    $stmt = $pdo->prepare("SELECT * FROM user WHERE id_user = :id");
    $stmt->execute(['id' => $id_user]);
    $user = $stmt->fetch();

    echo json_encode(['success' => true, 'user' => $user]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
