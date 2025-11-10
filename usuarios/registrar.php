<?php
include('../includes/db.php');
include('../includes/functions.php');

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

    // Insertar usuario
    $sql = "INSERT INTO usuario (id, nombre, apellido, username, fecha_nacimiento, edad, genero, altura_cm, peso_kg, email, password_hash, rol)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssssissdsss", $id, $nombre, $apellido, $username, $fecha_nacimiento, $edad, $genero, $altura_cm, $peso_kg, $email, $password, $rol);

    if ($stmt->execute()) {
        echo "Usuario registrado correctamente.";
    } else {
        echo "Error al registrar el usuario: " . $stmt->error;
    }

    $stmt->close();
    $conn->close();
} else {
    echo "Método no permitido.";
}
?>
