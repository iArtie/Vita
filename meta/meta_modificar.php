<?php
header('Content-Type: application/json');
include('../includes/db.php');

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) { echo json_encode(['success'=>false,'message'=>'No se recibieron datos JSON']); exit; }

$id = $data['id'] ?? null;
$usuario_id = $data['usuario_id'] ?? null;
$tipo = $data['tipo'] ?? null;
$valor_objetivo = isset($data['valor_objetivo']) ? floatval($data['valor_objetivo']) : 0;
$estado = $data['estado'] ?? 'activa';

if (!$id || !$usuario_id || !$tipo || !$valor_objetivo) {
    echo json_encode(['success'=>false,'message'=>'Faltan datos obligatorios']);
    exit;
}

$stmt = $conn->prepare("UPDATE meta SET usuario_id=?, tipo=?, valor_objetivo=?, estado=? WHERE id=?");
$stmt->bind_param("ssdss", $usuario_id, $tipo, $valor_objetivo, $estado, $id);

if($stmt->execute()){
    echo json_encode(['success'=>true,'message'=>'Meta modificada correctamente']);
} else {
    echo json_encode(['success'=>false,'message'=>'Error al modificar: '.$stmt->error]);
}

$stmt->close();
$conn->close();
?>
