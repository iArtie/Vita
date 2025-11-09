<?php
function calcularEdad($fecha_nacimiento) {
    $nacimiento = new DateTime($fecha_nacimiento);
    $hoy = new DateTime();
    $edad = $hoy->diff($nacimiento)->y;
    return $edad;
}
?>
