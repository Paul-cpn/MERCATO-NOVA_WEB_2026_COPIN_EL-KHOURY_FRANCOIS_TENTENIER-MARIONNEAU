<?php
require_once '../bdd/connexion.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id_user'])) {
    echo json_encode(['error' => 'ID utilisateur manquant']);
    exit;
}

try {
    $id_user = intval($data['id_user']);
    $nom = trim($data['nom'] ?? '');
    $prenom = trim($data['prenom'] ?? '');
    $email = trim($data['email'] ?? '');
    $pseudo = trim($data['pseudo'] ?? '');
    $adresse = trim($data['adresse'] ?? '');
    $oldPassword = $data['oldPassword'] ?? '';
    $newPassword = $data['newPassword'] ?? '';

    // 1. Validation stricte
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) throw new Exception("Format d'email invalide.");
    if (strlen($nom) < 2 || strlen($nom) > 50) throw new Exception("Le nom doit faire entre 2 et 50 caractères.");
    if (strlen($prenom) < 2 || strlen($prenom) > 50) throw new Exception("Le prénom doit faire entre 2 et 50 caractères.");
    if (strlen($pseudo) < 3 || strlen($pseudo) > 20) throw new Exception("Le pseudo doit faire entre 3 et 20 caractères.");
    if (strlen($adresse) > 200) throw new Exception("L'adresse est trop longue.");

    // 2. Vérifier si le nouveau pseudo ou mail est déjà pris par un AUTRE utilisateur
    $stmt = $pdo->prepare("SELECT id_user, mdp_user FROM user WHERE id_user = :id");
    $stmt->execute(['id' => $id_user]);
    $currentUser = $stmt->fetch();

    if (!$currentUser) throw new Exception("Utilisateur non trouvé.");

    $stmt = $pdo->prepare("SELECT id_user FROM user WHERE (pseudo_user = :p OR email_user = :m) AND id_user != :id");
    $stmt->execute(['p' => $pseudo, 'm' => $email, 'id' => $id_user]);
    if ($stmt->fetch()) {
        echo json_encode(['error' => 'Pseudo ou Email déjà utilisé par un autre compte']);
        exit;
    }

    // 3. Gestion du mot de passe
    $updatePasswordSql = "";
    $params = [
        'n' => $nom,
        'p' => $prenom,
        'e' => $email,
        'ps' => $pseudo,
        'a' => $adresse,
        'id' => $id_user
    ];

    if (!empty($newPassword)) {
        if (empty($oldPassword)) throw new Exception("Le mot de passe actuel est requis pour changer de mot de passe.");
        
        // Vérification de l'ancien mot de passe (en clair selon la convention du projet)
        if ($oldPassword !== $currentUser['mdp_user']) {
            throw new Exception("Le mot de passe actuel est incorrect.");
        }
        
        if (strlen($newPassword) < 8) throw new Exception("Le nouveau mot de passe doit faire au moins 8 caractères.");
        
        $updatePasswordSql = ", mdp_user = :mdp";
        $params['mdp'] = $newPassword;
    }

    // 4. Mise à jour
    $sql = "UPDATE user SET 
                nom_user = :n, 
                prenom_user = :p, 
                email_user = :e, 
                pseudo_user = :ps, 
                adresse_user = :a 
                $updatePasswordSql
            WHERE id_user = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    // 4. Retourner les données mises à jour pour synchroniser le localStorage
    $stmt = $pdo->prepare("SELECT * FROM user WHERE id_user = :id");
    $stmt->execute(['id' => $id_user]);
    $user = $stmt->fetch();

    echo json_encode(['success' => true, 'user' => $user]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
