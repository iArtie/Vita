<?php
header('Content-Type: application/json');
include('../includes/db.php');

$response = ['success' => false, 'message' => '', 'nueva_racha' => 0, 'nuevos_datos' => null];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usuario_id = trim($_POST['usuario_id'] ?? '');
    $tipo_registro = $_POST['tipo_registro'] ?? ''; // 'comida', 'actividad' o 'mision'

    if (!$usuario_id || !in_array($tipo_registro, ['comida', 'actividad', 'mision'])) {
        $response['message'] = "Datos inválidos.";
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

        $fecha_actual = date('Y-m-d');
        $nueva_racha = 1;

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
            
            // Crear registro en detalle_usuario con racha_date actual
            $id_detalle = uniqid();
            $sqlInsert = "INSERT INTO detalle_usuario (id, usuario_id, avatar_id, racha, level, points, completed_missions, racha_date) 
                         VALUES (?, ?, ?, 1, 1, 0, 0, ?)";
            $stmtInsert = $conn->prepare($sqlInsert);
            $stmtInsert->bind_param("ssss", $id_detalle, $usuario_id, $avatar_id, $fecha_actual);
            
            if (!$stmtInsert->execute()) {
                throw new Exception("Error al crear registro en detalle_usuario: " . $stmtInsert->error);
            }
            
            $stmtInsert->close();
        } else {
            // Si existe, obtener datos actuales
            $detalle = $resultCheck->fetch_assoc();
            $racha_actual = $detalle['racha'] ?? 0;
            $ultima_racha_date = $detalle['racha_date'] ?? null;
            
            // Lógica simplificada para la racha
            if ($ultima_racha_date === $fecha_actual) {
                // Mismo día - mantener racha actual
                $nueva_racha = $racha_actual;
            } else {
                // Verificar si fue consecutivo (diferencia de 1 día)
                if ($ultima_racha_date) {
                    $diferencia_dias = (strtotime($fecha_actual) - strtotime($ultima_racha_date)) / (60 * 60 * 24);
                    
                    if ($diferencia_dias == 1) {
                        // Registro consecutivo - aumentar racha
                        $nueva_racha = $racha_actual + 1;
                    } else {
                        // Más de un día de diferencia - reiniciar racha a 1
                        $nueva_racha = 1;
                    }
                } else {
                    // Primera vez - iniciar racha
                    $nueva_racha = 1;
                }
                
                // Actualizar racha y racha_date en detalle_usuario
                $sqlUpdate = "UPDATE detalle_usuario SET racha = ?, racha_date = ? WHERE usuario_id = ?";
                $stmtUpdate = $conn->prepare($sqlUpdate);
                $stmtUpdate->bind_param("iss", $nueva_racha, $fecha_actual, $usuario_id);
                
                if (!$stmtUpdate->execute()) {
                    throw new Exception("Error al actualizar racha: " . $stmtUpdate->error);
                }
                
                $stmtUpdate->close();
            }
        }

        // Obtener datos actualizados del usuario para enviar al frontend
        $sqlDatosActualizados = "SELECT u.*, du.racha, du.level, du.points, du.completed_missions 
                                FROM usuario u 
                                LEFT JOIN detalle_usuario du ON u.id = du.usuario_id 
                                WHERE u.id = ?";
        $stmtDatos = $conn->prepare($sqlDatosActualizados);
        $stmtDatos->bind_param("s", $usuario_id);
        $stmtDatos->execute();
        $resultDatos = $stmtDatos->get_result();
        
        if ($resultDatos->num_rows === 0) {
            throw new Exception("Error al obtener datos actualizados.");
        }
        
        $usuario_actualizado = $resultDatos->fetch_assoc();
        
        // Preparar respuesta con datos para el frontend
        $datos_frontend = [
            'id' => $usuario_actualizado['id'],
            'username' => $usuario_actualizado['username'],
            'email' => $usuario_actualizado['email'],
            'avatar_id' => $usuario_actualizado['avatar_id'],
            'racha' => $usuario_actualizado['racha'] ?? 0,
            'level' => $usuario_actualizado['level'] ?? 1,
            'points' => $usuario_actualizado['points'] ?? 0,
            'completed_missions' => $usuario_actualizado['completed_missions'] ?? 0
        ];

        // Confirmar transacción
        $conn->commit();
        
        $response['success'] = true;
        $response['message'] = "Racha actualizada correctamente.";
        $response['nueva_racha'] = $nueva_racha;
        $response['nuevos_datos'] = $datos_frontend;

        $stmtCheck->close();
        $stmtDatos->close();

    } catch (Exception $e) {
        // Revertir transacción en caso de error
        $conn->rollback();
        $response['message'] = $e->getMessage();
        error_log("Error en racha_actualizar.php: " . $e->getMessage());
    }

    $conn->close();
} else {
    $response['message'] = "Método no permitido.";
}

echo json_encode($response);
?>