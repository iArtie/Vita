<?php
header('Content-Type: application/json');
include('../includes/db.php');

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usuario_id = trim($_POST['usuario_id'] ?? '');
    $nombre = trim($_POST['nombre'] ?? '');
    $apellido = trim($_POST['apellido'] ?? '');
    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $avatar_id = $_POST['avatar_id'] ?? '';
    $cambiar_password = $_POST['cambiar_password'] ?? false;
    $password_actual = $_POST['password_actual'] ?? '';
    $nueva_password = $_POST['nueva_password'] ?? '';

    // Validar campos obligatorios
    if (!$usuario_id || !$nombre || !$apellido || !$username || !$email) {
        $response['message'] = "Todos los campos son obligatorios.";
        echo json_encode($response);
        exit;
    }

    // Verificar duplicados de username/email
    $checkSql = "SELECT * FROM usuario WHERE (username = ? OR email = ?) AND id != ?";
    $stmtCheck = $conn->prepare($checkSql);
    $stmtCheck->bind_param("sss", $username, $email, $usuario_id);
    $stmtCheck->execute();
    $resultCheck = $stmtCheck->get_result();

    if ($resultCheck->num_rows > 0) {
        $existing = $resultCheck->fetch_assoc();
        if ($existing['username'] === $username) {
            $response['message'] = "El nombre de usuario ya existe.";
        } elseif ($existing['email'] === $email) {
            $response['message'] = "El correo ya está registrado.";
        }
        echo json_encode($response);
        exit;
    }

    // Iniciar transacción
    $conn->begin_transaction();

    try {
        // Verificar contraseña actual si se quiere cambiar la contraseña
        if ($cambiar_password && $nueva_password) {
            $sqlPassword = "SELECT password_hash FROM usuario WHERE id = ?";
            $stmtPassword = $conn->prepare($sqlPassword);
            $stmtPassword->bind_param("s", $usuario_id);
            $stmtPassword->execute();
            $resultPassword = $stmtPassword->get_result();
            
            if ($resultPassword->num_rows > 0) {
                $usuario = $resultPassword->fetch_assoc();
                if (!password_verify($password_actual, $usuario['password_hash'])) {
                    throw new Exception("La contraseña actual es incorrecta.");
                }
                
                // Actualizar contraseña
                $newPasswordHash = password_hash($nueva_password, PASSWORD_BCRYPT);
                $sqlUpdatePassword = "UPDATE usuario SET password_hash = ? WHERE id = ?";
                $stmtUpdatePassword = $conn->prepare($sqlUpdatePassword);
                $stmtUpdatePassword->bind_param("ss", $newPasswordHash, $usuario_id);
                
                if (!$stmtUpdatePassword->execute()) {
                    throw new Exception("Error al actualizar contraseña.");
                }
                $stmtUpdatePassword->close();
            }
            $stmtPassword->close();
        }

        // Actualizar datos básicos del usuario
        $sqlUsuario = "UPDATE usuario SET nombre=?, apellido=?, username=?, email=? WHERE id=?";
        $stmtUsuario = $conn->prepare($sqlUsuario);
        $stmtUsuario->bind_param("sssss", $nombre, $apellido, $username, $email, $usuario_id);
        
        if (!$stmtUsuario->execute()) {
            throw new Exception("Error al actualizar usuario: " . $stmtUsuario->error);
        }

        // Actualizar avatar
        if ($avatar_id) {
            $sqlDetalle = "UPDATE detalle_usuario SET avatar_id = ? WHERE usuario_id = ?";
            $stmtDetalle = $conn->prepare($sqlDetalle);
            $stmtDetalle->bind_param("ss", $avatar_id, $usuario_id);
            
            if (!$stmtDetalle->execute()) {
                throw new Exception("Error al actualizar avatar: " . $stmtDetalle->error);
            }
            $stmtDetalle->close();
        }

        // Confirmar transacción
        $conn->commit();
        
        $response['success'] = true;
        $response['message'] = "Perfil actualizado correctamente.";

    } catch (Exception $e) {
        // Revertir transacción en caso de error
        $conn->rollback();
        $response['message'] = $e->getMessage();
    }

    if (isset($stmtUsuario)) $stmtUsuario->close();
    $conn->close();
} else {
    $response['message'] = "Método no permitido.";
}

echo json_encode($response);
?>