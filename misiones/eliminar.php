<?php
header('Content-Type: application/json');
include('../includes/db.php');

$response = ['success' => false, 'message' => ''];

// Verificar método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = "Método no permitido.";
    echo json_encode($response);
    exit;
}

// Obtener ID
$id = $_POST['id'] ?? '';
if (!$id) {
    $response['message'] = "ID de misión requerido.";
    echo json_encode($response);
    exit;
}

// Eliminar misión
$stmt = $conn->prepare("DELETE FROM mision WHERE id=?");
$stmt->bind_param("s", $id);

if ($stmt->execute()) {
    $response['success'] = true;
    $response['message'] = "Misión eliminada correctamente.";
} else {
    $response['message'] = "Error al eliminar misión: " . $stmt->error;
}

$stmt->close();
$conn->close();
echo json_encode($response);
?>
