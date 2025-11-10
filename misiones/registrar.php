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
$nombre = $_POST['nombre'] ?? '';
$periodicidad = $_POST['periodicidad'] ?? '';
$puntos = $_POST['puntos'] ?? '';
$reglas = $_POST['reglas'] ?? '';
$vigente = $_POST['vigente'] ?? 1;
$creado_por = $_POST['creado_por'] ?? 'admin'; // ID del creador

// Validar campos
if (!$nombre || !$periodicidad || !$puntos || !$reglas || !$creado_por) {
    $response['message'] = "Todos los campos son obligatorios.";
    echo json_encode($response);
    exit;
}

// Verificar duplicado
$stmt = $conn->prepare("SELECT id FROM mision WHERE nombre=?");
$stmt->bind_param("s", $nombre);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    $response['message'] = "Ya existe una misión con ese nombre.";
    echo json_encode($response);
    exit;
}
$stmt->close();

// Insertar misión
$id = uniqid();
$stmt = $conn->prepare("INSERT INTO mision (id, creado_por, nombre, periodicidad, puntos, reglas, vigente) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssisi", $id, $creado_por, $nombre, $periodicidad, $puntos, $reglas, $vigente);

if ($stmt->execute()) {
    $response['success'] = true;
    $response['message'] = "Misión registrada correctamente.";
} else {
    $response['message'] = "Error al registrar misión: " . $stmt->error;
}

$stmt->close();
$conn->close();
echo json_encode($response);
?>
