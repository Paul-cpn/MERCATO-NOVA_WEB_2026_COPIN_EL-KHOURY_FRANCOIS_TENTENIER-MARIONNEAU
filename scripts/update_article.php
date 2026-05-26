<?php
require_once '../bdd/connexion.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['id_annonce']) || !isset($data['id_user'])) {
    echo json_encode(['error' => 'Données manquantes']);
    exit;
}

// 1. Définition des valeurs autorisées (Enums Backend)
$ALLOWED_ETATS = ['neuf', 'tres_bon', 'bon', 'acceptable'];
$ALLOWED_MATIERES = ['Coton', 'Laine', 'Cuir', 'Soie', 'Synthétique', 'Polyester', 'Lin', 'Denim', 'Velours', 'Satin', 'Viscose', 'Cachemire', 'Autre'];
$ALLOWED_COULEURS = ['Noir', 'Blanc', 'Gris', 'Bleu', 'Rouge', 'Vert', 'Jaune', 'Rose', 'Beige', 'Marron', 'Argenté', 'Doré', 'Multicolore'];
$ALLOWED_TAILLES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unique', '34', '36', '38', '40', '42', '44', '46', '48', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];

try {
    $id_annonce = intval($data['id_annonce']);
    $id_user = intval($data['id_user']);
    $titre = trim($data['titre_annonce']);
    $prix = floatval($data['prix_annonce']);
    $description = trim($data['description_annonce']);
    $taille = $data['taille_annonce'];
    $couleur = $data['couleur_annonce'];
    $matiere = $data['matiere_annonce'];
    $etat = $data['etat_objet_annonce'];

    // 2. Validation stricte
    if (strlen($titre) < 3 || strlen($titre) > 50) throw new Exception("Le titre doit faire entre 3 et 50 caractères.");
    if ($prix <= 0) throw new Exception("Le prix doit être supérieur à 0.");
    if (!in_array($etat, $ALLOWED_ETATS)) throw new Exception("État invalide.");
    if (!in_array($taille, $ALLOWED_TAILLES)) throw new Exception("Taille invalide.");
    if (!in_array($couleur, $ALLOWED_COULEURS)) throw new Exception("Couleur invalide.");
    if (!in_array($matiere, $ALLOWED_MATIERES)) throw new Exception("Matière invalide.");

    // 3. Vérification de la propriété
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
