document.addEventListener('DOMContentLoaded', () => {

    const formRegistro = document.getElementById('registroForm');
    const formEditar = document.getElementById('editarForm');
    const resultado = document.getElementById('resultado');
    const tablaUsuarios = document.querySelector('#usuariosTable tbody');

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
        formEditar.addEventListener('submit', function(e) {
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
                if (data.success) cargarUsuarios();
            })
            .catch(err => {
                resultado.textContent = "Error: " + err;
                resultado.style.color = "red";
            });
        });
    }

    // Registro de usuario
    if (formRegistro) {
        formRegistro.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(formRegistro);
            fetch('/usuarios/registrar.php', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                resultado.textContent = data.success ? "✅ " + data.message : "❌ " + data.message;
                resultado.style.color = data.success ? "green" : "red";
                if (data.success) {
                    formRegistro.reset();
                    cargarUsuarios();
                }
            })
            .catch(err => {
                resultado.textContent = "Error: " + err;
                resultado.style.color = "red";
            });
        });
    }

});
