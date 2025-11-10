// Referencias al DOM
const misionesTableBody = document.querySelector('#misionesTable tbody');
const resultado = document.getElementById('resultado');
const timerSpan = document.getElementById('timer');

// Usuario actual (cambiar según tu sesión o ID de prueba)
const usuario_id = '6911498b0c8dc'; // reemplazar con el ID real del usuario

let tiempoRestante = 24 * 60 * 60; // 24 horas en segundos

// Función para cargar las misiones diarias
function cargarMisiones() {
    fetch(`misiones/diaria_usuario.php?usuario_id=${usuario_id}`)
        .then(res => res.json())
        .then(data => {
            misionesTableBody.innerHTML = '';
            if (!data.success) {
                resultado.textContent = "❌ " + data.message;
                resultado.style.color = "red";
                return;
            }

            data.data.forEach(m => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${m.nombre}</td>
                    <td>${m.puntos}</td>
                    <td>${m.reglas}</td>
                    <td>${m.estado}</td>
                    <td>
                        ${m.estado === 'pendiente' ? `<button onclick="completarMision('${m.id}', ${m.puntos})">Completar</button>` : ''}
                    </td>
                `;
                misionesTableBody.appendChild(row);
            });
        })
        .catch(err => {
            resultado.textContent = "Error al cargar misiones: " + err;
            resultado.style.color = "red";
        });
}

// Función para completar una misión
function completarMision(id, puntos) {
    fetch('misiones/completar.php', {
        method: 'POST',
        body: new URLSearchParams({ id, puntos_ganados: puntos })
    })
    .then(res => res.json())
    .then(data => {
        resultado.textContent = data.success ? "✅ " + data.message : "❌ " + data.message;
        resultado.style.color = data.success ? "green" : "red";
        cargarMisiones();
    })
    .catch(err => {
        resultado.textContent = "Error: " + err;
        resultado.style.color = "red";
    });
}

// Función para generar nuevas misiones diarias
function generarMisionesDiarias() {
    fetch(`misiones/diaria_usuario.php?usuario_id=${usuario_id}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                tiempoRestante = 24 * 60 * 60; // Reinicia el contador
                cargarMisiones();
            }
        });
}

// Función para actualizar el timer cada segundo
function actualizarTimer() {
    const horas = Math.floor(tiempoRestante / 3600);
    const minutos = Math.floor((tiempoRestante % 3600) / 60);
    const segundos = tiempoRestante % 60;

    timerSpan.textContent = `${horas.toString().padStart(2,'0')}h : ${minutos.toString().padStart(2,'0')}m : ${segundos.toString().padStart(2,'0')}s`;

    if (tiempoRestante > 0) {
        tiempoRestante--;
    } else {
        generarMisionesDiarias();
    }
}

// Inicializar
cargarMisiones();
setInterval(actualizarTimer, 1000);
