<?php
header('Content-Type: application/json');
include('../includes/db.php');

$data = json_decode(file_get_contents('php://input'), true);
if(!$data){ echo json_encode(['success'=>false,'message'=>'No se recibieron datos JSON']); exit; }

$id = $data['id'] ?? null;
$usuario_id = $data['usuario_id'] ?? null;
$descripcion = $data['descripcion'] ?? null;
$prioridad = $data['prioridad'] ?? 'media';
$estado = $data['estado'] ?? 'pendiente';
$fecha_generacion = $data['fecha_generacion'] ?? null;

if(!$id || !$usuario_id || !$descripcion || !$fecha_generacion){
    echo json_encode(['success'=>false,'message'=>'Faltan datos obligatorios']); exit;
}

$stmt = $conn->prepare("UPDATE recomendacion SET usuario_id=?, descripcion=?, prioridad=?, estado=?, fecha_generacion=? WHERE id=?");
$stmt->bind_param("ssssss", $usuario_id, $descripcion, $prioridad, $estado, $fecha_generacion, $id);

if($stmt->execute()){
    echo json_encode(['success'=>true,'message'=>'Recomendación modificada correctamente']);
} else {
    echo json_encode(['success'=>false,'message'=>'Error al modificar: '.$stmt->error]);
}

$stmt->close();
$conn->close();
?>