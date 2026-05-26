<?php
require_once '../bdd/connexion.php';
header('Content-Type: application/json');

$id_seller = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id_seller <= 0) {
    echo json_encode(["error" => "ID vendeur invalide"]);
    exit;
}

try {
    // 1. Informations publiques du vendeur
    $sqlSeller = "SELECT id_user, pseudo_user, 
                         (SELECT AVG(note_avis) FROM avis WHERE id_user_cible = u.id_user) as note,
                         (SELECT COUNT(*) FROM transaction WHERE id_user_vendeur = u.id_user) as ventes,
                         (SELECT COUNT(*) FROM avis WHERE id_user_cible = u.id_user) as nb_avis
                  FROM user u 
                  WHERE id_user = :id";
    $stmt = $pdo->prepare($sqlSeller);
    $stmt->execute(['id' => $id_seller]);
    $seller = $stmt->fetch();

    if (!$seller) {
        echo json_encode(["error" => "Vendeur non trouvé"]);
        exit;
    }

    // 2. Articles en vente du vendeur
    $sqlArticles = "SELECT a.*, 
                           (SELECT url_image FROM image WHERE id_annonce = a.id_annonce ORDER BY ordre_image ASC LIMIT 1) as image_url
                    FROM annonce a
                    WHERE a.id_user = :id AND a.statut_annonce = 'active'
                    ORDER BY a.date_annonce DESC";
    $stmt = $pdo->prepare($sqlArticles);
    $stmt->execute(['id' => $id_seller]);
    $articles = $stmt->fetchAll();

    // 3. Derniers avis reçus
    $sqlAvis = "SELECT av.*, u.pseudo_user as auteur_pseudo 
                FROM avis av 
                JOIN user u ON av.id_user_auteur = u.id_user 
                WHERE av.id_user_cible = :id 
                ORDER BY av.date_avis DESC LIMIT 10";
    $stmt = $pdo->prepare($sqlAvis);
    $stmt->execute(['id' => $id_seller]);
    $avis = $stmt->fetchAll();

    echo json_encode([
        "seller" => $seller,
        "articles" => $articles,
        "avis" => $avis
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
