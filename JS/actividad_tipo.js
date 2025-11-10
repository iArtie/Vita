const API_BASE = "/actividad/actividad_tipo"; // ajustá el path según tu estructura

document.addEventListener("DOMContentLoaded", () => {
    cargarTipos();

    const form = document.getElementById("formActividadTipo");
    const btnCancelar = document.getElementById("btnCancelar");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = document.getElementById("id").value;
        const nombre = document.getElementById("nombre").value.trim();
        const MET = parseFloat(document.getElementById("MET").value);

        if (!nombre || isNaN(MET)) {
            alert("Todos los campos son obligatorios");
            return;
        }

        const endpoint = id ? "editar" : "agregar";
        const res = await fetch(`${API_BASE}_${endpoint}.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, nombre, MET })
        });

        const data = await res.json();
        alert(data.message);

        if (data.success) {
            form.reset();
            document.getElementById("id").value = "";
            btnCancelar.style.display = "none";
            cargarTipos();
        }
    });

    btnCancelar.addEventListener("click", () => {
        form.reset();
        document.getElementById("id").value = "";
        btnCancelar.style.display = "none";
    });
});

async function cargarTipos() {
    const res = await fetch(`${API_BASE}_obtener.php`);
    const data = await res.json();
    const tbody = document.getElementById("tablaActividades");
    tbody.innerHTML = "";

    if (data.success && data.data.length > 0) {
        data.data.forEach(t => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${t.nombre}</td>
                <td>${t.MET}</td>
                <td>
                    <button onclick="editar('${t.id}','${t.nombre}',${t.MET})">Editar</button>
                    <button onclick="eliminar('${t.id}')">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } else {
        tbody.innerHTML = "<tr><td colspan='3'>No hay registros</td></tr>";
    }
}

function editar(id, nombre, MET) {
    document.getElementById("id").value = id;
    document.getElementById("nombre").value = nombre;
    document.getElementById("MET").value = MET;
    document.getElementById("btnCancelar").style.display = "inline";
}

async function eliminar(id) {
    if (!confirm("¿Seguro que deseas eliminar este tipo de actividad?")) return;

    const res = await fetch(`${API_BASE}_eliminar.php?id=${id}`);
    const data = await res.json();

    alert(data.message);
    if (data.success) cargarTipos();
}
