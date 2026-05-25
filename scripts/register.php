<?php
require_once '../bdd/connexion.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['nom']) || !isset($data['prenom']) || !isset($data['mail']) || !isset($data['mdp']) || !isset($data['pseudo'])) {
    echo json_encode(['error' => 'Champs obligatoires manquants']);
    exit;
}

try {
    // Vérifier si le pseudo ou mail existe déjà
    $stmt = $pdo->prepare("SELECT id_user FROM user WHERE pseudo_user = :p OR email_user = :m");
    $stmt->execute(['p' => $data['pseudo'], 'm' => $data['mail']]);
    if ($stmt->fetch()) {
        echo json_encode(['error' => 'Pseudo ou Email déjà utilisé']);
        exit;
    }

    $sql = "INSERT INTO user (nom_user, prenom_user, email_user, mdp_user, pseudo_user, adresse_user, role_user) 
            VALUES (:nom, :prenom, :mail, :mdp, :pseudo, :adresse, 'acheteur')";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'nom'     => $data['nom'],
        'prenom'  => $data['prenom'],
        'mail'    => $data['mail'],
        'mdp'     => $data['mdp'], 
        'pseudo'  => $data['pseudo'],
        'adresse' => $data['adresse'] ?? '',
    ]);

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
