<?php
header('Content-Type: application/json');
include('../includes/db.php');

$sql = "SELECT id, nombre, kcal_kg, prot_kg, gras_kg, carb_kg
        FROM alimento
        ORDER BY nombre ASC";

$result = $conn->query($sql);

if (!$result) {
    echo json_encode(["success" => false, "message" => "Error en la consulta: " . $conn->error]);
    exit;
}

$alimentos = [];
while ($row = $result->fetch_assoc()) {
    $alimentos[] = $row;
}

echo json_encode(["success" => true, "data" => $alimentos], JSON_UNESCAPED_UNICODE);
$conn->close();
