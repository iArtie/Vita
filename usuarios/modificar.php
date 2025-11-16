<?php
header('Content-Type: application/json');
include('../includes/db.php');
include('../includes/functions.php');

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = "Método no permitido.";
    echo json_encode($response);
    exit;
}

// Recibir datos
$id = trim($_POST['id'] ?? '');
$nombre = trim($_POST['nombre'] ?? '');
$apellido = trim($_POST['apellido'] ?? '');
$username = trim($_POST['username'] ?? '');
$email = trim($_POST['email'] ?? '');
$genero = trim($_POST['genero'] ?? '');
$altura_cm = $_POST['altura_cm'] ?? '';
$peso_kg = $_POST['peso_kg'] ?? '';
$avatar_id = $_POST['avatar_id'] ?? '';

// Validar campos obligatorios
if (!$id || !$nombre || !$apellido || !$username || !$email || !$genero || $altura_cm === '' || $peso_kg === '') {
    $response['message'] = "Todos los campos son obligatorios.";
    echo json_encode($response);
    exit;
}

// Evitar duplicados de username/email
$checkSql = "SELECT * FROM usuario WHERE (username = ? OR email = ?) AND id != ?";
$stmtCheck = $conn->prepare($checkSql);
$stmtCheck->bind_param("sss", $username, $email, $id);
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
    // Actualizar usuario
    $sqlUsuario = "UPDATE usuario SET nombre=?, apellido=?, username=?, email=?, genero=?, altura_cm=?, peso_kg=? WHERE id=?";
    $stmtUsuario = $conn->prepare($sqlUsuario);
    $stmtUsuario->bind_param("sssssdsi", $nombre, $apellido, $username, $email, $genero, $altura_cm, $peso_kg, $id);
    
    if (!$stmtUsuario->execute()) {
        throw new Exception("Error al actualizar usuario: " . $stmtUsuario->error);
    }

    // Actualizar avatar en detalle_usuario si se proporcionó
    if ($avatar_id) {
        $sqlDetalle = "UPDATE detalle_usuario SET avatar_id = ? WHERE usuario_id = ?";
        $stmtDetalle = $conn->prepare($sqlDetalle);
        $stmtDetalle->bind_param("is", $avatar_id, $id);
        
        if (!$stmtDetalle->execute()) {
            throw new Exception("Error al actualizar avatar: " . $stmtDetalle->error);
        }
        $stmtDetalle->close();
    }

    // Confirmar transacción
    $conn->commit();
    
    $response['success'] = true;
    $response['message'] = "Usuario actualizado correctamente.";

} catch (Exception $e) {
    // Revertir transacción en caso de error
    $conn->rollback();
    $response['message'] = $e->getMessage();
}

$stmtUsuario->close();
$conn->close();
echo json_encode($response);
?>