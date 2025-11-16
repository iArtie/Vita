 let currentUser = null;
    let currentAvatarTab = 'male';
    let selectedAvatar = '';
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
            loadUserProfile();
            updateStats();
        } else {
            window.location.href = 'login.html';
        }
    }

    async function loadUserProfile() {
        if (!currentUser) return;

        try {
            const response = await fetch(`usuarios/perfil_obtener.php?usuario_id=${currentUser.id}`);
            const data = await response.json();
            
            if (data.success) {
                const user = data.data;
                fillForm(user);
                selectedAvatar = user.avatar_id;
                
                // Actualizar el preview del avatar con la ruta correcta
                updateAvatarPreview();
                
                // Cargar avatares según el avatar actual
                if (selectedAvatar) {
                    const initialTab = selectedAvatar.includes('female') ? 'female' : 'male';
                    currentAvatarTab = initialTab;
                    loadAvatars(initialTab);
                    
                    // Actualizar tab activo
                    document.querySelectorAll('.avatar-tab').forEach(tab => {
                        tab.classList.remove('active');
                        if (tab.textContent.includes(initialTab === 'female' ? 'Femeninos' : 'Masculinos')) {
                            tab.classList.add('active');
                        }
                    });
                    
                    // Asegurar que el avatar esté seleccionado en la grid
                    setTimeout(() => {
                        document.querySelectorAll('.avatar-option').forEach(avatar => {
                            if (avatar.alt === selectedAvatar) {
                                avatar.classList.add('selected');
                            }
                        });
                    }, 100);
                } else {
                    // Si no hay avatar seleccionado, cargar masculinos por defecto
                    loadAvatars('male');
                }
            } else {
                showAlert('Error cargando perfil: ' + data.message, 'error');
            }
        } catch (error) {
            console.error('Error cargando perfil:', error);
            showAlert('Error al cargar el perfil', 'error');
        }
    }

    function fillForm(user) {
        document.getElementById('nombre').value = user.nombre || '';
        document.getElementById('apellido').value = user.apellido || '';
        document.getElementById('username').value = user.username || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('genero').value = user.genero || 'M';
        document.getElementById('fechaNacimiento').value = user.fecha_nacimiento || '';
        document.getElementById('altura').value = user.altura_cm || '';
        document.getElementById('peso').value = user.peso_kg || '';

        // Actualizar preview
        document.getElementById('previewUsername').textContent = user.username;
        document.getElementById('previewLevel').textContent = `Nivel ${user.level || 1}`;
    }

    function updateStats() {
        if (currentUser) {
            document.getElementById('statLevel').textContent = currentUser.level || 1;
            document.getElementById('statPoints').textContent = currentUser.points || 0;
            document.getElementById('statRacha').textContent = currentUser.racha || 0;
            document.getElementById('statMissions').textContent = currentUser.completed_missions || 0;
        }
    }

    function switchAvatarTab(gender) {
        currentAvatarTab = gender;
        
        // Actualizar tabs activos
        document.querySelectorAll('.avatar-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Cargar avatares del género seleccionado
        loadAvatars(gender);
    }

    function loadAvatars(gender) {
        const avatarGrid = document.getElementById('avatarGrid');
        const basePath = 'assets/avatars/';
        const avatarCount = 10;

        avatarGrid.innerHTML = '';

        for (let i = 1; i <= avatarCount; i++) {
            const avatarNumber = i.toString().padStart(2, '0');
            const avatarName = `${gender}_avatar_${avatarNumber}`;
            const avatarPath = `${basePath}${gender}/${avatarName}.png`;
            
            const avatarElement = document.createElement('img');
            avatarElement.className = `avatar-option ${selectedAvatar === avatarName ? 'selected' : ''}`;
            avatarElement.src = avatarPath;
            avatarElement.alt = avatarName;
            avatarElement.onclick = () => selectAvatar(avatarName, avatarPath);
            avatarElement.onerror = function() {
                // Fallback si la imagen no carga
                this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAiIGhlaWdodD0iNzAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiByeD0iMjUiIGZpbGw9IiM0ZTdhZTYiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPgo8cGF0aCBkPSJNMjAgMjF2LTJhNCA0IDAgMCAwLTQtNEg4YTQgNCAwIDAgMC00IDR2MiIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiLz4KPC9zdmc+Cjwvc3ZnPg==';
            };
            
            avatarGrid.appendChild(avatarElement);
        }
    }

    function selectAvatar(avatarName, avatarPath) {
        // Remover selección anterior
        document.querySelectorAll('.avatar-option').forEach(avatar => {
            avatar.classList.remove('selected');
        });
        
        // Agregar selección nueva
        event.target.classList.add('selected');
        
        // Actualizar avatar seleccionado
        selectedAvatar = avatarName;
        document.getElementById('selectedAvatar').value = avatarName;
        
        // Actualizar preview
        document.getElementById('avatarPreview').src = avatarPath;
    }

    function updateAvatarPreview() {
        if (selectedAvatar) {
            // Determinar la carpeta basándose en el avatar_id
            const avatarFolder = selectedAvatar.includes('female') ? 'female' : 'male';
            const avatarPath = `assets/avatars/${avatarFolder}/${selectedAvatar}.png`;
            document.getElementById('avatarPreview').src = avatarPath;
            document.getElementById('selectedAvatar').value = selectedAvatar;
        } else {
            // Avatar por defecto si no hay selección
            document.getElementById('avatarPreview').src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDUwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHJ4PSIyNSIgZmlsbD0iIzRlN2FlNiIvPgo8c3ZnIHg9IjEyIiB5PSIxMiIgd2lkdGg9IjI2IiBoZWlnaHQ9IjI2IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiI+CjxwYXRoIGQ9Ik0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIvPgo8L3N2Zz4KPC9zdmc+';
            document.getElementById('selectedAvatar').value = '';
        }
    }

    function togglePasswordSection() {
        const passwordFields = document.getElementById('passwordFields');
        const toggleSwitch = document.getElementById('passwordToggle');
        
        if (passwordFields.style.display === 'none') {
            passwordFields.style.display = 'block';
            toggleSwitch.classList.add('active');
        } else {
            passwordFields.style.display = 'none';
            toggleSwitch.classList.remove('active');
            // Limpiar campos de contraseña
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        }
    }

    async function saveProfile() {
        if (!currentUser) return;

        // Obtener el valor actual del avatar seleccionado
        const avatarToSend = document.getElementById('selectedAvatar').value || selectedAvatar;
        
        if (!avatarToSend) {
            showAlert('Por favor selecciona un avatar', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('usuario_id', currentUser.id);
        formData.append('nombre', document.getElementById('nombre').value);
        formData.append('apellido', document.getElementById('apellido').value);
        formData.append('username', document.getElementById('username').value);
        formData.append('email', document.getElementById('email').value);
        formData.append('genero', document.getElementById('genero').value);
        formData.append('fecha_nacimiento', document.getElementById('fechaNacimiento').value);
        formData.append('altura_cm', document.getElementById('altura').value);
        formData.append('peso_kg', document.getElementById('peso').value);
        formData.append('avatar_id', avatarToSend);

        console.log('Enviando avatar_id:', avatarToSend); // Para debug

        // Verificar si se quiere cambiar la contraseña
        const cambiarPassword = document.getElementById('passwordFields').style.display === 'block';
        if (cambiarPassword) {
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (!currentPassword) {
                showAlert('Debes ingresar tu contraseña actual', 'error');
                return;
            }

            if (newPassword !== confirmPassword) {
                showAlert('Las contraseñas nuevas no coinciden', 'error');
                return;
            }

            if (newPassword.length < 6) {
                showAlert('La nueva contraseña debe tener al menos 6 caracteres', 'error');
                return;
            }

            formData.append('cambiar_password', 'true');
            formData.append('password_actual', currentPassword);
            formData.append('nueva_password', newPassword);
        }

        try {
            const response = await fetch('usuarios/perfil_actualizar.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                showAlert('Perfil actualizado correctamente', 'success');
                
                // Actualizar datos en localStorage
                const updatedUser = {
                    ...currentUser,
                    nombre: document.getElementById('nombre').value,
                    apellido: document.getElementById('apellido').value,
                    username: document.getElementById('username').value,
                    email: document.getElementById('email').value,
                    genero: document.getElementById('genero').value,
                    fecha_nacimiento: document.getElementById('fechaNacimiento').value,
                    altura_cm: document.getElementById('altura').value,
                    peso_kg: document.getElementById('peso').value,
                    avatar_id: avatarToSend
                };
                
                localStorage.setItem('vita_user_data', JSON.stringify(updatedUser));
                currentUser = updatedUser;
                
                // Actualizar preview
                document.getElementById('previewUsername').textContent = updatedUser.username;
                
                // Cerrar sección de contraseña si estaba abierta
                if (cambiarPassword) {
                    togglePasswordSection();
                }
                
            } else {
                showAlert(result.message, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('Error al actualizar el perfil', 'error');
        }
    }

    function showAlert(message, type) {
        const alert = document.getElementById('alert');
        alert.textContent = message;
        alert.className = `alert alert-${type}`;
        alert.style.display = 'block';
        
        setTimeout(() => {
            alert.style.display = 'none';
        }, 5000);
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