let currentUser = null;
let tiposActividad = [];
let registrosActividad = [];
let sidebarOpen = false;

document.addEventListener('DOMContentLoaded', function () {
    loadUserData();
    document.getElementById('fechaHora').value = new Date().toISOString().slice(0, 16);

    // Cerrar sidebar al hacer clic en un enlace (móviles)
    document.querySelectorAll('.menu-link').forEach(link => {
        link.addEventListener('click', function (e) {
            if (!e.target.getAttribute('onclick') && window.innerWidth <= 992) {
                toggleSidebar();
            }
        });
    });
});

// Toggle sidebar en móviles
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    sidebarOpen = !sidebarOpen;
    sidebar.classList.toggle('active');
    overlay.style.display = sidebarOpen ? 'block' : 'none';

    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
}

function loadUserData() {
    const userData = localStorage.getItem('vita_user_data');
    if (userData) {
        currentUser = JSON.parse(userData);
        loadTiposActividad();
        loadRegistrosActividad();
    } else {
        window.location.href = 'login.html';
    }
}

async function loadTiposActividad() {
    try {
        const response = await fetch('actividad/actividad_tipo_obtener.php');
        const data = await response.json();

        if (data.success) {
            tiposActividad = data.data;
            renderTiposActividad();
            updateActivitySelect();
        }
    } catch (error) {
        console.error('Error cargando tipos de actividad:', error);
        CustomAlert.show('Error cargando tipos de actividad', 'error');
    }
}

async function loadRegistrosActividad() {
    if (!currentUser) return;

    try {
        const response = await fetch('actividad/registro_actividad_obtener.php');
        const data = await response.json();

        if (data.success) {
            registrosActividad = data.data.filter(registro => registro.usuario_id === currentUser.id);
            renderHistorialActividades();
            updateActivityStats();
        }
    } catch (error) {
        console.error('Error cargando registros de actividad:', error);
        CustomAlert.show('Error cargando registros de actividad', 'error');
    }
}

function renderTiposActividad() {
    const container = document.getElementById('tiposActividad');

    if (tiposActividad.length === 0) {
        container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-running"></i>
                        <h3>No hay tipos de actividad disponibles</h3>
                    </div>
                `;
        return;
    }

    let html = '<div class="table-container"><table class="table"><thead><tr><th>Actividad</th><th>MET</th><th>Descripción</th><th>Acciones</th></tr></thead><tbody>';

    tiposActividad.forEach(actividad => {
        html += `
                    <tr>
                        <td>${actividad.nombre}</td>
                        <td>${actividad.MET}</td>
                        <td>${getActivityDescription(actividad.nombre)}</td>
                        <td>
                            <button class="btn-icon btn-edit" onclick="selectActividad('${actividad.id}')" title="Usar esta actividad">
                                <i class="fas fa-play"></i>
                            </button>
                        </td>
                    </tr>
                `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function renderHistorialActividades() {
    const container = document.getElementById('historialActividades');

    if (registrosActividad.length === 0) {
        container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-history"></i>
                        <h3>No hay actividades registradas</h3>
                        <p>Comienza registrando tu primera actividad física.</p>
                        <button class="btn btn-primary" onclick="openActivityModal()" style="margin-top: 1rem;">
                            <i class="fas fa-plus"></i>
                            Registrar Mi Primera Actividad
                        </button>
                    </div>
                `;
        return;
    }

    let html = '<div class="table-container"><table class="table"><thead><tr><th>Fecha</th><th>Actividad</th><th>Duración</th><th>Calorías</th><th>Acciones</th></tr></thead><tbody>';

    registrosActividad.forEach(registro => {
        const actividad = tiposActividad.find(a => a.id === registro.actividad_tipo_id);
        const actividadNombre = actividad ? actividad.nombre : 'Actividad';
        const fecha = new Date(registro.fecha_hora).toLocaleString();

        html += `
                    <tr>
                        <td>${fecha}</td>
                        <td>${actividadNombre}</td>
                        <td>${registro.duracion_min} min</td>
                        <td>${Math.round(registro.kcal_quemadas)} kcal</td>
                        <td>
                            <button class="btn-icon btn-delete" onclick="deleteRegistro('${registro.id}')" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function getActivityDescription(activityName) {
    const descriptions = {
        'Caminata': 'Actividad de baja intensidad ideal para comenzar',
        'Correr': 'Ejercicio cardiovascular de alta intensidad',
        'Natación': 'Ejercicio de cuerpo completo de bajo impacto',
        'Ciclismo': 'Ejercicio cardiovascular para piernas y corazón',
        'Yoga': 'Mejora flexibilidad y reduce estrés',
        'Pesas': 'Fortalece músculos y huesos',
        'Baile': 'Divertido ejercicio cardiovascular'
    };
    return descriptions[activityName] || 'Actividad física beneficiosa para la salud';
}

function updateActivitySelect() {
    const select = document.getElementById('tipoActividad');
    select.innerHTML = '<option value="">Selecciona una actividad</option>';

    tiposActividad.forEach(actividad => {
        select.innerHTML += `<option value="${actividad.id}" data-met="${actividad.MET}">${actividad.nombre} (MET: ${actividad.MET})</option>`;
    });
}

function updateActivityStats() {
    const today = new Date().toDateString();
    const hoyRegistros = registrosActividad.filter(registro =>
        new Date(registro.fecha_hora).toDateString() === today
    );

    const totals = hoyRegistros.reduce((acc, registro) => ({
        minutes: acc.minutes + (parseInt(registro.duracion_min) || 0),
        calories: acc.calories + (parseFloat(registro.kcal_quemadas) || 0),
        activities: acc.activities + 1
    }), { minutes: 0, calories: 0, activities: 0 });

    document.getElementById('totalMinutes').textContent = totals.minutes;
    document.getElementById('totalCalories').textContent = Math.round(totals.calories);
    document.getElementById('totalActivities').textContent = totals.activities;
}

// Funciones de modales
function openActivityModal() {
    document.getElementById('activityModal').style.display = 'flex';
}

function closeActivityModal() {
    document.getElementById('activityModal').style.display = 'none';
    document.getElementById('activityForm').reset();
    document.getElementById('duracion').value = '';
}

// Funciones de actividades
function selectActividad(actividadId) {
    const actividad = tiposActividad.find(a => a.id === actividadId);
    if (actividad) {
        document.getElementById('tipoActividad').value = actividad.id;

        // Calcular calorías estimadas (MET * peso * tiempo / 60)
        const userWeight = currentUser.peso_kg || 70;
        const estimatedCalories = (actividad.MET * userWeight * 30 / 60).toFixed(0);
        document.getElementById('caloriasQuemadas').value = estimatedCalories;
        document.getElementById('duracion').value = 30;

        openActivityModal();
    }
}

// Calcular calorías cuando cambia la duración o el tipo de actividad
document.getElementById('duracion').addEventListener('input', calculateCalories);
document.getElementById('tipoActividad').addEventListener('change', calculateCalories);

function calculateCalories() {
    const actividadId = document.getElementById('tipoActividad').value;
    const duracion = document.getElementById('duracion').value;

    if (actividadId && duracion) {
        const actividad = tiposActividad.find(a => a.id === actividadId);
        const userWeight = currentUser.peso_kg || 70;
        const estimatedCalories = (actividad.MET * userWeight * duracion / 60).toFixed(0);
        document.getElementById('caloriasQuemadas').value = estimatedCalories;
    }
}

// Form submission
document.getElementById('activityForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = {
        usuario_id: currentUser.id,
        actividad_tipo_id: document.getElementById('tipoActividad').value,
        fecha_hora: document.getElementById('fechaHora').value,
        duracion_min: parseInt(document.getElementById('duracion').value),
        kcal_quemadas: parseFloat(document.getElementById('caloriasQuemadas').value)
    };

    try {
        const response = await fetch('actividad/registro_actividad_registrar.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            closeActivityModal();
            loadRegistrosActividad();
            CustomAlert.show('Actividad registrada correctamente. ¡+30 puntos!', 'success');

            // Actualizar puntos
            await updateUserPoints(30, 'actividad');

        } else {
            CustomAlert.show(result.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        CustomAlert.show('Error al registrar la actividad', 'error');
    }
});

async function deleteRegistro(registroId) {
    if (confirm('¿Estás seguro de que quieres eliminar este registro?')) {
        try {
            const response = await fetch(`actividad/registro_actividad_eliminar.php?id=${registroId}`);
            const result = await response.json();

            if (result.success) {
                loadRegistrosActividad();
                CustomAlert.show('Registro eliminado correctamente', 'success');
            } else {
                CustomAlert.show(result.message, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            CustomAlert.show('Error al eliminar el registro', 'error');
        }
    }
}

// Función para actualizar puntos y racha - SIMPLIFICADA
async function updateUserPoints(puntos, tipo) {
    try {
        console.log('Actualizando puntos:', {
            usuario_id: currentUser.id,
            puntos: puntos,
            tipo: tipo
        });

        if (!currentUser || !currentUser.id) {
            console.error('CurrentUser no tiene ID:', currentUser);
            CustomAlert.show('Error: Usuario no identificado', 'error');
            return;
        }

        // Primero actualizar puntos
        const puntosFormData = new FormData();
        puntosFormData.append('usuario_id', currentUser.id);
        puntosFormData.append('puntos', puntos);
        puntosFormData.append('tipo_accion', tipo);

        console.log('Enviando datos a puntos_actualizar.php...');

        const puntosResponse = await fetch('usuarios/puntos_actualizar.php', {
            method: 'POST',
            body: puntosFormData
        });

        const puntosResult = await puntosResponse.json();
        console.log('Respuesta de puntos_actualizar.php:', puntosResult);

        if (puntosResult.success) {
            console.log('Puntos actualizados correctamente');

            // Luego actualizar racha
            const rachaFormData = new FormData();
            rachaFormData.append('usuario_id', currentUser.id);
            rachaFormData.append('tipo_registro', tipo);

            const rachaResponse = await fetch('usuarios/racha_actualizar.php', {
                method: 'POST',
                body: rachaFormData
            });

            const rachaResult = await rachaResponse.json();
            console.log('Respuesta de racha_actualizar.php:', rachaResult);

            if (rachaResult.success) {
                console.log('Racha actualizada:', rachaResult.nueva_racha);

                // Actualizar datos del usuario en localStorage
                if (rachaResult.nuevos_datos) {
                    const userDataActualizado = {
                        ...currentUser,
                        ...rachaResult.nuevos_datos
                    };
                    localStorage.setItem('vita_user_data', JSON.stringify(userDataActualizado));
                    currentUser = userDataActualizado;

                    // Mostrar mensaje de racha si es mayor a 1
                    if (rachaResult.nueva_racha > 1) {
                        CustomAlert.show(`¡Racha de ${rachaResult.nueva_racha} días consecutivos!`, 'success');
                    }
                }
            } else {
                console.error('Error actualizando racha:', rachaResult.message);
            }

            // Mostrar mensaje de éxito de puntos
            CustomAlert.show(`¡+${puntos} puntos ganados!`, 'success');

        } else {
            console.error('Error actualizando puntos:', puntosResult.message);
            CustomAlert.show('Error al actualizar puntos: ' + puntosResult.message, 'error');
        }
    } catch (error) {
        console.error('Error actualizando puntos:', error);
        CustomAlert.show('Error de conexión: ' + error.message, 'error');
    }
}
// Cerrar modal al hacer clic fuera
window.addEventListener('click', function (e) {
    if (e.target === document.getElementById('activityModal')) {
        closeActivityModal();
    }
});

// Cerrar sidebar al redimensionar la ventana
window.addEventListener('resize', function () {
    if (window.innerWidth > 992 && sidebarOpen) {
        toggleSidebar();
    }
});

function logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('vita_user_data');
        localStorage.removeItem('vita_user_id');
        localStorage.removeItem('vita_username');
        localStorage.removeItem('vita_email');
        localStorage.removeItem('vita_avatar_id');
        window.location.href = 'login.html';
    }
}