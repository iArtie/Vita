<?php
header('Content-Type: application/json');
include('../includes/db.php');

$sql = "SELECT r.*, u.username AS usuario 
        FROM recomendacion r 
        INNER JOIN usuario u ON r.usuario_id = u.id 
        ORDER BY r.fecha_generacion DESC";

$result = $conn->query($sql);

$data = [];
if($result){
    while($row = $result->fetch_assoc()){
        $data[] = $row;
    }
}

echo json_encode(['success'=>true,'data'=>$data]);

$conn->close();
?>