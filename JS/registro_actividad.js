const form = document.getElementById('registroActividadForm');
const tableBody = document.querySelector('#registroActividadTable tbody');
const resultado = document.getElementById('resultado');
const formTitulo = document.getElementById('formTitulo');

const usuarioSelect = document.getElementById('usuarioId');
const actividadSelect = document.getElementById('actividadTipoId');

// Cargar usuarios
function cargarUsuarios() {
    fetch('/usuarios/obtener.php')
        .then(res => res.json())
        .then(data => {
            usuarioSelect.innerHTML = '';
            if (!Array.isArray(data)) return;
            data.forEach(u => {
                const opt = document.createElement('option');
                opt.value = u.id;
                opt.textContent = `${u.username}`;
                usuarioSelect.appendChild(opt);
            });
        })
        .catch(err => console.error("Error al cargar usuarios:", err));
}

// Cargar tipos de actividad
function cargarTiposActividad() {
    fetch('/actividad/actividad_tipo/obtener.php')
        .then(res => res.json())
        .then(data => {
            actividadSelect.innerHTML = '';
            if (!data.success) return;
            data.data.forEach(a => {
                const opt = document.createElement('option');
                opt.value = a.id;
                opt.textContent = a.nombre;
                actividadSelect.appendChild(opt);
            });
        });
}

// Listar registros
function cargarRegistros() {
    fetch('/actividad/registro_actividad_obtener.php')
        .then(res => res.json())
        .then(data => {
            tableBody.innerHTML = '';
            if (!data.success) return;
            data.data.forEach(r => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${r.id}</td>
                    <td>${r.usuario}</td>
                    <td>${r.actividad}</td>
                    <td>${r.fecha_hora}</td>
                    <td>${r.duracion_min}</td>
                    <td>${r.kcal_quemadas}</td>
                    <td>
                        <button onclick="editarRegistro('${r.id}')">Editar</button>
                        <button onclick="eliminarRegistro('${r.id}')">Eliminar</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(err => console.error("Error al cargar registros:", err));
}

// Registrar / Actualizar
form.addEventListener('submit', e => {
    e.preventDefault();
    const datos = {
        id: document.getElementById('registroId').value,
        usuario_id: usuarioSelect.value,
        actividad_tipo_id: actividadSelect.value,
        fecha_hora: document.getElementById('fechaHora').value,
        duracion_min: document.getElementById('duracionMin').value,
        kcal_quemadas: document.getElementById('kcalQuemadas').value
    };
    const url = datos.id ? '/actividad/registro_actividad_modificar.php' : '/actividad/registro_actividad_registrar.php';
    fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(datos)
    })
    .then(res => res.json())
    .then(data => {
        resultado.textContent = data.success ? "✅ " + data.message : "❌ " + data.message;
        resultado.style.color = data.success ? "green" : "red";
        if (data.success) {
            form.reset();
            document.getElementById('registroId').value = '';
            formTitulo.textContent = 'Agregar Nueva Actividad';
            cargarRegistros();
        }
    })
    .catch(err => {
        resultado.textContent = "Error: " + err;
        resultado.style.color = "red";
    });
});

// Editar
function editarRegistro(id) {
    fetch('/actividad/registro_actividad_obtener.php')
        .then(res => res.json())
        .then(data => {
            if (!data.success) return;
            const r = data.data.find(x => x.id === id);
            if (!r) return;

            document.getElementById('registroId').value = r.id;
            usuarioSelect.value = r.usuario_id;
            actividadSelect.value = r.actividad_tipo_id;
            document.getElementById('fechaHora').value = r.fecha_hora.replace(' ', 'T');
            document.getElementById('duracionMin').value = r.duracion_min;
            document.getElementById('kcalQuemadas').value = r.kcal_quemadas;
            formTitulo.textContent = 'Editar Registro de Actividad';
        })
        .catch(err => console.error("Error al obtener registro para editar:", err));
}

// Eliminar
function eliminarRegistro(id) {
    if (!confirm("¿Seguro que deseas eliminar este registro?")) return;
    fetch(`/actividad/registro_actividad_eliminar.php?id=${id}`)
        .then(res => res.json())
        .then(data => {
            resultado.textContent = data.success ? "✅ " + data.message : "❌ " + data.message;
            resultado.style.color = data.success ? "green" : "red";
            if (data.success) cargarRegistros();
        })
        .catch(err => {
            resultado.textContent = "Error: " + err;
            resultado.style.color = "red";
        });
}

// Inicializar
cargarUsuarios();
cargarTiposActividad();
cargarRegistros();
