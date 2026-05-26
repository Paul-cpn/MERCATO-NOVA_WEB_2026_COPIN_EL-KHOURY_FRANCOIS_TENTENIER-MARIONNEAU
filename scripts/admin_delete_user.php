<?php
require_once '../bdd/connexion.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$id_admin = isset($data['id_admin']) ? intval($data['id_admin']) : 0;
$id_target = isset($data['id_target']) ? intval($data['id_target']) : 0;

try {
    // 1. Vérifier si l'utilisateur est bien admin
    $stmtCheck = $pdo->prepare("SELECT role_user FROM user WHERE id_user = :id");
    $stmtCheck->execute(['id' => $id_admin]);
    $admin = $stmtCheck->fetch();

    if (!$admin || $admin['role_user'] !== 'admin') {
        echo json_encode(['error' => 'Accès non autorisé']);
        exit;
    }

    if ($id_admin === $id_target) {
        echo json_encode(['error' => 'Vous ne pouvez pas supprimer votre propre compte admin']);
        exit;
    }

    $pdo->beginTransaction();

    // 2. Nettoyage des données liées à l'utilisateur
    // A. Supprimer ses annonces (et tout ce qui y est lié via le script existant ou une logique similaire)
    $stmtAnn = $pdo->prepare("SELECT id_annonce FROM annonce WHERE id_user = :u");
    $stmtAnn->execute(['u' => $id_target]);
    $annonces = $stmtAnn->fetchAll();

    foreach ($annonces as $ann) {
        $id_a = $ann['id_annonce'];
        $pdo->prepare("DELETE FROM offre WHERE id_enchere IN (SELECT id_enchere FROM enchere WHERE id_annonce = :a)")->execute(['a' => $id_a]);
        $pdo->prepare("DELETE FROM enchere WHERE id_annonce = :a")->execute(['a' => $id_a]);
        $pdo->prepare("DELETE FROM echange WHERE id_negociation IN (SELECT id_negociation FROM negociation WHERE id_annonce = :a)")->execute(['a' => $id_a]);
        $pdo->prepare("DELETE FROM negociation WHERE id_annonce = :a")->execute(['a' => $id_a]);
        $pdo->prepare("DELETE FROM image WHERE id_annonce = :a")->execute(['a' => $id_a]);
        $pdo->prepare("DELETE FROM favoris WHERE id_annonce = :a")->execute(['a' => $id_a]);
        $pdo->prepare("DELETE FROM panier WHERE id_annonce = :a")->execute(['a' => $id_a]);
        $pdo->prepare("DELETE FROM transaction WHERE id_annonce = :a")->execute(['a' => $id_a]);
        $pdo->prepare("DELETE FROM annonce WHERE id_annonce = :a")->execute(['a' => $id_a]);
    }

    // B. Supprimer ses autres données perso
    $pdo->prepare("DELETE FROM avis WHERE id_user_auteur = :u OR id_user_cible = :u")->execute(['u' => $id_target]);
    $pdo->prepare("DELETE FROM panier WHERE id_user = :u")->execute(['u' => $id_target]);
    $pdo->prepare("DELETE FROM favoris WHERE id_user = :u")->execute(['u' => $id_target]);
    $pdo->prepare("DELETE FROM echange WHERE id_user = :u")->execute(['u' => $id_target]);
    $pdo->prepare("DELETE FROM negociation WHERE id_user_acheteur = :u OR id_user_vendeur = :u")->execute(['u' => $id_target]);
    $pdo->prepare("DELETE FROM transaction WHERE id_user_acheteur = :u OR id_user_vendeur = :u")->execute(['u' => $id_target]);
    $pdo->prepare("DELETE FROM notification WHERE id_user = :u")->execute(['u' => $id_target]);

    // 3. Suppression finale de l'utilisateur
    $pdo->prepare("DELETE FROM user WHERE id_user = :u")->execute(['u' => $id_target]);

    $pdo->commit();
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(['error' => $e->getMessage()]);
}
?>
