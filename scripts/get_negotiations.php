<?php
require_once '../bdd/connexion.php';
header('Content-Type: application/json');

$id_user = isset($_GET['id_user']) ? intval($_GET['id_user']) : 0;

if ($id_user <= 0) {
    echo json_encode([]);
    exit;
}

try {
    // Récupérer les négociations où l'utilisateur est soit acheteur soit vendeur
    $sql = "SELECT n.*, a.titre_annonce, 
                   u_ac.pseudo_user as acheteur_pseudo, u_v.pseudo_user as vendeur_pseudo,
                   (SELECT message_echange FROM echange WHERE id_negociation = n.id_negociation ORDER BY date_echange DESC LIMIT 1) as dernier_message,
                   (SELECT date_echange FROM echange WHERE id_negociation = n.id_negociation ORDER BY date_echange DESC LIMIT 1) as date_dernier_message
            FROM negociation n
            JOIN annonce a ON n.id_annonce = a.id_annonce
            JOIN user u_ac ON n.id_user_acheteur = u_ac.id_user
            JOIN user u_v ON n.id_user_vendeur = u_v.id_user
            WHERE n.id_user_acheteur = :u1 OR n.id_user_vendeur = :u2
            ORDER BY date_dernier_message DESC";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['u1' => $id_user, 'u2' => $id_user]);
    $negociations = $stmt->fetchAll();

    echo json_encode($negociations);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
