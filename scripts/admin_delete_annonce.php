<?php
require_once '../bdd/connexion.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id_annonce']) || !isset($data['id_user'])) {
    echo json_encode(['error' => 'Données manquantes']);
    exit;
}

try {
    $id_annonce = intval($data['id_annonce']);
    $id_user = intval($data['id_user']);

    // 1. Vérifier les permissions
    // On autorise la suppression si l'utilisateur est ADMIN 
    // OU si l'utilisateur est le PROPRIÉTAIRE de l'annonce
    $stmt = $pdo->prepare("SELECT id_user, (SELECT role_user FROM user WHERE id_user = :u) as role FROM annonce WHERE id_annonce = :a");
    $stmt->execute(['u' => $id_user, 'a' => $id_annonce]);
    $annonce_info = $stmt->fetch();

    if (!$annonce_info || ($annonce_info['id_user'] != $id_user && $annonce_info['role'] !== 'admin')) {
        echo json_encode(['error' => 'Permission refusée']);
        exit;
    }

    $pdo->beginTransaction();

    // 2. SUPPRESSION DANS L'ORDRE DES DÉPENDANCES (du plus profond au plus haut)
    
    // A. Enchères (Offres d'abord, puis l'Enchère)
    $pdo->prepare("DELETE FROM offre WHERE id_enchere IN (SELECT id_enchere FROM enchere WHERE id_annonce = :a)")->execute(['a' => $id_annonce]);
    $pdo->prepare("DELETE FROM enchere WHERE id_annonce = :a")->execute(['a' => $id_annonce]);

    // B. Négociations (Messages/Echanges d'abord, puis la Négociation)
    $pdo->prepare("DELETE FROM echange WHERE id_negociation IN (SELECT id_negociation FROM negociation WHERE id_annonce = :a)")->execute(['a' => $id_annonce]);
    $pdo->prepare("DELETE FROM negociation WHERE id_annonce = :a")->execute(['a' => $id_annonce]);

    // C. Autres liens simples
    $pdo->prepare("DELETE FROM image WHERE id_annonce = :a")->execute(['a' => $id_annonce]);
    $pdo->prepare("DELETE FROM favoris WHERE id_annonce = :a")->execute(['a' => $id_annonce]);
    $pdo->prepare("DELETE FROM panier WHERE id_annonce = :a")->execute(['a' => $id_annonce]);
    
    // D. Transactions (On garde l'historique normalement, mais pour un nettoyage complet on supprime)
    $pdo->prepare("DELETE FROM transaction WHERE id_annonce = :a")->execute(['a' => $id_annonce]);

    // 3. Suppression finale de l'annonce
    $stmt = $pdo->prepare("DELETE FROM annonce WHERE id_annonce = :a");
    $stmt->execute(['a' => $id_annonce]);

    $pdo->commit();
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(['error' => $e->getMessage()]);
}
?>
