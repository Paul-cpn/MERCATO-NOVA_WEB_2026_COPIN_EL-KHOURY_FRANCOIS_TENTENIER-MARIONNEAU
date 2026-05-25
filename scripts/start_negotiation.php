<?php
require_once '../bdd/connexion.php';
require_once 'utils_notifications.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id_annonce']) || !isset($data['id_user_acheteur']) || !isset($data['montant'])) {
    echo json_encode(['error' => 'Données manquantes']);
    exit;
}

$id_annonce = intval($data['id_annonce']);
$id_acheteur = intval($data['id_user_acheteur']);
$montant = floatval($data['montant']);
$message = $data['message'] ?? "Nouvelle offre à $montant €";

try {
    // 1. Récupérer l'ID du vendeur
    $stmt = $pdo->prepare("SELECT id_user FROM annonce WHERE id_annonce = :a");
    $stmt->execute(['a' => $id_annonce]);
    $annonce = $stmt->fetch();
    
    if (!$annonce) {
        echo json_encode(['error' => 'Annonce non trouvée']);
        exit;
    }
    $id_vendeur = $annonce['id_user'];

    if ($id_acheteur == $id_vendeur) {
        echo json_encode(['error' => 'Vous ne pouvez pas négocier votre propre article']);
        exit;
    }

    // 2. Vérifier si une négociation existe déjà entre ces deux-là pour cette annonce
    $stmt = $pdo->prepare("SELECT id_negociation FROM negociation WHERE id_annonce = :a AND id_user_acheteur = :u AND statut_negociation = 'en_cours'");
    $stmt->execute(['a' => $id_annonce, 'u' => $id_acheteur]);
    $negociation = $stmt->fetch();

    if (!$negociation) {
        // Créer la négociation
        $stmt = $pdo->prepare("INSERT INTO negociation (offre_initiale_negociation, id_annonce, id_user_acheteur, id_user_vendeur) VALUES (:m, :a, :ac, :v)");
        $stmt->execute(['m' => $montant, 'a' => $id_annonce, 'ac' => $id_acheteur, 'v' => $id_vendeur]);
        $id_negociation = $pdo->lastInsertId();
    } else {
        $id_negociation = $negociation['id_negociation'];
    }

    // 3. Ajouter l'échange (le message/offre)
    $stmt = $pdo->prepare("INSERT INTO echange (montant_echange, message_echange, id_negociation, id_user) VALUES (:m, :msg, :n, :u)");
    $stmt->execute(['m' => $montant, 'msg' => $message, 'n' => $id_negociation, 'u' => $id_acheteur]);

    // 4. Notification au vendeur
    createNotification($pdo, $id_vendeur, 'negociation', "Nouvelle offre de $montant € sur votre article : " . $annonce['titre_annonce']);

    echo json_encode(['success' => true, 'id_negociation' => $id_negociation]);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
