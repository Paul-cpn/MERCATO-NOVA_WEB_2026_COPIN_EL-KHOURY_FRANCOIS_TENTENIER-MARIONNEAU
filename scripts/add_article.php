<?php
require_once '../bdd/connexion.php';
header('Content-Type: application/json');

// 1. Définition des valeurs autorisées (Enums Backend)
$ALLOWED_ETATS = ['neuf', 'tres_bon', 'bon', 'acceptable'];
$ALLOWED_MATIERES = ['Coton', 'Laine', 'Cuir', 'Soie', 'Synthétique', 'Polyester', 'Lin', 'Denim', 'Velours', 'Satin', 'Viscose', 'Cachemire', 'Autre'];
$ALLOWED_COULEURS = ['Noir', 'Blanc', 'Gris', 'Bleu', 'Rouge', 'Vert', 'Jaune', 'Rose', 'Beige', 'Marron', 'Argenté', 'Doré', 'Multicolore'];
$ALLOWED_TAILLES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unique', '34', '36', '38', '40', '42', '44', '46', '48', '35', '37', '39', '41', '43', '45'];
$ALLOWED_TYPES = ['achat_direct', 'enchere'];

// 2. Vérification des données manquantes
if (!isset($_POST['id_user']) || !isset($_POST['titre']) || !isset($_POST['prix']) || !isset($_POST['id_categorie'])) {
    echo json_encode(['error' => 'Données obligatoires manquantes']);
    exit;
}

try {
    // 3. Validation stricte des données et du rôle
    $id_user = intval($_POST['id_user']);

    // Vérification du rôle en base de données
    $stmtRole = $pdo->prepare("SELECT role_user FROM user WHERE id_user = :id");
    $stmtRole->execute(['id' => $id_user]);
    $user = $stmtRole->fetch();

    if (!$user || ($user['role_user'] !== 'vendeur' && $user['role_user'] !== 'admin')) {
        throw new Exception("Vous devez être vendeur pour publier une annonce.");
    }

    $titre = trim($_POST['titre']);
    $prix = floatval($_POST['prix']);
    $etat = $_POST['etat'];
    $type_vente = $_POST['type_vente'];
    $taille = $_POST['taille'];
    $couleur = $_POST['couleur'];
    $matiere = $_POST['matiere'];
    $id_cat = intval($_POST['id_categorie']);

    if (strlen($titre) < 3 || strlen($titre) > 50) throw new Exception("Le titre doit faire entre 3 et 50 caractères.");
    if ($prix <= 0) throw new Exception("Le prix doit être supérieur à 0.");
    if (!in_array($etat, $ALLOWED_ETATS)) throw new Exception("État invalide.");
    if (!in_array($type_vente, $ALLOWED_TYPES)) throw new Exception("Type de vente invalide.");
    if (!in_array($taille, $ALLOWED_TAILLES)) throw new Exception("Taille invalide.");
    if (!in_array($couleur, $ALLOWED_COULEURS)) throw new Exception("Couleur invalide.");
    if (!in_array($matiere, $ALLOWED_MATIERES)) throw new Exception("Matière invalide.");

    $pdo->beginTransaction();

    // 4. Insertion de l'annonce
    $sql = "INSERT INTO annonce (titre_annonce, description_annonce, prix_annonce, etat_objet_annonce, type_vente_annonce, taille_annonce, couleur_annonce, marque_annonce, matiere_annonce, id_user, id_categorie, statut_annonce) 
            VALUES (:titre, :desc, :prix, :etat, :type, :taille, :couleur, :marque, :matiere, :u, :cat, 'active')";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'titre'   => $titre,
        'desc'    => trim($_POST['description']),
        'prix'    => $prix,
        'etat'    => $etat,
        'type'    => $type_vente,
        'taille'  => $taille,
        'couleur' => $couleur,
        'marque'  => trim($_POST['marque']),
        'matiere' => $matiere,
        'u'       => $id_user,
        'cat'     => $id_cat
    ]);

    $id_annonce = $pdo->lastInsertId();

    // 5. Gestion des enchères
    if ($type_vente === 'enchere') {
        if (empty($_POST['date_fin_enchere'])) throw new Exception("Date de fin d'enchère manquante.");
        $date_fin = $_POST['date_fin_enchere'];
        if (strtotime($date_fin) <= time()) throw new Exception("La date de fin doit être dans le futur.");

        $sqlEnchere = "INSERT INTO enchere (prix_depart_enchere, date_fin_enchere, id_annonce) VALUES (:prix, :date_fin, :id_a)";
        $stmtE = $pdo->prepare($sqlEnchere);
        $stmtE->execute(['prix' => $prix, 'date_fin' => $date_fin, 'id_a' => $id_annonce]);
    }

    // 6. Gestion des images
    if (!empty($_FILES['images'])) {
        $uploadDir = '../images/images_produit/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

        $files = $_FILES['images'];
        for ($i = 0; $i < count($files['name']); $i++) {
            if ($files['error'][$i] === UPLOAD_ERR_OK) {
                $tmpName = $files['tmp_name'][$i];
                $ext = strtolower(pathinfo($files['name'][$i], PATHINFO_EXTENSION));
                if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) continue; // Validation type mime/extension

                $newName = uniqid('img_', true) . '.' . $ext;
                if (move_uploaded_file($tmpName, $uploadDir . $newName)) {
                    $url = '../images/images_produit/' . $newName;
                    $stmt = $pdo->prepare("INSERT INTO image (url_image, ordre_image, id_annonce) VALUES (:url, :ordre, :a)");
                    $stmt->execute(['url' => $url, 'ordre' => $i + 1, 'a' => $id_annonce]);
                }
            }
        }
    }

    $pdo->commit();
    echo json_encode(['success' => true, 'id_annonce' => $id_annonce]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(['error' => $e->getMessage()]);
}
?>
