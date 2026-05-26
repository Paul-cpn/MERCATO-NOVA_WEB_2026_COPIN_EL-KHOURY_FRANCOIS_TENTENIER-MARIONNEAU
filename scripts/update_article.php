<?php
require_once '../bdd/connexion.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['id_annonce']) || !isset($data['id_user'])) {
    echo json_encode(['error' => 'Données manquantes']);
    exit;
}

$id_annonce = intval($data['id_annonce']);
$id_user = intval($data['id_user']);
$titre = $data['titre_annonce'];
$prix = floatval($data['prix_annonce']);
$description = $data['description_annonce'];
$taille = $data['taille_annonce'];
$couleur = $data['couleur_annonce'];
$matiere = $data['matiere_annonce'];
$etat = $data['etat_objet_annonce'];

try {
    // Vérification de la propriété
    $checkSql = "SELECT id_user FROM annonce WHERE id_annonce = :id";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute(['id' => $id_annonce]);
    $annonce = $checkStmt->fetch();

    if (!$annonce || intval($annonce['id_user']) !== $id_user) {
        echo json_encode(['error' => 'Accès non autorisé ou annonce introuvable']);
        exit;
    }

    $sql = "UPDATE annonce SET 
                titre_annonce = :titre,
                prix_annonce = :prix,
                description_annonce = :desc,
                taille_annonce = :taille,
                couleur_annonce = :couleur,
                matiere_annonce = :matiere,
                etat_objet_annonce = :etat
            WHERE id_annonce = :id";
            
    $stmt = $pdo->prepare($sql);
    $success = $stmt->execute([
        'titre' => $titre,
        'prix' => $prix,
        'desc' => $description,
        'taille' => $taille,
        'couleur' => $couleur,
        'matiere' => $matiere,
        'etat' => $etat,
        'id' => $id_annonce
    ]);

    if ($success) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => 'Erreur lors de la mise à jour']);
    }
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
