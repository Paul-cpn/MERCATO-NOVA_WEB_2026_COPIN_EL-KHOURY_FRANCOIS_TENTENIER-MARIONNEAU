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

    // 1. Validation stricte
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) throw new Exception("Format d'email invalide.");
    if (strlen($nom) < 2 || strlen($nom) > 50) throw new Exception("Le nom doit faire entre 2 et 50 caractères.");
    if (strlen($prenom) < 2 || strlen($prenom) > 50) throw new Exception("Le prénom doit faire entre 2 et 50 caractères.");
    if (strlen($pseudo) < 3 || strlen($pseudo) > 20) throw new Exception("Le pseudo doit faire entre 3 et 20 caractères.");
    if (strlen($adresse) > 200) throw new Exception("L'adresse est trop longue.");

    // 2. Vérifier si le nouveau pseudo ou mail est déjà pris par un AUTRE utilisateur
    $stmt = $pdo->prepare("SELECT id_user FROM user WHERE (pseudo_user = :p OR email_user = :m) AND id_user != :id");
    $stmt->execute(['p' => $pseudo, 'm' => $email, 'id' => $id_user]);
    if ($stmt->fetch()) {
        echo json_encode(['error' => 'Pseudo ou Email déjà utilisé par un autre compte']);
        exit;
    }

    // 3. Mise à jour
    $sql = "UPDATE user SET 
                nom_user = :n, 
                prenom_user = :p, 
                email_user = :e, 
                pseudo_user = :ps, 
                adresse_user = :a 
            WHERE id_user = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'n' => $nom,
        'p' => $prenom,
        'e' => $email,
        'ps' => $pseudo,
        'a' => $adresse,
        'id' => $id_user
    ]);

    // 4. Retourner les données mises à jour pour synchroniser le localStorage
    $stmt = $pdo->prepare("SELECT * FROM user WHERE id_user = :id");
    $stmt->execute(['id' => $id_user]);
    $user = $stmt->fetch();

    echo json_encode(['success' => true, 'user' => $user]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
