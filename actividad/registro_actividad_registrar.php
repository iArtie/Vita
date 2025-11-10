<?php
header('Content-Type: application/json');
include('../includes/db.php');
$data = json_decode(file_get_contents("php://input"), true);

// Validar campos
if (!isset($data['usuario_id'], $data['actividad_tipo_id'], $data['fecha_hora'], $data['duracion_min'], $data['kcal_quemadas'])) {
    echo json_encode(["success" => false, "message" => "Faltan datos obligatorios"]);
    exit;
}

// Verificar existencia de usuario
$checkUsuario = $conn->prepare("SELECT id FROM usuario WHERE id = ?");
$checkUsuario->bind_param("s", $data['usuario_id']);
$checkUsuario->execute();
if ($checkUsuario->get_result()->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "El usuario no existe"]);
    exit;
}

// Verificar existencia de tipo de actividad
$checkActividad = $conn->prepare("SELECT id FROM actividad_tipo WHERE id = ?");
$checkActividad->bind_param("s", $data['actividad_tipo_id']);
$checkActividad->execute();
if ($checkActividad->get_result()->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "El tipo de actividad no existe"]);
    exit;
}

// Insertar registro
$id = uniqid();
$sql = $conn->prepare("INSERT INTO registro_actividad (id, usuario_id, actividad_tipo_id, fecha_hora, duracion_min, kcal_quemadas)
                       VALUES (?, ?, ?, ?, ?, ?)");
$sql->bind_param("ssssii", $id, $data['usuario_id'], $data['actividad_tipo_id'], $data['fecha_hora'], $data['duracion_min'], $data['kcal_quemadas']);

if ($sql->execute()) {
    echo json_encode(["success" => true, "message" => "Registro agregado correctamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al registrar: " . $conn->error]);
}
?>