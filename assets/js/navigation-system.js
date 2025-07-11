// navigation-system.js - Sistema Universal de Navegación Rápida
// Incluir este script en TODAS las páginas del sitio

(function() {
    'use strict';
    
    // Configuración de páginas del sistema
    const pageConfig = {
        'index.html': {
            name: 'Inicio',
            icon: '🏠',
            description: 'Página principal'
        },
        'home.html': {
            name: 'Chat Escolar',
            icon: '💬',
            description: 'Sistema de comunicación'
        },
        'menual.html': {
            name: 'Mi Espacio',
            icon: '👨‍🎓',
            description: 'Panel de estudiante'
        },
        'menupr.html': {
            name: 'Mi Panel',
            icon: '👨‍🏫',
            description: 'Panel de personal'
        },
        'menuad.html': {
            name: 'Panel Admin',
            icon: '👑',
            description: 'Panel de administrador'
        },
        'Electronica.html': {
            name: 'Electrónica',
            icon: '🔌',
            description: 'Orientación Electrónica'
        },
        'programacion.html': {
            name: 'Programación',
            icon: '💻',
            description: 'Orientación Programación'
        },
        'Brazo.html': {
            name: 'Brazo Robot',
            icon: '🤖',
            description: 'Proyecto de robótica'
        },
        'portfolio-details.html': {
            name: 'Limpiador',
            icon: '🧹',
            description: 'Proyecto automático'
        },
        'teslita.html': {
            name: 'AutoParking',
            icon: '🚗',
            description: 'Estacionamiento automático'
        },
        'futbolin.html': {
            name: 'Robot Fútbol',
            icon: '⚽',
            description: 'Robot de entretenimiento'
        },
        'tanque.html': {
            name: 'Tanque',
            icon: '🚛',
            description: 'Proyecto con bluetooth'
        },
        'Tablero.html': {
            name: 'Tablero',
            icon: '⚡',
            description: 'Simulador eléctrico'
        },
        'Login.html': {
            name: 'Iniciar Sesión',
            icon: '🔐',
            description: 'Acceso al sistema'
        }
    };

    // Función para obtener el nombre de página actual
    function getCurrentPage() {
        return window.location.pathname.split('/').pop() || 'index.html';
    }

    // Función para registrar visita a página
    function registerPageVisit() {
        const currentPage = getCurrentPage();
        const currentTime = new Date().getTime();
        
        // Solo registrar si es una página conocida y no es index.html
        if (pageConfig[currentPage] && currentPage !== 'index.html') {
            // Obtener el historial actual
            let history = JSON.parse(localStorage.getItem('navigationHistory') || '[]');
            
            // Agregar visita actual (máximo 5 páginas en historial)
            const visit = {
                page: currentPage,
                time: currentTime,
                info: pageConfig[currentPage]
            };
            
            // Remover visita anterior a la misma página
            history = history.filter(item => item.page !== currentPage);
            
            // Agregar al inicio
            history.unshift(visit);
            
            // Mantener solo las últimas 5 visitas
            history = history.slice(0, 5);
            
            // Guardar historial actualizado
            localStorage.setItem('navigationHistory', JSON.stringify(history));
            localStorage.setItem('lastVisitedPage', currentPage);
            localStorage.setItem('lastVisitTime', currentTime.toString());
        }
    }

    // Función para crear el botón de regreso rápido
    function createQuickReturnButton() {
        const currentPage = getCurrentPage();
        
        // No mostrar en index.html
        if (currentPage === 'index.html') return;
        
        const history = JSON.parse(localStorage.getItem('navigationHistory') || '[]');
        if (history.length === 0) return;
        
        // Buscar la página anterior (que no sea la actual)
        const previousPage = history.find(item => item.page !== currentPage);
        if (!previousPage) return;
        
        // Verificar que la visita no sea muy antigua (30 minutos)
        const currentTime = new Date().getTime();
        if (currentTime - previousPage.time > 1800000) return;
        
        // Crear el botón flotante
        const quickReturn = document.createElement('div');
        quickReturn.id = 'quickReturnFloat';
        quickReturn.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 30px;
            z-index: 1000;
            background: linear-gradient(45deg, #4ecdc4, #45b7d1);
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            font-weight: bold;
            max-width: 250px;
            opacity: 0;
            transform: translateY(100px);
            text-decoration: none;
            border: none;
        `;
        
        quickReturn.innerHTML = `
            <i class="bi bi-arrow-left-circle-fill" style="font-size: 18px;"></i>
            <div>
                <div style="font-size: 12px; opacity: 0.8;">Regresar a</div>
                <div>${previousPage.info.icon} ${previousPage.info.name}</div>
            </div>
            <i class="bi bi-x-circle" style="font-size: 16px; opacity: 0.7; margin-left: auto;" onclick="event.stopPropagation(); this.closest('#quickReturnFloat').remove();"></i>
        `;
        
        // Eventos
        quickReturn.addEventListener('click', function(e) {
            if (e.target.classList.contains('bi-x-circle')) return;
            
            // Animación de salida
            this.style.transform = 'translateY(100px)';
            this.style.opacity = '0';
            
            // Redirigir después de la animación
            setTimeout(() => {
                window.location.href = previousPage.page;
            }, 300);
        });
        
        quickReturn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
            this.style.boxShadow = '0 6px 25px rgba(0, 0, 0, 0.4)';
        });
        
        quickReturn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        });
        
        document.body.appendChild(quickReturn);
        
        // Animar entrada
        setTimeout(() => {
            quickReturn.style.opacity = '1';
            quickReturn.style.transform = 'translateY(0)';
        }, 500);
        
        // Auto-ocultar después de 10 segundos
        setTimeout(() => {
            if (quickReturn.parentNode) {
                quickReturn.style.opacity = '0';
                quickReturn.style.transform = 'translateY(100px)';
                setTimeout(() => {
                    if (quickReturn.parentNode) {
                        quickReturn.remove();
                    }
                }, 300);
            }
        }, 10000);
    }

    // Función para crear breadcrumbs en el header
    function createBreadcrumbs() {
        const currentPage = getCurrentPage();
        const currentPageInfo = pageConfig[currentPage];
        
        if (!currentPageInfo || currentPage === 'index.html') return;
        
        const history = JSON.parse(localStorage.getItem('navigationHistory') || '[]');
        const previousPage = history.find(item => item.page !== currentPage);
        
        if (!previousPage) return;
        
        // Buscar un header existente
        const header = document.querySelector('header') || document.querySelector('.header');
        if (!header) return;
        
        // Crear breadcrumbs
        const breadcrumbs = document.createElement('div');
        breadcrumbs.id = 'dynamicBreadcrumbs';
        breadcrumbs.style.cssText = `
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 0;
            font-size: 13px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        `;
        
        breadcrumbs.innerHTML = `
            <div class="container" style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <a href="index.html" style="color: #4ecdc4; text-decoration: none;">
                        🏠 Inicio
                    </a>
                    <span style="color: #888;">→</span>
                    <a href="${previousPage.page}" style="color: #ccc; text-decoration: none;">
                        ${previousPage.info.icon} ${previousPage.info.name}
                    </a>
                    <span style="color: #888;">→</span>
                    <span style="color: white; font-weight: bold;">
                        ${currentPageInfo.icon} ${currentPageInfo.name}
                    </span>
                </div>
                <button onclick="this.closest('#dynamicBreadcrumbs').remove()" 
                        style="background: none; border: none; color: #888; cursor: pointer; font-size: 16px;">
                    ×
                </button>
            </div>
        `;
        
        // Insertar después del header
        header.parentNode.insertBefore(breadcrumbs, header.nextSibling);
        
        // Ajustar el contenido principal para compensar
        const main = document.querySelector('main') || document.querySelector('#main');
        if (main) {
            main.style.marginTop = '40px';
        }
    }

    // Función para crear menú de historial
    function createHistoryMenu() {
        const history = JSON.parse(localStorage.getItem('navigationHistory') || '[]');
        if (history.length === 0) return;
        
        // Crear botón de historial
        const historyBtn = document.createElement('div');
        historyBtn.style.cssText = `
            position: fixed;
            top: 50%;
            right: 20px;
            transform: translateY(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 50%;
            cursor: pointer;
            z-index: 999;
            transition: all 0.3s ease;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.7;
        `;
        historyBtn.innerHTML = '<i class="bi bi-clock-history"></i>';
        
        historyBtn.addEventListener('mouseenter', function() {
            this.style.opacity = '1';
            this.style.transform = 'translateY(-50%) scale(1.1)';
        });
        
        historyBtn.addEventListener('mouseleave', function() {
            this.style.opacity = '0.7';
            this.style.transform = 'translateY(-50%) scale(1)';
        });
        
        historyBtn.addEventListener('click', function() {
            showHistoryModal(history);
        });
        
        document.body.appendChild(historyBtn);
    }

    // Función para mostrar modal de historial
    function showHistoryModal(history) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: #2d2d2d;
            border-radius: 15px;
            padding: 30px;
            max-width: 400px;
            width: 90%;
            color: white;
            transform: scale(0.8);
            transition: transform 0.3s ease;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        content.innerHTML = `
            <h3 style="text-align: center; margin-bottom: 20px; color: #4ecdc4;">
                🕒 Historial de Navegación
            </h3>
            <div>
                ${history.map((item, index) => `
                    <a href="${item.page}" style="
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 12px;
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 8px;
                        margin-bottom: 8px;
                        text-decoration: none;
                        color: white;
                        transition: background 0.3s ease;
                    " onmouseover="this.style.background='rgba(255,255,255,0.2)'" 
                       onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                        <span style="font-size: 20px;">${item.info.icon}</span>
                        <div style="flex: 1;">
                            <div style="font-weight: bold;">${item.info.name}</div>
                            <div style="font-size: 12px; opacity: 0.7;">${item.info.description}</div>
                            <div style="font-size: 11px; opacity: 0.5;">${formatTime(item.time)}</div>
                        </div>
                        <i class="bi bi-arrow-right" style="opacity: 0.6;"></i>
                    </a>
                `).join('')}
            </div>
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="clearNavigationHistory()" style="
                    background: #e74c3c;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    margin-right: 10px;
                ">Limpiar Historial</button>
                <button onclick="this.closest('.modal-overlay').remove()" style="
                    background: #95a5a6;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                ">Cerrar</button>
            </div>
        `;
        
        modal.className = 'modal-overlay';
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Animar entrada
        setTimeout(() => {
            modal.style.opacity = '1';
            content.style.transform = 'scale(1)';
        }, 10);
        
        // Cerrar con ESC o click fuera
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
        
        function closeModal() {
            modal.style.opacity = '0';
            content.style.transform = 'scale(0.8)';
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.remove();
                }
            }, 300);
        }
    }

    // Función para formatear tiempo
    function formatTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;
        
        if (diff < 60000) return 'Hace un momento';
        if (diff < 3600000) return `Hace ${Math.floor(diff/60000)} min`;
        if (diff < 86400000) return `Hace ${Math.floor(diff/3600000)} h`;
        return time.toLocaleDateString();
    }

    // Función para limpiar historial
    window.clearNavigationHistory = function() {
        localStorage.removeItem('navigationHistory');
        localStorage.removeItem('lastVisitedPage');
        localStorage.removeItem('lastVisitTime');
        location.reload();
    };

    // Función para crear accesos rápidos
    function createQuickAccess() {
        const currentPage = getCurrentPage();
        
        // Definir accesos rápidos por tipo de página
        const quickAccess = {
            'index.html': [],
            'Login.html': ['index.html'],
            'menual.html': ['home.html', 'Electronica.html', 'programacion.html'],
            'menupr.html': ['home.html', 'Electronica.html', 'programacion.html'],
            'menuad.html': ['home.html', 'menual.html', 'menupr.html'],
            'home.html': ['menual.html', 'menupr.html', 'menuad.html']
        };
        
        const relevantPages = quickAccess[currentPage];
        if (!relevantPages || relevantPages.length === 0) return;
        
        // Crear barra de accesos rápidos
        const quickBar = document.createElement('div');
        quickBar.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, rgba(0,0,0,0.9), rgba(30,30,30,0.9));
            backdrop-filter: blur(10px);
            padding: 12px;
            display: flex;
            justify-content: center;
            gap: 15px;
            z-index: 998;
            transform: translateY(100%);
            transition: transform 0.3s ease;
            border-top: 1px solid rgba(255,255,255,0.1);
        `;
        
        quickBar.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <span style="color: #888; font-size: 12px;">Accesos rápidos:</span>
                ${relevantPages.map(page => {
                    const info = pageConfig[page];
                    return `
                        <a href="${page}" style="
                            display: flex;
                            align-items: center;
                            gap: 6px;
                            padding: 8px 12px;
                            background: rgba(255,255,255,0.1);
                            border-radius: 20px;
                            color: white;
                            text-decoration: none;
                            font-size: 13px;
                            transition: all 0.3s ease;
                        " onmouseover="this.style.background='rgba(78,205,196,0.3)'" 
                           onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                            <span>${info.icon}</span>
                            <span>${info.name}</span>
                        </a>
                    `;
                }).join('')}
                <button onclick="this.closest('div').style.transform='translateY(100%)'" style="
                    background: none;
                    border: none;
                    color: #888;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 50%;
                ">×</button>
            </div>
        `;
        
        document.body.appendChild(quickBar);
        
        // Mostrar barra después de 2 segundos
        setTimeout(() => {
            quickBar.style.transform = 'translateY(0)';
        }, 2000);
        
        // Auto-ocultar después de 15 segundos
        setTimeout(() => {
            if (quickBar.parentNode) {
                quickBar.style.transform = 'translateY(100%)';
            }
        }, 17000);
    }

    // Función de inicialización
    function init() {
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }
        
        // Registrar visita actual
        registerPageVisit();
        
        // Crear elementos de navegación después de un pequeño delay
        setTimeout(() => {
            createQuickReturnButton();
            createBreadcrumbs();
            createHistoryMenu();
            createQuickAccess();
        }, 1000);
        
        // Limpiar historial antiguo (más de 24 horas)
        cleanOldHistory();
    }

    // Función para limpiar historial antiguo
    function cleanOldHistory() {
        const history = JSON.parse(localStorage.getItem('navigationHistory') || '[]');
        const currentTime = new Date().getTime();
        const oneDayAgo = currentTime - 86400000; // 24 horas
        
        const cleanHistory = history.filter(item => item.time > oneDayAgo);
        
        if (cleanHistory.length !== history.length) {
            localStorage.setItem('navigationHistory', JSON.stringify(cleanHistory));
        }
    }

    // Función para detectar navegación programática
    function trackNavigation() {
        // Escuchar cambios en la URL (para SPAs)
        window.addEventListener('popstate', function() {
            setTimeout(registerPageVisit, 100);
        });
        
        // Interceptar clicks en enlaces para actualizar historial
        document.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (link && link.href && !link.href.startsWith('javascript:') && !link.href.includes('#')) {
                const url = new URL(link.href);
                if (url.origin === window.location.origin) {
                    // Es un enlace interno, registrar en historial
                    setTimeout(() => {
                        registerPageVisit();
                    }, 100);
                }
            }
        });
    }

    // Función para crear indicador de conectividad
    function createConnectivityIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'connectivityIndicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 80px;
            background: #27ae60;
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            z-index: 1001;
            display: none;
            transition: all 0.3s ease;
        `;
        indicator.textContent = '● Online';
        
        document.body.appendChild(indicator);
        
        // Manejar eventos de conectividad
        window.addEventListener('online', function() {
            indicator.style.background = '#27ae60';
            indicator.textContent = '● Online';
            indicator.style.display = 'block';
            setTimeout(() => {
                indicator.style.display = 'none';
            }, 3000);
        });
        
        window.addEventListener('offline', function() {
            indicator.style.background = '#e74c3c';
            indicator.textContent = '● Offline';
            indicator.style.display = 'block';
        });
    }

    // Inicializar sistema
    trackNavigation();
    createConnectivityIndicator();
    init();

    // Exportar funciones útiles al objeto global
    window.NavigationSystem = {
        getCurrentPage,
        registerPageVisit,
        clearHistory: window.clearNavigationHistory,
        getHistory: () => JSON.parse(localStorage.getItem('navigationHistory') || '[]'),
        pageConfig
    };

})();