document.addEventListener('DOMContentLoaded', () => {
  const tabla = document.querySelector('#alimentosTable tbody');
  const formRegistro = document.getElementById('registroAlimentoForm');
  const formEditar = document.getElementById('editarAlimentoForm');
  const resultado = document.getElementById('resultado');

  function msg(text, ok = true) {
    resultado.textContent = (ok ? '✅ ' : '❌ ') + text;
    resultado.style.color = ok ? 'green' : 'red';
  }

  function cargarAlimentos() {
    fetch('/Alimentos/obtener.php')
      .then(r => r.json())
      .then(json => {
        if (!json.success) { msg(json.message || 'Error al cargar.', false); return; }
        const data = json.data || [];
        tabla.innerHTML = '';
        data.forEach(a => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${a.id}</td>
            <td>${a.nombre}</td>
            <td>${Number(a.kcal_kg).toFixed(2)}</td>
            <td>${Number(a.prot_kg).toFixed(2)}</td>
            <td>${Number(a.gras_kg).toFixed(2)}</td>
            <td>${Number(a.carb_kg).toFixed(2)}</td>
            <td>
              <button class="editarBtn" data-id="${a.id}">Editar</button>
              <button class="eliminarBtn" data-id="${a.id}">Eliminar</button>
            </td>
          `;
          tabla.appendChild(tr);
        });

        // editar
        document.querySelectorAll('.editarBtn').forEach(btn => {
          btn.addEventListener('click', () => {
            const a = (json.data || []).find(x => x.id === btn.dataset.id);
            if (!a) return;
            document.getElementById('editId').value = a.id;
            document.getElementById('editNombre').value = a.nombre;
            document.getElementById('editKcal').value = a.kcal_kg;
            document.getElementById('editProt').value = a.prot_kg;
            document.getElementById('editGras').value = a.gras_kg;
            document.getElementById('editCarb').value = a.carb_kg;
            msg('Editando alimento: ' + a.nombre, true);
          });
        });

        // eliminar
        document.querySelectorAll('.eliminarBtn').forEach(btn => {
          btn.addEventListener('click', () => {
            if (!confirm('¿Eliminar este alimento?')) return;
            const fd = new FormData();
            fd.append('id', btn.dataset.id);
            fetch('/Alimentos/eliminar.php', { method: 'POST', body: fd })
              .then(r => r.json())
              .then(j => {
                msg(j.message || (j.success ? 'Eliminado.' : 'No se pudo eliminar.'), !!j.success);
                if (j.success) cargarAlimentos();
              })
              .catch(err => msg('Error: ' + err, false));
          });
        });
      })
      .catch(err => msg('Error: ' + err, false));
  }

  // registrar
  if (formRegistro) {
    formRegistro.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(formRegistro);
      fetch('/Alimentos/registrar.php', { method: 'POST', body: fd })
        .then(r => r.json())
        .then(j => {
          msg(j.message || (j.success ? 'Creado.' : 'No se pudo crear.'), !!j.success);
          if (j.success) { formRegistro.reset(); cargarAlimentos(); }
        })
        .catch(err => msg('Error: ' + err, false));
    });
  }

  // modificar
  if (formEditar) {
    formEditar.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(formEditar);
      fetch('/Alimentos/modificar.php', { method: 'POST', body: fd })
        .then(r => r.json())
        .then(j => {
          msg(j.message || (j.success ? 'Actualizado.' : 'No se pudo actualizar.'), !!j.success);
          if (j.success) cargarAlimentos();
        })
        .catch(err => msg('Error: ' + err, false));
    });
  }

  // carga inicial
  cargarAlimentos();
});
