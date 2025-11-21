document.addEventListener('DOMContentLoaded', () => {
    // Referencias al DOM para misiones
    const misionesForm = document.getElementById('misionesForm');
    const misionesTableBody = document.querySelector('#misionesTable tbody');
    const formTitulo = document.getElementById('formTitulo');
    const resultado = document.getElementById('resultado');

    // Elementos del modal de misiones
    const modalMisiones = document.getElementById('modalMisiones');
    const btnCancelarMision = document.getElementById('btnCancelarMision');
    const modalCloseMisiones = document.querySelector('.modal-close-misiones');

    // Funciones del modal de misiones
    function mostrarModalMisiones() {
        modalMisiones.style.display = 'flex';
    }

    function ocultarModalMisiones() {
        modalMisiones.style.display = 'none';
        misionesForm.reset();
        document.getElementById('misionesId').value = '';
        formTitulo.textContent = 'Agregar Nueva Misión';
    }

    // Event listeners del modal de misiones
    btnCancelarMision.addEventListener('click', ocultarModalMisiones);
    modalCloseMisiones.addEventListener('click', ocultarModalMisiones);

    // Cerrar modal al hacer click fuera del contenido
    modalMisiones.addEventListener('click', function (e) {
        if (e.target === modalMisiones) {
            ocultarModalMisiones();
        }
    });

    // Cargar todas las misiones (listar)
    function cargarMisiones() {
        fetch('/misiones/obtener.php')
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
                            <button class="editarBtnMision" data-id="${m.id}">Editar</button>
                            <button class="eliminarBtnMision" data-id="${m.id}">Eliminar</button>
                        </td>
                    `;
                    misionesTableBody.appendChild(row);
                });

                // Actualizar total de misiones
                document.getElementById('totalMisiones').textContent = data.data.length;

                // Botones de editar misiones
                document.querySelectorAll('.editarBtnMision').forEach(btn => {
                    btn.addEventListener('click', () => {
                        editarMision(btn.dataset.id);
                    });
                });

                // Botones de eliminar misiones
                document.querySelectorAll('.eliminarBtnMision').forEach(btn => {
                    btn.addEventListener('click', () => {
                        eliminarMision(btn.dataset.id);
                    });
                });
            })
            .catch(err => {
                resultado.textContent = "Error al cargar misiones: " + err;
                resultado.style.color = "red";
            });
    }

    // Crear o actualizar misión
    if (misionesForm) {
        misionesForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(misionesForm);
            const id = formData.get('id');

            const url = id ? '/misiones/modificar.php' : '/misiones/registrar.php';

            fetch(url, {
                method: 'POST',
                body: formData
            })
                .then(res => res.json())
                .then(data => {
                    resultado.textContent = data.success ? "✅ " + data.message : "❌ " + data.message;
                    resultado.style.color = data.success ? "green" : "red";
                    if (data.success) {
                        ocultarModalMisiones();
                        cargarMisiones();
                    }
                })
                .catch(err => {
                    resultado.textContent = "Error: " + err;
                    resultado.style.color = "red";
                });
        });
    }

    // Rellenar formulario para editar misión
    function editarMision(id) {
        fetch('/misiones/obtener.php')
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
                mostrarModalMisiones();
            })
            .catch(err => {
                resultado.textContent = "Error al cargar misión: " + err;
                resultado.style.color = "red";
            });
    }

    // Eliminar misión
    function eliminarMision(id) {
        if (!confirm("¿Seguro que deseas eliminar esta misión?")) return;
        fetch('/misiones/eliminar.php', {
            method: 'POST',
            body: new URLSearchParams({ id })
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

    // Botón para agregar nueva misión
    const btnAgregarMision = document.getElementById('btnAgregarMision');
    if (btnAgregarMision) {
        btnAgregarMision.addEventListener('click', () => {
            misionesForm.reset();
            document.getElementById('misionesId').value = '';
            formTitulo.textContent = 'Agregar Nueva Misión';
            mostrarModalMisiones();
        });
    }

    // Inicializar
    cargarMisiones();
});