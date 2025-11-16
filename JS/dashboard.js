 // Variables globales
        let currentUser = null;
        let userStats = null;
        let sidebarOpen = false;

        // Cargar datos del usuario al iniciar
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

        // Cargar datos del usuario desde localStorage
        function loadUserData() {
            const userData = localStorage.getItem('vita_user_data');
            if (userData) {
                currentUser = JSON.parse(userData);
                updateUserInterface();
                loadUserStats();
            } else {
                window.location.href = 'login.html';
            }
        }

        // Actualizar interfaz con datos del usuario
        function updateUserInterface() {
            if (currentUser) {
                // Usar username en lugar de nombre y apellido
                document.getElementById('userName').textContent = currentUser.username;
                document.getElementById('mobileUserName').textContent = currentUser.username;
                
                // Actualizar nivel inicial
                document.getElementById('userLevel').textContent = `Nivel ${currentUser.level || 1}`;
                document.getElementById('mobileUserLevel').textContent = `Nivel ${currentUser.level || 1}`;
                
                // Actualizar avatar - CORREGIDO
                if (currentUser.avatar_id) {
                    const avatarFolder = currentUser.avatar_id.includes('female') ? 'female' : 'male';
                    const avatarPath = `assets/avatars/${avatarFolder}/${currentUser.avatar_id}.png`;
                    
                    const avatarElements = [
                        document.getElementById('userAvatar'),
                        document.getElementById('mobileUserAvatar')
                    ];
                    
                    avatarElements.forEach(avatar => {
                        if (avatar) {
                            avatar.src = avatarPath;
                            avatar.onerror = function() {
                                // Si falla la carga, usar SVG por defecto
                                this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiByeD0iMjUiIGZpbGw9IiM0ZTdhZTYiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPgo8cGF0aCBkPSJNMjAgMjF2LTJhNCA0IDAgMCAwLTQtNEg4YTQgNCAwIDAgMC00IDR2MiIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiLz4KPC9zdmc+Cjwvc3ZnPg==';
                            };
                        }
                    });
                }
            }
        }

        // Cargar estadísticas del usuario
        async function loadUserStats() {
            if (!currentUser) return;

            try {
                const response = await fetch(`usuarios/perfil_obtener.php?usuario_id=${currentUser.id}`);
                const data = await response.json();
                
                if (data.success) {
                    userStats = data.data;
                    updateStatsInterface();
                    loadUserGoals();
                } else {
                    console.error('Error cargando estadísticas:', data.message);
                    CustomAlert.show('Error cargando estadísticas: ' + data.message, 'error');
                }
            } catch (error) {
                console.error('Error cargando estadísticas:', error);
                CustomAlert.show('Error cargando estadísticas', 'error');
            }
        }

        // Actualizar interfaz con estadísticas REALES
        function updateStatsInterface() {
            if (userStats) {
                // Puntos y nivel - DATOS REALES
                document.getElementById('puntosTotales').textContent = userStats.points || 0;
                document.getElementById('nivelActual').textContent = userStats.level || 1;
                document.getElementById('userLevel').textContent = `Nivel ${userStats.level || 1}`;
                document.getElementById('mobileUserLevel').textContent = `Nivel ${userStats.level || 1}`;
                
                // Progreso de puntos - CÁLCULO REAL
                const puntosActuales = userStats.points || 0;
                const nivelActual = userStats.level || 1;
                const puntosParaNivelActual = (nivelActual - 1) * 100;
                const puntosEnNivelActual = puntosActuales - puntosParaNivelActual;
                const progresoPuntos = (puntosEnNivelActual / 100) * 100;
                
                document.getElementById('proximoNivel').textContent = `Próximo nivel: ${100 - puntosEnNivelActual} pts`;
                document.getElementById('puntosProgress').style.width = `${progresoPuntos}%`;
                
                // Racha - DATO REAL
                document.getElementById('diasConsecutivos').textContent = userStats.racha || 0;
                const progresoRacha = Math.min(((userStats.racha || 0) / 30) * 100, 100);
                document.getElementById('rachaProgress').style.width = `${progresoRacha}%`;
                
                // Misiones completadas - DATO REAL
                document.getElementById('misionesCompletadas').textContent = userStats.completed_missions || 0;
                document.getElementById('misionesProgreso').textContent = `${userStats.completed_missions || 0} misiones completadas`;
            }
        }

        // Cargar metas del usuario - DATOS REALES
        async function loadUserGoals() {
            if (!currentUser) return;

            try {
                const response = await fetch(`meta/meta_usuario_obtener.php?usuario_id=${currentUser.id}`);
                const data = await response.json();
                
                const metasGrid = document.getElementById('metasGrid');
                metasGrid.innerHTML = '';

                if (data.success && data.data.length > 0) {
                    data.data.slice(0, 4).forEach(meta => { // Mostrar solo 4 metas
                        const goalItem = document.createElement('div');
                        goalItem.className = 'goal-item';
                        
                        let icon = 'fa-bullseye';
                        let color = 'var(--primary)';
                        
                        switch(meta.tipo) {
                            case 'peso':
                                icon = 'fa-weight';
                                color = 'var(--success)';
                                break;
                            case 'calorias':
                                icon = 'fa-fire';
                                color = 'var(--warning)';
                                break;
                            case 'proteinas':
                                icon = 'fa-dumbbell';
                                color = 'var(--info)';
                                break;
                            case 'carbohidratos':
                                icon = 'fa-bread-slice';
                                color = 'var(--primary)';
                                break;
                            case 'grasas':
                                icon = 'fa-oil-can';
                                color = 'var(--accent)';
                                break;
                        }

                        goalItem.innerHTML = `
                            <div class="goal-icon" style="background-color: ${color}">
                                <i class="fas ${icon}"></i>
                            </div>
                            <div class="goal-info">
                                <div class="goal-title">${meta.tipo.charAt(0).toUpperCase() + meta.tipo.slice(1)}</div>
                                <div class="goal-progress">Objetivo: ${meta.valor_objetivo} ${getUnidad(meta.tipo)}</div>
                                <div class="goal-progress" style="font-size: 0.75rem; color: ${meta.estado === 'activa' ? 'var(--success)' : 'var(--text-secondary)'}">
                                    ${meta.estado === 'activa' ? '🟢 Activa' : '✅ Completada'}
                                </div>
                            </div>
                        `;
                        metasGrid.appendChild(goalItem);
                    });

                    if (data.data.length > 4) {
                        const verMas = document.createElement('div');
                        verMas.className = 'goal-item';
                        verMas.style.justifyContent = 'center';
                        verMas.style.cursor = 'pointer';
                        verMas.onclick = () => window.location.href = 'metas.html';
                        verMas.innerHTML = `
                            <div class="goal-info" style="text-align: center;">
                                <div class="goal-title">Ver todas las metas</div>
                                <div class="goal-progress">+${data.data.length - 4} más</div>
                            </div>
                        `;
                        metasGrid.appendChild(verMas);
                    }
                } else {
                    metasGrid.innerHTML = `
                        <div class="goal-item" style="text-align: center; padding: 2rem;">
                            <i class="fas fa-bullseye" style="font-size: 2rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                            <p style="color: var(--text-secondary); margin-bottom: 1rem;">No tienes metas establecidas</p>
                            <button class="btn btn-primary" onclick="window.location.href='metas.html'">Crear Mi Primera Meta</button>
                        </div>
                    `;
                }
            } catch (error) {
                console.error('Error cargando metas:', error);
                metasGrid.innerHTML = `
                    <div class="goal-item" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: var(--warning); margin-bottom: 1rem;"></i>
                        <p style="color: var(--text-secondary);">Error al cargar las metas</p>
                    </div>
                `;
            }
        }

        // Obtener unidad para cada tipo de meta
        function getUnidad(tipo) {
            const unidades = {
                'peso': 'kg',
                'calorias': 'kcal',
                'proteinas': 'g',
                'carbohidratos': 'g',
                'grasas': 'g'
            };
            return unidades[tipo] || '';
        }

        // Cerrar sesión
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

        // Cerrar sidebar al redimensionar la ventana
        window.addEventListener('resize', function() {
            if (window.innerWidth > 992 && sidebarOpen) {
                toggleSidebar();
            }
        });