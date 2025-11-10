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

// Obtener datos del POST
$id = $_POST['id'] ?? '';
$nombre = $_POST['nombre'] ?? '';
$periodicidad = $_POST['periodicidad'] ?? '';
$puntos = $_POST['puntos'] ?? '';
$reglas = $_POST['reglas'] ?? '';
$vigente = $_POST['vigente'] ?? 1; // por defecto vigente

// Validar campos
if (!$id || !$nombre || !$periodicidad || !$puntos || !$reglas) {
    $response['message'] = "Todos los campos son obligatorios.";
    echo json_encode($response);
    exit;
}

// Preparar SQL
$stmt = $conn->prepare("UPDATE mision SET nombre=?, periodicidad=?, puntos=?, reglas=?, vigente=? WHERE id=?");
$stmt->bind_param("ssisds", $nombre, $periodicidad, $puntos, $reglas, $vigente, $id);

// Ejecutar y devolver respuesta
if ($stmt->execute()) {
    $response['success'] = true;
    $response['message'] = "Misión actualizada correctamente.";
} else {
    $response['message'] = "Error al actualizar misión: " . $stmt->error;
}

$stmt->close();
$conn->close();
echo json_encode($response);
?>
