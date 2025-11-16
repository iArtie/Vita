<?php
header('Content-Type: application/json');
include('../includes/db.php');

$response = ['success' => false, 'message' => '', 'nuevo_level' => 0];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usuario_id = trim($_POST['usuario_id'] ?? '');
    $puntos_ganados = intval($_POST['puntos'] ?? 0);
    $tipo_accion = $_POST['tipo_accion'] ?? ''; // 'comida', 'actividad', 'mision'

    if (!$usuario_id || $puntos_ganados <= 0) {
        $response['message'] = "Datos inválidos.";
        echo json_encode($response);
        exit;
    }

    // Iniciar transacción
    $conn->begin_transaction();

    try {
        // Obtener puntos actuales y level
        $sqlSelect = "SELECT points, level, completed_missions FROM detalle_usuario WHERE usuario_id = ?";
        $stmtSelect = $conn->prepare($sqlSelect);
        $stmtSelect->bind_param("s", $usuario_id);
        $stmtSelect->execute();
        $result = $stmtSelect->get_result();

        if ($result->num_rows === 0) {
            throw new Exception("Usuario no encontrado.");
        }

        $detalle = $result->fetch_assoc();
        $puntos_actuales = $detalle['points'];
        $level_actual = $detalle['level'];
        $misiones_completadas = $detalle['completed_missions'];

        // Calcular nuevos puntos
        $nuevos_puntos = $puntos_actuales + $puntos_ganados;

        // Calcular nuevo nivel (cada 100 puntos sube 1 nivel)
        $nuevo_level = floor($nuevos_puntos / 100) + 1;
        
        // Asegurar que el nivel mínimo sea 1 y máximo 100
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
    }

    if (isset($stmtSelect)) $stmtSelect->close();
    if (isset($stmtUpdate)) $stmtUpdate->close();
    $conn->close();
} else {
    $response['message'] = "Método no permitido.";
}

echo json_encode($response);
?>