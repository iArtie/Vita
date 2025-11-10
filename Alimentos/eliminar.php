<?php
header('Content-Type: application/json');
include('../includes/db.php');

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = "Método no permitido.";
    echo json_encode($response);
    exit;
}

$id = trim($_POST['id'] ?? '');
if ($id === '') {
    $response['message'] = "ID requerido.";
    echo json_encode($response);
    exit;
}

$stmt = $conn->prepare("DELETE FROM alimento WHERE id=?");
$stmt->bind_param("s", $id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        $response['success'] = true;
        $response['message'] = "Alimento eliminado correctamente.";
    } else {
        $response['message'] = "No existe el alimento.";
    }
} else {
    $response['message'] = "Error al eliminar: " . $stmt->error;
}

$stmt->close();
$conn->close();
echo json_encode($response, JSON_UNESCAPED_UNICODE);
