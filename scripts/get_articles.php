<?php

require_once '../bdd/connexion.php';

header('Content-Type: application/json');

try {
    // Récupération des annonces avec leur image principale (ordre_image = 1) si elle existe
    $sql = "SELECT a.id_annonce, a.titre_annonce, a.prix_annonce, a.taille_annonce, a.couleur_annonce, 
                   (SELECT url_image FROM image i WHERE i.id_annonce = a.id_annonce ORDER BY ordre_image ASC LIMIT 1) as image_url
            FROM annonce a 
            WHERE a.statut_annonce = 'active'
            ORDER BY a.date_annonce DESC";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $articles = $stmt->fetchAll();

    echo json_encode($articles);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur lors de la récupération des annonces : " . $e->getMessage()]);
}
?>
