<?php
header('Content-Type: application/json');
include('../includes/db.php');
include('../includes/functions.php');

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'];
    $nombre = trim($_POST['nombre']);
    $apellido = trim($_POST['apellido']);
    $username = trim($_POST['username']);
    $fecha_nacimiento = $_POST['fecha_nacimiento'];
    $genero = $_POST['genero'];
    $altura_cm = $_POST['altura_cm'];
    $peso_kg = $_POST['peso_kg'];
    $email = trim($_POST['email']);

    // Evitar duplicados de username/email en otros usuarios
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

    $edad = calcularEdad($fecha_nacimiento);

    $sql = "UPDATE usuario SET nombre=?, apellido=?, username=?, email=?, genero=?, altura_cm=?, peso_kg=?, fecha_nacimiento=?, edad=? WHERE id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssssddis", $nombre, $apellido, $username, $email, $genero, $altura_cm, $peso_kg, $fecha_nacimiento, $edad, $id);

    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = "Usuario actualizado correctamente.";
    } else {
        $response['message'] = "Error al actualizar: " . $stmt->error;
    }

    $stmt->close();
    $conn->close();
    echo json_encode($response);
} else {
    $response['message'] = "Método no permitido.";
    echo json_encode($response);
}
