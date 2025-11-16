let currentUser = null;
        let misiones = [];
        let misionesUsuario = [];
        let sidebarOpen = false;

        document.addEventListener('DOMContentLoaded', function() {
            loadUserData();
            
            // Cerrar sidebar al hacer clic en un enlace (móviles)
            document.querySelectorAll('.menu-link').forEach(link => {
                link.addEventListener('click', function(e) {
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
                    loadMisionesUsuario();
                } else {
                    CustomAlert.show('Error cargando misiones disponibles', 'error');
                }
            } catch (error) {
                console.error('Error cargando misiones:', error);
                CustomAlert.show('Error cargando misiones', 'error');
            }
        }

        async function loadMisionesUsuario() {
            if (!currentUser) return;

            try {
                const hoy = new Date().toISOString().split('T')[0];
                const response = await fetch(`misiones/misionDiariaUsuario/obtener.php?usuario_id=${currentUser.id}&fecha=${hoy}`);
                const data = await response.json();
                
                if (data.success) {
                    misionesUsuario = data.misiones || [];
                    renderMisiones();
                    updateProgress();
                } else {
                    // Si no hay misiones para hoy, asignar algunas aleatorias
                    await assignDailyMissions();
                }
            } catch (error) {
                console.error('Error cargando misiones del usuario:', error);
                // En caso de error, usar misiones por defecto
                await assignDailyMissions();
            }
        }

        async function assignDailyMissions() {
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
                puntos_ganados: 0
            }));
            
            // Guardar en localStorage para persistencia
            const misionesKey = `vita_misiones_${currentUser.id}_${new Date().toDateString()}`;
            localStorage.setItem(misionesKey, JSON.stringify(misionesUsuario));
            
            renderMisiones();
            updateProgress();
        }

        function getRandomMissions(count) {
            const shuffled = [...misiones].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, count);
        }

        function renderMisiones() {
            const container = document.getElementById('misionesContainer');
            
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
            card.className = `mission-card ${misionUsuario.estado === 'completada' ? 'completed' : ''} ${misionUsuario.estado === 'expirada' ? 'expired' : ''}`;
            
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
                        <button class="btn btn-success" onclick="completeMission('${misionUsuario.mdu_id}')">
                            <i class="fas fa-check"></i>
                            Completar
                        </button>
                    ` : ''}
                    
                    ${misionUsuario.estado === 'completada' ? `
                        <button class="btn btn-outline" onclick="claimReward('${misionUsuario.mdu_id}')">
                            <i class="fas fa-gift"></i>
                            Reclamar
                        </button>
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
                'completada': 'status-completed',
                'expirada': 'status-expired'
            };
            return classes[status] || 'status-pending';
        }

        function getStatusText(status) {
            const texts = {
                'pendiente': '⏳ Pendiente',
                'completada': '✅ Completada',
                'expirada': '❌ Expirada'
            };
            return texts[status] || '⏳ Pendiente';
        }

        function updateProgress() {
            const totalMissions = misionesUsuario.length;
            const completedMissions = misionesUsuario.filter(m => m.estado === 'completada').length;
            const progress = totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;
            
            // Actualizar círculo de progreso
            const progressCircle = document.getElementById('progressCircle');
            const progressText = document.getElementById('progressText');
            const progressValue = document.getElementById('progressValue');
            
            progressCircle.style.background = `conic-gradient(var(--primary) 0% ${progress}%, var(--light) ${progress}% 100%)`;
            progressText.textContent = `${Math.round(progress)}%`;
            progressValue.textContent = `${completedMissions} de ${totalMissions} misiones completadas`;
            
            // Calcular puntos totales disponibles (SOLO sumar números, no strings)
            const totalPoints = misionesUsuario
                .filter(m => m.estado === 'pendiente' || m.estado === 'completada')
                .reduce((sum, m) => {
                    const puntos = parseInt(m.puntos) || 0;
                    return sum + puntos;
                }, 0);
            
            document.getElementById('totalPoints').textContent = totalPoints;
        }

        async function completeMission(misionId) {
            const mision = misionesUsuario.find(m => m.mdu_id === misionId);
            if (!mision) return;

            // Marcar como completada
            mision.estado = 'completada';
            
            // Actualizar interfaz
            renderMisiones();
            updateProgress();
            
            CustomAlert.show('Misión completada! Reclama tu recompensa.', 'success');
        }

        async function claimReward(misionId) {
            const mision = misionesUsuario.find(m => m.mdu_id === misionId);
            if (!mision || mision.estado !== 'completada') return;

            try {
                // Actualizar puntos del usuario
                const formData = new FormData();
                formData.append('usuario_id', currentUser.id);
                formData.append('puntos', mision.puntos);
                formData.append('tipo_accion', 'mision');

                const response = await fetch('usuarios/puntos_actualizar.php', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                
                if (result.success) {
                    // Marcar puntos como reclamados
                    mision.puntos_ganados = mision.puntos;
                    mision.puntos = 0;
                    mision.estado = 'expirada';
                    
                    renderMisiones();
                    updateProgress();
                    
                    CustomAlert.show(`¡Felicidades! Has ganado ${mision.puntos_ganados} puntos.`, 'success');
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
                    renderMisiones();
                    updateProgress();
                    CustomAlert.show('Misión omitida', 'info');
                }
            }
        }

        function refreshMissions() {
            if (confirm('¿Estás seguro de que quieres regenerar las misiones? Perderás el progreso actual.')) {
                assignDailyMissions();
                CustomAlert.show('Misiones actualizadas!', 'success');
            }
        }

        // Verificar si es un nuevo día y regenerar misiones
        function checkNewDay() {
            const lastMissionDate = localStorage.getItem(`vita_last_mission_date_${currentUser.id}`);
            const today = new Date().toDateString();
            
            if (lastMissionDate !== today) {
                localStorage.setItem(`vita_last_mission_date_${currentUser.id}`, today);
                assignDailyMissions();
            }
        }

        // Ejecutar check cuando se carga la página
        if (currentUser) {
            checkNewDay();
        }

        // Cerrar sidebar al redimensionar la ventana
        window.addEventListener('resize', function() {
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