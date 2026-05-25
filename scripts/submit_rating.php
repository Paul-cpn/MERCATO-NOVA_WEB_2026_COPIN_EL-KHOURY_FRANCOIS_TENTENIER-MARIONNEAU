<?php
require_once '../bdd/connexion.php';
require_once 'utils_notifications.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

// Vérification de id_transaction en plus des autres champs
if (!isset($data['id_user_auteur']) || !isset($data['id_user_cible']) || !isset($data['note']) || !isset($data['id_transaction'])) {
    echo json_encode(['error' => 'Données manquantes (ID transaction requis)']);
    exit;
}

$auteur = intval($data['id_user_auteur']);
$cible = intval($data['id_user_cible']);
$id_trans = intval($data['id_transaction']);
$note = intval($data['note']);
$commentaire = $data['commentaire'] ?? "";

if ($note < 0 || $note > 5) {
    echo json_encode(['error' => 'Note invalide (doit être entre 0 et 5)']);
    exit;
}

try {
    // Insérer l'avis dans la table avis avec id_transaction
    $stmt = $pdo->prepare("INSERT INTO avis (note_avis, commentaire_avis, id_user_auteur, id_user_cible, id_transaction) VALUES (:n, :c, :a, :t, :tr)");
    $stmt->execute([
        'n' => $note,
        'c' => $commentaire,
        'a' => $auteur,
        't' => $cible,
        'tr' => $id_trans
    ]);

    // Notifier le vendeur qu'il a reçu une note
    createNotification($pdo, $cible, 'avis', "Vous avez reçu une nouvelle note de $note/5 !");

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
