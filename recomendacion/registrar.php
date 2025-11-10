<?php
header('Content-Type: application/json');
include('../includes/db.php');

// Función para generar UUID v4
function generate_uuid() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

$data = json_decode(file_get_contents('php://input'), true);
if(!$data){ echo json_encode(['success'=>false,'message'=>'No se recibieron datos JSON']); exit; }

$id = generate_uuid();
$usuario_id = $data['usuario_id'] ?? null;
$descripcion = $data['descripcion'] ?? null;
$prioridad = $data['prioridad'] ?? 'media';
$estado = $data['estado'] ?? 'pendiente';
$fecha_generacion = $data['fecha_generacion'] ?? null;

if(!$usuario_id || !$descripcion || !$fecha_generacion){
    echo json_encode(['success'=>false,'message'=>'Faltan datos obligatorios']); exit;
}

$stmt = $conn->prepare("INSERT INTO recomendacion (id, usuario_id, descripcion, prioridad, estado, fecha_generacion) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssss", $id, $usuario_id, $descripcion, $prioridad, $estado, $fecha_generacion);

if($stmt->execute()){
    echo json_encode(['success'=>true,'message'=>'Recomendación registrada correctamente','id'=>$id]);
} else {
    echo json_encode(['success'=>false,'message'=>'Error al registrar: '.$stmt->error]);
}

$stmt->close();
$conn->close();
?>