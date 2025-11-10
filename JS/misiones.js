// Referencias al DOM
const misionesForm = document.getElementById('misionesForm');
const misionesTableBody = document.querySelector('#misionesTable tbody');
const resultado = document.getElementById('resultado');
const formTitulo = document.getElementById('formTitulo');

// Cargar todas las misiones (listar)
function cargarMisiones() {
    fetch('misiones/obtener.php')
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
                    <td>${m.id}</td>
                    <td>${m.nombre}</td>
                    <td>${m.periodicidad}</td>
                    <td>${m.puntos}</td>
                    <td>${m.reglas}</td>
                    <td>${m.vigente == 1 ? 'Sí' : 'No'}</td>
                    <td>
                        <button onclick="editarMision('${m.id}')">Editar</button>
                        <button onclick="eliminarMision('${m.id}')">Eliminar</button>
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

// Crear o actualizar misión
misionesForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(misionesForm);
    const id = formData.get('id');

    const url = id ? 'misiones/modificar.php' : 'misiones/registrar.php';

    fetch(url, {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        resultado.textContent = data.success ? "✅ " + data.message : "❌ " + data.message;
        resultado.style.color = data.success ? "green" : "red";
        if (data.success) {
            misionesForm.reset();
            document.getElementById('misionesId').value = '';
            formTitulo.textContent = 'Agregar Nueva Misión';
            cargarMisiones();
        }
    })
    .catch(err => {
        resultado.textContent = "Error: " + err;
        resultado.style.color = "red";
    });
});

// Rellenar formulario para editar misión
function editarMision(id) {
    fetch('misiones/obtener.php')
        .then(res => res.json())
        .then(data => {
            if (!data.success) return;
            const m = data.data.find(x => x.id === id);
            if (!m) return;
            document.getElementById('misionesId').value = m.id;
            document.getElementById('misionesNombre').value = m.nombre;
            document.getElementById('misionesPeriodicidad').value = m.periodicidad;
            document.getElementById('misionesPuntos').value = m.puntos;
            document.getElementById('misionesReglas').value = m.reglas;
            document.getElementById('misionesVigente').value = m.vigente;
            formTitulo.textContent = 'Editar Misión';
        })
        .catch(err => {
            resultado.textContent = "Error al cargar misión: " + err;
            resultado.style.color = "red";
        });
}

// Eliminar misión
function eliminarMision(id) {
    if (!confirm("¿Seguro que deseas eliminar esta misión?")) return;
    fetch('misiones/eliminar.php', {
        method: 'POST',
        body: new URLSearchParams({id})
    })
    .then(res => res.json())
    .then(data => {
        resultado.textContent = data.success ? "✅ " + data.message : "❌ " + data.message;
        resultado.style.color = data.success ? "green" : "red";
        if (data.success) cargarMisiones();
    })
    .catch(err => {
        resultado.textContent = "Error: " + err;
        resultado.style.color = "red";
    });
}

// Cargar misiones al inicio
cargarMisiones();