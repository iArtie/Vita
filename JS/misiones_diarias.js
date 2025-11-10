const usuarioId = "USUARIO_ID_DEL_LOGUEADO"; // <- Cambiar por tu usuario actual o pasar desde sesión
const tablaBody = document.querySelector("#misionesTable tbody");
const generarBtn = document.getElementById("generarMisionesBtn");

// Función para obtener misiones diarias
async function obtenerMisiones() {
    try {
        const res = await fetch(`/misiones/misionDiariaUsuario/obtener.php?usuario_id=${usuarioId}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Error al obtener misiones");

        tablaBody.innerHTML = '';
        data.misiones.forEach(m => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${m.mdu_id}</td>
                <td>${m.nombre}</td>
                <td>${m.puntos}</td>
                <td>${m.reglas}</td>
                <td>${m.periodicidad}</td>
                <td>${m.estado}</td>
                <td>${m.puntos_ganados}</td>
            `;
            tablaBody.appendChild(row);
        });
    } catch (err) {
        alert("Error: " + err.message);
    }
}

// Función para generar/actualizar misiones diarias
async function generarMisiones() {
    try {
        const res = await fetch(`/misiones/misionDiariaUsuario/generar.php?usuario_id=${usuarioId}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Error al generar misiones");

        // Después de generar, obtener y mostrar
        await obtenerMisiones();
    } catch (err) {
        alert("Error: " + err.message);
    }
}

// Inicializar
generarBtn.addEventListener("click", generarMisiones);
window.addEventListener("load", obtenerMisiones);
