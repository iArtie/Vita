
        function renderAlimentos() {
            const container = document.getElementById('alimentosList');
            
            if (alimentos.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-utensils"></i>
                        <h3>No hay alimentos disponibles</h3>
                    </div>
                `;
                return;
            }

            let html = '<div class="table-wrapper"><table class="table"><thead><tr><th>Nombre</th><th>Calorías/kg</th><th>Proteínas/kg</th><th>Carbohidratos/kg</th><th>Grasas/kg</th><th>Acciones</th></tr></thead><tbody>';
            
            alimentos.forEach(alimento => {
                html += `
                    <tr>
                        <td>${alimento.nombre}</td>
                        <td>${alimento.kcal_kg}</td>
                        <td>${alimento.prot_kg}</td>
                        <td>${alimento.carb_kg}</td>
                        <td>${alimento.gras_kg}</td>
                        <td>
                            <button class="btn-icon btn-edit" onclick="selectAlimento('${alimento.id}')" title="Usar este alimento">
                                <i class="fas fa-utensil-spoon"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            html += '</tbody></table></div>';
            container.innerHTML = html;
        }

        function renderAlimentosPersonalizados() {
            const container = document.getElementById('alimentosPersonalizadosList');
            
            if (alimentosPersonalizados.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-utensils"></i>
                        <h3>No tienes alimentos personalizados</h3>
                        <p>Crea tu primer alimento personalizado para registrarlo más fácilmente.</p>
                        <button class="btn btn-primary" onclick="openCustomFoodModal()" style="margin-top: 1rem;">
                            <i class="fas fa-plus"></i>
                            Crear Mi Primer Alimento
                        </button>
                    </div>
                `;
                return;
            }

            let html = '<div class="table-wrapper"><table class="table"><thead><tr><th>Nombre</th><th>Calorías/kg</th><th>Proteínas/kg</th><th>Carbohidratos/kg</th><th>Grasas/kg</th><th>Acciones</th></tr></thead><tbody>';
            
            alimentosPersonalizados.forEach(alimento => {
                html += `
                    <tr>
                        <td>${alimento.nombre}</td>
                        <td>${alimento.kcal_kg}</td>
                        <td>${alimento.prot_kg}</td>
                        <td>${alimento.carb_kg}</td>
                        <td>${alimento.gras_kg}</td>
                        <td>
                            <button class="btn-icon btn-edit" onclick="selectAlimentoPersonalizado('${alimento.id}')" title="Usar este alimento">
                                <i class="fas fa-utensil-spoon"></i>
                            </button>
                            <button class="btn-icon btn-delete" onclick="deleteAlimentoPersonalizado('${alimento.id}')" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            html += '</tbody></table></div>';
            container.innerHTML = html;
        }

        function renderRegistrosComida() {
            const container = document.getElementById('registrosList');
            
            if (registrosComida.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-history"></i>
                        <h3>No hay registros de comida</h3>
                        <p>Comienza registrando tu primera comida.</p>
                        <button class="btn btn-primary" onclick="openFoodModal()" style="margin-top: 1rem;">
                            <i class="fas fa-plus"></i>
                            Registrar Mi Primera Comida
                        </button>
                    </div>
                `;
                return;
            }

            let html = '<div class="table-wrapper"><table class="table"><thead><tr><th>Fecha</th><th>Alimento</th><th>Porción (kg)</th><th>Calorías</th><th>Proteínas</th><th>Acciones</th></tr></thead><tbody>';
            
            registrosComida.forEach(registro => {
                const alimentoNombre = registro.alimento || registro.alimento_personalizado || 'Alimento personalizado';
                const fecha = new Date(registro.fecha_hora).toLocaleString();
                
                html += `
                    <tr>
                        <td>${fecha}</td>
                        <td>${alimentoNombre}</td>
                        <td>${registro.porcion_kg}</td>
                        <td>${registro.kcal}</td>
                        <td>${registro.prot_g}g</td>
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

        // El resto del JavaScript se mantiene igual...
        let currentUser = null;
        let alimentos = [];
        let alimentosPersonalizados = [];
        let registrosComida = [];
        let sidebarOpen = false;

        document.addEventListener('DOMContentLoaded', function() {
            loadUserData();
            document.getElementById('fechaHora').value = new Date().toISOString().slice(0, 16);
            
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
                loadAlimentos();
                loadAlimentosPersonalizados();
                loadRegistrosComida();
            } else {
                window.location.href = 'login.html';
            }
        }

        async function loadAlimentos() {
            try {
                const response = await fetch('Alimentos/obtener.php');
                const data = await response.json();
                
                if (data.success) {
                    alimentos = data.data;
                    renderAlimentos();
                    updateFoodSelect();
                }
            } catch (error) {
                console.error('Error cargando alimentos:', error);
                CustomAlert.show('Error cargando alimentos', 'error');
            }
        }

        async function loadAlimentosPersonalizados() {
            if (!currentUser) return;

            try {
                const response = await fetch(`Alimentos/AlimentosPersonalizados/obtener.php?usuario_id=${currentUser.id}`);
                const data = await response.json();
                
                if (data.success) {
                    alimentosPersonalizados = data.data.filter(item => item.usuario_id === currentUser.id);
                    renderAlimentosPersonalizados();
                    updateFoodSelect();
                }
            } catch (error) {
                console.error('Error cargando alimentos personalizados:', error);
                CustomAlert.show('Error cargando alimentos personalizados', 'error');
            }
        }

        async function loadRegistrosComida() {
            if (!currentUser) return;

            try {
                const response = await fetch(`Alimentos/RegistrarComida/registro_comida_obtener.php`);
                const data = await response.json();
                
                if (data.success) {
                    registrosComida = data.data.filter(registro => registro.usuario_id === currentUser.id);
                    renderRegistrosComida();
                    updateNutritionTotals();
                }
            } catch (error) {
                console.error('Error cargando registros:', error);
                CustomAlert.show('Error cargando registros de comida', 'error');
            }
        }

        function updateFoodSelect() {
            const select = document.getElementById('alimentoSelect');
            select.innerHTML = '<option value="">Selecciona un alimento</option>';
            
            // Agregar alimentos base
            alimentos.forEach(alimento => {
                select.innerHTML += `<option value="base_${alimento.id}" data-kcal="${alimento.kcal_kg}" data-prot="${alimento.prot_kg}" data-carb="${alimento.carb_kg}" data-gras="${alimento.gras_kg}">${alimento.nombre} (Base)</option>`;
            });
            
            // Agregar alimentos personalizados
            alimentosPersonalizados.forEach(alimento => {
                select.innerHTML += `<option value="personalizado_${alimento.id}" data-kcal="${alimento.kcal_kg}" data-prot="${alimento.prot_kg}" data-carb="${alimento.carb_kg}" data-gras="${alimento.gras_kg}">${alimento.nombre} (Personalizado)</option>`;
            });
        }

        function updateNutritionTotals() {
            const today = new Date().toDateString();
            const hoyRegistros = registrosComida.filter(registro => 
                new Date(registro.fecha_hora).toDateString() === today
            );

            const totals = hoyRegistros.reduce((acc, registro) => ({
                calories: acc.calories + (parseFloat(registro.kcal) || 0),
                protein: acc.protein + (parseFloat(registro.prot_g) || 0),
                carbs: acc.carbs + (parseFloat(registro.carb_g) || 0),
                fat: acc.fat + (parseFloat(registro.gras_g) || 0)
            }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

            document.getElementById('totalCalories').textContent = Math.round(totals.calories);
            document.getElementById('totalProtein').textContent = Math.round(totals.protein);
            document.getElementById('totalCarbs').textContent = Math.round(totals.carbs);
            document.getElementById('totalFat').textContent = Math.round(totals.fat);
        }

        // Funciones de tabs
        function openTab(tabName) {
            document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            document.querySelector(`.tab[onclick="openTab('${tabName}')"]`).classList.add('active');
            document.getElementById(tabName).classList.add('active');
        }

        // Funciones de modales
        function openFoodModal() {
            document.getElementById('foodModal').style.display = 'flex';
        }

        function closeFoodModal() {
            document.getElementById('foodModal').style.display = 'none';
            document.getElementById('foodForm').reset();
            document.getElementById('porcion').value = '';
        }

        function openCustomFoodModal() {
            document.getElementById('customFoodModal').style.display = 'flex';
        }

        function closeCustomFoodModal() {
            document.getElementById('customFoodModal').style.display = 'none';
            document.getElementById('customFoodForm').reset();
        }

        // Funciones de alimentos
        function selectAlimento(alimentoId) {
            const alimento = alimentos.find(a => a.id === alimentoId);
            if (alimento) {
                document.getElementById('alimentoSelect').value = `base_${alimento.id}`;
                updateNutritionValues();
                openFoodModal();
            }
        }

        function selectAlimentoPersonalizado(alimentoId) {
            const alimento = alimentosPersonalizados.find(a => a.id === alimentoId);
            if (alimento) {
                document.getElementById('alimentoSelect').value = `personalizado_${alimento.id}`;
                updateNutritionValues();
                openFoodModal();
            }
        }

        // Actualizar valores nutricionales cuando cambia el alimento o la porción
        document.getElementById('alimentoSelect').addEventListener('change', updateNutritionValues);
        document.getElementById('porcion').addEventListener('input', updateNutritionValues);

        function updateNutritionValues() {
            const alimentoSelect = document.getElementById('alimentoSelect');
            const porcion = parseFloat(document.getElementById('porcion').value) || 0;
            const selectedOption = alimentoSelect.options[alimentoSelect.selectedIndex];
            
            if (selectedOption.value && porcion > 0) {
                const kcalPerKg = parseFloat(selectedOption.dataset.kcal);
                const protPerKg = parseFloat(selectedOption.dataset.prot);
                const carbPerKg = parseFloat(selectedOption.dataset.carb);
                const grasPerKg = parseFloat(selectedOption.dataset.gras);
                
                document.getElementById('calorias').value = (kcalPerKg * porcion).toFixed(2);
                document.getElementById('proteinas').value = (protPerKg * porcion).toFixed(2);
                document.getElementById('carbohidratos').value = (carbPerKg * porcion).toFixed(2);
                document.getElementById('grasas').value = (grasPerKg * porcion).toFixed(2);
            } else {
                document.getElementById('calorias').value = '';
                document.getElementById('proteinas').value = '';
                document.getElementById('carbohidratos').value = '';
                document.getElementById('grasas').value = '';
            }
        }

        // Form submission
        document.getElementById('foodForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const alimentoValue = document.getElementById('alimentoSelect').value;
            const [tipo, alimentoId] = alimentoValue.split('_');
            
            const formData = {
                usuario_id: currentUser.id,
                alimento_id: tipo === 'base' ? alimentoId : null,
                alimento_personalizado_id: tipo === 'personalizado' ? alimentoId : null,
                fecha_hora: document.getElementById('fechaHora').value,
                porcion_kg: parseFloat(document.getElementById('porcion').value),
                kcal: parseFloat(document.getElementById('calorias').value),
                prot_g: parseFloat(document.getElementById('proteinas').value),
                gras_g: parseFloat(document.getElementById('grasas').value),
                carb_g: parseFloat(document.getElementById('carbohidratos').value)
            };

            try {
                const response = await fetch('Alimentos/RegistrarComida/registro_comida_registrar.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                
                if (result.success) {
                    closeFoodModal();
                    loadRegistrosComida();
                    CustomAlert.show('Comida registrada correctamente. ¡+50 puntos!', 'success');
                    
                    // Actualizar puntos
                    await updateUserPoints(50, 'comida');
                    
                } else {
                    CustomAlert.show(result.message, 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                CustomAlert.show('Error al registrar la comida', 'error');
            }
        });

        document.getElementById('customFoodForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                usuario_id: currentUser.id,
                nombre: document.getElementById('customNombre').value,
                kcal_kg: parseFloat(document.getElementById('customCalorias').value),
                prot_kg: parseFloat(document.getElementById('customProteinas').value),
                carb_kg: parseFloat(document.getElementById('customCarbohidratos').value),
                gras_kg: parseFloat(document.getElementById('customGrasas').value)
            };

            try {
                const response = await fetch('Alimentos/AlimentosPersonalizados/registrar.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                
                if (result.success) {
                    closeCustomFoodModal();
                    loadAlimentosPersonalizados();
                    CustomAlert.show('Alimento personalizado creado correctamente', 'success');
                } else {
                    CustomAlert.show(result.message, 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                CustomAlert.show('Error al crear el alimento personalizado', 'error');
            }
        });

        async function deleteAlimentoPersonalizado(alimentoId) {
            if (confirm('¿Estás seguro de que quieres eliminar este alimento personalizado?')) {
                try {
                    const response = await fetch(`Alimentos/AlimentosPersonalizados/eliminar.php?id=${alimentoId}`);
                    const result = await response.json();
                    
                    if (result.success) {
                        loadAlimentosPersonalizados();
                        CustomAlert.show('Alimento eliminado correctamente', 'success');
                    } else {
                        CustomAlert.show(result.message, 'error');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    CustomAlert.show('Error al eliminar el alimento', 'error');
                }
            }
        }

        async function deleteRegistro(registroId) {
            if (confirm('¿Estás seguro de que quieres eliminar este registro?')) {
                try {
                    const response = await fetch(`Alimentos/RegistrarComida/registro_comida_eliminar.php?id=${registroId}`);
                    const result = await response.json();
                    
                    if (result.success) {
                        loadRegistrosComida();
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

        async function updateUserPoints(puntos, tipo) {
            try {
                const formData = new FormData();
                formData.append('usuario_id', currentUser.id);
                formData.append('puntos', puntos);
                formData.append('tipo_accion', tipo);

                await fetch('usuarios/puntos_actualizar.php', {
                    method: 'POST',
                    body: formData
                });

                // Actualizar racha
                const rachaFormData = new FormData();
                rachaFormData.append('usuario_id', currentUser.id);
                rachaFormData.append('tipo_registro', tipo);

                await fetch('usuarios/racha_actualizar.php', {
                    method: 'POST',
                    body: rachaFormData
                });

            } catch (error) {
                console.error('Error actualizando puntos:', error);
            }
        }

        // Cerrar modales al hacer clic fuera
        window.addEventListener('click', function(e) {
            if (e.target === document.getElementById('foodModal')) {
                closeFoodModal();
            }
            if (e.target === document.getElementById('customFoodModal')) {
                closeCustomFoodModal();
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