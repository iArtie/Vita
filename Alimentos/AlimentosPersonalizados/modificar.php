<?php
header('Content-Type: application/json');
include('../../includes/db.php');

$data = json_decode(file_get_contents('php://input'), true);
$response = ['success'=>false,'message'=>''];

$id = $data['id'] ?? '';
$usuario_id = $data['usuario_id'] ?? '';
$nombre = trim($data['nombre'] ?? '');
$kcal_kg = $data['kcal_kg'] ?? '';
$prot_kg = $data['prot_kg'] ?? '';
$gras_kg = $data['gras_kg'] ?? '';
$carb_kg = $data['carb_kg'] ?? '';

if(!$id || !$usuario_id || !$nombre){
    $response['message'] = "ID, usuario y nombre son obligatorios";
    echo json_encode($response);
    exit;
}

// Verificar que el registro exista
$res = $conn->query("SELECT id FROM alimento_personalizado WHERE id='$id'");
if($res->num_rows == 0){
    $response['message'] = "Alimento personalizado no existe";
    echo json_encode($response);
    exit;
}

// Verificar que el usuario exista
$res = $conn->query("SELECT id FROM usuario WHERE id='$usuario_id'");
if($res->num_rows == 0){
    $response['message'] = "Usuario no existe";
    echo json_encode($response);
    exit;
}

// Verificar si el nombre ya existe para el usuario en otro registro
$res = $conn->query("SELECT id FROM alimento_personalizado WHERE usuario_id='$usuario_id' AND nombre='$nombre' AND id<>'$id'");
if($res->num_rows > 0){
    $response['message'] = "Ya existe otro alimento personalizado con ese nombre para este usuario";
    echo json_encode($response);
    exit;
}

$stmt = $conn->prepare("UPDATE alimento_personalizado SET usuario_id=?, nombre=?, kcal_kg=?, prot_kg=?, gras_kg=?, carb_kg=? WHERE id=?");
$stmt->bind_param("ssdddds", $usuario_id, $nombre, $kcal_kg, $prot_kg, $gras_kg, $carb_kg, $id);

if($stmt->execute()){
    $response['success'] = true;
    $response['message'] = "Alimento personalizado modificado correctamente";
} else {
    $response['message'] = "Error al modificar: ".$stmt->error;
}

$stmt->close();
$conn->close();
echo json_encode($response);
?>