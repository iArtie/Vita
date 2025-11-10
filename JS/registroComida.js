const form = document.getElementById('registroComidaForm');
const tableBody = document.querySelector('#registroComidaTable tbody');
const resultado = document.getElementById('resultado');
const formTitulo = document.getElementById('formTitulo');

const usuarioSelect = document.getElementById('usuarioId');
const alimentoSelect = document.getElementById('alimentoId');
const alimentoPersonalizadoSelect = document.getElementById('alimentoPersonalizadoId');

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

// Cargar alimentos
function cargarAlimentos() {
    fetch('/Alimentos/obtener.php')
        .then(res => res.json())
        .then(data => {
            alimentoSelect.innerHTML = '<option value="">-- Ninguno --</option>';
            if (!data.success || !Array.isArray(data.data)) return;
            data.data.forEach(a => {
                const opt = document.createElement('option');
                opt.value = a.id;
                opt.textContent = a.nombre;
                alimentoSelect.appendChild(opt);
            });
        })
        .catch(err => console.error("Error al cargar alimentos:", err));
}

// Cargar alimentos personalizados
function cargarAlimentosPersonalizados() {
    fetch('/Alimentos/AlimentosPeronalizados/obtener.php')
        .then(res => res.json())
        .then(data => {
            alimentoPersonalizadoSelect.innerHTML = '<option value="">-- Ninguno --</option>';
            if (!Array.isArray(data)) return;
            data.forEach(a => {
                const opt = document.createElement('option');
                opt.value = a.id;
                opt.textContent = a.nombre;
                alimentoPersonalizadoSelect.appendChild(opt);
            });
        })
        .catch(err => console.error("Error al cargar alimentos personalizados:", err));
}

// Listar registros de comida
function cargarRegistros() {
    fetch('/Alimentos/RegistrarComida/registro_comida_obtener.php')
        .then(res => res.json())
        .then(data => {
            tableBody.innerHTML = '';
            if (!data.success) return;
            data.data.forEach(r => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${r.id}</td>
                    <td>${r.usuario}</td>
                    <td>${r.alimento || ''}</td>
                    <td>${r.alimento_personalizado || ''}</td>
                    <td>${r.fecha_hora}</td>
                    <td>${r.porcion_kg}</td>
                    <td>${r.kcal}</td>
                    <td>${r.prot_g}</td>
                    <td>${r.gras_g}</td>
                    <td>${r.carb_g}</td>
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
        alimento_id: alimentoSelect.value || null,
        alimento_personalizado_id: alimentoPersonalizadoSelect.value || null,
        fecha_hora: document.getElementById('fechaHora').value,
        porcion_kg: parseFloat(document.getElementById('porcionKg').value),
        kcal: parseFloat(document.getElementById('kcal').value),
        prot_g: parseFloat(document.getElementById('protG').value),
        gras_g: parseFloat(document.getElementById('grasG').value),
        carb_g: parseFloat(document.getElementById('carbG').value)
    };

    const url = datos.id 
        ? '/Alimentos/RegistrarComida/registro_comida_modificar.php' 
        : '/Alimentos/RegistrarComida/registro_comida_registrar.php';

    fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(datos)
    })
    .then(res => res.json())
    .then(data => {
        resultado.textContent = data.success ? "✅ " + data.message : "❌ " + data.message;
        resultado.style.color = data.success ? "green" : "red";
        if(data.success){
            form.reset();
            document.getElementById('registroId').value = '';
            formTitulo.textContent = 'Agregar Nuevo Registro de Comida';
            cargarRegistros();
        }
    })
    .catch(err => {
        resultado.textContent = "Error: " + err;
        resultado.style.color = "red";
    });
});

// Editar registro
function editarRegistro(id) {
    fetch('/Alimentos/RegistrarComida/registro_comida_obtener.php')
        .then(res => res.json())
        .then(data => {
            if(!data.success) return;
            const r = data.data.find(x => x.id === id);
            if(!r) return;

            document.getElementById('registroId').value = r.id;
            usuarioSelect.value = r.usuario_id;
            alimentoSelect.value = r.alimento_id || '';
            alimentoPersonalizadoSelect.value = r.alimento_personalizado_id || '';
            document.getElementById('fechaHora').value = r.fecha_hora.replace(' ', 'T');
            document.getElementById('porcionKg').value = r.porcion_kg;
            document.getElementById('kcal').value = r.kcal;
            document.getElementById('protG').value = r.prot_g;
            document.getElementById('grasG').value = r.gras_g;
            document.getElementById('carbG').value = r.carb_g;
            formTitulo.textContent = 'Editar Registro de Comida';
        })
        .catch(err => console.error("Error al obtener registro para editar:", err));
}

// Eliminar registro
function eliminarRegistro(id){
    if(!confirm("¿Seguro que deseas eliminar este registro?")) return;

    fetch(`/Alimentos/RegistrarComida/registro_comida_eliminar.php?id=${id}`)
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
cargarAlimentos();
cargarAlimentosPersonalizados();
cargarRegistros();