<?php
header('Content-Type: application/json');
include('../includes/db.php');

$response = ['success' => false, 'message' => '', 'data' => []];

$result = $conn->query("SELECT * FROM actividad_tipo ORDER BY nombre ASC");
while ($row = $result->fetch_assoc()) {
    $response['data'][] = $row;
}

$response['success'] = true;
echo json_encode($response);
$conn->close();
?>
