<?php
header('Content-Type: application/json');
include('../../includes/db.php');

$id = $_GET['id'] ?? '';
$response = ['success'=>false,'message'=>''];

if(!$id){
    $response['message'] = "ID del registro requerido";
    echo json_encode($response);
    exit;
}

if($conn->query("DELETE FROM registro_comida WHERE id='$id'")){
    $response['success'] = true;
    $response['message'] = "Registro de comida eliminado correctamente";
}else{
    $response['message'] = "Error: ".$conn->error;
}

echo json_encode($response);
$conn->close();
?>
