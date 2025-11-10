<?php
header('Content-Type: application/json');
include('../includes/db.php');

$response = ['success' => false, 'message' => ''];

$id = $_GET['id'] ?? '';

if (!$id) {
    $response['message'] = "ID requerido";
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

// Eliminar
$stmt = $conn->prepare("DELETE FROM actividad_tipo WHERE id=?");
$stmt->bind_param("s", $id);

if ($stmt->execute()) {
    $response['success'] = true;
    $response['message'] = "Tipo de actividad eliminado correctamente";
} else {
    $response['message'] = "Error al eliminar: " . $conn->error;
}

echo json_encode($response);
$conn->close();
?>
