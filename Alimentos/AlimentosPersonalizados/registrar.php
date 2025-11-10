<?php
header("Content-Type: application/json");
include('../../includes/db.php');

// Mostrar errores para depuración
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "Datos no recibidos"]);
    exit;
}

// Tomar los datos correctamente
$usuario_id = $data["usuario_id"] ?? "";
$nombre = trim($data["nombre"] ?? "");
$porcion_kg = floatval($data["porcion_kg"] ?? 0);
$kcal_kg = floatval($data["kcal_kg"] ?? 0);
$prot_kg = floatval($data["prot_kg"] ?? 0);
$gras_kg = floatval($data["gras_kg"] ?? 0);
$carb_kg = floatval($data["carb_kg"] ?? 0);

// Validación obligatoria
if (!$usuario_id || !$nombre) {
    echo json_encode(["success" => false, "message" => "Faltan datos obligatorios"]);
    exit;
}

// Verificar si ya existe el alimento para este usuario
$sql_check = "SELECT COUNT(*) FROM alimento_personalizado WHERE usuario_id = ? AND nombre = ?";
$stmt_check = $conn->prepare($sql_check);
$stmt_check->bind_param("ss", $usuario_id, $nombre);
$stmt_check->execute();
$stmt_check->bind_result($existe);
$stmt_check->fetch();
$stmt_check->close();

if ($existe > 0) {
    echo json_encode(["success" => false, "message" => "Ya existe un alimento con ese nombre"]);
    exit;
}

// Generar ID único
$id = uniqid();

// Insertar registro
$sql = "INSERT INTO alimento_personalizado 
        (id, usuario_id, nombre, kcal_kg, prot_kg, gras_kg, carb_kg, creado_el)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sssdddd", $id, $usuario_id, $nombre, $kcal_kg, $prot_kg, $gras_kg, $carb_kg);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Alimento agregado exitosamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al insertar: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>