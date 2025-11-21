// alimentos_admin.js
document.addEventListener('DOMContentLoaded', () => {
    // Referencias al DOM para alimentos
    const alimentosForm = document.getElementById('alimentosForm');
    const alimentosTableBody = document.querySelector('#alimentosTable tbody');
    const formTituloAlimento = document.getElementById('formTituloAlimento');
    const resultado = document.getElementById('resultado');

    // Elementos del modal de alimentos
    const modalAlimentos = document.getElementById('modalAlimentos');
    const btnCancelarAlimento = document.getElementById('btnCancelarAlimento');
    const modalCloseAlimentos = document.querySelector('.modal-close-alimentos');

    // Funciones del modal de alimentos
    function mostrarModalAlimentos() {
        modalAlimentos.style.display = 'flex';
    }

    function ocultarModalAlimentos() {
        modalAlimentos.style.display = 'none';
        alimentosForm.Freset();
        document.getElementById('alimentosId').value = '';
        formTituloAlimento.textContent = 'Agregar Nuevo Alimento';
    }

    // Event listeners del modal de alimentos
    btnCancelarAlimento.addEventListener('click', ocultarModalAlimentos);
    modalCloseAlimentos.addEventListener('click', ocultarModalAlimentos);

    // Cerrar modal al hacer click fuera del contenido
    modalAlimentos.addEventListener('click', function (e) {
        if (e.target === modalAlimentos) {
            ocultarModalAlimentos();
        }
    });

    // Cargar todos los alimentos (listar)
    function cargarAlimentos() {
        fetch('/Alimentos/obtener.php')
            .then(res => res.json())
            .then(data => {
                alimentosTableBody.innerHTML = '';
                if (!data.success) {
                    resultado.textContent = "❌ " + data.message;
                    resultado.style.color = "red";
                    return;
                }
                data.data.forEach(a => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${a.id}</td>
                        <td>${a.nombre}</td>
                        <td>${Number(a.kcal_kg).toFixed(2)}</td>
                        <td>${Number(a.prot_kg).toFixed(2)}</td>
                        <td>${Number(a.gras_kg).toFixed(2)}</td>
                        <td>${Number(a.carb_kg).toFixed(2)}</td>
                        <td>
                            <button class="editarBtnAlimento" data-id="${a.id}">Editar</button>
                            <button class="eliminarBtnAlimento" data-id="${a.id}">Eliminar</button>
                        </td>
                    `;
                    alimentosTableBody.appendChild(row);
                });

                // Actualizar total de alimentos
                document.getElementById('totalAlimentos').textContent = data.data.length;

                // Botones de editar alimentos
                document.querySelectorAll('.editarBtnAlimento').forEach(btn => {
                    btn.addEventListener('click', () => {
                        editarAlimento(btn.dataset.id);
                    });
                });

                // Botones de eliminar alimentos
                document.querySelectorAll('.eliminarBtnAlimento').forEach(btn => {
                    btn.addEventListener('click', () => {
                        eliminarAlimento(btn.dataset.id);
                    });
                });
            })
            .catch(err => {
                resultado.textContent = "Error al cargar alimentos: " + err;
                resultado.style.color = "red";
            });
    }

    // Crear o actualizar alimento
    if (alimentosForm) {
        alimentosForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(alimentosForm);
            const id = formData.get('id');

            const url = id ? '/Alimentos/modificar.php' : '/Alimentos/registrar.php';

            fetch(url, {
                method: 'POST',
                body: formData
            })
                .then(res => res.json())
                .then(data => {
                    resultado.textContent = data.success ? "✅ " + data.message : "❌ " + data.message;
                    resultado.style.color = data.success ? "green" : "red";
                    if (data.success) {
                        ocultarModalAlimentos();
                        cargarAlimentos();
                    }
                })
                .catch(err => {
                    resultado.textContent = "Error: " + err;
                    resultado.style.color = "red";
                });
        });
    }

    // Rellenar formulario para editar alimento
    function editarAlimento(id) {
        fetch('/Alimentos/obtener.php')
            .then(res => res.json())
            .then(data => {
                if (!data.success) return;
                const a = data.data.find(x => x.id === id);
                if (!a) return;
                document.getElementById('alimentosId').value = a.id;
                document.getElementById('alimentosNombre').value = a.nombre;
                document.getElementById('alimentosKcal').value = a.kcal_kg;
                document.getElementById('alimentosProt').value = a.prot_kg;
                document.getElementById('alimentosGras').value = a.gras_kg;
                document.getElementById('alimentosCarb').value = a.carb_kg;
                formTituloAlimento.textContent = 'Editar Alimento';
                mostrarModalAlimentos();
            })
            .catch(err => {
                resultado.textContent = "Error al cargar alimento: " + err;
                resultado.style.color = "red";
            });
    }

    // Eliminar alimento
    function eliminarAlimento(id) {
        if (!confirm("¿Seguro que deseas eliminar este alimento?")) return;
        fetch('/Alimentos/eliminar.php', {
            method: 'POST',
            body: new URLSearchParams({ id })
        })
            .then(res => res.json())
            .then(data => {
                resultado.textContent = data.success ? "✅ " + data.message : "❌ " + data.message;
                resultado.style.color = data.success ? "green" : "red";
                if (data.success) cargarAlimentos();
            })
            .catch(err => {
                resultado.textContent = "Error: " + err;
                resultado.style.color = "red";
            });
    }

    // Botón para agregar nuevo alimento
    const btnAgregarAlimento = document.getElementById('btnAgregarAlimento');
    if (btnAgregarAlimento) {
        btnAgregarAlimento.addEventListener('click', () => {
            alimentosForm.reset();
            document.getElementById('alimentosId').value = '';
            formTituloAlimento.textContent = 'Agregar Nuevo Alimento';
            mostrarModalAlimentos();
        });
    }

    // Inicializar
    cargarAlimentos();
});