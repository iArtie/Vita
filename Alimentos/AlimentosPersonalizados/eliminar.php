<?php
header('Content-Type: application/json');
include('../../includes/db.php');

$id = $_GET['id'] ?? '';
$response = ['success'=>false,'message'=>''];

if(!$id){
    $response['message'] = "ID es obligatorio";
    echo json_encode($response);
    exit;
}

// Verificar que el registro exista
$res = $conn->query("SELECT id FROM alimento_personalizado WHERE id='$id'");
if($res->num_rows == 0){
    $response['message'] = "Alimento personalizado no existe";
    echo json_encode($response);
    exit;
}

if($conn->query("DELETE FROM alimento_personalizado WHERE id='$id'")){
    $response['success'] = true;
    $response['message'] = "Alimento personalizado eliminado correctamente";
} else {
    $response['message'] = "Error al eliminar: ".$conn->error;
}

echo json_encode($response);
$conn->close();
?>
