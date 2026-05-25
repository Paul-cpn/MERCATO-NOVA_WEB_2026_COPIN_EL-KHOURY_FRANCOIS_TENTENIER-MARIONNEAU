<?php
require_once '../bdd/connexion.php';
header('Content-Type: application/json');

try {
    // Récupérer toutes les catégories en utilisant id_categorie_mere
    $stmt = $pdo->query("SELECT * FROM categorie ORDER BY nom_categorie ASC");
    $all = $stmt->fetchAll();

    // Organiser par hiérarchie
    $tree = [];
    $indexed = [];

    // On indexe tout par ID pour un accès rapide
    foreach ($all as $cat) {
        $cat['subs'] = [];
        $indexed[$cat['id_categorie']] = $cat;
    }

    // On construit l'arbre
    foreach ($indexed as $id => &$cat) {
        if ($cat['id_categorie_mere'] === null) {
            // C'est une racine (Homme, Femme, Enfant)
            $tree[] = &$cat;
        } else {
            // On le lie à son parent via id_categorie_mere
            if (isset($indexed[$cat['id_categorie_mere']])) {
                $indexed[$cat['id_categorie_mere']]['subs'][] = &$cat;
            }
        }
    }

    echo json_encode($tree);
} catch (Exception $e) {
    echo json_encode([]);
}
?>
