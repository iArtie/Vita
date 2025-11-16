<?php
header('Content-Type: application/json');
include('../includes/db.php');

$response = ['success' => false, 'message' => '', 'user' => null];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($password)) {
        $response['message'] = "Usuario y contraseña son requeridos.";
        echo json_encode($response);
        exit;
    }

    try {
        // Buscar usuario por username o email
        $sql = "SELECT u.*, du.avatar_id, du.racha, du.level, du.points, du.completed_missions 
                FROM usuario u 
                LEFT JOIN detalle_usuario du ON u.id = du.usuario_id 
                WHERE u.username = ? OR u.email = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $username, $username);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();
            
            // Verificar contraseña
            if (password_verify($password, $user['password_hash'])) {
                // Iniciar sesión
                session_start();
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['email'] = $user['email'];
                $_SESSION['role'] = $user['rol'];
                $_SESSION['avatar_id'] = $user['avatar_id'];
                
                // No enviar el password_hash por seguridad
                unset($user['password_hash']);
                
                $response['success'] = true;
                $response['message'] = "Inicio de sesión exitoso.";
                $response['user'] = $user;
            } else {
                $response['message'] = "Contraseña incorrecta.";
            }
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