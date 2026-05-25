<?php
require_once '../bdd/connexion.php';
header('Content-Type: application/json');

$id_user = isset($_GET['id_user']) ? intval($_GET['id_user']) : 0;

if ($id_user <= 0) {
    echo json_encode([]);
    exit;
}

try {
    $sql = "SELECT a.*, 
                   (SELECT url_image FROM image WHERE id_annonce = a.id_annonce ORDER BY ordre_image ASC LIMIT 1) as image_url
            FROM annonce a
            WHERE a.id_user = :u AND a.statut_annonce = 'active'
            ORDER BY a.date_annonce DESC";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['u' => $id_user]);
    $annonces = $stmt->fetchAll();

    echo json_encode($annonces);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
