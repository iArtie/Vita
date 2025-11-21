document.addEventListener('DOMContentLoaded', () => {

    const formEditar = document.getElementById('editarForm');
    const resultado = document.getElementById('resultado');
    const tablaUsuarios = document.querySelector('#usuariosTable tbody');

    // Elementos de navegación del admin
    const menuLinks = document.querySelectorAll('.menu-link');
    const sections = document.querySelectorAll('.section');
    const menuItems = document.querySelectorAll('.menu-item');

    // Elementos del modal
    const modalEditarUsuario = document.getElementById('modalEditarUsuario');
    const btnCancelarEdicion = document.getElementById('btnCancelarEdicion');
    const modalClose = document.querySelector('.modal-close');

    // Navegación entre secciones
    menuLinks.forEach(link => {
        link.addEventListener('click', function () {
            const sectionId = this.getAttribute('data-section');

            // Remover active de todos los items del menú y secciones
            menuItems.forEach(item => item.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));

            // Activar el item del menú y sección correspondiente
            this.parentElement.classList.add('active');
            document.getElementById(`section-${sectionId}`).classList.add('active');
        });
    });

    // Funciones del modal
    function mostrarModal() {
        modalEditarUsuario.style.display = 'flex';
    }

    function ocultarModal() {
        modalEditarUsuario.style.display = 'none';
    }

    // Event listeners del modal
    btnCancelarEdicion.addEventListener('click', ocultarModal);
    modalClose.addEventListener('click', ocultarModal);

    // Cerrar modal al hacer click fuera del contenido
    modalEditarUsuario.addEventListener('click', function (e) {
        if (e.target === modalEditarUsuario) {
            ocultarModal();
        }
    });

    // Función para cargar usuarios
    function cargarUsuarios() {
        fetch('/usuarios/obtener.php')
            .then(res => res.json())
            .then(data => {
                tablaUsuarios.innerHTML = '';
                data.forEach(usuario => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                    <td>${usuario.id}</td>
                    <td>${usuario.nombre}</td>
                    <td>${usuario.apellido}</td>
                    <td>${usuario.username}</td>
                    <td>${usuario.email}</td>
                    <td>${usuario.genero || ''}</td>
                    <td>${usuario.altura_cm || ''}</td>
                    <td>${usuario.peso_kg || ''}</td>
                    <td>${usuario.fecha_nacimiento || ''}</td>
                    <td>${usuario.edad || ''}</td>
                    <td>${usuario.rol || ''}</td>
                    <td>
                        <button data-id="${usuario.id}" class="editarBtn">Editar</button>
                        <button data-id="${usuario.id}" class="eliminarBtn">Eliminar</button>
                    </td>
                `;
                    tablaUsuarios.appendChild(tr);
                });

                // Actualizar total de usuarios
                document.getElementById('totalUsuarios').textContent = data.length;

                // Botones de editar
                document.querySelectorAll('.editarBtn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const usuario = data.find(u => u.id === btn.dataset.id);
                        if (usuario) {
                            document.getElementById('editId').value = usuario.id;
                            document.getElementById('editNombre').value = usuario.nombre;
                            document.getElementById('editApellido').value = usuario.apellido;
                            document.getElementById('editUsername').value = usuario.username;
                            document.getElementById('editEmail').value = usuario.email;
                            document.getElementById('editGenero').value = usuario.genero;
                            document.getElementById('editAltura').value = usuario.altura_cm;
                            document.getElementById('editPeso').value = usuario.peso_kg;
                            resultado.textContent = '';
                            mostrarModal();
                        }
                    });
                });

                // Botones de eliminar
                document.querySelectorAll('.eliminarBtn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        if (!confirm('¿Seguro que quieres eliminar este usuario?')) return;
                        const id = btn.dataset.id;
                        const formData = new FormData();
                        formData.append('id', id);

                        fetch('/usuarios/eliminar.php', { method: 'POST', body: formData })
                            .then(res => res.json())
                            .then(data => {
                                resultado.textContent = data.success ? "✅ " + data.message : "❌ " + data.message;
                                resultado.style.color = data.success ? "green" : "red";
                                if (data.success) cargarUsuarios();
                            })
                            .catch(err => {
                                resultado.textContent = "Error: " + err;
                                resultado.style.color = "red";
                            });
                    });
                });
            });
    }

    cargarUsuarios();

    // Editar usuario
    if (formEditar) {
        formEditar.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(formEditar);
            fetch('/usuarios/modificar.php', {
                method: 'POST',
                body: formData
            })
                .then(res => res.json())
                .then(data => {
                    resultado.textContent = data.success ? "✅ " + data.message : "❌ " + data.message;
                    resultado.style.color = data.success ? "green" : "red";
                    if (data.success) {
                        ocultarModal();
                        cargarUsuarios();
                    }
                })
                .catch(err => {
                    resultado.textContent = "Error: " + err;
                    resultado.style.color = "red";
                });
        });
    }

    // Cargar estadísticas iniciales
    function cargarEstadisticas() {
        // Simular carga de misiones y alimentos
        document.getElementById('totalMisiones').textContent = '6';
        document.getElementById('totalAlimentos').textContent = '1';
    }

    cargarEstadisticas();

});