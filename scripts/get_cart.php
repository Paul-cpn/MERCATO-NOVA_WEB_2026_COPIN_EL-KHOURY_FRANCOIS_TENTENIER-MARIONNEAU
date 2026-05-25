<?php
require_once '../bdd/connexion.php';
header('Content-Type: application/json');

$id_user = isset($_GET['id_user']) ? intval($_GET['id_user']) : 0;

if ($id_user <= 0) {
    echo json_encode([]);
    exit;
}

try {
    // Récupération enrichie pour inclure les infos vendeur nécessaires au paiement/notation
    $sql = "SELECT a.id_annonce, a.titre_annonce, a.prix_annonce as prix_base, a.taille_annonce, a.couleur_annonce, 
                   u.id_user as id_vendeur, u.prenom_user as vendeur_nom,
                   (SELECT url_image FROM image i WHERE i.id_annonce = a.id_annonce ORDER BY ordre_image ASC LIMIT 1) as image_url,
                   n.prix_negocie, e.meilleure_offre_enchere
            FROM panier p
            JOIN annonce a ON p.id_annonce = a.id_annonce
            JOIN user u ON a.id_user = u.id_user
            LEFT JOIN negociation n ON (n.id_annonce = a.id_annonce AND n.id_user_acheteur = p.id_user AND n.statut_negociation = 'acceptee')
            LEFT JOIN enchere e ON (e.id_annonce = a.id_annonce AND e.id_user_gagnant = p.id_user AND e.statut_enchere = 'terminee')
            WHERE p.id_user = :u
            ORDER BY p.id_panier DESC";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['u' => $id_user]);
    $results = $stmt->fetchAll();

    $articles = [];
    foreach ($results as $row) {
        $prix_final = $row['prix_negocie'] ?? ($row['meilleure_offre_enchere'] ?? $row['prix_base']);
        
        $articles[] = [
            "id_annonce" => $row['id_annonce'],
            "titre_annonce" => $row['titre_annonce'],
            "prix_annonce" => $prix_final,
            "prix_base" => $row['prix_base'],
            "id_vendeur" => $row['id_vendeur'],
            "vendeur_nom" => $row['vendeur_nom'],
            "is_negotiated" => !empty($row['prix_negocie']),
            "is_auction_win" => !empty($row['meilleure_offre_enchere']),
            "taille_annonce" => $row['taille_annonce'],
            "couleur_annonce" => $row['couleur_annonce'],
            "image_url" => $row['image_url']
        ];
    }

    echo json_encode($articles);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
