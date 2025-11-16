<?php
header('Content-Type: application/json');
include('../includes/db.php');

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = "Método no permitido.";
    echo json_encode($response);
    exit;
}

$nombre  = trim($_POST['nombre'] ?? '');
$kcal_kg = $_POST['kcal_kg'] ?? '';
$prot_kg = $_POST['prot_kg'] ?? '';
$gras_kg = $_POST['gras_kg'] ?? '';
$carb_kg = $_POST['carb_kg'] ?? '';

if ($nombre === '' || $kcal_kg === '' || $prot_kg === '' || $gras_kg === '' || $carb_kg === '') {
    $response['message'] = "Todos los campos son obligatorios.";
    echo json_encode($response);
    exit;
}

$check = $conn->prepare("SELECT id FROM alimento WHERE nombre = ?");
$check->bind_param("s", $nombre);
$check->execute();
$res = $check->get_result();

if ($res->num_rows > 0) {
    $response['message'] = "Ya existe un alimento con ese nombre.";
    echo json_encode($response);
    exit;
}

$id = uniqid();

$sql = "INSERT INTO alimento (id, nombre, kcal_kg, prot_kg, gras_kg, carb_kg)
        VALUES (?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ssdddd", $id, $nombre, $kcal_kg, $prot_kg, $gras_kg, $carb_kg);

if ($stmt->execute()) {
    $response['success'] = true;
    $response['message'] = "Alimento registrado correctamente.";
    $response['id'] = $id;
} else {
    $response['message'] = "Error al registrar: " . $stmt->error;
}

$stmt->close();
$conn->close();

echo json_encode($response, JSON_UNESCAPED_UNICODE);
