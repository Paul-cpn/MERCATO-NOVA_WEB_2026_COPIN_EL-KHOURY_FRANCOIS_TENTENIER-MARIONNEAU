<?php
require_once '../bdd/connexion.php';
header('Content-Type: application/json');

$id_user = isset($_GET['id_user']) ? intval($_GET['id_user']) : 0;

if ($id_user <= 0) {
    echo json_encode([]);
    exit;
}

try {
    // Récupérer uniquement les annonces créées par l'utilisateur (actives ou vendues)
    $sql = "SELECT a.id_annonce, a.titre_annonce, a.prix_annonce, a.taille_annonce, a.couleur_annonce, a.statut_annonce,
                   (SELECT url_image FROM image i WHERE i.id_annonce = a.id_annonce ORDER BY ordre_image ASC LIMIT 1) as image_url
            FROM annonce a
            WHERE a.id_user = :u
            ORDER BY a.date_annonce DESC";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['u' => $id_user]);
    $articles = $stmt->fetchAll();

    echo json_encode($articles);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
