<?php
require_once '../bdd/connexion.php';
require_once 'utils_notifications.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id_user']) || !isset($data['articles'])) {
    echo json_encode(['error' => 'Données manquantes']);
    exit;
}

$id_user = intval($data['id_user']);
$articles = $data['articles']; 

try {
    $pdo->beginTransaction();
    $transactionIds = [];

    foreach ($articles as $art) {
        $id_annonce = intval($art['id_annonce']);
        $prix = floatval($art['prix']);

        $stmt = $pdo->prepare("SELECT id_user, titre_annonce FROM annonce WHERE id_annonce = :a");
        $stmt->execute(['a' => $id_annonce]);
        $annonce = $stmt->fetch();
        if (!$annonce) continue;
        $id_vendeur = $annonce['id_user'];

        // Créer la transaction
        $stmt = $pdo->prepare("INSERT INTO transaction (montant_transaction, mode_transaction, id_user_acheteur, id_user_vendeur, id_annonce) 
                               VALUES (:m, 'CB', :ac, :v, :a)");
        $stmt->execute(['m' => $prix, 'ac' => $id_user, 'v' => $id_vendeur, 'a' => $id_annonce]);
        
        $transactionIds[$id_annonce] = $pdo->lastInsertId();

        // Statut vendu
        $stmt = $pdo->prepare("UPDATE annonce SET statut_annonce = 'vendu' WHERE id_annonce = :a");
        $stmt->execute(['a' => $id_annonce]);

        // Nettoyage panier
        $stmt = $pdo->prepare("DELETE FROM panier WHERE id_user = :u AND id_annonce = :a");
        $stmt->execute(['u' => $id_user, 'a' => $id_annonce]);

        // Notification
        createNotification($pdo, $id_vendeur, 'vente', "Félicitations ! Votre article '" . $annonce['titre_annonce'] . "' a été vendu pour $prix €.");
    }

    $pdo->commit();
    echo json_encode(['success' => true, 'transactionIds' => $transactionIds]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['error' => $e->getMessage()]);
}
?>
