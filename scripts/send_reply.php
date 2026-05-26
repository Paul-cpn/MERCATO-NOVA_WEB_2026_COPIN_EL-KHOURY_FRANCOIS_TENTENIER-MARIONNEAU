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
$message = trim($data['message']);
$montant = (isset($data['montant']) && $data['montant'] !== "") ? floatval($data['montant']) : null;

try {
    // 1. Vérification de l'autorisation (L'utilisateur fait-il partie de la négo ?)
    $stmt = $pdo->prepare("SELECT n.id_user_acheteur, n.id_user_vendeur, a.titre_annonce, n.statut_negociation 
                           FROM negociation n 
                           JOIN annonce a ON n.id_annonce = a.id_annonce 
                           WHERE n.id_negociation = :id");
    $stmt->execute(['id' => $id_negociation]);
    $nego = $stmt->fetch();

    if (!$nego) throw new Exception("Négociation introuvable.");
    if ($id_user != $nego['id_user_acheteur'] && $id_user != $nego['id_user_vendeur']) {
        throw new Exception("Accès non autorisé à cette discussion.");
    }

    // 2. Validation du contenu
    if (empty($message) && $montant === null) throw new Exception("Le message ne peut pas être vide.");
    if (strlen($message) > 500) throw new Exception("Le message est trop long (max 500 car.).");
    if ($montant !== null && $montant <= 0) throw new Exception("Le montant doit être positif.");

    // 3. Limite de 5 offres par négociation
    if ($montant !== null) {
        $stmtCount = $pdo->prepare("SELECT COUNT(*) FROM echange WHERE id_negociation = :id AND montant_echange IS NOT NULL");
        $stmtCount->execute(['id' => $id_negociation]);
        $offerCount = $stmtCount->fetchColumn();

        if ($offerCount >= 5) {
            throw new Exception("Limite de 5 offres atteinte. La négociation est clôturée.");
        }
    }

    $pdo->beginTransaction();

    // 3. Ajouter l'échange
    $stmt = $pdo->prepare("INSERT INTO echange (montant_echange, message_echange, id_negociation, id_user) VALUES (:m, :msg, :n, :u)");
    $stmt->execute(['m' => $montant, 'msg' => $message, 'n' => $id_negociation, 'u' => $id_user]);

    // 4. Si c'est une offre, on repasse le statut en 'en_cours' (au cas où c'était refusé)
    if ($montant !== null) {
        $stmt = $pdo->prepare("UPDATE negociation SET statut_negociation = 'en_cours' WHERE id_negociation = :id");
        $stmt->execute(['id' => $id_negociation]);
    }

    // 5. Notifier l'autre personne
    $id_autre = ($id_user == $nego['id_user_acheteur']) ? $nego['id_user_vendeur'] : $nego['id_user_acheteur'];
    $role = ($id_user == $nego['id_user_acheteur']) ? "l'acheteur" : "le vendeur";
    
    $texte = "Nouveau message de $role sur l'article : " . $nego['titre_annonce'];
    if ($montant) $texte = "Nouvelle offre de $montant € sur l'article : " . $nego['titre_annonce'];

    createNotification($pdo, $id_autre, 'message', $texte, $id_negociation);

    $pdo->commit();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(['error' => $e->getMessage()]);
}
?>
