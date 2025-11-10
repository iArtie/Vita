<?php
header('Content-Type: application/json');
include('../includes/db.php');

$data = json_decode(file_get_contents('php://input'), true);
$response = ['success'=>false, 'message'=>''];

// Validar campos requeridos
if(empty($data['usuario_id']) || (!isset($data['alimento_id']) && !isset($data['alimento_personalizado_id']))) {
    $response['message'] = 'Usuario o alimento no especificado';
    echo json_encode($response);
    exit;
}

// Generar ID
$id = uniqid();

// Insertar en BD
$stmt = $conn->prepare("INSERT INTO registro_comida 
(usuario_id, alimento_id, alimento_personalizado_id, fecha_hora, porcion_kg, kcal, prot_g, gras_g, carb_g, id) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssddddd", 
    $data['usuario_id'], 
    $data['alimento_id'], 
    $data['alimento_personalizado_id'], 
    $data['fecha_hora'], 
    $data['porcion_kg'], 
    $data['kcal'], 
    $data['prot_g'], 
    $data['gras_g'], 
    $data['carb_g'], 
    $id
);

if($stmt->execute()) {
    $response['success'] = true;
    $response['message'] = 'Registro de comida agregado';
} else {
    $response['message'] = 'Error al agregar: '.$stmt->error;
}

$stmt->close();
$conn->close();

echo json_encode($response);
?>