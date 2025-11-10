<?php
header('Content-Type: application/json');
include('../includes/db.php');

$response = ['success' => false, 'message' => ''];

$data = json_decode(file_get_contents('php://input'), true);
$nombre = trim($data['nombre'] ?? '');
$MET = $data['MET'] ?? '';

if (!$nombre || !$MET) {
    $response['message'] = "Nombre y MET son requeridos";
    echo json_encode($response);
    exit;
}

// Verificar si ya existe ese nombre
$check = $conn->prepare("SELECT COUNT(*) AS c FROM actividad_tipo WHERE nombre=?");
$check->bind_param("s", $nombre);
$check->execute();
$res = $check->get_result()->fetch_assoc();

if ($res['c'] > 0) {
    $response['message'] = "Ya existe un tipo de actividad con ese nombre";
    echo json_encode($response);
    exit;
}

$id = uniqid();
$stmt = $conn->prepare("INSERT INTO actividad_tipo (id, nombre, MET) VALUES (?, ?, ?)");
$stmt->bind_param("ssd", $id, $nombre, $MET);

if ($stmt->execute()) {
    $response['success'] = true;
    $response['message'] = "Actividad tipo agregada correctamente";
} else {
    $response['message'] = "Error al agregar: " . $conn->error;
}

echo json_encode($response);
$conn->close();
?>
