<?php
header('Content-Type: application/json');
include('../includes/db.php');

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = "Método no permitido.";
    echo json_encode($response);
    exit;
}

$id      = trim($_POST['id'] ?? '');
$nombre  = trim($_POST['nombre'] ?? '');
$kcal_kg = $_POST['kcal_kg'] ?? '';
$prot_kg = $_POST['prot_kg'] ?? '';
$gras_kg = $_POST['gras_kg'] ?? '';
$carb_kg = $_POST['carb_kg'] ?? '';

if ($id === '' || $nombre === '' || $kcal_kg === '' || $prot_kg === '' || $gras_kg === '' || $carb_kg === '') {
    $response['message'] = "Todos los campos son obligatorios.";
    echo json_encode($response);
    exit;
}

$check = $conn->prepare("SELECT id FROM alimento WHERE nombre = ? AND id <> ?");
$check->bind_param("ss", $nombre, $id);
$check->execute();
$res = $check->get_result();

if ($res->num_rows > 0) {
    $response['message'] = "Ya existe otro alimento con ese nombre.";
    echo json_encode($response);
    exit;
}

$sql = "UPDATE alimento 
        SET nombre=?, kcal_kg=?, prot_kg=?, gras_kg=?, carb_kg=? 
        WHERE id=?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sdddds", $nombre, $kcal_kg, $prot_kg, $gras_kg, $carb_kg, $id);

if ($stmt->execute()) {
    $response['success'] = true;
    $response['message'] = "Alimento modificado correctamente.";
} else {
    $response['message'] = "Error al modificar: " . $stmt->error;
}

$stmt->close();
$conn->close();
echo json_encode($response, JSON_UNESCAPED_UNICODE);
