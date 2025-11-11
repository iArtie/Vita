<?php
header('Content-Type: application/json');
include('../includes/db.php');

$res = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $res['message'] = 'Método no permitido.';
    echo json_encode($res); exit;
}

/* Lee JSON si viene como raw; si no, usa $_POST */
$input = file_get_contents('php://input');
$data = json_decode($input, true);
if (json_last_error() === JSON_ERROR_NONE && is_array($data)) {
    $id       = trim($data['id'] ?? '');
    $nombre   = trim($data['nombre'] ?? '');
    $kcal_kg  = $data['kcal_kg'] ?? null;
    $prot_kg  = $data['prot_kg'] ?? null;
    $gras_kg  = $data['gras_kg'] ?? null;
    $carb_kg  = $data['carb_kg'] ?? null;
} else {
    $id       = trim($_POST['id'] ?? '');
    $nombre   = trim($_POST['nombre'] ?? '');
    $kcal_kg  = $_POST['kcal_kg'] ?? null;
    $prot_kg  = $_POST['prot_kg'] ?? null;
    $gras_kg  = $_POST['gras_kg'] ?? null;
    $carb_kg  = $_POST['carb_kg'] ?? null;
}

if ($id === '' || $nombre === '') {
    $res['message'] = 'id y nombre son obligatorios.';
    echo json_encode($res); exit;
}

/* ¿Actualizas solo nombre o todos los nutrientes también? */
$actualizaSoloNombre = ($kcal_kg === null && $prot_kg === null && $gras_kg === null && $carb_kg === null);

if ($actualizaSoloNombre) {
    $sql = "UPDATE alimento SET nombre=? WHERE id=?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) { echo json_encode(['success'=>false,'message'=>"Error prepare: ".$conn->error]); exit; }
    $stmt->bind_param("ss", $nombre, $id);  // <-- 2 variables => "ss"
} else {
    // Convierte a float si vienen valores
    if ($kcal_kg === null || $prot_kg === null || $gras_kg === null || $carb_kg === null) {
        echo json_encode(['success'=>false,'message'=>'Completa kcal_kg, prot_kg, gras_kg y carb_kg o no envíes ninguno.']); exit;
    }
    $kcal_kg = floatval($kcal_kg);
    $prot_kg = floatval($prot_kg);
    $gras_kg = floatval($gras_kg);
    $carb_kg = floatval($carb_kg);

    $sql = "UPDATE alimento SET nombre=?, kcal_kg=?, prot_kg=?, gras_kg=?, carb_kg=? WHERE id=?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) { echo json_encode(['success'=>false,'message'=>"Error prepare: ".$conn->error]); exit; }
    // 6 variables => "sdddds"
    $stmt->bind_param("sdddds", $nombre, $kcal_kg, $prot_kg, $gras_kg, $carb_kg, $id);
}

if ($stmt->execute()) {
    $res['success'] = true;
    $res['message'] = ($stmt->affected_rows >= 0) ? 'Alimento actualizado correctamente.' : 'Sin cambios.';
} else {
    $res['message'] = 'Error al actualizar: ' . $stmt->error;
}

$stmt->close();
$conn->close();
echo json_encode($res);
