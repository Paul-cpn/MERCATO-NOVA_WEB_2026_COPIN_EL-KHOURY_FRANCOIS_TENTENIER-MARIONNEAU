<?php
require_once '../bdd/connexion.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id_user']) || !isset($data['titre']) || !isset($data['prix'])) {
    echo json_encode(['error' => 'Données manquantes']);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Insertion de l'annonce
    $sql = "INSERT INTO annonce (titre_annonce, description_annonce, prix_annonce, etat_objet_annonce, type_vente_annonce, taille_annonce, couleur_annonce, marque_annonce, matiere_annonce, id_user, id_categorie, statut_annonce) 
            VALUES (:titre, :desc, :prix, :etat, :type, :taille, :couleur, :marque, :matiere, :u, :cat, 'active')";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'titre'   => $data['titre'],
        'desc'    => $data['description'],
        'prix'    => floatval($data['prix']),
        'etat'    => $data['etat'],
        'type'    => $data['type_vente'],
        'taille'  => $data['taille'],
        'couleur' => $data['couleur'],
        'marque'  => $data['marque'],
        'matiere' => $data['matiere'],
        'u'       => intval($data['id_user']),
        'cat'     => intval($data['id_categorie'])
    ]);

    $id_annonce = $pdo->lastInsertId();

    // 2. Si c'est une enchère, on crée l'entrée dans la table 'enchere'
    if ($data['type_vente'] === 'enchere') {
        if (empty($data['date_fin_enchere'])) {
            throw new Exception("La date de fin est obligatoire pour une enchère.");
        }
        $sqlEnchere = "INSERT INTO enchere (prix_depart_enchere, date_fin_enchere, id_annonce) 
                       VALUES (:prix, :date_fin, :id_a)";
        $stmtE = $pdo->prepare($sqlEnchere);
        $stmtE->execute([
            'prix' => floatval($data['prix']),
            'date_fin' => $data['date_fin_enchere'],
            'id_a' => $id_annonce
        ]);
    }

    // 3. Insertion de l'image
    if (!empty($data['image_url'])) {
        $stmt = $pdo->prepare("INSERT INTO image (url_image, ordre_image, id_annonce) VALUES (:url, 1, :a)");
        $stmt->execute(['url' => $data['image_url'], 'a' => $id_annonce]);
    }

    $pdo->commit();
    echo json_encode(['success' => true, 'id_annonce' => $id_annonce]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['error' => $e->getMessage()]);
}
?>
