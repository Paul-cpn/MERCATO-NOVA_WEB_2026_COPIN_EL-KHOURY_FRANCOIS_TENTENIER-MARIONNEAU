<?php
require_once '../bdd/connexion.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$id_admin = isset($data['id_admin']) ? intval($data['id_admin']) : 0;

try {
    // 1. Vérifier si l'utilisateur est bien admin
    $stmtCheck = $pdo->prepare("SELECT role_user FROM user WHERE id_user = :id");
    $stmtCheck->execute(['id' => $id_admin]);
    $user = $stmtCheck->fetch();

    if (!$user || $user['role_user'] !== 'admin') {
        echo json_encode(['error' => 'Accès non autorisé']);
        exit;
    }

    // 2. Récupérer tous les utilisateurs
    $users = $pdo->query("SELECT id_user, nom_user, prenom_user, email_user, pseudo_user, role_user, adresse_user FROM user ORDER BY id_user DESC")->fetchAll();

    // 3. Récupérer tous les articles avec le nom du vendeur et l'image principale
    $articles = $pdo->query("SELECT a.*, u.pseudo_user as vendeur_pseudo,
                                (SELECT url_image FROM image WHERE id_annonce = a.id_annonce ORDER BY ordre_image ASC LIMIT 1) as image_url
                             FROM annonce a
                             JOIN user u ON a.id_user = u.id_user
                             ORDER BY a.date_annonce DESC")->fetchAll();

    echo json_encode([
        'success' => true,
        'users' => $users,
        'articles' => $articles
    ]);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
