<?php
header('Content-Type: application/json');
include('../includes/db.php');

$response = ['success' => false, 'message' => ''];

$id = $_GET['id'] ?? '';

if (!$id) {
    $response['message'] = "ID requerido.";
    echo json_encode($response);
    exit;
}

$stmt = $conn->prepare("DELETE FROM registro_actividad WHERE id=?");
$stmt->bind_param("s", $id);

if ($stmt->execute()) {
    $response['success'] = true;
    $response['message'] = "Registro eliminado correctamente.";
} else {
    $response['message'] = "Error al eliminar: " . $stmt->error;
}

$stmt->close();
$conn->close();
echo json_encode($response);
?>
