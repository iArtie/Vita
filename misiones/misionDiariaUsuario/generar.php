<?php
header('Content-Type: application/json');
include('../../includes/db.php');

$usuario_id = $_GET['usuario_id'] ?? null;
if (!$usuario_id) {
    echo json_encode(['success'=>false,'message'=>'Falta el ID del usuario']);
    exit;
}

$hoy = date('Y-m-d');

// Verificar si el usuario ya tiene misiones para hoy
$stmt = $conn->prepare("SELECT COUNT(*) as total FROM mision_diaria_usuario WHERE usuario_id=? AND fecha=?");
$stmt->bind_param("ss", $usuario_id, $hoy);
$stmt->execute();
$res = $stmt->get_result();
$row = $res->fetch_assoc();

if ($row['total'] >= 5) {
    // Ya tiene misiones, devolverlas
    $stmtMisiones = $conn->prepare("
        SELECT mdu.id AS mdu_id, m.id AS mision_id, m.nombre, m.puntos, m.reglas, m.periodicidad, mdu.estado, mdu.puntos_ganados
        FROM mision_diaria_usuario mdu
        JOIN mision m ON m.id = mdu.mision_id
        WHERE mdu.usuario_id=? AND mdu.fecha=?
    ");
    $stmtMisiones->bind_param("ss", $usuario_id, $hoy);
    $stmtMisiones->execute();
    $resMisiones = $stmtMisiones->get_result();
    $misiones = [];
    while ($row = $resMisiones->fetch_assoc()) $misiones[] = $row;

    echo json_encode(['success'=>true,'misiones'=>$misiones]);
    exit;
}

// Obtener 5 misiones vigentes al azar
$result = $conn->query("SELECT id FROM mision WHERE vigente=1 ORDER BY RAND() LIMIT 5");
$misiones = [];
while($m = $result->fetch_assoc()) $misiones[] = $m;

// Insertar misiones diarias para el usuario
$stmtInsert = $conn->prepare("INSERT INTO mision_diaria_usuario (id, usuario_id, mision_id, fecha, estado, puntos_ganados) VALUES (UUID(), ?, ?, ?, 'pendiente', 0)");
foreach ($misiones as $m) {
    $stmtInsert->bind_param("sss", $usuario_id, $m['id'], $hoy);
    $stmtInsert->execute();
}

// Obtener misiones completas para devolver
$stmtMisiones = $conn->prepare("
    SELECT mdu.id AS mdu_id, m.id AS mision_id, m.nombre, m.puntos, m.reglas, m.periodicidad, mdu.estado, mdu.puntos_ganados
    FROM mision_diaria_usuario mdu
    JOIN mision m ON m.id = mdu.mision_id
    WHERE mdu.usuario_id=? AND mdu.fecha=?
");
$stmtMisiones->bind_param("ss", $usuario_id, $hoy);
$stmtMisiones->execute();
$resMisiones = $stmtMisiones->get_result();
$misionesCompletas = [];
while ($row = $resMisiones->fetch_assoc()) $misionesCompletas[] = $row;

echo json_encode(['success'=>true,'misiones'=>$misionesCompletas]);

$stmt->close();
$stmtInsert->close();
$stmtMisiones->close();
$conn->close();
?>