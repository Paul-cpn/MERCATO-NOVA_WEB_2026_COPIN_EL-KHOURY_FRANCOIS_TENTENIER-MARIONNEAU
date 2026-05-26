<?php
require_once '../bdd/connexion.php';
require_once 'auction_engine.php';

header('Content-Type: application/json');

// On lance la vérification des enchères terminées à chaque appel
runAuctionEngine($pdo);

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
$id_user_request = isset($_GET['id_user']) ? intval($_GET['id_user']) : 0;

if ($id <= 0) {
    echo json_encode(["error" => "ID d'annonce invalide"]);
    exit;
}

try {
    // 1. Informations de base de l'annonce et du vendeur (Calcul de la moyenne des notes inclus)
    $sqlAnnonce = "SELECT a.*, u.nom_user as vendeur_nom, u.prenom_user as vendeur_prenom,
                          (SELECT AVG(note_avis) FROM avis WHERE id_user_cible = a.id_user) as vendeur_note,
                          (SELECT COUNT(*) FROM transaction WHERE id_user_vendeur = a.id_user) as vendeur_ventes
                   FROM annonce a
                   JOIN user u ON a.id_user = u.id_user
                   WHERE a.id_annonce = :id";
    $stmt = $pdo->prepare($sqlAnnonce);
    $stmt->execute(['id' => $id]);
    $annonce = $stmt->fetch();

    if (!$annonce) {
        echo json_encode(["error" => "Annonce non trouvée"]);
        exit;
    }

    // --- LOGIQUE PRIX NÉGOCIÉ + FAVORI ---
    $annonce['is_favorite'] = false;
    if ($id_user_request > 0) {
        $sqlNego = "SELECT prix_negocie FROM negociation
                    WHERE id_annonce = :a AND id_user_acheteur = :u AND statut_negociation = 'acceptee'
                    LIMIT 1";
        $stmtNego = $pdo->prepare($sqlNego);
        $stmtNego->execute(['a' => $id, 'u' => $id_user_request]);
        $prix_negocie = $stmtNego->fetchColumn();

        if ($prix_negocie) {
            $annonce['prix_original'] = $annonce['prix_annonce'];
            $annonce['prix_annonce'] = $prix_negocie;
            $annonce['is_negotiated'] = true;
        }

        // L'article est-il déjà dans les favoris de cet utilisateur ?
        $stmtFav = $pdo->prepare("SELECT 1 FROM favoris WHERE id_annonce = :a AND id_user = :u LIMIT 1");
        $stmtFav->execute(['a' => $id, 'u' => $id_user_request]);
        $annonce['is_favorite'] = (bool) $stmtFav->fetchColumn();
    }

    // 2. Images de l'annonce
    $sqlImages = "SELECT url_image FROM image WHERE id_annonce = :id ORDER BY ordre_image ASC";
    $stmt = $pdo->prepare($sqlImages);
    $stmt->execute(['id' => $id]);
    $images = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // 3. Informations sur l'enchère
    $enchere = null;
    if ($annonce['type_vente_annonce'] === 'enchere') {
        $sqlEnchere = "SELECT * FROM enchere WHERE id_annonce = :id";
        $stmt = $pdo->prepare($sqlEnchere);
        $stmt->execute(['id' => $id]);
        $enchere = $stmt->fetch();
        
        if ($enchere) {
            $sqlOffres = "SELECT COUNT(*) FROM offre WHERE id_enchere = :id_enchere";
            $stmt = $pdo->prepare($sqlOffres);
            $stmt->execute(['id_enchere' => $enchere['id_enchere']]);
            $enchere['nombre_offres'] = $stmt->fetchColumn();
        }
    }

    // 4. Avis sur le vendeur
    $sqlAvis = "SELECT av.*, u.nom_user as auteur_nom 
                FROM avis av 
                JOIN user u ON av.id_user_auteur = u.id_user 
                WHERE av.id_user_cible = :id_vendeur 
                ORDER BY av.date_avis DESC LIMIT 5";
    $stmt = $pdo->prepare($sqlAvis);
    $stmt->execute(['id_vendeur' => $annonce['id_user']]);
    $avis = $stmt->fetchAll();

    echo json_encode([
        "annonce" => $annonce,
        "images" => $images,
        "enchere" => $enchere,
        "avis" => $avis
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur serveur : " . $e->getMessage()]);
}
?>
