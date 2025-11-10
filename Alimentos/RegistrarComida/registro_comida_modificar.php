<?php
header('Content-Type: application/json');

// Manejador de errores para mostrar mensajes JSON
set_error_handler(function($errno, $errstr, $errfile, $errline){
    echo json_encode(['success'=>false,'message'=>"PHP Error [$errno]: $errstr"]);
    exit;
});

include('../../includes/db.php');

// Obtener datos JSON
$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    echo json_encode(['success'=>false,'message'=>'No se recibieron datos JSON']);
    exit;
}

// Variables recibidas
$id = $data['id'] ?? null;
$usuario_id = $data['usuario_id'] ?? null;
$alimento_id = $data['alimento_id'] ?? null;
$alimento_personalizado_id = $data['alimento_personalizado_id'] ?? null;
$fecha_hora = $data['fecha_hora'] ?? null;
$porcion_kg = isset($data['porcion_kg']) ? floatval($data['porcion_kg']) : 0;
$kcal = isset($data['kcal']) ? floatval($data['kcal']) : 0;
$prot_g = isset($data['prot_g']) ? floatval($data['prot_g']) : 0;
$gras_g = isset($data['gras_g']) ? floatval($data['gras_g']) : 0;
$carb_g = isset($data['carb_g']) ? floatval($data['carb_g']) : 0;

// Depuración: imprimir valores recibidos
$debug = [
    'id' => $id,
    'usuario_id' => $usuario_id,
    'alimento_id' => $alimento_id,
    'alimento_personalizado_id' => $alimento_personalizado_id,
    'fecha_hora' => $fecha_hora,
    'porcion_kg' => $porcion_kg,
    'kcal' => $kcal,
    'prot_g' => $prot_g,
    'gras_g' => $gras_g,
    'carb_g' => $carb_g
];
file_put_contents('php://stderr', print_r($debug, true)); // imprime en log del servidor

// Validaciones
if (!$id || !$usuario_id || !$fecha_hora) {
    echo json_encode(['success'=>false,'message'=>'Faltan datos obligatorios (ID, usuario o fecha)', 'debug'=>$debug]);
    exit;
}

// Formato MySQL
$fecha_hora = str_replace('T', ' ', $fecha_hora);
if (strlen($fecha_hora) === 16) $fecha_hora .= ':00';

// Preparar consulta
$query = "UPDATE registro_comida SET 
    usuario_id=?,
    alimento_id=?,
    alimento_personalizado_id=?,
    fecha_hora=?,
    porcion_kg=?,
    kcal=?,
    prot_g=?,
    gras_g=?,
    carb_g=?
    WHERE id=?";

$stmt = $conn->prepare($query);
if (!$stmt) {
    echo json_encode(['success'=>false,'message'=>'Error al preparar consulta: '.$conn->error]);
    exit;
}

// bind_param con tipos correctos: todos los IDs como strings, números como doubles
$stmt->bind_param(
    "ssssddddds",
    $usuario_id,
    $alimento_id,
    $alimento_personalizado_id,
    $fecha_hora,
    $porcion_kg,
    $kcal,
    $prot_g,
    $gras_g,
    $carb_g,
    $id
);

// Ejecutar y responder
if ($stmt->execute()) {
    echo json_encode(['success'=>true,'message'=>'Registro modificado correctamente']);
} else {
    echo json_encode(['success'=>false,'message'=>'Error al modificar: '.$stmt->error]);
}

$stmt->close();
$conn->close();
?>