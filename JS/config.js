// config.js - Gestión de temas y configuraciones globales
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('vita_theme') || 'default';
        this.darkMode = localStorage.getItem('vita_dark_mode') === 'true';
        this.init();
    }

    init() {
        this.applyTheme();
        this.applyDarkMode();
        this.injectThemeStyles();
    }

    injectThemeStyles() {
        // Remover estilos de tema existentes
        const existingStyles = document.getElementById('dynamic-theme-styles');
        if (existingStyles) {
            existingStyles.remove();
        }

        const themeStyles = this.generateThemeStyles();
        const styleSheet = document.createElement('style');
        styleSheet.id = 'dynamic-theme-styles';
        styleSheet.textContent = themeStyles;
        document.head.appendChild(styleSheet);
    }

    generateThemeStyles() {
        const themes = {
            'default': {
                primary: '#4e7ae6',
                secondary: '#7c4dff',
                accent: '#ff6e6c'
            },
            'blue': {
                primary: '#2c5aa0',
                secondary: '#3a7bd5',
                accent: '#00b4db'
            },
            'red': {
                primary: '#c44569',
                secondary: '#e84393',
                accent: '#fd79a8'
            },
            'green': {
                primary: '#00b894',
                secondary: '#00cec9',
                accent: '#81ecec'
            },
            'gold': {
                primary: '#fdcb6e',
                secondary: '#e17055',
                accent: '#e84393'
            }
        };

        const currentTheme = themes[this.currentTheme] || themes['default'];

        return `
            :root {
                --primary: ${currentTheme.primary};
                --secondary: ${currentTheme.secondary};
                --accent: ${currentTheme.accent};
                --light: #f8f9fa;
                --dark: #343a40;
                --success: #28a745;
                --warning: #ffc107;
                --info: #17a2b8;
                --background: #f5f7fb;
                --card-bg: #ffffff;
                --text-primary: #212529;
                --text-secondary: #6c757d;
                --border-radius: 12px;
                --shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                --transition: all 0.3s ease;
            }

            .dark-mode {
                --background: #1a1a1a;
                --card-bg: #2d2d2d;
                --text-primary: #ffffff;
                --text-secondary: #b0b0b0;
                --light: #3a3a3a;
                --dark: #f8f9fa;
                --shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }

            /* Asegurar que los gradientes usen los colores del tema */
            .sidebar {
                background: linear-gradient(to bottom, var(--primary), var(--secondary)) !important;
            }

            .mobile-header {
                background: linear-gradient(to right, var(--primary), var(--secondary)) !important;
            }

            .btn-primary {
                background: linear-gradient(to right, var(--primary), var(--secondary)) !important;
            }

            /* LOS THEME-OPTION DEBEN MANTENER SUS COLORES ORIGINALES SIEMPRE */
            .theme-option.theme-default .theme-preview {
                background: linear-gradient(45deg, #4e7ae6, #7c4dff) !important;
            }

            .theme-option.theme-blue .theme-preview {
                background: linear-gradient(45deg, #2c5aa0, #3a7bd5) !important;
            }

            .theme-option.theme-red .theme-preview {
                background: linear-gradient(45deg, #c44569, #e84393) !important;
            }

            .theme-option.theme-green .theme-preview {
                background: linear-gradient(45deg, #00b894, #00cec9) !important;
            }

            .theme-option.theme-gold .theme-preview {
                background: linear-gradient(45deg, #fdcb6e, #e17055) !important;
            }

            /* Estilos para los theme-option activos */
            .theme-option.active {
                border: 2px solid var(--primary) !important;
            }
        `;
    }

    applyTheme() {
        // Limpiar clases de tema existentes
        const bodyClass = document.body.className;
        const themeClassRegex = /theme-\w+/g;
        document.body.className = bodyClass.replace(themeClassRegex, '').replace(/\s+/g, ' ').trim();

        // Agregar nueva clase de tema
        document.body.classList.add(`theme-${this.currentTheme}`);

        // Re-inyectar estilos
        this.injectThemeStyles();
    }

    applyDarkMode() {
        if (this.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    setTheme(themeName) {
        this.currentTheme = themeName;
        localStorage.setItem('vita_theme', themeName);
        this.applyTheme();

        // Actualizar la selección en la UI
        updateThemeSelectionUI(themeName);

        // Disparar evento personalizado para que otras páginas se actualicen
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: themeName }
        }));
    }

    toggleDarkMode() {
        this.darkMode = !this.darkMode;
        localStorage.setItem('vita_dark_mode', this.darkMode);
        this.applyDarkMode();
        this.applyTheme();

        window.dispatchEvent(new CustomEvent('darkModeChanged', {
            detail: { darkMode: this.darkMode }
        }));
    }

    setDarkMode(enabled) {
        this.darkMode = enabled;
        localStorage.setItem('vita_dark_mode', enabled);
        this.applyDarkMode();
        this.applyTheme();

        window.dispatchEvent(new CustomEvent('darkModeChanged', {
            detail: { darkMode: enabled }
        }));
    }

    getCurrentTheme() {
        return {
            theme: this.currentTheme,
            darkMode: this.darkMode
        };
    }
}

// Función para actualizar la UI de selección de temas
function updateThemeSelectionUI(themeName) {
    const themeOptions = document.querySelectorAll('.theme-option');
    if (themeOptions.length > 0) {
        themeOptions.forEach(option => {
            option.classList.remove('active');
        });

        const currentThemeOption = document.querySelector(`.theme-${themeName}`);
        if (currentThemeOption) {
            currentThemeOption.classList.add('active');
        }
    }
}

// Alertas personalizadas
class CustomAlert {
    static show(message, type = 'info', duration = 5000) {
        this.removeExistingAlerts();
        this.ensureAlertStyles();

        const alert = document.createElement('div');
        alert.className = `custom-alert custom-alert-${type}`;
        alert.innerHTML = `
            <div class="custom-alert-content">
                <i class="fas ${this.getIcon(type)}"></i>
                <span>${message}</span>
                <button class="custom-alert-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(alert);

        setTimeout(() => {
            if (alert.parentElement) {
                alert.remove();
            }
        }, duration);
    }

    static getIcon(type) {
        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        return icons[type] || 'fa-info-circle';
    }

    static removeExistingAlerts() {
        const existingAlerts = document.querySelectorAll('.custom-alert');
        existingAlerts.forEach(alert => alert.remove());
    }

    static ensureAlertStyles() {
        if (document.querySelector('#custom-alert-styles')) {
            return;
        }

        const alertStyles = `
.custom-alert {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    min-width: 300px;
    max-width: 500px;
    animation: slideInRight 0.3s ease;
}

.custom-alert-content {
    background: var(--card-bg);
    border-radius: var(--border-radius);
    padding: 1rem 1.5rem;
    box-shadow: var(--shadow);
    border-left: 4px solid;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.custom-alert-success {
    border-left-color: var(--success);
}

.custom-alert-success .custom-alert-content i {
    color: var(--success);
}

.custom-alert-error {
    border-left-color: #dc3545;
}

.custom-alert-error .custom-alert-content i {
    color: #dc3545;
}

.custom-alert-warning {
    border-left-color: var(--warning);
}

.custom-alert-warning .custom-alert-content i {
    color: var(--warning);
}

.custom-alert-info {
    border-left-color: var(--info);
}

.custom-alert-info .custom-alert-content i {
    color: var(--info);
}

.custom-alert-close {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    margin-left: auto;
    padding: 0.25rem;
}

.custom-alert-close:hover {
    color: var(--text-primary);
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@media (max-width: 768px) {
    .custom-alert {
        left: 20px;
        right: 20px;
        min-width: auto;
    }
}
`;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'custom-alert-styles';
        styleSheet.textContent = alertStyles;
        document.head.appendChild(styleSheet);
    }
}

// Funciones globales para la interfaz
function selectTheme(themeName, showAlert = true) {
    if (typeof themeManager !== 'undefined') {
        themeManager.setTheme(themeName);
    }

    if (showAlert) {
        showAlertMessage('Tema cambiado correctamente', 'success');
    }
}

function toggleDarkMode() {
    const toggle = document.getElementById('darkModeToggle');
    const isCurrentlyActive = toggle.classList.contains('active');

    if (typeof themeManager !== 'undefined') {
        themeManager.setDarkMode(!isCurrentlyActive);
    }

    toggle.classList.toggle('active');
    showAlertMessage('Modo oscuro ' + (!isCurrentlyActive ? 'activado' : 'desactivado'), 'success');
}

function showAlertMessage(message, type) {
    if (typeof CustomAlert !== 'undefined') {
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
        } else {
            alert(message);
        }
    }
}

// Inicialización global mejorada
function initializeThemeSystem() {
    window.themeManager = new ThemeManager();

    const savedTheme = localStorage.getItem('vita_theme') || 'default';
    const darkModeEnabled = localStorage.getItem('vita_dark_mode') === 'true';

    updateThemeSelectionUI(savedTheme);

    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        if (darkModeEnabled) {
            darkModeToggle.classList.add('active');
        } else {
            darkModeToggle.classList.remove('active');
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    initializeThemeSystem();
});

// Hacer las funciones disponibles globalmente
window.selectTheme = selectTheme;
window.toggleDarkMode = toggleDarkMode;
window.showAlertMessage = showAlertMessage;
window.CustomAlert = CustomAlert;
window.initializeThemeSystem = initializeThemeSystem;
window.updateThemeSelectionUI = updateThemeSelectionUI;

// Exportar para módulos (si se usa)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ThemeManager, CustomAlert };
}