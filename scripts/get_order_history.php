<?php
require_once '../bdd/connexion.php';
header('Content-Type: application/json');

$id_user = isset($_GET['id_user']) ? intval($_GET['id_user']) : 0;
$type = isset($_GET['type']) ? $_GET['type'] : 'achats'; // 'achats' ou 'ventes'

if ($id_user <= 0) {
    echo json_encode([]);
    exit;
}

try {
    if ($type === 'achats') {
        $sql = "SELECT t.*, a.titre_annonce, 
                       (SELECT url_image FROM image WHERE id_annonce = a.id_annonce ORDER BY ordre_image ASC LIMIT 1) as image_url
                FROM transaction t
                JOIN annonce a ON t.id_annonce = a.id_annonce
                WHERE t.id_user_acheteur = :u
                ORDER BY t.date_transaction DESC";
    } else {
        $sql = "SELECT t.*, a.titre_annonce, 
                       (SELECT url_image FROM image WHERE id_annonce = a.id_annonce ORDER BY ordre_image ASC LIMIT 1) as image_url
                FROM transaction t
                JOIN annonce a ON t.id_annonce = a.id_annonce
                WHERE t.id_user_vendeur = :u
                ORDER BY t.date_transaction DESC";
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute(['u' => $id_user]);
    $transactions = $stmt->fetchAll();

    echo json_encode($transactions);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
