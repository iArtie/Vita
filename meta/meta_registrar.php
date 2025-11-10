<?php
header('Content-Type: application/json');
include('../includes/db.php');

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) { echo json_encode(['success'=>false,'message'=>'No se recibieron datos JSON']); exit; }

$id = $data['id'] ?? uniqid('', true); // o usa un UUID real
$usuario_id = $data['usuario_id'] ?? null;
$tipo = $data['tipo'] ?? null;
$valor_objetivo = isset($data['valor_objetivo']) ? floatval($data['valor_objetivo']) : 0;
$estado = $data['estado'] ?? 'activa';

if (!$usuario_id || !$tipo || !$valor_objetivo) {
    echo json_encode(['success'=>false,'message'=>'Faltan datos obligatorios']);
    exit;
}

$stmt = $conn->prepare("INSERT INTO meta (id, usuario_id, tipo, valor_objetivo, estado) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sssds", $id, $usuario_id, $tipo, $valor_objetivo, $estado);

if($stmt->execute()){
    echo json_encode(['success'=>true,'message'=>'Meta registrada correctamente']);
} else {
    echo json_encode(['success'=>false,'message'=>'Error al registrar: '.$stmt->error]);
}

$stmt->close();
$conn->close();
?>
