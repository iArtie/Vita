<?php
header('Content-Type: application/json');
include('../../includes/db.php');

$response = ['success'=>false,'data'=>[]];

$sql = "
SELECT rc.id, rc.usuario_id, u.nombre AS usuario, 
       rc.alimento_id, a.nombre AS alimento,
       rc.alimento_personalizado_id, ap.nombre AS alimento_personalizado,
       rc.fecha_hora, rc.porcion_kg, rc.kcal, rc.prot_g, rc.gras_g, rc.carb_g
FROM registro_comida rc
LEFT JOIN usuario u ON u.id = rc.usuario_id
LEFT JOIN alimento a ON a.id = rc.alimento_id
LEFT JOIN alimento_personalizado ap ON ap.id = rc.alimento_personalizado_id
ORDER BY rc.fecha_hora DESC";

$result = $conn->query($sql);
if(!$result){
    echo json_encode(['success'=>false,'message'=>'Error en consulta: '.$conn->error]);
    exit;
}

while($row = $result->fetch_assoc()){
    $response['data'][] = $row;
}

$response['success'] = true;
echo json_encode($response);
$conn->close();
?>
