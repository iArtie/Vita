<?php
header('Content-Type: application/json');
include('../includes/db.php');

$response = ['success' => false, 'data' => null, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $usuario_id = $_GET['usuario_id'] ?? '';
    
    if (!$usuario_id) {
        $response['message'] = "ID de usuario requerido.";
        echo json_encode($response);
        exit;
    }

    try {
        $sql = "SELECT u.*, du.avatar_id, du.racha, du.level, du.points, du.completed_missions
                FROM usuario u 
                LEFT JOIN detalle_usuario du ON u.id = du.usuario_id 
                WHERE u.id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $usuario_id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $usuario = $result->fetch_assoc();
            // No enviar el password_hash por seguridad
            unset($usuario['password_hash']);
            
            $response['success'] = true;
            $response['data'] = $usuario;
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