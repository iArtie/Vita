let currentUser = null;
let misiones = [];
let misionesUsuario = [];
let sidebarOpen = false;

document.addEventListener('DOMContentLoaded', function () {
    loadUserData();

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
        loadMisiones();
    } else {
        window.location.href = 'login.html';
    }
}

async function loadMisiones() {
    try {
        // Cargar misiones disponibles
        const response = await fetch('misiones/obtener.php');
        const data = await response.json();

        if (data.success) {
            misiones = data.data;
            checkNewDay();
        } else {
            CustomAlert.show('Error cargando misiones disponibles', 'error');
        }
    } catch (error) {
        console.error('Error cargando misiones:', error);
        CustomAlert.show('Error cargando misiones', 'error');
    }
}

// Verificar si es un nuevo día y regenerar misiones
function checkNewDay() {
    const lastMissionDate = localStorage.getItem(`vita_last_mission_date_${currentUser.id}`);
    const today = new Date().toDateString();

    if (lastMissionDate !== today) {
        // Es un nuevo día, resetear todo
        localStorage.setItem(`vita_last_mission_date_${currentUser.id}`, today);
        localStorage.removeItem(`vita_misiones_reclamadas_${currentUser.id}_${lastMissionDate}`);
        localStorage.removeItem(`vita_misiones_${currentUser.id}_${lastMissionDate}`);
        assignDailyMissions();
    } else {
        // Mismo día, cargar misiones existentes
        loadMisionesUsuario();
    }
}

async function loadMisionesUsuario() {
    if (!currentUser) return;

    try {
        // Primero intentar cargar desde localStorage
        const misionesKey = `vita_misiones_${currentUser.id}_${new Date().toDateString()}`;
        const misionesGuardadas = localStorage.getItem(misionesKey);

        if (misionesGuardadas) {
            misionesUsuario = JSON.parse(misionesGuardadas);
            renderMisiones();
            updateProgress();
        } else {
            // Si no hay misiones guardadas para hoy, asignar nuevas
            await assignDailyMissions();
        }
    } catch (error) {
        console.error('Error cargando misiones del usuario:', error);
        await assignDailyMissions();
    }
}

async function assignDailyMissions() {
    // Verificar si ya se reclamaron 3 misiones hoy
    const misionesReclamadasKey = `vita_misiones_reclamadas_${currentUser.id}_${new Date().toDateString()}`;
    const misionesReclamadasHoy = parseInt(localStorage.getItem(misionesReclamadasKey)) || 0;

    if (misionesReclamadasHoy >= 3) {
        mostrarContadorProximasMisiones();
        return;
    }

    // Seleccionar 3 misiones aleatorias para el día de hoy
    const misionesHoy = getRandomMissions(3);
    misionesUsuario = misionesHoy.map((mision, index) => ({
        mdu_id: 'mdu_' + Math.random().toString(36).substr(2, 9),
        mision_id: mision.id,
        nombre: mision.nombre,
        puntos: parseInt(mision.puntos),
        reglas: mision.reglas,
        periodicidad: mision.periodicidad,
        estado: 'pendiente',
        puntos_ganados: 0,
        fecha_asignacion: new Date().toISOString()
    }));

    // Guardar en localStorage para persistencia
    const misionesKey = `vita_misiones_${currentUser.id}_${new Date().toDateString()}`;
    localStorage.setItem(misionesKey, JSON.stringify(misionesUsuario));

    renderMisiones();
    updateProgress();
}

// Función para mostrar contador de próximas misiones
function mostrarContadorProximasMisiones() {
    const container = document.getElementById('misionesContainer');

    // Calcular tiempo hasta medianoche
    const ahora = new Date();
    const manana = new Date(ahora);
    manana.setDate(manana.getDate() + 1);
    manana.setHours(0, 0, 0, 0);

    function actualizarContador() {
        const ahora = new Date();
        const tiempoRestante = manana - ahora;

        if (tiempoRestante <= 0) {
            // ¡Es medianoche! Recargar misiones
            location.reload();
            return;
        }

        const horas = Math.floor(tiempoRestante / (1000 * 60 * 60));
        const minutos = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((tiempoRestante % (1000 * 60)) / 1000);

        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clock"></i>
                <h3>¡Has reclamado tus 3 misiones diarias!</h3>
                <p>Vuelve mañana para nuevas misiones.</p>
                <div class="countdown-timer">
                    <div class="countdown-label">Próximas misiones en:</div>
                    <div class="countdown-value">${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}</div>
                </div>
            </div>
        `;
    }

    // Actualizar inmediatamente y luego cada segundo
    actualizarContador();
    setInterval(actualizarContador, 1000);
}

function getRandomMissions(count) {
    const shuffled = [...misiones].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function renderMisiones() {
    const container = document.getElementById('misionesContainer');

    // Verificar límite de misiones reclamadas
    const misionesReclamadasKey = `vita_misiones_reclamadas_${currentUser.id}_${new Date().toDateString()}`;
    const misionesReclamadasHoy = parseInt(localStorage.getItem(misionesReclamadasKey)) || 0;

    if (misionesReclamadasHoy >= 3) {
        mostrarContadorProximasMisiones();
        return;
    }

    if (misionesUsuario.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-trophy"></i>
                <h3>No hay misiones para hoy</h3>
                <p>Vuelve mañana para nuevas misiones diarias.</p>
                <button class="btn btn-primary" onclick="refreshMissions()" style="margin-top: 1rem;">
                    <i class="fas fa-sync-alt"></i>
                    Generar Misiones
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = '<div class="missions-grid" id="missionsGrid"></div>';
    const grid = document.getElementById('missionsGrid');

    misionesUsuario.forEach((misionUsuario, index) => {
        const mision = misiones.find(m => m.id === misionUsuario.mision_id) || misionUsuario;
        const missionCard = createMissionCard(mision, misionUsuario, index);
        grid.appendChild(missionCard);
    });
}

function createMissionCard(mision, misionUsuario, index) {
    const card = document.createElement('div');
    card.className = `mission-card ${misionUsuario.estado === 'lista' ? 'completed' : ''} ${misionUsuario.estado === 'expirada' ? 'expired' : ''} ${misionUsuario.estado === 'reclamada' ? 'claimed' : ''}`;

    const isNew = index < 2;
    const icon = getMissionIcon(mision.nombre);

    card.innerHTML = `
        ${misionUsuario.estado === 'pendiente' ? `
            <button class="skip-btn" onclick="skipMission('${misionUsuario.mdu_id}')" title="Omitir misión">
                <i class="fas fa-times"></i>
            </button>
        ` : ''}
        
        <div class="mission-header">
            <div class="mission-icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="mission-points">
                +${mision.puntos || misionUsuario.puntos} pts
            </div>
        </div>
        
        <div class="mission-title">
            ${mision.nombre || misionUsuario.nombre}
            ${isNew && misionUsuario.estado === 'pendiente' ? '<span class="new-badge">NUEVA</span>' : ''}
        </div>
        
        <div class="mission-description">
            ${getMissionDescription(mision.nombre || misionUsuario.nombre)}
        </div>
        
        <div class="mission-rules">
            <strong>Reglas:</strong> ${mision.reglas || misionUsuario.reglas}
        </div>
        
        <div class="mission-actions">
            <div class="mission-status ${getStatusClass(misionUsuario.estado)}">
                ${getStatusText(misionUsuario.estado)}
            </div>
            
            ${misionUsuario.estado === 'pendiente' ? `
                <button class="btn btn-success" onclick="markMissionReady('${misionUsuario.mdu_id}')">
                    <i class="fas fa-check"></i>
                    Completar
                </button>
            ` : ''}
            
            ${misionUsuario.estado === 'lista' ? `
                <button class="btn btn-primary" onclick="claimReward('${misionUsuario.mdu_id}')">
                    <i class="fas fa-gift"></i>
                    Reclamar ${misionUsuario.puntos} pts
                </button>
            ` : ''}
            
            ${misionUsuario.estado === 'reclamada' ? `
                <div class="claimed-badge">
                    <i class="fas fa-check-circle"></i>
                    Reclamada
                </div>
            ` : ''}
        </div>
    `;

    return card;
}

function getMissionIcon(missionName) {
    const icons = {
        'comida': 'fa-utensils',
        'actividad': 'fa-running',
        'agua': 'fa-tint',
        'sueño': 'fa-bed',
        'peso': 'fa-weight',
        'ejercicio': 'fa-dumbbell',
        'fruta': 'fa-apple-alt',
        'verdura': 'fa-leaf',
        'meditación': 'fa-spa',
        'caminata': 'fa-walking'
    };

    for (const [key, icon] of Object.entries(icons)) {
        if (missionName.toLowerCase().includes(key)) {
            return icon;
        }
    }

    return 'fa-tasks';
}

function getMissionDescription(missionName) {
    const descriptions = {
        'comida': 'Registra tu consumo de alimentos para mantener un control nutricional.',
        'actividad': 'Realiza actividad física para mejorar tu salud y condición física.',
        'agua': 'Mantente hidratado consumiendo la cantidad adecuada de agua.',
        'sueño': 'Descansa lo suficiente para recuperar energía y mantener tu salud.',
        'peso': 'Controla tu peso para seguir tu progreso hacia tus metas.',
        'ejercicio': 'Fortalece tu cuerpo con ejercicio regular.',
        'fruta': 'Incluye frutas en tu dieta para obtener vitaminas y fibra.',
        'verdura': 'Consume verduras para una alimentación balanceada.',
        'meditación': 'Practica mindfulness para reducir el estrés.',
        'caminata': 'Camina regularmente para mantenerte activo.'
    };

    for (const [key, description] of Object.entries(descriptions)) {
        if (missionName.toLowerCase().includes(key)) {
            return description;
        }
    }

    return 'Completa esta misión para ganar puntos y mejorar tu salud.';
}

function getStatusClass(status) {
    const classes = {
        'pendiente': 'status-pending',
        'lista': 'status-ready',
        'reclamada': 'status-claimed',
        'expirada': 'status-expired'
    };
    return classes[status] || 'status-pending';
}

function getStatusText(status) {
    const texts = {
        'pendiente': '⏳ Pendiente',
        'lista': '✅ Lista para reclamar',
        'reclamada': '🎉 Reclamada',
        'expirada': '❌ Expirada'
    };
    return texts[status] || '⏳ Pendiente';
}

function updateProgress() {
    const totalMissions = misionesUsuario.length;
    const claimedMissions = misionesUsuario.filter(m => m.estado === 'reclamada').length;
    const progress = totalMissions > 0 ? (claimedMissions / totalMissions) * 100 : 0;

    // Actualizar círculo de progreso
    const progressCircle = document.getElementById('progressCircle');
    const progressText = document.getElementById('progressText');
    const progressValue = document.getElementById('progressValue');

    progressCircle.style.background = `conic-gradient(var(--primary) 0% ${progress}%, var(--light) ${progress}% 100%)`;
    progressText.textContent = `${Math.round(progress)}%`;
    progressValue.textContent = `${claimedMissions} de ${totalMissions} misiones reclamadas`;

    // Calcular puntos totales disponibles (solo las que están listas para reclamar)
    const totalPoints = misionesUsuario
        .filter(m => m.estado === 'lista')
        .reduce((sum, m) => {
            const puntos = parseInt(m.puntos) || 0;
            return sum + puntos;
        }, 0);

    document.getElementById('totalPoints').textContent = totalPoints;
}

function markMissionReady(misionId) {
    const mision = misionesUsuario.find(m => m.mdu_id === misionId);
    if (!mision || mision.estado !== 'pendiente') return;

    // Cambiar estado a "lista" (lista para reclamar)
    mision.estado = 'lista';

    // Guardar cambios en localStorage
    const misionesKey = `vita_misiones_${currentUser.id}_${new Date().toDateString()}`;
    localStorage.setItem(misionesKey, JSON.stringify(misionesUsuario));

    // Actualizar interfaz
    renderMisiones();
    updateProgress();

    CustomAlert.show('¡Misión completada! Ahora puedes reclamar tus puntos.', 'success');
}

async function claimReward(misionId) {
    const mision = misionesUsuario.find(m => m.mdu_id === misionId);
    if (!mision || mision.estado !== 'lista') return;

    // Verificar límite de misiones reclamadas
    const misionesReclamadasKey = `vita_misiones_reclamadas_${currentUser.id}_${new Date().toDateString()}`;
    const misionesReclamadasHoy = parseInt(localStorage.getItem(misionesReclamadasKey)) || 0;

    if (misionesReclamadasHoy >= 3) {
        CustomAlert.show('¡Ya has reclamado tus 3 misiones diarias! Vuelve mañana.', 'info');
        return;
    }

    try {
        // Primero actualizar puntos
        const puntosFormData = new FormData();
        puntosFormData.append('usuario_id', currentUser.id);
        puntosFormData.append('puntos', mision.puntos);
        puntosFormData.append('tipo_accion', 'mision');

        const puntosResponse = await fetch('usuarios/puntos_actualizar.php', {
            method: 'POST',
            body: puntosFormData
        });

        const puntosResult = await puntosResponse.json();

        if (puntosResult.success) {
            console.log('Puntos actualizados correctamente');

            // Luego actualizar racha para misiones también
            const rachaFormData = new FormData();
            rachaFormData.append('usuario_id', currentUser.id);
            rachaFormData.append('tipo_registro', 'mision');

            const rachaResponse = await fetch('usuarios/racha_actualizar.php', {
                method: 'POST',
                body: rachaFormData
            });

            const rachaResult = await rachaResponse.json();

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

            // Marcar como reclamada
            mision.puntos_ganados = mision.puntos;
            mision.estado = 'reclamada';

            // Actualizar contador de misiones reclamadas
            localStorage.setItem(misionesReclamadasKey, misionesReclamadasHoy + 1);

            // Guardar cambios en localStorage
            const misionesKey = `vita_misiones_${currentUser.id}_${new Date().toDateString()}`;
            localStorage.setItem(misionesKey, JSON.stringify(misionesUsuario));

            renderMisiones();
            updateProgress();

            CustomAlert.show(`¡Felicidades! Has reclamado ${mision.puntos_ganados} puntos.`, 'success');
        } else {
            CustomAlert.show('Error al reclamar la recompensa', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        CustomAlert.show('Error al reclamar la recompensa', 'error');
    }
}

function skipMission(misionId) {
    if (confirm('¿Estás seguro de que quieres omitir esta misión? No podrás completarla hoy.')) {
        const mision = misionesUsuario.find(m => m.mdu_id === misionId);
        if (mision) {
            mision.estado = 'expirada';

            // Guardar cambios en localStorage
            const misionesKey = `vita_misiones_${currentUser.id}_${new Date().toDateString()}`;
            localStorage.setItem(misionesKey, JSON.stringify(misionesUsuario));

            renderMisiones();
            updateProgress();
            CustomAlert.show('Misión omitida', 'info');
        }
    }
}

function refreshMissions() {
    const misionesReclamadasKey = `vita_misiones_reclamadas_${currentUser.id}_${new Date().toDateString()}`;
    const misionesReclamadasHoy = parseInt(localStorage.getItem(misionesReclamadasKey)) || 0;

    if (misionesReclamadasHoy >= 3) {
        CustomAlert.show('Ya has reclamado 3 misiones hoy. Vuelve mañana.', 'warning');
        return;
    }

    if (confirm('¿Estás seguro de que quieres regenerar las misiones? Perderás el progreso actual.')) {
        assignDailyMissions();
        CustomAlert.show('Misiones actualizadas!', 'success');
    }
}

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