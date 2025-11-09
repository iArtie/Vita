<?php
header('Content-Type: application/json');
include('../includes/db.php');

$sql = "SELECT id, nombre, apellido, username, fecha_nacimiento, edad, genero, altura_cm, peso_kg, email, rol 
        FROM usuario";

$result = mysqli_query($conn, $sql);

if (!$result) {
    echo json_encode(["error" => "Error en la consulta: " . mysqli_error($conn)]);
    exit;
}

$usuarios = [];
while ($row = mysqli_fetch_assoc($result)) {
    $usuarios[] = $row;
}

echo json_encode($usuarios, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

mysqli_close($conn);
?>
