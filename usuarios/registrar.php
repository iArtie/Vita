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

    $edad = calcularEdad($fecha_nacimiento);
    $id = uniqid();

    
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

 
    $sql = "INSERT INTO usuario (id, nombre, apellido, username, fecha_nacimiento, edad, genero, altura_cm, peso_kg, email, password_hash, rol)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        $response['message'] = "Error en prepare: " . $conn->error;
        echo json_encode($response);
        exit;
    }

    $stmt->bind_param("sssssisddsss", $id, $nombre, $apellido, $username, $fecha_nacimiento, $edad, $genero, $altura_cm, $peso_kg, $email, $password, $rol);

    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = "Usuario registrado correctamente.";
    } else {
        $response['message'] = "Error al registrar usuario: " . $stmt->error;
    }

    $stmt->close();
    $conn->close();

    echo json_encode($response);

} else {
    $response['message'] = "Método no permitido.";
    echo json_encode($response);
}