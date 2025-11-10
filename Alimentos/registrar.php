<?php
header('Content-Type: application/json');
require_once '../../conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usuario_id = $_POST['usuario_id'] ?? null;
    $nombre = $_POST['nombre'] ?? null;
    $kcal_kg = $_POST['kcal_kg'] ?? null;
    $prot_kg = $_POST['prot_kg'] ?? null;
    $gras_kg = $_POST['gras_kg'] ?? null;
    $carb_kg = $_POST['carb_kg'] ?? null;

    if (!$usuario_id || !$nombre) {
        echo json_encode(['success' => false, 'message' => 'Faltan datos obligatorios']);
        exit;
    }

    // Generar un UUID (simplificado) si no lo genera la DB
    $id = uniqid();
    $creado_el = date('Y-m-d H:i:s'); // <- Aquí se guarda la fecha actual

    $query = "INSERT INTO alimento_personalizado 
                (id, usuario_id, nombre, kcal_kg, prot_kg, gras_kg, carb_kg, creado_el)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($query);
    if ($stmt) {
        $stmt->bind_param(
            "ssssdddd",
            $id,
            $usuario_id,
            $nombre,
            $kcal_kg,
            $prot_kg,
            $gras_kg,
            $carb_kg,
            $creado_el
        );

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Alimento registrado correctamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al registrar el alimento: ' . $stmt->error]);
        }
        $stmt->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al preparar la consulta: ' . $conn->error]);
    }

    $conn->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}
?>