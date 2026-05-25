<?php
require_once '../bdd/connexion.php';
require_once 'utils_notifications.php';

function runAuctionEngine($pdo) {
    try {
        // 1. Trouver toutes les enchères terminées mais encore marquées "en cours"
        $sql = "SELECT e.*, a.titre_annonce, a.id_user as id_vendeur 
                FROM enchere e 
                JOIN annonce a ON e.id_annonce = a.id_annonce 
                WHERE e.statut_enchere = 'en_cours' AND e.date_fin_enchere <= NOW()";
        
        $stmt = $pdo->query($sql);
        $endedAuctions = $stmt->fetchAll();

        foreach ($endedAuctions as $enchere) {
            $pdo->beginTransaction();
            $id_annonce = $enchere['id_annonce'];
            $id_vendeur = $enchere['id_vendeur'];
            $titre = $enchere['titre_annonce'];

            if ($enchere['id_user_gagnant']) {
                $montant = $enchere['meilleure_offre_enchere'];
                $id_gagnant = $enchere['id_user_gagnant'];

                // 2. Mettre à jour le statut de l'enchère
                $pdo->prepare("UPDATE enchere SET statut_enchere = 'terminee' WHERE id_enchere = :id")
                    ->execute(['id' => $enchere['id_enchere']]);

                // 3. Ajouter AUTOMATIQUEMENT au panier du vainqueur
                $pdo->prepare("INSERT IGNORE INTO panier (id_user, id_annonce) VALUES (:u, :a)")
                    ->execute(['u' => $id_gagnant, 'a' => $id_annonce]);

                // 4. Marquer l'annonce comme vendue
                $pdo->prepare("UPDATE annonce SET statut_annonce = 'vendu' WHERE id_annonce = :a")
                    ->execute(['a' => $id_annonce]);

                // 5. Notifications
                createNotification($pdo, $id_gagnant, 'enchere', "Félicitations ! Vous avez gagné l'enchère pour '$titre' à $montant €. L'article est dans votre panier.");
                createNotification($pdo, $id_vendeur, 'vente', "Votre enchère pour '$titre' est terminée. Vendue pour $montant €.");

            } else {
                // PAS DE GAGNANT : SUPPRESSION AUTOMATIQUE
                
                // A. Notifier le vendeur avant suppression
                createNotification($pdo, $id_vendeur, 'enchere', "Votre enchère pour '$titre' est terminée sans aucune offre. L'article a été supprimé du catalogue.");

                // B. Nettoyer les dépendances
                $pdo->prepare("DELETE FROM image WHERE id_annonce = :a")->execute(['a' => $id_annonce]);
                $pdo->prepare("DELETE FROM favoris WHERE id_annonce = :a")->execute(['a' => $id_annonce]);
                $pdo->prepare("DELETE FROM panier WHERE id_annonce = :a")->execute(['a' => $id_annonce]);
                $pdo->prepare("DELETE FROM echange WHERE id_negociation IN (SELECT id_negociation FROM negociation WHERE id_annonce = :a)")->execute(['a' => $id_annonce]);
                $pdo->prepare("DELETE FROM negociation WHERE id_annonce = :a")->execute(['a' => $id_annonce]);
                $pdo->prepare("DELETE FROM enchere WHERE id_annonce = :a")->execute(['a' => $id_annonce]);

                // C. Supprimer l'annonce
                $pdo->prepare("DELETE FROM annonce WHERE id_annonce = :a")->execute(['a' => $id_annonce]);
            }

            $pdo->commit();
        }
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
    }
}
?>
