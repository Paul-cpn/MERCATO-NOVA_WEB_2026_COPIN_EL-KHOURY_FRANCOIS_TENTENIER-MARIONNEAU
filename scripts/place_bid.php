<?php
require_once '../bdd/connexion.php';
require_once 'utils_notifications.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id_enchere']) || !isset($data['id_user']) || !isset($data['montant'])) {
    echo json_encode(['error' => 'Données manquantes']);
    exit;
}

$id_enchere = intval($data['id_enchere']);
$id_user = intval($data['id_user']);
$montant = floatval($data['montant']);

try {
    $pdo->beginTransaction();

    // 1. Vérifier l'enchère (statut, date de fin, meilleure offre actuelle)
    $stmt = $pdo->prepare("SELECT e.*, a.titre_annonce, a.id_user as id_vendeur 
                           FROM enchere e 
                           JOIN annonce a ON e.id_annonce = a.id_annonce 
                           WHERE e.id_enchere = :id");
    $stmt->execute(['id' => $id_enchere]);
    $enchere = $stmt->fetch();

    if (!$enchere || $enchere['statut_enchere'] !== 'en_cours') {
        echo json_encode(['error' => 'Enchère terminée ou inexistante']);
        exit;
    }

    if (new DateTime() > new DateTime($enchere['date_fin_enchere'])) {
        // Optionnel : fermer l'enchère ici si on s'en rend compte
        echo json_encode(['error' => 'L\'enchère est terminée']);
        exit;
    }

    $seuil = $enchere['meilleure_offre_enchere'] ?? $enchere['prix_depart_enchere'];
    if ($montant <= $seuil) {
        echo json_encode(['error' => 'Votre offre doit être supérieure à ' . $seuil . ' €']);
        exit;
    }

    // 2. Enregistrer l'offre
    $stmt = $pdo->prepare("INSERT INTO offre (montant_offre, id_enchere, id_user) VALUES (:m, :e, :u)");
    $stmt->execute(['m' => $montant, 'e' => $id_enchere, 'u' => $id_user]);

    // 3. Mettre à jour la meilleure offre dans l'enchère
    $old_gagnant = $enchere['id_user_gagnant'];
    $stmt = $pdo->prepare("UPDATE enchere SET meilleure_offre_enchere = :m, id_user_gagnant = :u WHERE id_enchere = :e");
    $stmt->execute(['m' => $montant, 'u' => $id_user, 'e' => $id_enchere]);

    // 4. Notifications
    // Au vendeur
    createNotification($pdo, $enchere['id_vendeur'], 'enchere', "Nouvelle enchère de $montant € sur votre article : " . $enchere['titre_annonce']);
    
    // À l'ancien gagnant (s'il y en avait un et que c'est pas le même)
    if ($old_gagnant && $old_gagnant != $id_user) {
        createNotification($pdo, $old_gagnant, 'enchere', "Vous avez été surenchéri sur l'article : " . $enchere['titre_annonce'] . ". Nouvelle offre : $montant €.");
    }

    $pdo->commit();
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['error' => $e->getMessage()]);
}
?>
