<?php
require_once '../bdd/connexion.php';
header('Content-Type: application/json');

$id_user = isset($_GET['id_user']) ? intval($_GET['id_user']) : 0;

if ($id_user <= 0) {
    echo json_encode([]);
    exit;
}

try {
    $sql = "SELECT a.id_annonce, a.titre_annonce, a.prix_annonce, a.taille_annonce, a.couleur_annonce, 
                   (SELECT url_image FROM image i WHERE i.id_annonce = a.id_annonce ORDER BY ordre_image ASC LIMIT 1) as image_url
            FROM favoris f
            JOIN annonce a ON f.id_annonce = a.id_annonce
            WHERE f.id_user = :u AND a.statut_annonce = 'active'
            ORDER BY f.date_favoris DESC";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['u' => $id_user]);
    $articles = $stmt->fetchAll();

    echo json_encode($articles);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
