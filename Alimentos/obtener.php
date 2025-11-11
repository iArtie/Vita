<?php
header('Content-Type: application/json; charset=utf-8');
include('../includes/db.php');

$sql = "SELECT id, nombre, kcal_kg, prot_kg, gras_kg, carb_kg
        FROM alimento
        ORDER BY nombre ASC";

$res = $conn->query($sql);
if (!$res) {
    echo json_encode(['success' => false, 'message' => 'Error en la consulta: ' . $conn->error]);
    exit;
}

$data = [];
while ($row = $res->fetch_assoc()) {
    // Normalizamos tipos numéricos
    $row['kcal_kg'] = (float)$row['kcal_kg'];
    $row['prot_kg'] = (float)$row['prot_kg'];
    $row['gras_kg'] = (float)$row['gras_kg'];
    $row['carb_kg'] = (float)$row['carb_kg'];
    $data[] = $row;
}

echo json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
$conn->close();
