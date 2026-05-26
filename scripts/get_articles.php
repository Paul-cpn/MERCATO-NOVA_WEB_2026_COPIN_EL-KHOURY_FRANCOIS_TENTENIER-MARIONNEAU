<?php

require_once '../bdd/connexion.php';
require_once 'auction_engine.php';

header('Content-Type: application/json');

// On lance la vérification des enchères terminées à chaque appel
runAuctionEngine($pdo);

try {
    // Construction de la requête de base (Ajout de marque_annonce)
    $sql = "SELECT a.id_annonce, a.titre_annonce, a.marque_annonce, a.prix_annonce, a.taille_annonce, a.couleur_annonce, 
                   (SELECT url_image FROM image i WHERE i.id_annonce = a.id_annonce ORDER BY ordre_image ASC LIMIT 1) as image_url
            FROM annonce a 
            WHERE a.statut_annonce = 'active'";
    
    $params = [];

    // Recherche par mot-clé (titre ou marque)
    if (!empty($_GET['search'])) {
        $search = '%' . $_GET['search'] . '%';
        $sql .= " AND (a.titre_annonce LIKE :search OR a.marque_annonce LIKE :search_2)";
        $params['search'] = $search;
        $params['search_2'] = $search;
    }

    // Filtre par catégorie (et toute son arborescence)
    if (!empty($_GET['categorie_id'])) {
        $cat_id = intval($_GET['categorie_id']);
        $sql .= " AND (
            a.id_categorie = :cat_id 
            OR a.id_categorie IN (SELECT id_categorie FROM categorie WHERE id_categorie_mere = :cat_id_1)
            OR a.id_categorie IN (SELECT id_categorie FROM categorie WHERE id_categorie_mere IN (SELECT id_categorie FROM categorie WHERE id_categorie_mere = :cat_id_2))
        )";
        $params['cat_id'] = $cat_id;
        $params['cat_id_1'] = $cat_id;
        $params['cat_id_2'] = $cat_id;
    }

    // Filtre par type de vente
    if (!empty($_GET['type_vente'])) {
        $sql .= " AND a.type_vente_annonce = :type_vente";
        $params['type_vente'] = $_GET['type_vente'];
    }

    // Filtre par prix
    if (!empty($_GET['prix_min'])) {
        $sql .= " AND a.prix_annonce >= :prix_min";
        $params['prix_min'] = floatval($_GET['prix_min']);
    }
    if (!empty($_GET['prix_max'])) {
        $sql .= " AND a.prix_annonce <= :prix_max";
        $params['prix_max'] = floatval($_GET['prix_max']);
    }

    // Filtre par état
    if (!empty($_GET['etats'])) {
        $etats = explode(',', $_GET['etats']);
        $inQuery = "";
        foreach($etats as $i => $item) {
            $key = "etat_".$i;
            $inQuery .= ($i === 0 ? "" : ",") . ":$key";
            $params[$key] = $item;
        }
        $sql .= " AND a.etat_objet_annonce IN ($inQuery)";
    }

    // Filtre par couleur
    if (!empty($_GET['couleurs'])) {
        $couleurs = explode(',', $_GET['couleurs']);
        $inQuery = "";
        foreach($couleurs as $i => $item) {
            $key = "couleur_".$i;
            $inQuery .= ($i === 0 ? "" : ",") . ":$key";
            $params[$key] = $item;
        }
        $sql .= " AND a.couleur_annonce IN ($inQuery)";
    }

    // Filtre par matière
    if (!empty($_GET['matieres'])) {
        $matieres = explode(',', $_GET['matieres']);
        $inQuery = "";
        foreach($matieres as $i => $item) {
            $key = "matiere_".$i;
            $inQuery .= ($i === 0 ? "" : ",") . ":$key";
            $params[$key] = $item;
        }
        $sql .= " AND a.matiere_annonce IN ($inQuery)";
    }

    // Filtre par taille
    if (!empty($_GET['tailles'])) {
        $tailles = explode(',', $_GET['tailles']);
        $inQuery = "";
        foreach($tailles as $i => $item) {
            $key = "taille_".$i;
            $inQuery .= ($i === 0 ? "" : ",") . ":$key";
            $params[$key] = $item;
        }
        $sql .= " AND a.taille_annonce IN ($inQuery)";
    }

    $sql .= " ORDER BY a.date_annonce DESC";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $articles = $stmt->fetchAll();

    echo json_encode($articles);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur lors de la récupération des annonces : " . $e->getMessage()]);
}
?>
