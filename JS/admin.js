// Variables globales
let currentUser = null;
let sidebarOpen = false;
let currentAvatarTab = 'male';
let selectedAvatar = '';

// Cargar datos del usuario al iniciar
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    initializeNavigation();
    loadSettings();
    
    // Cerrar sidebar al hacer clic en un enlace (móviles)
    document.querySelectorAll('.menu-link').forEach(link => {
        link.addEventListener('click', function(e) {
            if (!e.target.getAttribute('onclick') && window.innerWidth <= 992) {
                toggleSidebar();
            }
        });
    });

    // Inicializar modales
    initializeModals();
});

// Inicializar navegación entre secciones
function initializeNavigation() {
    const menuLinks = document.querySelectorAll('.menu-link[data-section]');
    
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            
            // Actualizar menú activo
            document.querySelectorAll('.menu-item').forEach(item => {
                item.classList.remove('active');
            });
            this.parentElement.classList.add('active');
            
            // Mostrar sección correspondiente
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(`section-${targetSection}`).classList.add('active');
            
            // Si es la sección de perfil, cargar datos
            if (targetSection === 'perfil') {
                loadUserProfile();
            }
        });
    });
}

// Inicializar modales
function initializeModals() {
    // Modal de editar usuario
    const modalEditarUsuario = document.getElementById('modalEditarUsuario');
    const btnCancelarEdicion = document.getElementById('btnCancelarEdicion');
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', function() {
            modalEditarUsuario.style.display = 'none';
        });
    });
    
    btnCancelarEdicion.addEventListener('click', function() {
        modalEditarUsuario.style.display = 'none';
    });
    
    // Cerrar modal al hacer clic fuera del contenido
    window.addEventListener('click', function(event) {
        if (event.target === modalEditarUsuario) {
            modalEditarUsuario.style.display = 'none';
        }
    });
}

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
        // Verificar rol de administrador
        verifyAdminRole();
    } else {
        // Si no hay datos de usuario, redirigir al login
        window.location.href = 'login.html';
    }
}

// Verificar si el usuario tiene rol de administrador
async function verifyAdminRole() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`usuarios/verificar_rol.php?usuario_id=${currentUser.id}`);
        const data = await response.json();
        
        if (data.success && data.rol === 'admin') {
            // Usuario es administrador, cargar interfaz
            updateUserInterface();
        } else {
            // Usuario no es administrador, cerrar sesión
            showAlertMessage('No tienes permisos de administrador', 'error');
        
                ForceLogout();
        
        }
    } catch (error) {
        console.error('Error verificando rol:', error);
        showAlertMessage('Error al verificar permisos', 'error');
        setTimeout(() => {
            logout();
        }, 2000);
    }
}

// Actualizar interfaz con datos del usuario
function updateUserInterface() {
    if (currentUser) {
        // Usar username en lugar de nombre y apellido
        document.getElementById('userName').textContent = currentUser.username;
        document.getElementById('mobileUserName').textContent = currentUser.username;
        
        // Actualizar avatar
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
                        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiByeD0iMjUiIGZpbGw9IiM0ZTdhZTYiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPgo8cGF0aCBkPSJNMjAgMjF2LTJhNCA0IDAgMCAwLTQgNEg4YTQgNCAwIDAgMC00IDR2MiIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiLz4KPC9zdmc+Cjwvc3ZnPg==';
                    };
                }
            });
        }
    }
}

// Cargar perfil del usuario
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
            
            // Actualizar estadísticas
            updateStats(user);
        } else {
            showAlertMessage('Error cargando perfil: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error cargando perfil:', error);
        showAlertMessage('Error al cargar el perfil', 'error');
    }
}

// Llenar formulario con datos del usuario
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
}

// Actualizar estadísticas
function updateStats(user) {
    document.getElementById('statLevel').textContent = user.level || 1;
    document.getElementById('statPoints').textContent = user.points || 0;
    document.getElementById('statRacha').textContent = user.racha || 0;
    document.getElementById('statMissions').textContent = user.completed_missions || 0;
}

// Cambiar pestaña de avatares
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

// Cargar avatares
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
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAiIGhlaWdodD0iNzAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiByeD0iMjUiIGZpbGw9IiM0ZTdhZTYiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPgo8cGF0aCBkPSJNMjAgMjF2LTJhNCA0IDAgMCAwLTQgNEg4YTQgNCAwIDAgMC00IDR2MiIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiLz4KPC9zdmc+Cjwvc3ZnPg==';
        };
        
        avatarGrid.appendChild(avatarElement);
    }
}

// Seleccionar avatar
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

// Actualizar preview del avatar
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

// Alternar sección de contraseña
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

// Guardar perfil
async function saveProfile() {
    if (!currentUser) return;

    // Obtener el valor actual del avatar seleccionado
    const avatarToSend = document.getElementById('selectedAvatar').value || selectedAvatar;
    
    if (!avatarToSend) {
        showAlertMessage('Por favor selecciona un avatar', 'error');
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

    // Verificar si se quiere cambiar la contraseña
    const cambiarPassword = document.getElementById('passwordFields').style.display === 'block';
    if (cambiarPassword) {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!currentPassword) {
            showAlertMessage('Debes ingresar tu contraseña actual', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showAlertMessage('Las contraseñas nuevas no coinciden', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showAlertMessage('La nueva contraseña debe tener al menos 6 caracteres', 'error');
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
            showAlertMessage('Perfil actualizado correctamente', 'success');
            
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
            document.getElementById('userName').textContent = updatedUser.username;
            document.getElementById('mobileUserName').textContent = updatedUser.username;
            
            // Actualizar avatar en header
            const avatarFolder = avatarToSend.includes('female') ? 'female' : 'male';
            const avatarPath = `assets/avatars/${avatarFolder}/${avatarToSend}.png`;
            document.getElementById('userAvatar').src = avatarPath;
            document.getElementById('mobileUserAvatar').src = avatarPath;
            
            // Cerrar sección de contraseña si estaba abierta
            if (cambiarPassword) {
                togglePasswordSection();
            }
            
        } else {
            showAlertMessage(result.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlertMessage('Error al actualizar el perfil', 'error');
    }
}

// Cargar configuraciones
function loadSettings() {
    const savedTheme = localStorage.getItem('vita_theme') || 'default';
    selectTheme(savedTheme, false);
    
    const darkModeEnabled = localStorage.getItem('vita_dark_mode') === 'true';
    const toggle = document.getElementById('darkModeToggle');
    if (darkModeEnabled) {
        toggle.classList.add('active');
    } else {
        toggle.classList.remove('active');
    }
}

// Seleccionar tema
function selectTheme(themeName, showAlert = true) {
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('active');
    });
    
    document.querySelector(`.theme-${themeName}`).classList.add('active');
    
    if (window.themeManager) {
        window.themeManager.setTheme(themeName);
    }
    
    if (showAlert) {
        showAlertMessage('Tema cambiado correctamente', 'success');
    }
}

// Alternar modo oscuro
function toggleDarkMode() {
    const toggle = document.getElementById('darkModeToggle');
    
    if (window.themeManager) {
        window.themeManager.toggleDarkMode();
        
        const isDarkMode = window.themeManager.darkMode;
        if (isDarkMode) {
            toggle.classList.add('active');
        } else {
            toggle.classList.remove('active');
        }
        
        showAlertMessage('Modo oscuro ' + (isDarkMode ? 'activado' : 'desactivado'), 'success');
    }
}

// Exportar datos
function exportData() {
    if (!currentUser) return;

    const data = {
        usuario: currentUser,
        fecha_exportacion: new Date().toISOString(),
        mensaje: "Estos son tus datos exportados de Vita"
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vita_datos_${currentUser.username}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showAlertMessage('Datos exportados correctamente', 'success');
}

// Restablecer configuración
function resetConfiguration() {
    if (confirm('¿Estás seguro de que quieres restablecer la configuración a los valores por defecto?')) {
        if (window.themeManager) {
            window.themeManager.setTheme('default');
            window.themeManager.setDarkMode(false);
        }
        
        loadSettings();
        showAlertMessage('Configuración restablecida correctamente', 'success');
    }
}

// Guardar configuración
function saveSettings() {
    showAlertMessage('Configuración guardada correctamente', 'success');
}

// Mostrar mensaje de alerta
function showAlertMessage(message, type) {
    if (window.CustomAlert) {
        CustomAlert.show(message, type);
    } else {
        const alertDiv = document.getElementById('resultado');
        if (alertDiv) {
            alertDiv.textContent = message;
            alertDiv.className = `alert alert-${type}`;
            alertDiv.style.display = 'block';
            setTimeout(() => {
                alertDiv.style.display = 'none';
            }, 3000);
        }
    }
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

// Cerrar sesión forzada
function ForceLogout() {
        localStorage.removeItem('vita_user_data');
        localStorage.removeItem('vita_user_id');
        localStorage.removeItem('vita_username');
        localStorage.removeItem('vita_email');
        localStorage.removeItem('vita_avatar_id');
        window.location.href = 'login.html';
}

// Cerrar sidebar al redimensionar la ventana
window.addEventListener('resize', function() {
    if (window.innerWidth > 992 && sidebarOpen) {
        toggleSidebar();
    }
});