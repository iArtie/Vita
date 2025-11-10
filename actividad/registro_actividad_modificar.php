<?php
header('Content-Type: application/json');
include('../includes/db.php');

$response = ['success' => false, 'message' => ''];

// Asegurarse de que sea POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = "Método no permitido.";
    echo json_encode($response);
    exit;
}

// Leer datos JSON
$data = json_decode(file_get_contents('php://input'), true);

$id = $data['id'] ?? '';
$usuario_id = $data['usuario_id'] ?? '';
$actividad_tipo_id = $data['actividad_tipo_id'] ?? '';
$fecha_hora = $data['fecha_hora'] ?? '';
$duracion_min = $data['duracion_min'] ?? '';
$kcal_quemadas = $data['kcal_quemadas'] ?? '';

if (!$id || !$usuario_id || !$actividad_tipo_id || !$fecha_hora || !$duracion_min || !$kcal_quemadas) {
    $response['message'] = "Todos los campos son obligatorios.";
    echo json_encode($response);
    exit;
}

// Actualizar registro
$stmt = $conn->prepare("UPDATE registro_actividad SET usuario_id=?, actividad_tipo_id=?, fecha_hora=?, duracion_min=?, kcal_quemadas=? WHERE id=?");
$stmt->bind_param("ssssds", $usuario_id, $actividad_tipo_id, $fecha_hora, $duracion_min, $kcal_quemadas, $id);

if ($stmt->execute()) {
    $response['success'] = true;
    $response['message'] = "Registro actualizado correctamente.";
} else {
    $response['message'] = "Error al actualizar: " . $stmt->error;
}

$stmt->close();
$conn->close();
echo json_encode($response);
?>
