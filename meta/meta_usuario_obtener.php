<?php
header('Content-Type: application/json');
include('../includes/db.php');

$response = ['success' => false, 'data' => [], 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $usuario_id = $_GET['usuario_id'] ?? '';
    
    if (!$usuario_id) {
        $response['message'] = "ID de usuario requerido.";
        echo json_encode($response);
        exit;
    }

    try {
        $sql = "SELECT * FROM meta WHERE usuario_id = ? ORDER BY estado, tipo";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $usuario_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $metas = [];
        while ($row = $result->fetch_assoc()) {
            $metas[] = $row;
        }

        $response['success'] = true;
        $response['data'] = $metas;
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