<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include('../includes/db.php');
include('../includes/functions.php');

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre = trim($_POST['nombre']);
    $apellido = trim($_POST['apellido']);
    $username = trim($_POST['username']);
    $fecha_nacimiento = $_POST['fecha_nacimiento'];
    $genero = $_POST['genero'];
    $altura_cm = $_POST['altura_cm'];
    $peso_kg = $_POST['peso_kg'];
    $email = trim($_POST['email']);
    $password = password_hash($_POST['password'], PASSWORD_BCRYPT);
    $rol = 'cliente';
    $avatar_id = $_POST['avatar_id'] ?? 'male_avatar_01'; // Valor por defecto

    $edad = calcularEdad($fecha_nacimiento);
    $usuario_id = uniqid();
    $detalle_id = uniqid();

    // Verificar duplicados
    $checkSql = "SELECT * FROM usuario WHERE username = ? OR email = ?";
    $stmtCheck = $conn->prepare($checkSql);
    $stmtCheck->bind_param("ss", $username, $email);
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
        // Insertar usuario
        $sqlUsuario = "INSERT INTO usuario (id, nombre, apellido, username, fecha_nacimiento, edad, genero, altura_cm, peso_kg, email, password_hash, rol)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmtUsuario = $conn->prepare($sqlUsuario);
        $stmtUsuario->bind_param("sssssisddsss", $usuario_id, $nombre, $apellido, $username, $fecha_nacimiento, $edad, $genero, $altura_cm, $peso_kg, $email, $password, $rol);
        
        if (!$stmtUsuario->execute()) {
            throw new Exception("Error al registrar usuario: " . $stmtUsuario->error);
        }

        // Insertar detalle_usuario con avatar_id como VARCHAR
        $sqlDetalle = "INSERT INTO detalle_usuario (id, usuario_id, avatar_id, racha, level, points, completed_missions)
                      VALUES (?, ?, ?, 0, 1, 0, 0)";
        $stmtDetalle = $conn->prepare($sqlDetalle);
        $stmtDetalle->bind_param("sss", $detalle_id, $usuario_id, $avatar_id);
        
        if (!$stmtDetalle->execute()) {
            throw new Exception("Error al crear detalle de usuario: " . $stmtDetalle->error);
        }

        // Confirmar transacción
        $conn->commit();
        
        $response['success'] = true;
        $response['message'] = "Usuario registrado correctamente.";
        $response['usuario_id'] = $usuario_id;

    } catch (Exception $e) {
        // Revertir transacción en caso de error
        $conn->rollback();
        $response['message'] = $e->getMessage();
    }

    $stmtUsuario->close();
    if (isset($stmtDetalle)) $stmtDetalle->close();
    $conn->close();

} else {
    $response['message'] = "Método no permitido.";
}

echo json_encode($response);
?>