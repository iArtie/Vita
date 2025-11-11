<?php
header('Content-Type: application/json; charset=utf-8');
include('../includes/db.php');

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Método no permitido.';
    echo json_encode($response);
    exit;
}

// Leer JSON bruto
$input = json_decode(file_get_contents("php://input"), true);

// Validar estructura JSON
$nombre  = trim($input['nombre'] ?? '');
$kcal_kg = $input['kcal_kg'] ?? null;
$prot_kg = $input['prot_kg'] ?? null;
$gras_kg = $input['gras_kg'] ?? null;
$carb_kg = $input['carb_kg'] ?? null;

if ($nombre === '' || $kcal_kg === null || $prot_kg === null || $gras_kg === null || $carb_kg === null) {
    $response['message'] = 'Todos los campos son obligatorios.';
    echo json_encode($response);
    exit;
}

// Validar numéricos
if (!is_numeric($kcal_kg) || !is_numeric($prot_kg) || !is_numeric($gras_kg) || !is_numeric($carb_kg)) {
    $response['message'] = 'Los valores nutricionales deben ser numéricos.';
    echo json_encode($response);
    exit;
}

// Verificar duplicado
$chk = $conn->prepare("SELECT id FROM alimento WHERE nombre = ?");
$chk->bind_param("s", $nombre);
$chk->execute();
$res = $chk->get_result();
if ($res->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Ya existe un alimento con este nombre.']);
    exit;
}
$chk->close();

$id = uniqid();

$sql = "INSERT INTO alimento (id, nombre, kcal_kg, prot_kg, gras_kg, carb_kg)
        VALUES (?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssdddd", $id, $nombre, $kcal_kg, $prot_kg, $gras_kg, $carb_kg);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Alimento registrado correctamente.', 'id' => $id]);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al registrar: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
