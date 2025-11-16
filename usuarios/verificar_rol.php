<?php
header('Content-Type: application/json');
include('../includes/db.php');

$response = ['success' => false, 'rol' => '', 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $usuario_id = $_GET['usuario_id'] ?? '';
    
    if (!$usuario_id) {
        $response['message'] = "ID de usuario requerido.";
        echo json_encode($response);
        exit;
    }

    try {
        $sql = "SELECT rol FROM usuario WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $usuario_id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $usuario = $result->fetch_assoc();
            $response['success'] = true;
            $response['rol'] = $usuario['rol'];
            $response['message'] = "Rol obtenido correctamente";
        } else {
            $response['message'] = "Usuario no encontrado.";
        }

        $stmt->close();
    } catch (Exception $e) {
        $response['message'] = "Error: " . $e->getMessage();
    }
} else {
    $response['message'] = "Método no permitido.";
}

$conn->close();
echo json_encode($response);
?>