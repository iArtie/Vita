   // Variables globales para el usuario
        let currentUser = null;
        let selectedAvatar = '';
        let currentAvatarTab = 'male';

        // Función para cambiar entre pestañas de avatares
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

        // Función para cargar avatares
        function loadAvatars(gender) {
            const avatarGrid = document.getElementById('avatarGrid');
            const basePath = 'assets/avatars/';
            const avatarCount = 10;

            avatarGrid.innerHTML = '';

            for (let i = 1; i <= avatarCount; i++) {
                const avatarNumber = i.toString().padStart(2, '0');
                const avatarName = `${gender}_avatar_${avatarNumber}`;
                const avatarPath = `${basePath}${gender}/${avatarName}.png`;
                
                const avatarElement = document.createElement('div');
                avatarElement.className = 'avatar-option';
                avatarElement.innerHTML = `
                    <img src="${avatarPath}" alt="${avatarName}" class="avatar-option" 
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiByeD0iMjUiIGZpbGw9IiM0ZTdhZTYiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPgo8cGF0aCBkPSJNMjAgMjF2LTJhNCA0IDAgMCAwLTQtNEg4YTQgNCAwIDAgMC00IDR2MiIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiLz4KPC9zdmc+Cjwvc3ZnPg=='">
                    <div class="avatar-label">${avatarNumber}</div>
                `;
                
                avatarElement.onclick = () => selectAvatar(avatarName, avatarPath);
                avatarGrid.appendChild(avatarElement);
            }

            // Si no hay avatar seleccionado, seleccionar el primero
            if (!selectedAvatar && avatarGrid.firstChild) {
                const firstAvatar = avatarGrid.firstChild;
                const avatarName = `${gender}_avatar_01`;
                const avatarPath = `${basePath}${gender}/${avatarName}.png`;
                selectAvatar(avatarName, avatarPath);
            }
        }

        // Función para seleccionar avatar
        function selectAvatar(avatarName, avatarPath) {
            // Remover selección anterior
            document.querySelectorAll('.avatar-option').forEach(avatar => {
                avatar.classList.remove('selected');
            });

            // Agregar selección nueva
            event.currentTarget.classList.add('selected');
            
            // Actualizar preview
            const preview = document.getElementById('avatarPreview');
            const avatarNameDisplay = document.getElementById('avatarName');
            
            preview.src = avatarPath;
            preview.alt = avatarName;
            
            // Mostrar nombre del avatar de forma más amigable
            const avatarType = avatarName.includes('male') ? 'Masculino' : 'Femenino';
            const avatarNumber = avatarName.split('_').pop();
            avatarNameDisplay.textContent = `Avatar ${avatarType} ${avatarNumber}`;
            
            // Guardar selección
            selectedAvatar = avatarName;
            document.getElementById('regAvatar').value = selectedAvatar;
        }

        // Mostrar/ocultar formularios
        function showLogin() {
            document.getElementById('registerForm').classList.remove('active');
            document.getElementById('loginForm').classList.add('active');
            document.getElementById('loginAlert').innerHTML = '';
            document.getElementById('registerAlert').innerHTML = '';
        }

        function showRegister() {
            document.getElementById('loginForm').classList.remove('active');
            document.getElementById('registerForm').classList.add('active');
            document.getElementById('loginAlert').innerHTML = '';
            document.getElementById('registerAlert').innerHTML = '';
            
            // Cargar avatares masculinos por defecto
            loadAvatars('male');
            currentAvatarTab = 'male';
            
            // Resetear tabs
            document.querySelectorAll('.avatar-tab').forEach((tab, index) => {
                tab.classList.remove('active');
                if (index === 0) tab.classList.add('active');
            });
        }

        // Función para verificar el rol y redirigir
        function verificarYRederigir(userId) {
            fetch(`usuarios/verificar_rol.php?usuario_id=${userId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Redirigir según el rol
                    if (data.rol === 'admin') {
                        setTimeout(() => {
                            window.location.href = 'index_admin.html';
                        }, 1000);
                    } else {
                        // Por defecto asumimos que es cliente
                        setTimeout(() => {
                            window.location.href = 'dashboard.html';
                        }, 1000);
                    }
                } else {
                    // Si hay error al verificar el rol, redirigir al dashboard por defecto
                    console.error('Error verificando rol:', data.message);
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                }
            })
            .catch(error => {
                console.error('Error al verificar rol:', error);
                // En caso de error, redirigir al dashboard por defecto
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            });
        }

        // Manejar login
        document.getElementById('loginFormElement').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const loginAlert = document.getElementById('loginAlert');
            
            fetch('usuarios/login.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    loginAlert.innerHTML = `
                        <div class="alert alert-success">
                            <i class="fas fa-check-circle me-2"></i>${data.message}
                        </div>
                    `;
                    
                    // Guardar usuario en localStorage
                    localStorage.setItem('vita_user_id', data.user.id);
                    localStorage.setItem('vita_username', data.user.username);
                    localStorage.setItem('vita_email', data.user.email);
                    localStorage.setItem('vita_avatar_id', data.user.avatar_id);
                    localStorage.setItem('vita_user_data', JSON.stringify(data.user));
                    
                    // Verificar el rol del usuario y redirigir según corresponda
                    verificarYRederigir(data.user.id);
                } else {
                    loginAlert.innerHTML = `
                        <div class="alert alert-danger">
                            <i class="fas fa-exclamation-circle me-2"></i>${data.message}
                        </div>
                    `;
                }
            })
            .catch(error => {
                loginAlert.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle me-2"></i>Error de conexión: ${error}
                    </div>
                `;
            });
        });

        // Manejar registro
        document.getElementById('registerFormElement').addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!selectedAvatar) {
                document.getElementById('registerAlert').innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle me-2"></i>Por favor selecciona un avatar.
                    </div>
                `;
                return;
            }
            
            const formData = new FormData(this);
            const registerAlert = document.getElementById('registerAlert');
            
            fetch('usuarios/registrar.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    registerAlert.innerHTML = `
                        <div class="alert alert-success">
                            <i class="fas fa-check-circle me-2"></i>${data.message}
                        </div>
                    `;
                    // Limpiar formulario y mostrar login después de 2 segundos
                    setTimeout(() => {
                        document.getElementById('registerFormElement').reset();
                        showLogin();
                    }, 2000);
                } else {
                    registerAlert.innerHTML = `
                        <div class="alert alert-danger">
                            <i class="fas fa-exclamation-circle me-2"></i>${data.message}
                        </div>
                    `;
                }
            })
            .catch(error => {
                registerAlert.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle me-2"></i>Error de conexión: ${error}
                    </div>
                `;
            });
        });

        // Inicializar cuando el DOM esté listo
        document.addEventListener('DOMContentLoaded', function() {
            // Verificar si ya hay una sesión activa
            const userId = localStorage.getItem('vita_user_id');
            if (userId) {
                // Si ya hay sesión, verificar el rol y redirigir
                verificarYRederigir(userId);
            }
            
            // Establecer fecha máxima para fecha de nacimiento (13 años atrás como mínimo)
            const fechaInput = document.getElementById('regFechaNacimiento');
            const today = new Date();
            const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
            fechaInput.max = maxDate.toISOString().split('T')[0];
            
            // Establecer fecha por defecto (25 años atrás)
            const defaultDate = new Date(today.getFullYear() - 25, today.getMonth(), today.getDate());
            fechaInput.value = defaultDate.toISOString().split('T')[0];
        });