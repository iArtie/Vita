<?php
header('Content-Type: application/json');
include('../includes/db.php');

$sql = "SELECT ra.id, ra.usuario_id, ra.actividad_tipo_id, 
               u.nombre AS usuario, a.nombre AS actividad,
               ra.fecha_hora, ra.duracion_min, ra.kcal_quemadas
        FROM registro_actividad ra
        INNER JOIN usuario u ON ra.usuario_id = u.id
        INNER JOIN actividad_tipo a ON ra.actividad_tipo_id = a.id";

$result = $conn->query($sql);

if (!$result) {
    echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
    exit;
}

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode(["success" => true, "data" => $data], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>