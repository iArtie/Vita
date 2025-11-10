<?php
header('Content-Type: application/json');
include('../../includes/db.php');

$data = json_decode(file_get_contents('php://input'), true);
$response = ['success'=>false,'message'=>''];

if(empty($data['id'])){
    $response['message'] = "ID del registro requerido";
    echo json_encode($response);
    exit;
}

$stmt = $conn->prepare("
UPDATE registro_comida
SET usuario_id=?, alimento_id=?, alimento_personalizado_id=?, fecha_hora=?, porcion_kg=?, kcal=?, prot_g=?, gras_g=?, carb_g=?
WHERE id=?
");
$stmt->bind_param(
    "ssssddddd s",
    $data['usuario_id'],
    $data['alimento_id'] ?? null,
    $data['alimento_personalizado_id'] ?? null,
    $data['fecha_hora'],
    $data['porcion_kg'],
    $data['kcal'],
    $data['prot_g'],
    $data['gras_g'],
    $data['carb_g'],
    $data['id']
);

if($stmt->execute()){
    $response['success'] = true;
    $response['message'] = "Registro de comida modificado correctamente";
}else{
    $response['message'] = "Error: ".$stmt->error;
}
$stmt->close();
$conn->close();
echo json_encode($response);
?>
