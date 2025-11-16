<?php
header('Content-Type: application/json');
include('../includes/db.php');

$response = ['success' => false, 'message' => '', 'nueva_racha' => 0];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usuario_id = trim($_POST['usuario_id'] ?? '');
    $tipo_registro = $_POST['tipo_registro'] ?? ''; // 'comida' o 'actividad'

    if (!$usuario_id || !in_array($tipo_registro, ['comida', 'actividad'])) {
        $response['message'] = "Datos inválidos.";
        echo json_encode($response);
        exit;
    }

    try {
        // Obtener racha actual y última fecha de registro
        $sqlSelect = "SELECT racha FROM detalle_usuario WHERE usuario_id = ?";
        $stmtSelect = $conn->prepare($sqlSelect);
        $stmtSelect->bind_param("s", $usuario_id);
        $stmtSelect->execute();
        $result = $stmtSelect->get_result();

        if ($result->num_rows === 0) {
            throw new Exception("Usuario no encontrado.");
        }

        $detalle = $result->fetch_assoc();
        $racha_actual = $detalle['racha'];
        
        // Obtener última fecha de registro según el tipo
        if ($tipo_registro === 'comida') {
            $sqlUltimaFecha = "SELECT MAX(fecha_hora) as ultima_fecha 
                              FROM registro_comida 
                              WHERE usuario_id = ?";
        } else {
            $sqlUltimaFecha = "SELECT MAX(fecha_hora) as ultima_fecha 
                              FROM registro_actividad 
                              WHERE usuario_id = ?";
        }
        
        $stmtFecha = $conn->prepare($sqlUltimaFecha);
        $stmtFecha->bind_param("s", $usuario_id);
        $stmtFecha->execute();
        $resultFecha = $stmtFecha->get_result();
        $fechaData = $resultFecha->fetch_assoc();
        
        $fecha_actual = date('Y-m-d');
        $nueva_racha = $racha_actual;

        if ($fechaData['ultima_fecha']) {
            $ultima_fecha = date('Y-m-d', strtotime($fechaData['ultima_fecha']));
            $diferencia_dias = (strtotime($fecha_actual) - strtotime($ultima_fecha)) / (60 * 60 * 24);
            
            if ($diferencia_dias == 1) {
                // Registro consecutivo - aumentar racha
                $nueva_racha = $racha_actual + 1;
            } elseif ($diferencia_dias > 1) {
                // Más de un día de diferencia - reiniciar racha
                $nueva_racha = 1;
            }
            // Si diferencia_dias == 0, es el mismo día, mantener racha
        } else {
            // Primer registro - iniciar racha
            $nueva_racha = 1;
        }

        // Actualizar racha
        $sqlUpdate = "UPDATE detalle_usuario SET racha = ? WHERE usuario_id = ?";
        $stmtUpdate = $conn->prepare($sqlUpdate);
        $stmtUpdate->bind_param("is", $nueva_racha, $usuario_id);
        
        if (!$stmtUpdate->execute()) {
            throw new Exception("Error al actualizar racha: " . $stmtUpdate->error);
        }

        $response['success'] = true;
        $response['message'] = "Racha actualizada correctamente.";
        $response['nueva_racha'] = $nueva_racha;

        $stmtSelect->close();
        $stmtFecha->close();
        $stmtUpdate->close();

    } catch (Exception $e) {
        $response['message'] = $e->getMessage();
    }

    $conn->close();
} else {
    $response['message'] = "Método no permitido.";
}

echo json_encode($response);
?>