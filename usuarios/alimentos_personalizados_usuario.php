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
        $sql = "SELECT * FROM alimento_personalizado WHERE usuario_id = ? ORDER BY creado_el DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $usuario_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $alimentos = [];
        while ($row = $result->fetch_assoc()) {
            $alimentos[] = $row;
        }

        $response['success'] = true;
        $response['data'] = $alimentos;
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