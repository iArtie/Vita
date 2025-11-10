<?php
header('Content-Type: application/json');
include('../includes/db.php');

$response = ['success' => false, 'message' => '', 'data' => []];
$usuario_id = $_GET['usuario_id'] ?? '';

// Verificar si se envió un usuario_id
if (!$usuario_id) {
    $response['message'] = "Usuario requerido";
    echo json_encode($response);
    exit;
}

// Verificar que el usuario exista en la tabla usuario
$checkUser = $conn->prepare("SELECT COUNT(*) AS existe FROM usuario WHERE id = ?");
$checkUser->bind_param("s", $usuario_id);
$checkUser->execute();
$result = $checkUser->get_result()->fetch_assoc();
$checkUser->close();

if ($result['existe'] == 0) {
    $response['message'] = "El usuario no existe en la base de datos.";
    echo json_encode($response);
    exit;
}

// Verificar si ya existen misiones para hoy
$res = $conn->query("SELECT COUNT(*) AS count FROM mision_diaria_usuario WHERE usuario_id='$usuario_id' AND fecha=CURDATE()");
$row = $res->fetch_assoc();

if ($row['count'] == 0) {
    // No hay misiones para hoy → generarlas

    // Eliminar misiones viejas (por seguridad)
    $conn->query("DELETE FROM mision_diaria_usuario WHERE usuario_id='$usuario_id'");

    // Obtener 5 misiones al azar
    $misionesRes = $conn->query("SELECT id FROM mision WHERE vigente=1 ORDER BY RAND() LIMIT 5");
    $stmt = $conn->prepare("INSERT INTO mision_diaria_usuario (id, usuario_id, mision_id, fecha, estado, puntos_ganados) VALUES (?, ?, ?, CURDATE(), 'pendiente', 0)");

    while ($m = $misionesRes->fetch_assoc()) {
        $id = uniqid();
        $stmt->bind_param("sss", $id, $usuario_id, $m['id']);
        $stmt->execute();
    }
    $stmt->close();
}

// Finalmente, devolver todas las misiones diarias actuales
$result = $conn->query("
    SELECT 
        d.id AS id_usuario_mision,
        m.id AS mision_id,
        m.nombre,
        m.puntos,
        m.reglas,
        d.estado
    FROM mision_diaria_usuario d
    JOIN mision m ON m.id = d.mision_id
    WHERE d.usuario_id='$usuario_id' AND d.fecha=CURDATE()
");

while ($row = $result->fetch_assoc()) {
    $response['data'][] = $row;
}

$response['success'] = true;
$response['message'] = "Misiones diarias cargadas correctamente.";
echo json_encode($response);
$conn->close();
?>
