<?php
$host = "sql111.infinityfree.com";
$user = "if0_40370164";
$pass = "eMS4z3pAWGoMdgE";
$dbname = "if0_40370164_vitadb";

$conn = mysqli_connect($host, $user, $pass, $dbname);

if (!$conn) {
    die("Error al conectar: " . mysqli_connect_error());
}
?>
