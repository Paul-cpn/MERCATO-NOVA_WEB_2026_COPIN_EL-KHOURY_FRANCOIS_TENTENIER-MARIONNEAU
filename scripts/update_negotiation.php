<?php
require_once '../bdd/connexion.php';
require_once 'utils_notifications.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id_negociation']) || !isset($data['statut']) || !isset($data['id_user'])) {
    echo json_encode(['error' => 'Données manquantes']);
    exit;
}

$id_neg = intval($data['id_negociation']);
$statut = $data['statut']; // 'acceptee' ou 'refusee'
$id_user_action = intval($data['id_user']);

try {
    // 1. Récupérer les infos de la nego
    $stmt = $pdo->prepare("SELECT n.*, a.titre_annonce FROM negociation n JOIN annonce a ON n.id_annonce = a.id_annonce WHERE id_negociation = :n");
    $stmt->execute(['n' => $id_neg]);
    $nego = $stmt->fetch();

    if (!$nego) throw new Exception("Négociation introuvable.");

    // 2. Vérification de l'autorisation
    if ($id_user_action != $nego['id_user_acheteur'] && $id_user_action != $nego['id_user_vendeur']) {
        throw new Exception("Action non autorisée.");
    }

    // Déterminer qui est l'autre personne pour la notification
    $id_autre = ($id_user_action == $nego['id_user_acheteur']) ? $nego['id_user_vendeur'] : $nego['id_user_acheteur'];

    $pdo->beginTransaction();

    if ($statut === 'acceptee') {
        // 3. Récupérer le dernier montant proposé (doit être fait par l'AUTRE partie)
        $stmt = $pdo->prepare("SELECT montant_echange, id_user FROM echange WHERE id_negociation = :n AND montant_echange IS NOT NULL ORDER BY date_echange DESC LIMIT 1");
        $stmt->execute(['n' => $id_neg]);
        $derniere_offre = $stmt->fetch();

        if (!$derniere_offre) throw new Exception("Aucune offre à accepter.");
        if ($derniere_offre['id_user'] == $id_user_action) throw new Exception("Vous ne pouvez pas accepter votre propre offre.");

        $montant = floatval($derniere_offre['montant_echange']);

        // Mettre à jour
        $stmt = $pdo->prepare("UPDATE negociation SET statut_negociation = 'acceptee', prix_negocie = :p WHERE id_negociation = :n");
        $stmt->execute(['p' => $montant, 'n' => $id_neg]);

        $message_auto = "Offre acceptée ! Le prix final est de $montant €.";
        $stmt = $pdo->prepare("INSERT INTO echange (message_echange, id_negociation, id_user) VALUES (:msg, :n, :u)");
        $stmt->execute(['msg' => $message_auto, 'n' => $id_neg, 'u' => $id_user_action]);

        createNotification($pdo, $id_autre, 'negociation', "L'offre de $montant € a été acceptée pour l'article : " . $nego['titre_annonce'], $id_neg);

    } else if ($statut === 'refusee') {
        $stmt = $pdo->prepare("UPDATE negociation SET statut_negociation = 'refusee' WHERE id_negociation = :n");
        $stmt->execute(['n' => $id_neg]);

        $message_auto = "L'offre a été refusée.";
        $stmt = $pdo->prepare("INSERT INTO echange (message_echange, id_negociation, id_user) VALUES (:msg, :n, :u)");
        $stmt->execute(['msg' => $message_auto, 'n' => $id_neg, 'u' => $id_user_action]);

        createNotification($pdo, $id_autre, 'negociation', "L'offre pour l'article " . $nego['titre_annonce'] . " a été refusée.", $id_neg);
    }

    $pdo->commit();
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(['error' => $e->getMessage()]);
}
?>
