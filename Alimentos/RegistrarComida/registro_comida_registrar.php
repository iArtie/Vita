<?php
header('Content-Type: application/json');

// Capturar cualquier warning o error y devolverlo en JSON
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    echo json_encode([
        'success' => false,
        'message' => "PHP Error [$errno]: $errstr en $errfile:$errline"
    ]);
    exit;
});

include('../../includes/db.php');

$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    echo json_encode(['success' => false, 'message' => 'No se recibieron datos JSON']);
    exit;
}

$usuario_id = $data['usuario_id'] ?? null;
$alimento_id = $data['alimento_id'] ?: null;
$alimento_personalizado_id = $data['alimento_personalizado_id'] ?: null;
$fecha_hora = $data['fecha_hora'] ?? null;
$porcion_kg = $data['porcion_kg'] ?? 0;
$kcal = $data['kcal'] ?? 0;
$prot_g = $data['prot_g'] ?? 0;
$gras_g = $data['gras_g'] ?? 0;
$carb_g = $data['carb_g'] ?? 0;

if (!$usuario_id || !$fecha_hora) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos obligatorios (usuario o fecha)']);
    exit;
}

// Formato MySQL válido
$fecha_hora = str_replace('T', ' ', $fecha_hora);
if (strlen($fecha_hora) === 16) $fecha_hora .= ':00';

$id = uniqid();

$query = "INSERT INTO registro_comida 
    (id, usuario_id, alimento_id, alimento_personalizado_id, fecha_hora, porcion_kg, kcal, prot_g, gras_g, carb_g)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($query);
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Error al preparar consulta: ' . $conn->error]);
    exit;
}

$stmt->bind_param(
    "sssssddddd",
    $id,
    $usuario_id,
    $alimento_id,
    $alimento_personalizado_id,
    $fecha_hora,
    $porcion_kg,
    $kcal,
    $prot_g,
    $gras_g,
    $carb_g
);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Registro guardado correctamente']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al guardar: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>