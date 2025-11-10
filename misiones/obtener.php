<?php
header('Content-Type: application/json');
include('../includes/db.php');

$response = ['success'=>false, 'message'=>'', 'data'=>[]];

$res = $conn->query("SELECT * FROM mision");
if($res){
    while($row = $res->fetch_assoc()) $response['data'][] = $row;
    $response['success'] = true;
} else {
    $response['message'] = $conn->error;
}

echo json_encode($response);
$conn->close();
?>
