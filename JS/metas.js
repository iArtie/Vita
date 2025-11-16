 let currentUser = null;
        let editingMeta = null;
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
                loadMetas();
            } else {
                window.location.href = 'login.html';
            }
        }

        async function loadMetas() {
            if (!currentUser) return;

            try {
                const response = await fetch(`meta/meta_usuario_obtener.php?usuario_id=${currentUser.id}`);
                const data = await response.json();
                
                const container = document.getElementById('metasContainer');
                
                if (data.success && data.data.length > 0) {
                    container.innerHTML = '<div class="metas-grid" id="metasGrid"></div>';
                    const grid = document.getElementById('metasGrid');
                    
                    data.data.forEach(meta => {
                        const metaCard = createMetaCard(meta);
                        grid.appendChild(metaCard);
                    });
                } else {
                    container.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-bullseye"></i>
                            <h3>No tienes metas establecidas</h3>
                            <p>Comienza creando tu primera meta para llevar un mejor control de tu salud.</p>
                            <button class="btn btn-primary" onclick="openModal()" style="margin-top: 1rem;">
                                <i class="fas fa-plus"></i>
                                Crear Mi Primera Meta
                            </button>
                        </div>
                    `;
                }
            } catch (error) {
                console.error('Error cargando metas:', error);
                CustomAlert.show('Error al cargar las metas', 'error');
            }
        }

        function createMetaCard(meta) {
            const card = document.createElement('div');
            card.className = 'meta-card';
            
            const iconInfo = getMetaIcon(meta.tipo);
            
            card.innerHTML = `
                <div class="meta-header">
                    <div class="meta-icon" style="background: ${iconInfo.color}">
                        <i class="fas ${iconInfo.icon}"></i>
                    </div>
                    <div class="meta-actions">
                        <button class="btn-icon btn-edit" onclick="editMeta('${meta.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteMeta('${meta.id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="meta-title">${iconInfo.title}</div>
                <div class="meta-value">${meta.valor_objetivo} ${iconInfo.unit}</div>
                <div class="meta-type">Objetivo ${meta.tipo}</div>
                <div class="meta-status ${meta.estado === 'activa' ? 'status-active' : 'status-completed'}">
                    ${meta.estado === 'activa' ? '🟢 Activa' : '✅ Completada'}
                </div>
            `;
            
            return card;
        }

        function getMetaIcon(tipo) {
            const icons = {
                'peso': { icon: 'fa-weight', color: 'var(--success)', title: 'Control de Peso', unit: 'kg' },
                'calorias': { icon: 'fa-fire', color: 'var(--warning)', title: 'Control Calórico', unit: 'kcal' },
                'proteinas': { icon: 'fa-dumbbell', color: 'var(--info)', title: 'Proteínas', unit: 'g' },
                'carbohidratos': { icon: 'fa-bread-slice', color: 'var(--primary)', title: 'Carbohidratos', unit: 'g' },
                'grasas': { icon: 'fa-oil-can', color: 'var(--accent)', title: 'Grasas', unit: 'g' }
            };
            return icons[tipo] || { icon: 'fa-bullseye', color: 'var(--primary)', title: 'Meta', unit: '' };
        }

        function openModal(meta = null) {
            editingMeta = meta;
            const modal = document.getElementById('metaModal');
            const title = document.getElementById('modalTitle');
            const form = document.getElementById('metaForm');
            
            if (meta) {
                title.textContent = 'Editar Meta';
                document.getElementById('metaId').value = meta.id;
                document.getElementById('metaTipo').value = meta.tipo;
                document.getElementById('metaValor').value = meta.valor_objetivo;
                document.getElementById('metaEstado').value = meta.estado;
            } else {
                title.textContent = 'Nueva Meta';
                form.reset();
            }
            
            modal.style.display = 'flex';
        }

        function closeModal() {
            const modal = document.getElementById('metaModal');
            modal.style.display = 'none';
            editingMeta = null;
        }

        document.getElementById('metaForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                id: document.getElementById('metaId').value || generateId(),
                usuario_id: currentUser.id,
                tipo: document.getElementById('metaTipo').value,
                valor_objetivo: parseFloat(document.getElementById('metaValor').value),
                estado: document.getElementById('metaEstado').value
            };

            try {
                const url = editingMeta ? 'meta/meta_modificar.php' : 'meta/meta_registrar.php';
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                
                if (result.success) {
                    closeModal();
                    loadMetas();
                    CustomAlert.show(editingMeta ? 'Meta actualizada correctamente' : 'Meta creada correctamente', 'success');
                } else {
                    CustomAlert.show(result.message, 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                CustomAlert.show('Error al guardar la meta', 'error');
            }
        });

        async function editMeta(metaId) {
            try {
                const response = await fetch(`meta/meta_usuario_obtener.php?usuario_id=${currentUser.id}`);
                const data = await response.json();
                
                if (data.success) {
                    const meta = data.data.find(m => m.id === metaId);
                    if (meta) {
                        openModal(meta);
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                CustomAlert.show('Error al cargar la meta', 'error');
            }
        }

        async function deleteMeta(metaId) {
            if (confirm('¿Estás seguro de que quieres eliminar esta meta?')) {
                try {
                    const response = await fetch(`meta/meta_eliminar.php?id=${metaId}`);
                    const result = await response.json();
                    
                    if (result.success) {
                        loadMetas();
                        CustomAlert.show('Meta eliminada correctamente', 'success');
                    } else {
                        CustomAlert.show(result.message, 'error');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    CustomAlert.show('Error al eliminar la meta', 'error');
                }
            }
        }

        function generateId() {
            return 'meta_' + Math.random().toString(36).substr(2, 9);
        }

        // Cerrar modal al hacer clic fuera
        window.addEventListener('click', function(e) {
            const modal = document.getElementById('metaModal');
            if (e.target === modal) {
                closeModal();
            }
        });

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