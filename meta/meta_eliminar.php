<?php
header('Content-Type: application/json');
include('../includes/db.php');

$id = $_GET['id'] ?? null;
if (!$id) { echo json_encode(['success'=>false,'message'=>'Falta el ID']); exit; }

$stmt = $conn->prepare("DELETE FROM meta WHERE id=?");
$stmt->bind_param("s", $id);

if($stmt->execute()){
    echo json_encode(['success'=>true,'message'=>'Meta eliminada correctamente']);
} else {
    echo json_encode(['success'=>false,'message'=>'Error al eliminar: '.$stmt->error]);
}

$stmt->close();
$conn->close();
?>