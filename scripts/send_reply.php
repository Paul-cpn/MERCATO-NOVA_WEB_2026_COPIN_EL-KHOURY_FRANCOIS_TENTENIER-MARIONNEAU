<?php
require_once '../bdd/connexion.php';
require_once 'utils_notifications.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id_negociation']) || !isset($data['id_user']) || !isset($data['message'])) {
    echo json_encode(['error' => 'Données manquantes']);
    exit;
}

$id_negociation = intval($data['id_negociation']);
$id_user = intval($data['id_user']);
$message = $data['message'];
$montant = isset($data['montant']) ? floatval($data['montant']) : null;

try {
    // 1. Ajouter l'échange
    $stmt = $pdo->prepare("INSERT INTO echange (montant_echange, message_echange, id_negociation, id_user) VALUES (:m, :msg, :n, :u)");
    $stmt->execute(['m' => $montant, 'msg' => $message, 'n' => $id_negociation, 'u' => $id_user]);

    // 2. Notifier l'autre personne
    // Trouver qui est l'autre personne
    $stmt = $pdo->prepare("SELECT id_user_acheteur, id_user_vendeur, a.titre_annonce 
                           FROM negociation n 
                           JOIN annonce a ON n.id_annonce = a.id_annonce 
                           WHERE id_negociation = :id");
    $stmt->execute(['id' => $id_negociation]);
    $nego = $stmt->fetch();

    $id_autre = ($id_user == $nego['id_user_acheteur']) ? $nego['id_user_vendeur'] : $nego['id_user_acheteur'];
    $role = ($id_user == $nego['id_user_acheteur']) ? "l'acheteur" : "le vendeur";
    
    $texte = "Nouveau message de $role sur l'article : " . $nego['titre_annonce'];
    if ($montant) $texte = "Nouvelle offre de $montant € sur l'article : " . $nego['titre_annonce'];

    createNotification($pdo, $id_autre, 'message', $texte, $id_negociation);

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
