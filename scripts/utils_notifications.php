<?php
function createNotification($pdo, $id_user, $type, $texte, $id_cible = null) {
    try {
        $sql = "INSERT INTO notification (id_user, type_notification, texte_notification, id_cible) VALUES (:u, :t, :txt, :c)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['u' => $id_user, 't' => $type, 'txt' => $texte, 'c' => $id_cible]);
        return true;
    } catch (Exception $e) {
        return false;
    }
}
?>
