<?php
require_once '../bdd/connexion.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['pseudo']) || !isset($data['mdp'])) {
    echo json_encode(['error' => 'Champs manquants']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM user WHERE pseudo_user = :pseudo");
    $stmt->execute(['pseudo' => $data['pseudo']]);
    $user = $stmt->fetch();

    if ($user && $user['mdp_user'] === $data['mdp']) { // Note: Idéalement utiliser password_verify
        unset($user['mdp_user']); // Ne pas renvoyer le mdp
        session_start();
        $_SESSION['user'] = $user;
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['error' => 'Identifiants incorrects']);
    }
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
