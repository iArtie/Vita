document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registroAlimentoPersonalizadoForm');
    const tableBody = document.querySelector('#registroAlimentoPersonalizadoTable tbody');
    const resultado = document.getElementById('resultado');
    const formTitulo = document.getElementById('formTitulo');
    const usuarioSelect = document.getElementById('usuarioId');

    // Cargar usuarios
    function cargarUsuarios() {
        fetch('/usuarios/obtener.php')
            .then(res => res.json())
            .then(data => {
                if (!Array.isArray(data)) {
                    console.error("Error: los datos de usuarios no son un array");
                    return;
                }
                usuarioSelect.innerHTML = '';
                data.forEach(u => {
                    const opt = document.createElement('option');
                    opt.value = u.id;
                    opt.textContent = u.username; // mostrar username
                    usuarioSelect.appendChild(opt);
                });
            })
            .catch(err => console.error("Error al cargar usuarios:", err));
    }

    // Cargar registros de alimentos personalizados
    function cargarRegistros() {
        fetch('/Alimentos/AlimentosPersonalizados/obtener.php')
            .then(res => res.json())
            .then(data => {
                tableBody.innerHTML = '';
                if (!data.success) return;
                data.data.forEach(r => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${r.id}</td>
                        <td>${r.usuario}</td>
                        <td>${r.nombre}</td>
                        <td>${r.kcal_kg}</td>
                        <td>${r.prot_kg}</td>
                        <td>${r.gras_kg}</td>
                        <td>${r.carb_kg}</td>
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

    // Registrar / Actualizar alimento personalizado
    form.addEventListener('submit', e => {
        e.preventDefault();

        const datos = {
            id: document.getElementById('registroId').value,
            usuario_id: usuarioSelect.value,
            nombre: document.getElementById('nombre').value.trim(),
            porcion_kg: parseFloat(document.getElementById('porcionKg').value),
            kcal_kg: parseFloat(document.getElementById('kcal').value),
            prot_kg: parseFloat(document.getElementById('prot').value),
            gras_kg: parseFloat(document.getElementById('gras').value),
            carb_kg: parseFloat(document.getElementById('carb').value)
        };

        const url = datos.id
            ? '/Alimentos/AlimentosPersonalizados/modificar.php'
            : '/Alimentos/AlimentosPersonalizados/registrar.php';

        fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(datos)
})
.then(res => res.text()) // <-- Primero obtenemos texto
.then(text => {
    console.log("Respuesta cruda del servidor:", text);
    return JSON.parse(text); // parseamos JSON después
})
.then(data => {
    resultado.textContent = data.success ? "✅ " + data.message : "❌ " + data.message;
    resultado.style.color = data.success ? "green" : "red";
    if(data.success){
        form.reset();
        document.getElementById('registroId').value = '';
        formTitulo.textContent = 'Agregar Nuevo Alimento Personalizado';
        cargarRegistros();
    }
})
.catch(err => {
    resultado.textContent = "Error: " + err;
    resultado.style.color = "red";
});

    });

    // Editar registro
    window.editarRegistro = function(id) {
        fetch('/Alimentos/AlimentosPersonalizados/obtener.php')
            .then(res => res.json())
            .then(data => {
                if(!data.success) return;
                const r = data.data.find(x => x.id === id);
                if(!r) return;

                document.getElementById('registroId').value = r.id;
                usuarioSelect.value = r.usuario_id;
                document.getElementById('nombre').value = r.nombre;
                document.getElementById('porcionKg').value = r.porcion_kg;
                document.getElementById('kcal').value = r.kcal_kg;
                document.getElementById('prot').value = r.prot_kg;
                document.getElementById('gras').value = r.gras_kg;
                document.getElementById('carb').value = r.carb_kg;
                formTitulo.textContent = 'Editar Alimento Personalizado';
            })
            .catch(err => console.error("Error al obtener registro para editar:", err));
    }

    // Eliminar registro
    window.eliminarRegistro = function(id) {
        if(!confirm("¿Seguro que deseas eliminar este registro?")) return;

        fetch(`/Alimentos/AlimentosPersonalizados/eliminar.php?id=${id}`)
            .then(res => res.json())
            .then(data => {
                resultado.textContent = data.success ? "✅ " + data.message : "❌ " + data.message;
                resultado.style.color = data.success ? "green" : "red";
                if(data.success) cargarRegistros();
            })
            .catch(err => {
                resultado.textContent = "Error: " + err;
                resultado.style.color = "red";
            });
    }

    // Inicializar
    cargarUsuarios();
    cargarRegistros();
});