<?php
header('Content-Type: application/json');
include('../../includes/db.php');

$response = ['success'=>false,'message'=>'','data'=>[]];

$result = $conn->query("
    SELECT ap.id, ap.usuario_id, CONCAT(u.nombre,' ',u.apellido) as usuario, ap.nombre, ap.kcal_kg, ap.prot_kg, ap.gras_kg, ap.carb_kg, ap.creado_el
    FROM alimento_personalizado ap
    JOIN usuario u ON u.id = ap.usuario_id
    ORDER BY ap.creado_el DESC
");

if(!$result){
    $response['message'] = "Error en la consulta: ".$conn->error;
    echo json_encode($response);
    exit;
}

while($row = $result->fetch_assoc()){
    $response['data'][] = $row;
}

$response['success'] = true;
echo json_encode($response);
$conn->close();
?>
