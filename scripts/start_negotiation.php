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
$message = trim($data['message'] ?? "Nouvelle offre à $montant €");

try {
    // 1. Validation du montant
    if ($montant <= 0) throw new Exception("Le montant doit être positif.");
    if (strlen($message) > 500) throw new Exception("Le message est trop long.");

    // 2. Récupérer l'ID du vendeur
    $stmt = $pdo->prepare("SELECT id_user, titre_annonce FROM annonce WHERE id_annonce = :a");
    $stmt->execute(['a' => $id_annonce]);
    $annonce = $stmt->fetch();
    
    if (!$annonce) throw new Exception("Annonce non trouvée.");
    
    $id_vendeur = intval($annonce['id_user']);
    if ($id_acheteur === $id_vendeur) throw new Exception("Vous ne pouvez pas négocier votre propre article.");

    $pdo->beginTransaction();

    // 3. Vérifier si une négociation existe déjà en cours
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

    // 4. Ajouter l'échange
    $stmt = $pdo->prepare("INSERT INTO echange (montant_echange, message_echange, id_negociation, id_user) VALUES (:m, :msg, :n, :u)");
    $stmt->execute(['m' => $montant, 'msg' => $message, 'n' => $id_negociation, 'u' => $id_acheteur]);

    // 5. Notification au vendeur
    createNotification($pdo, $id_vendeur, 'negociation', "Nouvelle offre de $montant € sur votre article : " . $annonce['titre_annonce'], $id_negociation);

    $pdo->commit();
    echo json_encode(['success' => true, 'id_negociation' => $id_negociation]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(['error' => $e->getMessage()]);
}
?>
