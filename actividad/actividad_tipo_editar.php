<?php
header('Content-Type: application/json');
include('../includes/db.php');

$response = ['success' => false, 'message' => ''];

$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'] ?? '';
$nombre = trim($data['nombre'] ?? '');
$MET = $data['MET'] ?? '';

if (!$id || !$nombre || !$MET) {
    $response['message'] = "Todos los campos son requeridos";
    echo json_encode($response);
    exit;
}

// Verificar que exista
$exists = $conn->prepare("SELECT COUNT(*) AS c FROM actividad_tipo WHERE id=?");
$exists->bind_param("s", $id);
$exists->execute();
$res = $exists->get_result()->fetch_assoc();

if ($res['c'] == 0) {
    $response['message'] = "El registro no existe";
    echo json_encode($response);
    exit;
}

// Verificar que no exista otro con el mismo nombre
$check = $conn->prepare("SELECT COUNT(*) AS c FROM actividad_tipo WHERE nombre=? AND id!=?");
$check->bind_param("ss", $nombre, $id);
$check->execute();
$res = $check->get_result()->fetch_assoc();

if ($res['c'] > 0) {
    $response['message'] = "Ya existe otro tipo de actividad con ese nombre";
    echo json_encode($response);
    exit;
}

$stmt = $conn->prepare("UPDATE actividad_tipo SET nombre=?, MET=? WHERE id=?");
$stmt->bind_param("sds", $nombre, $MET, $id);

if ($stmt->execute()) {
    $response['success'] = true;
    $response['message'] = "Tipo de actividad actualizado correctamente";
} else {
    $response['message'] = "Error al actualizar: " . $conn->error;
}

echo json_encode($response);
$conn->close();
?>
