const metaForm = document.getElementById('metaForm');
const metaTableBody = document.querySelector('#metaTable tbody');
const resultadoMeta = document.getElementById('resultadoMeta');
const formTituloMeta = document.getElementById('formTituloMeta');

const usuarioMetaSelect = document.getElementById('usuarioMetaId');
const tipoMetaSelect = document.getElementById('tipoMeta');
const estadoMetaSelect = document.getElementById('estadoMeta');

let usuariosCache = [];

// Cargar usuarios
function cargarUsuariosMeta() {
    fetch('/usuarios/obtener.php')
        .then(res => res.json())
        .then(data => {
            usuarioMetaSelect.innerHTML = '';
            if (!Array.isArray(data)) return;
            usuariosCache = data;
            data.forEach(u => {
                const opt = document.createElement('option');
                opt.value = u.id;
                opt.textContent = u.username;
                usuarioMetaSelect.appendChild(opt);
            });
        })
        .catch(err => console.error("Error al cargar usuarios:", err));
}

// Listar metas
function cargarMetas() {
    fetch('/meta/meta_obtener.php')
        .then(res => res.json())
        .then(data => {
            metaTableBody.innerHTML = '';
            if (!data.success) return;
            data.data.forEach(m => {
                const usuario = usuariosCache.find(u => u.id === m.usuario_id);
                const usuarioNombre = usuario ? usuario.username : m.usuario_id;

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${m.id}</td>
                    <td>${usuarioNombre}</td>
                    <td>${m.tipo}</td>
                    <td>${m.valor_objetivo}</td>
                    <td>${m.estado}</td>
                    <td>
                        <button onclick="editarMeta('${m.id}')">Editar</button>
                        <button onclick="eliminarMeta('${m.id}')">Eliminar</button>
                    </td>
                `;
                metaTableBody.appendChild(row);
            });
        })
        .catch(err => console.error("Error al cargar metas:", err));
}

// Registrar / Modificar meta
metaForm.addEventListener('submit', e => {
    e.preventDefault();

    const datos = {
        id: document.getElementById('metaId').value || null,
        usuario_id: usuarioMetaSelect.value,
        tipo: tipoMetaSelect.value,
        valor_objetivo: parseFloat(document.getElementById('valorMeta').value),
        estado: estadoMetaSelect.value
    };

    const url = datos.id 
        ? '/meta/meta_modificar.php'
        : '/meta/meta_registrar.php';

    fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(datos)
    })
    .then(res => res.json())
    .then(data => {
        resultadoMeta.textContent = data.success ? "✅ " + data.message : "❌ " + data.message;
        resultadoMeta.style.color = data.success ? "green" : "red";
        if(data.success){
            metaForm.reset();
            document.getElementById('metaId').value = '';
            formTituloMeta.textContent = 'Agregar Nueva Meta';
            cargarMetas();
        }
    })
    .catch(err => {
        resultadoMeta.textContent = "Error: " + err;
        resultadoMeta.style.color = "red";
    });
});

// Editar meta
function editarMeta(id) {
    fetch('/meta/meta_obtener.php')
        .then(res => res.json())
        .then(data => {
            if(!data.success) return;
            const m = data.data.find(x => x.id === id);
            if(!m) return;

            document.getElementById('metaId').value = m.id;
            usuarioMetaSelect.value = m.usuario_id;
            tipoMetaSelect.value = m.tipo;
            estadoMetaSelect.value = m.estado;
            document.getElementById('valorMeta').value = m.valor_objetivo;

            formTituloMeta.textContent = 'Editar Meta';
        })
        .catch(err => console.error("Error al obtener meta para editar:", err));
}

// Eliminar meta
function eliminarMeta(id){
    if(!confirm("¿Seguro que deseas eliminar esta meta?")) return;

    fetch(`/meta/meta_eliminar.php?id=${id}`)
        .then(res => res.json())
        .then(data => {
            resultadoMeta.textContent = data.success ? "✅ " + data.message : "❌ " + data.message;
            resultadoMeta.style.color = data.success ? "green" : "red";
            if(data.success) cargarMetas();
        })
        .catch(err => {
            resultadoMeta.textContent = "Error: " + err;
            resultadoMeta.style.color = "red";
        });
}

// Inicializar
cargarUsuariosMeta();
cargarMetas();
