/* ============================================
   FUNCIONALIDADES MODERNAS - Bergmans Automotores
   ============================================ */

// ============================================
// ANIMACIONES AL SCROLL (Intersection Observer)
// ============================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-visible');
            fadeInObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observar elementos para animaciones
document.addEventListener('DOMContentLoaded', () => {
    // Elementos que se animarán al aparecer en pantalla
    const animatedElements = document.querySelectorAll(`
        .auto-card,
        .servicio-card,
        .stat-box,
        .feature-item,
        .section-header
    `);
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        fadeInObserver.observe(el);
    });
});

// Agregar clase cuando el elemento es visible
const style = document.createElement('style');
style.textContent = `
    .fade-in-visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

// ============================================
// CONTADOR ANIMADO PARA ESTADÍSTICAS
// ============================================

function animateCounter(element, target, duration = 2000) {
    let current = 0;
    const increment = target / (duration / 16);
    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.ceil(current).toLocaleString();
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString();
        }
    };
    updateCounter();
}

// Iniciar contadores cuando sean visibles
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counter = entry.target;
            const target = parseInt(counter.dataset.target);
            animateCounter(counter, target);
            counterObserver.unobserve(counter);
        }
    });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.counter').forEach(counter => {
        counterObserver.observe(counter);
    });
});

// ============================================
// MENÚ MÓVIL MEJORADO
// ============================================

const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const body = document.body;

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
        body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        
        // Animar las barras del menú hamburguesa
        const spans = menuToggle.querySelectorAll('span');
        if (menuToggle.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(7px, 7px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -7px)';
        } else {
            spans[0].style.transform = '';
            spans[1].style.opacity = '1';
            spans[2].style.transform = '';
        }
    });
    
    // Cerrar menú al hacer clic en un enlace
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            body.style.overflow = '';
            
            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = '';
            spans[1].style.opacity = '1';
            spans[2].style.transform = '';
        });
    });
}

// ============================================
// SCROLL SUAVE Y NAVBAR STICKY CON EFECTO
// ============================================

const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Agregar sombra al navbar al hacer scroll
    if (currentScroll > 50) {
        navbar.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
    }
    
    // Ocultar/mostrar navbar al hacer scroll
    if (currentScroll > lastScroll && currentScroll > 100) {
        navbar.style.transform = 'translateY(-100%)';
    } else {
        navbar.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;
    
    // Mostrar/ocultar botón scroll to top
    const scrollBtn = document.querySelector('.scroll-to-top');
    if (scrollBtn) {
        if (currentScroll > 500) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    }
});

// Botón scroll to top
const scrollToTopBtn = document.querySelector('.scroll-to-top');
if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ============================================
// FILTROS DE TABS PARA INVENTARIO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const filterTabs = document.querySelectorAll('.filter-tab');
    const autoCards = document.querySelectorAll('.auto-card');
    
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remover clase active de todos los tabs
            filterTabs.forEach(t => t.classList.remove('active'));
            // Agregar clase active al tab clickeado
            tab.classList.add('active');
            
            const filter = tab.dataset.filter;
            
            autoCards.forEach((card, index) => {
                // Animar salida
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                
                setTimeout(() => {
                    if (filter === 'all') {
                        card.style.display = 'block';
                    } else {
                        // Aquí puedes implementar la lógica de filtrado real
                        // Por ahora, mostramos todos
                        card.style.display = 'block';
                    }
                    
                    // Animar entrada
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50 * index);
                }, 300);
            });
        });
    });
});

// ============================================
// LAZY LOADING PARA IMÁGENES
// ============================================

const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        }
    });
}, {
    rootMargin: '50px'
});

// Observar imágenes para lazy loading
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
});

// ============================================
// EFECTOS DE PARALLAX SUAVES
// ============================================

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.hero');
    
    parallaxElements.forEach(element => {
        const speed = 0.5;
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// ============================================
// FORMULARIO DE BÚSQUEDA CON VALIDACIÓN
// ============================================

const searchForm = document.getElementById('search-form');
if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Agregar efecto de carga
        const searchBtn = searchForm.querySelector('.search-btn');
        const originalText = searchBtn.innerHTML;
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Buscando...</span>';
        searchBtn.disabled = true;
        
        // Simular búsqueda
        setTimeout(() => {
            searchBtn.innerHTML = originalText;
            searchBtn.disabled = false;
            
            // Scroll suave a los resultados
            document.getElementById('inventario').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }, 1500);
    });
}

// ============================================
// FORMULARIO DE CONTACTO CON VALIDACIÓN
// ============================================

const contactForm = document.getElementById('contacto-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Validación básica
        const nombre = contactForm.querySelector('#nombre').value.trim();
        const email = contactForm.querySelector('#email').value.trim();
        const mensaje = contactForm.querySelector('#mensaje').value.trim();
        
        if (!nombre || !email || !mensaje) {
            mostrarNotificacion('Por favor, completa todos los campos requeridos.', 'error');
            return;
        }
        
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            mostrarNotificacion('Por favor, ingresa un correo electrónico válido.', 'error');
            return;
        }
        
        // Efecto de envío
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;
        
        // Simular envío
        setTimeout(() => {
            submitBtn.innerHTML = '<i class="fas fa-check"></i> ¡Mensaje Enviado!';
            mostrarNotificacion('¡Gracias por contactarnos! Te responderemos pronto.', 'success');
            
            // Resetear formulario
            contactForm.reset();
            
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 3000);
        }, 2000);
    });
}

// ============================================
// SISTEMA DE NOTIFICACIONES
// ============================================

function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear contenedor de notificaciones si no existe
    let container = document.querySelector('.notifications-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notifications-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        `;
        document.body.appendChild(container);
    }
    
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${tipo}`;
    notification.style.cssText = `
        padding: 1rem 1.5rem;
        background: white;
        border-radius: 0.75rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        min-width: 300px;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
        border-left: 4px solid ${tipo === 'success' ? '#10b981' : tipo === 'error' ? '#ef4444' : '#3b82f6'};
    `;
    
    const icon = tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle';
    const color = tipo === 'success' ? '#10b981' : tipo === 'error' ? '#ef4444' : '#3b82f6';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}" style="color: ${color}; font-size: 1.25rem;"></i>
        <span style="flex: 1; color: #374151; font-weight: 500;">${mensaje}</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; cursor: pointer; color: #9ca3af; font-size: 1.25rem;">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(notification);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Agregar animaciones CSS para notificaciones
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// ============================================
// MEJORAS EN EL MODAL
// ============================================

const modal = document.getElementById('modal-auto');
const closeBtn = document.querySelector('.close');

if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.style.display = 'none';
            modal.style.animation = '';
            document.body.style.overflow = '';
        }, 300);
    });
}

// Cerrar modal al hacer clic fuera
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.style.display = 'none';
            modal.style.animation = '';
            document.body.style.overflow = '';
        }, 300);
    }
});

// Cerrar modal con tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.style.display = 'none';
            modal.style.animation = '';
            document.body.style.overflow = '';
        }, 300);
    }
});

// ============================================
// PRELOADER (opcional)
// ============================================

window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
});

// ============================================
// MEJORAR EXPERIENCIA DE ENLACES
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // Compensar altura del navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// EFECTOS DE CURSOR PERSONALIZADOS (OPCIONAL)
// ============================================

document.querySelectorAll('.cta-button, .servicio-card, .auto-card').forEach(element => {
    element.addEventListener('mouseenter', () => {
        document.body.style.cursor = 'pointer';
    });
    
    element.addEventListener('mouseleave', () => {
        document.body.style.cursor = 'default';
    });
});

console.log('✨ Bergmans Automotores - Sistema cargado correctamente');
