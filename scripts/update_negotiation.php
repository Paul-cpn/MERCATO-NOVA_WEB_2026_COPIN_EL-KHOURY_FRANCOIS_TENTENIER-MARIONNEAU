<?php
require_once '../bdd/connexion.php';
require_once 'utils_notifications.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id_negociation']) || !isset($data['statut'])) {
    echo json_encode(['error' => 'Données manquantes']);
    exit;
}

$id_neg = intval($data['id_negociation']);
$statut = $data['statut']; // 'acceptee' ou 'refusee'

try {
    // Récupérer les infos de la nego
    $stmt = $pdo->prepare("SELECT n.*, a.titre_annonce FROM negociation n JOIN annonce a ON n.id_annonce = a.id_annonce WHERE id_negociation = :n");
    $stmt->execute(['n' => $id_neg]);
    $nego = $stmt->fetch();

    if ($statut === 'acceptee') {
        // Récupérer le dernier montant proposé dans les échanges
        $stmt = $pdo->prepare("SELECT montant_echange FROM echange WHERE id_negociation = :n AND montant_echange IS NOT NULL ORDER BY date_echange DESC LIMIT 1");
        $stmt->execute(['n' => $id_neg]);
        $dernier_montant = $stmt->fetchColumn();

        if (!$dernier_montant) {
            echo json_encode(['error' => 'Aucune offre trouvée à accepter']);
            exit;
        }

        // Mettre à jour la négociation
        $stmt = $pdo->prepare("UPDATE negociation SET statut_negociation = 'acceptee', prix_negocie = :p WHERE id_negociation = :n");
        $stmt->execute(['p' => $dernier_montant, 'n' => $id_neg]);

        // Message automatique
        $message_auto = "Offre acceptée ! Vous pouvez maintenant acheter cet article au prix de " . $dernier_montant . " €.";
        $stmt = $pdo->prepare("INSERT INTO echange (message_echange, id_negociation, id_user) VALUES (:msg, :n, :u)");
        $stmt->execute(['msg' => $message_auto, 'n' => $id_neg, 'u' => $nego['id_user_vendeur']]);

        // Notification à l'acheteur
        createNotification($pdo, $nego['id_user_acheteur'], 'negociation', "Bonne nouvelle ! Votre offre de $dernier_montant € a été acceptée pour l'article : " . $nego['titre_annonce'], $id_neg);

    } else {
        $stmt = $pdo->prepare("UPDATE negociation SET statut_negociation = 'refusee' WHERE id_negociation = :n");
        $stmt->execute(['n' => $id_neg]);

        // Message automatique
        $message_auto = "Désolé, cette offre a été refusée.";
        $stmt = $pdo->prepare("INSERT INTO echange (message_echange, id_negociation, id_user) VALUES (:msg, :n, :u)");
        $stmt->execute(['msg' => $message_auto, 'n' => $id_neg, 'u' => $nego['id_user_vendeur']]);

        // Notification à l'acheteur
        createNotification($pdo, $nego['id_user_acheteur'], 'negociation', "Votre offre pour l'article " . $nego['titre_annonce'] . " a été refusée.", $id_neg);
    }

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
