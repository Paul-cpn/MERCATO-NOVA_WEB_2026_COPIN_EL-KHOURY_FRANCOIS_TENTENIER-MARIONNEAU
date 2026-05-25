<?php
function createNotification($pdo, $id_user, $type, $texte) {
    try {
        $stmt = $pdo->prepare("INSERT INTO notification (id_user, type_notification, texte_notification) VALUES (:u, :t, :txt)");
        $stmt->execute(['u' => $id_user, 't' => $type, 'txt' => $texte]);
        return true;
    } catch (Exception $e) {
        return false;
    }
}
?>
