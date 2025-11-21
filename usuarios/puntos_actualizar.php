<?php
header('Content-Type: application/json');
include('../includes/db.php');

$response = ['success' => false, 'message' => '', 'nuevo_level' => 0];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usuario_id = trim($_POST['usuario_id'] ?? '');
    $puntos_ganados = intval($_POST['puntos'] ?? 0);
    $tipo_accion = $_POST['tipo_accion'] ?? '';

    if (empty($usuario_id)) {
        $response['message'] = "ID de usuario requerido.";
        echo json_encode($response);
        exit;
    }

    if ($puntos_ganados <= 0) {
        $response['message'] = "Los puntos deben ser mayores a 0.";
        echo json_encode($response);
        exit;
    }

    // Iniciar transacción
    $conn->begin_transaction();

    try {
        // Verificar si el usuario existe en detalle_usuario
        $sqlCheck = "SELECT * FROM detalle_usuario WHERE usuario_id = ?";
        $stmtCheck = $conn->prepare($sqlCheck);
        $stmtCheck->bind_param("s", $usuario_id);
        $stmtCheck->execute();
        $resultCheck = $stmtCheck->get_result();

        if ($resultCheck->num_rows === 0) {
            // Si no existe, crear registro en detalle_usuario
            $sqlUsuario = "SELECT avatar_id FROM usuario WHERE id = ?";
            $stmtUsuario = $conn->prepare($sqlUsuario);
            $stmtUsuario->bind_param("s", $usuario_id);
            $stmtUsuario->execute();
            $resultUsuario = $stmtUsuario->get_result();
            
            if ($resultUsuario->num_rows === 0) {
                throw new Exception("Usuario no encontrado.");
            }
            
            $usuarioData = $resultUsuario->fetch_assoc();
            $avatar_id = $usuarioData['avatar_id'];
            
            // Crear registro en detalle_usuario con los puntos iniciales
            $id_detalle = uniqid();
            $sqlInsert = "INSERT INTO detalle_usuario (id, usuario_id, avatar_id, racha, level, points, completed_missions, racha_date) 
                         VALUES (?, ?, ?, 0, 1, ?, 0, ?)";
            $stmtInsert = $conn->prepare($sqlInsert);
            $fecha_actual = date('Y-m-d');
            $stmtInsert->bind_param("sssis", $id_detalle, $usuario_id, $avatar_id, $puntos_ganados, $fecha_actual);
            
            if (!$stmtInsert->execute()) {
                throw new Exception("Error al crear registro en detalle_usuario: " . $stmtInsert->error);
            }
            
            $nuevos_puntos = $puntos_ganados;
            $nuevo_level = 1;
            $misiones_completadas = 0;
            
            $stmtInsert->close();
        } else {
            // Si existe, obtener datos actuales
            $detalle = $resultCheck->fetch_assoc();
            $puntos_actuales = $detalle['points'] ?? 0;
            $level_actual = $detalle['level'] ?? 1;
            $misiones_completadas = $detalle['completed_missions'] ?? 0;

            // Calcular nuevos puntos
            $nuevos_puntos = $puntos_actuales + $puntos_ganados;

            // Calcular nuevo nivel (cada 100 puntos sube 1 nivel)
            $nuevo_level = floor($nuevos_puntos / 100) + 1;
            $nuevo_level = max(1, min(100, $nuevo_level));

            // Incrementar misiones completadas si es una misión
            if ($tipo_accion === 'mision') {
                $misiones_completadas += 1;
            }

            // Actualizar detalle_usuario
            $sqlUpdate = "UPDATE detalle_usuario 
                         SET points = ?, level = ?, completed_missions = ? 
                         WHERE usuario_id = ?";
            $stmtUpdate = $conn->prepare($sqlUpdate);
            $stmtUpdate->bind_param("iiis", $nuevos_puntos, $nuevo_level, $misiones_completadas, $usuario_id);
            
            if (!$stmtUpdate->execute()) {
                throw new Exception("Error al actualizar puntos: " . $stmtUpdate->error);
            }
            
            $stmtUpdate->close();
        }

        // Confirmar transacción
        $conn->commit();
        
        $response['success'] = true;
        $response['message'] = "Puntos actualizados correctamente.";
        $response['nuevo_level'] = $nuevo_level;
        $response['puntos_totales'] = $nuevos_puntos;
        $response['misiones_completadas'] = $misiones_completadas;

    } catch (Exception $e) {
        // Revertir transacción en caso de error
        $conn->rollback();
        $response['message'] = $e->getMessage();
        error_log("Error en puntos_actualizar.php: " . $e->getMessage());
    }

    if (isset($stmtCheck)) $stmtCheck->close();
    if (isset($stmtUsuario)) $stmtUsuario->close();
    $conn->close();
} else {
    $response['message'] = "Método no permitido.";
}

echo json_encode($response);
?>