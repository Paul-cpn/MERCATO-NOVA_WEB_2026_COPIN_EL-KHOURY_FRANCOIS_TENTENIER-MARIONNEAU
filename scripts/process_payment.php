<?php
require_once '../bdd/connexion.php';
require_once 'utils_notifications.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id_user']) || !isset($data['articles']) || empty($data['articles'])) {
    echo json_encode(['error' => 'Données de commande invalides']);
    exit;
}

$id_user = intval($data['id_user']);
$articles = $data['articles']; 

try {
    // 1. Vérification de l'utilisateur (Profil complet requis pour payer)
    $stmtU = $pdo->prepare("SELECT nom_user, prenom_user, adresse_user FROM user WHERE id_user = :id");
    $stmtU->execute(['id' => $id_user]);
    $user = $stmtU->fetch();

    if (!$user || empty($user['nom_user']) || empty($user['prenom_user']) || empty($user['adresse_user'])) {
        throw new Exception("Votre profil est incomplet (Nom, Prénom ou Adresse manquants). Veuillez le mettre à jour avant de payer.");
    }

    $pdo->beginTransaction();
    $transactionIds = [];

    foreach ($articles as $art) {
        $id_annonce = intval($art['id_annonce']);
        
        // 1. Vérification de l'existence et du statut de l'annonce
        $stmt = $pdo->prepare("SELECT id_user, titre_annonce, prix_annonce, statut_annonce FROM annonce WHERE id_annonce = :a");
        $stmt->execute(['a' => $id_annonce]);
        $annonce = $stmt->fetch();
        
        if (!$annonce) throw new Exception("Une des annonces n'existe plus.");
        if ($annonce['statut_annonce'] !== 'active') throw new Exception("L'article '" . $annonce['titre_annonce'] . "' n'est plus disponible.");
        if (intval($annonce['id_user']) === $id_user) throw new Exception("Vous ne pouvez pas acheter votre propre article.");

        $prix = floatval($annonce['prix_annonce']);
        $id_vendeur = intval($annonce['id_user']);

        // 2. Créer la transaction
        $stmt = $pdo->prepare("INSERT INTO transaction (montant_transaction, mode_transaction, id_user_acheteur, id_user_vendeur, id_annonce) 
                               VALUES (:m, 'CB', :ac, :v, :a)");
        $stmt->execute(['m' => $prix, 'ac' => $id_user, 'v' => $id_vendeur, 'a' => $id_annonce]);
        
        $id_trans = $pdo->lastInsertId();
        $transactionIds[$id_annonce] = $id_trans;

        // 3. Mettre à jour le statut de l'annonce
        $stmt = $pdo->prepare("UPDATE annonce SET statut_annonce = 'vendu' WHERE id_annonce = :a");
        $stmt->execute(['a' => $id_annonce]);

        // 4. Nettoyage du panier (pour tous les utilisateurs qui l'auraient mis en panier)
        $stmt = $pdo->prepare("DELETE FROM panier WHERE id_annonce = :a");
        $stmt->execute(['a' => $id_annonce]);

        // 5. Notification au vendeur
        createNotification($pdo, $id_vendeur, 'vente', "Félicitations ! Votre article '" . $annonce['titre_annonce'] . "' a été vendu pour $prix €.", $id_annonce);
    }

    $pdo->commit();
    echo json_encode(['success' => true, 'transactionIds' => $transactionIds]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(['error' => $e->getMessage()]);
}
?>
