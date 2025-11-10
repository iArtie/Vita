<?php
header('Content-Type: application/json');
include('../includes/db.php');

$id = $_GET['id'] ?? null;
if(!$id){ echo json_encode(['success'=>false,'message'=>'ID no especificado']); exit; }

$stmt = $conn->prepare("DELETE FROM recomendacion WHERE id=?");
$stmt->bind_param("s", $id);

if($stmt->execute()){
    echo json_encode(['success'=>true,'message'=>'Recomendación eliminada correctamente']);
} else {
    echo json_encode(['success'=>false,'message'=>'Error al eliminar: '.$stmt->error]);
}

$stmt->close();
$conn->close();
?>