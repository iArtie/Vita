// Variables globales para el usuario
let currentUser = null;
let selectedAvatar = '';
let currentAvatarTab = 'male';

// Función para cambiar entre pestañas de avatares
function switchAvatarTab(gender) {
    currentAvatarTab = gender;

    document.querySelectorAll('.avatar-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');

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

    if (!selectedAvatar && avatarGrid.firstChild) {
        const firstAvatar = avatarGrid.firstChild;
        const avatarName = `${gender}_avatar_01`;
        const avatarPath = `${basePath}${gender}/${avatarName}.png`;
        selectAvatar(avatarName, avatarPath);
    }
}

// Función para seleccionar avatar
function selectAvatar(avatarName, avatarPath) {
    document.querySelectorAll('.avatar-option').forEach(avatar => {
        avatar.classList.remove('selected');
    });

    event.currentTarget.classList.add('selected');

    const preview = document.getElementById('avatarPreview');
    const avatarNameDisplay = document.getElementById('avatarName');

    preview.src = avatarPath;
    preview.alt = avatarName;

    const avatarType = avatarName.includes('male') ? 'Masculino' : 'Femenino';
    const avatarNumber = avatarName.split('_').pop();
    avatarNameDisplay.textContent = `Avatar ${avatarType} ${avatarNumber}`;

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

    loadAvatars('male');
    currentAvatarTab = 'male';

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
                if (data.rol === 'admin') {
                    setTimeout(() => {
                        window.location.href = 'index_admin.html';
                    }, 1000);
                } else {
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                }
            } else {
                console.error('Error verificando rol:', data.message);
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            }
        })
        .catch(error => {
            console.error('Error al verificar rol:', error);
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        });
}

// Manejar login
document.getElementById('loginFormElement').addEventListener('submit', function (e) {
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

                localStorage.setItem('vita_user_id', data.user.id);
                localStorage.setItem('vita_username', data.user.username);
                localStorage.setItem('vita_email', data.user.email);
                localStorage.setItem('vita_avatar_id', data.user.avatar_id);
                localStorage.setItem('vita_user_data', JSON.stringify(data.user));

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
document.getElementById('registerFormElement').addEventListener('submit', function (e) {
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

                const altura = parseFloat(document.getElementById('regAltura').value);
                const peso = parseFloat(document.getElementById('regPeso').value);
                const objetivo = document.getElementById('regObjetivo').value;
                const nivelActividad = document.getElementById('regNivelActividad').value;

                if (data.user && data.user.id) {
                    crearMetasAutomaticas(data.user.id, altura, peso, objetivo, nivelActividad);
                } else {
                    const username = document.getElementById('regUsername').value;
                    const password = document.getElementById('regPassword').value;
                    hacerLoginDespuesRegistro(username, password, altura, peso, objetivo, nivelActividad);
                }

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
            console.error('Error en registro:', error);
            registerAlert.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle me-2"></i>Error de conexión: ${error.message}
            </div>
        `;
        });
});

// Función para hacer login automático después del registro
function hacerLoginDespuesRegistro(username, password, altura, peso, objetivo, nivelActividad) {
    const loginData = new FormData();
    loginData.append('username', username);
    loginData.append('password', password);

    fetch('usuarios/login.php', {
        method: 'POST',
        body: loginData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.user && data.user.id) {
                crearMetasAutomaticas(data.user.id, altura, peso, objetivo, nivelActividad);

                localStorage.setItem('vita_user_id', data.user.id);
                localStorage.setItem('vita_username', data.user.username);
                localStorage.setItem('vita_email', data.user.email);
                localStorage.setItem('vita_avatar_id', data.user.avatar_id);
                localStorage.setItem('vita_user_data', JSON.stringify(data.user));
            }
        })
        .catch(error => {
            console.error('Error en login automático:', error);
        });
}

// Función para crear metas automáticas
function crearMetasAutomaticas(usuarioId, altura, peso, objetivo, nivelActividad) {
    function calcularPesoIdeal(altura) {
        return Math.round((altura - 100) * 0.9 * 10) / 10;
    }

    function calcularCalorias(pesoIdeal, objetivo, nivelActividad) {
        const caloriasBase = pesoIdeal * 25;
        
        const multiplicadores = {
            'sedentario': 1.2,
            'ligero': 1.375,
            'moderado': 1.55,
            'activo': 1.725,
            'muy_activo': 1.9
        };
        
        let calorias = caloriasBase * (multiplicadores[nivelActividad] || 1.55);
        
        if (objetivo === 'perder_peso') {
            calorias -= 300;
        } else if (objetivo === 'ganar_masa') {
            calorias += 300;
        }
        
        return Math.round(calorias);
    }

    function calcularProteinas(pesoIdeal) {
        return Math.round(pesoIdeal * 1.5);
    }

    function calcularCarbohidratos(caloriasTotales) {
        const caloriasCarbohidratos = caloriasTotales * 0.5;
        return Math.round(caloriasCarbohidratos / 4);
    }

    function calcularGrasas(caloriasTotales) {
        const caloriasGrasas = caloriasTotales * 0.3;
        return Math.round(caloriasGrasas / 9);
    }

    const pesoIdeal = calcularPesoIdeal(altura);
    const caloriasIdeal = calcularCalorias(pesoIdeal, objetivo, nivelActividad);
    const proteinasIdeal = calcularProteinas(pesoIdeal);
    const carbohidratosIdeal = calcularCarbohidratos(caloriasIdeal);
    const grasasIdeal = calcularGrasas(caloriasIdeal);

    const metas = [
        { tipo: 'peso', valor: pesoIdeal },
        { tipo: 'calorias', valor: caloriasIdeal },
        { tipo: 'proteinas', valor: proteinasIdeal },
        { tipo: 'carbohidratos', valor: carbohidratosIdeal },
        { tipo: 'grasas', valor: grasasIdeal }
    ];

    let metasCreadas = 0;
    const totalMetas = metas.length;

    metas.forEach(meta => {
        const metaData = {
            usuario_id: usuarioId,
            tipo: meta.tipo,
            valor_objetivo: meta.valor,
            estado: 'activa'
        };

        fetch('meta/meta_registrar.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(metaData)
        })
            .then(response => response.json())
            .then(data => {
                metasCreadas++;
                if (!data.success) {
                    console.error('Error creando meta:', data.message);
                }
            })
            .catch(error => {
                metasCreadas++;
                console.error('Error de conexión:', error);
            });
    });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    const userId = localStorage.getItem('vita_user_id');
    if (userId) {
        verificarYRederigir(userId);
    }

    const fechaInput = document.getElementById('regFechaNacimiento');
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
    fechaInput.max = maxDate.toISOString().split('T')[0];

    const defaultDate = new Date(today.getFullYear() - 25, today.getMonth(), today.getDate());
    fechaInput.value = defaultDate.toISOString().split('T')[0];
});
