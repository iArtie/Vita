let currentUser = null;
let sidebarOpen = false;

document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    loadSettings();
    
    document.querySelectorAll('.menu-link').forEach(link => {
        link.addEventListener('click', function(e) {
            if (!e.target.getAttribute('onclick') && window.innerWidth <= 992) {
                toggleSidebar();
            }
        });
    });
});

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
    } else {
        window.location.href = 'login.html';
    }
}

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

function selectTheme(themeName, showAlert = true) {
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('active');
    });
    
    event.target.classList.add('active');
    
    if (window.themeManager) {
        window.themeManager.setTheme(themeName);
    }
    
    if (showAlert) {
        showAlertMessage('Tema cambiado correctamente', 'success');
    }
}

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

function saveSettings() {
    showAlertMessage('Configuración guardada correctamente', 'success');
}

function showAlertMessage(message, type) {
    if (window.CustomAlert) {
        CustomAlert.show(message, type);
    } else {
        const alertDiv = document.getElementById('alert');
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