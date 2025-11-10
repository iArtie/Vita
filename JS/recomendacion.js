const form = document.getElementById('recomendacionForm');
const tableBody = document.querySelector('#recomendacionTable tbody');
const resultado = document.getElementById('resultado');
const formTitulo = document.getElementById('formTitulo');

const usuarioSelect = document.getElementById('usuarioId');
const descripcionInput = document.getElementById('descripcion');
const prioridadSelect = document.getElementById('prioridad');
const estadoSelect = document.getElementById('estado');
const fechaGeneracionInput = document.getElementById('fechaGeneracion');

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
                opt.textContent = u.username;
                usuarioSelect.appendChild(opt);
            });
        })
        .catch(err => console.error("Error al cargar usuarios:", err));
}

// Cargar todas las recomendaciones
function cargarRecomendaciones() {
    fetch('/recomendacion/obtener.php')
        .then(res => res.json())
        .then(data => {
            tableBody.innerHTML = '';
            if (!data.success) return;
            data.data.forEach(r => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${r.id}</td>
                    <td>${r.usuario}</td>
                    <td>${r.descripcion}</td>
                    <td>${r.prioridad}</td>
                    <td>${r.estado}</td>
                    <td>${r.fecha_generacion}</td>
                    <td>
                        <button onclick="editarRecomendacion('${r.id}')">Editar</button>
                        <button onclick="eliminarRecomendacion('${r.id}')">Eliminar</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(err => console.error("Error al cargar recomendaciones:", err));
}

// Guardar / Modificar
form.addEventListener('submit', e => {
    e.preventDefault();

    const datos = {
        id: document.getElementById('recomendacionId').value || null,
        usuario_id: usuarioSelect.value,
        descripcion: descripcionInput.value,
        prioridad: prioridadSelect.value,
        estado: estadoSelect.value,
        fecha_generacion: fechaGeneracionInput.value
    };

    const url = datos.id 
        ? '/recomendacion/modificar.php' 
        : '/recomendacion/registrar.php';

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
            document.getElementById('recomendacionId').value = '';
            formTitulo.textContent = 'Agregar Nueva Recomendación';
            cargarRecomendaciones();
        }
    })
    .catch(err => {
        resultado.textContent = "Error: " + err;
        resultado.style.color = "red";
    });
});

// Editar recomendación
function editarRecomendacion(id) {
    fetch('/recomendacion/obtener.php')
        .then(res => res.json())
        .then(data => {
            if(!data.success) return;
            const r = data.data.find(x => x.id === id);
            if(!r) return;

            document.getElementById('recomendacionId').value = r.id;
            usuarioSelect.value = r.usuario_id ?? '';
            descripcionInput.value = r.descripcion;
            prioridadSelect.value = r.prioridad;
            estadoSelect.value = r.estado;
            fechaGeneracionInput.value = r.fecha_generacion.replace(' ', 'T');
            formTitulo.textContent = 'Editar Recomendación';
        })
        .catch(err => console.error("Error al obtener recomendación para editar:", err));
}

// Eliminar recomendación
function eliminarRecomendacion(id) {
    if(!confirm("¿Seguro que deseas eliminar esta recomendación?")) return;

    fetch(`/recomendacion/eliminar.php?id=${id}`)
        .then(res => res.json())
        .then(data => {
            resultado.textContent = data.success ? "✅ " + data.message : "❌ " + data.message;
            resultado.style.color = data.success ? "green" : "red";
            if (data.success) cargarRecomendaciones();
        })
        .catch(err => {
            resultado.textContent = "Error: " + err;
            resultado.style.color = "red";
        });
}

// Inicializar
cargarUsuarios();
cargarRecomendaciones();