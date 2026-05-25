<?php
require_once '../bdd/connexion.php';
header('Content-Type: application/json');

$id_negociation = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id_negociation <= 0) {
    echo json_encode([]);
    exit;
}

try {
    $sql = "SELECT e.*, u.pseudo_user, u.prenom_user
            FROM echange e
            JOIN user u ON e.id_user = u.id_user
            WHERE e.id_negociation = :n
            ORDER BY e.date_echange ASC";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['n' => $id_negociation]);
    $echanges = $stmt->fetchAll();

    echo json_encode($echanges);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
