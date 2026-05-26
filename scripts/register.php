<?php
require_once '../bdd/connexion.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['nom']) || !isset($data['prenom']) || !isset($data['mail']) || !isset($data['mdp']) || !isset($data['pseudo'])) {
    echo json_encode(['error' => 'Champs obligatoires manquants']);
    exit;
}

try {
    $nom = trim($data['nom']);
    $prenom = trim($data['prenom']);
    $email = trim($data['mail']);
    $mdp = $data['mdp'];
    $pseudo = trim($data['pseudo']);
    $adresse = isset($data['adresse']) ? trim($data['adresse']) : '';

    // 1. Validation stricte
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) throw new Exception("Format d'email invalide.");
    if (strlen($nom) < 2 || strlen($nom) > 50) throw new Exception("Le nom doit faire entre 2 et 50 caractères.");
    if (strlen($prenom) < 2 || strlen($prenom) > 50) throw new Exception("Le prénom doit faire entre 2 et 50 caractères.");
    if (strlen($pseudo) < 3 || strlen($pseudo) > 20) throw new Exception("Le pseudo doit faire entre 3 et 20 caractères.");
    if (strlen($mdp) < 8) throw new Exception("Le mot de passe doit faire au moins 8 caractères.");
    if (strlen($adresse) > 200) throw new Exception("L'adresse est trop longue.");

    // 2. Vérifier si le pseudo ou mail existe déjà
    $stmt = $pdo->prepare("SELECT id_user FROM user WHERE pseudo_user = :p OR email_user = :m");
    $stmt->execute(['p' => $pseudo, 'm' => $email]);
    if ($stmt->fetch()) {
        echo json_encode(['error' => 'Pseudo ou Email déjà utilisé']);
        exit;
    }

    // 3. Insertion
    $sql = "INSERT INTO user (nom_user, prenom_user, email_user, mdp_user, pseudo_user, adresse_user, role_user) 
            VALUES (:nom, :prenom, :mail, :mdp, :pseudo, :adresse, 'acheteur')";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'nom'     => $nom,
        'prenom'  => $prenom,
        'mail'    => $email,
        'mdp'     => $mdp, // Idéalement haché avec password_hash
        'pseudo'  => $pseudo,
        'adresse' => $adresse,
    ]);

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
