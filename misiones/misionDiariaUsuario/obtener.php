<?php
header('Content-Type: application/json');
include('../../includes/db.php');

$usuario_id = $_GET['usuario_id'] ?? null;
if (!$usuario_id) {
    echo json_encode(['success'=>false,'message'=>'Falta el ID del usuario']);
    exit;
}

$hoy = date('Y-m-d');

// Obtener misiones asignadas al usuario para hoy
$stmt = $conn->prepare("
    SELECT mdu.id AS mdu_id, m.id AS mision_id, m.nombre, m.puntos, m.reglas, m.periodicidad, mdu.estado, mdu.puntos_ganados
    FROM mision_diaria_usuario mdu
    JOIN mision m ON m.id = mdu.mision_id
    WHERE mdu.usuario_id=? AND mdu.fecha=?
");
$stmt->bind_param("ss", $usuario_id, $hoy);
$stmt->execute();
$res = $stmt->get_result();

$misiones = [];
while ($row = $res->fetch_assoc()) $misiones[] = $row;

$stmt->close();
$conn->close();

echo json_encode(['success'=>true,'misiones'=>$misiones]);
?>