<?php
require_once '../bdd/connexion.php';
require_once 'utils_notifications.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id_user_auteur']) || !isset($data['id_user_cible']) || !isset($data['note']) || !isset($data['id_transaction'])) {
    echo json_encode(['error' => 'Données manquantes']);
    exit;
}

try {
    $auteur = intval($data['id_user_auteur']);
    $cible = intval($data['id_user_cible']);
    $id_trans = intval($data['id_transaction']);
    $note = intval($data['note']);
    $commentaire = trim($data['commentaire'] ?? "");

    // 1. Validation de la note
    if ($note < 1 || $note > 5) throw new Exception("La note doit être comprise entre 1 et 5.");
    if (strlen($commentaire) > 300) throw new Exception("Le commentaire est trop long (max 300 caractères).");

    // 2. Vérification de la légitimité (est-ce bien l'acheteur de cette transaction ?)
    $stmt = $pdo->prepare("SELECT id_transaction FROM transaction WHERE id_transaction = :id AND id_user_acheteur = :a AND id_user_vendeur = :v");
    $stmt->execute(['id' => $id_trans, 'a' => $auteur, 'v' => $cible]);
    if (!$stmt->fetch()) throw new Exception("Transaction invalide ou non autorisée pour cet avis.");

    // 3. Vérifier si un avis a déjà été laissé pour cette transaction
    $stmt = $pdo->prepare("SELECT id_avis FROM avis WHERE id_transaction = :id");
    $stmt->execute(['id' => $id_trans]);
    if ($stmt->fetch()) throw new Exception("Vous avez déjà laissé un avis pour cette transaction.");

    // 4. Insertion
    $stmt = $pdo->prepare("INSERT INTO avis (note_avis, commentaire_avis, id_user_auteur, id_user_cible, id_transaction) VALUES (:n, :c, :a, :t, :tr)");
    $stmt->execute(['n' => $note, 'c' => $commentaire, 'a' => $auteur, 't' => $cible, 'tr' => $id_trans]);

    // 5. Notification
    createNotification($pdo, $cible, 'avis', "Vous avez reçu une nouvelle note de $note/5 !", $id_trans);

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
