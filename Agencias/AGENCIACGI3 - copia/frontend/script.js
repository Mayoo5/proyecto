/* ============================================
   BASE DE DATOS DE AUTOS - Bergmans Automotores
   ============================================ */

// Variable global para almacenar los autos
let autos = [];

/* ============================================
   CARGAR AUTOS DESDE ARCHIVO JSON
   ============================================ */

async function cargarAutosDesdeServidor() {
    try {
        const response = await fetch('https://gonzalobergmans.pythonanywhere.com/api/autos');
        if (response.ok) {
            const data = await response.json();
            // La API devuelve directamente el array de autos
            autos = Array.isArray(data) ? data : [];
            cargarAutos();
            // Actualizar contador inicial
            actualizarContadorResultados(autos.length);
            // Configurar filtros de tabs después de cargar los autos
            configurarFilterTabs();
        } else {
            console.error('Error al cargar autos del archivo JSON');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

/* ============================================
   FUNCIONES DE UTILIDAD
   ============================================ */

// Formatear precio en moneda
function formatearPrecio(precio, moneda = 'ARS') {
    if (moneda === 'USD') {
        return '$' + new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(precio) + ' USD';
    } else {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        }).format(precio);
    }
}

// Formatear kilómetros
function formatearKilometros(km) {
    return new Intl.NumberFormat('es-ES').format(km);
}

/* ============================================
   CREAR TARJETA DE AUTO
   ============================================ */

function crearTarjetaAuto(auto) {
    // Determinar badge según año y condición
    let badge = '';
    const añoActual = new Date().getFullYear();
    
    if (auto.cero_km || auto.año >= añoActual || auto.kilometraje < 100) {
        badge = '<div class="auto-badge badge-nuevo"><i class="fas fa-star"></i> 0 KM</div>';
    } else if (auto.destacado) {
        badge = '<div class="auto-badge badge-destacado"><i class="fas fa-crown"></i> Destacado</div>';
    } else if (auto.oferta) {
        badge = '<div class="auto-badge badge-oferta"><i class="fas fa-fire"></i> Oferta</div>';
    }
    
    // Obtener la primera imagen válida (que no sea placeholder)
    let imagenPrincipal = '';
    if (auto.imagenes && auto.imagenes.length > 0) {
        // Buscar la primera imagen válida en el array
        imagenPrincipal = auto.imagenes.find(img => 
            img && 
            typeof img === 'string' && 
            img.trim() !== '' && 
            !img.includes('placeholder') && 
            !img.includes('Sin+Imagen')
        );
    }
    // Si no encuentra en imagenes, usar la imagen principal
    if (!imagenPrincipal && auto.imagen) {
        imagenPrincipal = auto.imagen;
    }
    // Fallback: si aún no hay imagen, usar la primera del array aunque sea
    if (!imagenPrincipal && auto.imagenes && auto.imagenes.length > 0) {
        imagenPrincipal = auto.imagenes[0];
    }
    
    // Asegurar que la ruta apunte al servidor de producción
    if (imagenPrincipal && !imagenPrincipal.startsWith('http')) {
        // Si la ruta no tiene el servidor, agregarlo
        if (imagenPrincipal.startsWith('/')) {
            imagenPrincipal = 'https://gonzalobergmans.pythonanywhere.com' + imagenPrincipal;
        } else {
            imagenPrincipal = 'https://gonzalobergmans.pythonanywhere.com/' + imagenPrincipal;
        }
    }
    
    // Calcular "estado" del vehículo
    const kmPorAño = auto.kilometraje / (añoActual - auto.año + 1);
    let estadoVehiculo = '';
    if (kmPorAño < 10000) {
        estadoVehiculo = '<span class="estado-badge excelente"><i class="fas fa-check-circle"></i> Excelente Estado</span>';
    } else if (kmPorAño < 20000) {
        estadoVehiculo = '<span class="estado-badge bueno"><i class="fas fa-check"></i> Muy Buen Estado</span>';
    }
    
    return `
        <div class="auto-card-professional" data-id="${auto.id}">
            <div class="auto-image-container">
                <img src="${imagenPrincipal || 'placeholder.jpg'}" alt="${auto.marca} ${auto.modelo}" class="auto-img" style="width: 100%; height: auto; display: block;">
                ${badge}
                <div class="image-overlay">
                    <button class="btn-quick-view ver-detalles" data-id="${auto.id}">
                        <i class="fas fa-eye"></i> Ver Detalles
                    </button>
                </div>
            </div>
            <div class="auto-content">
                <div class="auto-header-pro">
                    <h3 class="auto-title-pro">${auto.marca.toUpperCase()} ${auto.modelo.toUpperCase()}</h3>
                    ${auto.versión ? `<p class="auto-version">${auto.versión}</p>` : ''}
                    ${estadoVehiculo}
                </div>
                
                <div class="auto-specs-grid">
                    <div class="spec-item-pro">
                        <i class="fas fa-calendar-alt"></i>
                        <div>
                            <strong>${auto.año}</strong>
                            <small>Año</small>
                        </div>
                    </div>
                    <div class="spec-item-pro">
                        <i class="fas fa-tachometer-alt"></i>
                        <div>
                            <strong>${formatearKilometros(auto.kilometraje)}</strong>
                            <small>km</small>
                        </div>
                    </div>
                    <div class="spec-item-pro">
                        <i class="fas fa-cog"></i>
                        <div>
                            <strong>${auto.motor}</strong>
                            <small>Motor</small>
                        </div>
                    </div>
                    <div class="spec-item-pro">
                        <i class="fas fa-exchange-alt"></i>
                        <div>
                            <strong>${auto.transmision}</strong>
                            <small>Caja</small>
                        </div>
                    </div>
                </div>
                
                <div class="auto-features">
                    <span class="feature-tag"><i class="fas fa-gas-pump"></i> ${auto.combustible}${auto.gnc === 'si' ? ' + GNC' : ''}</span>
                    ${auto.color ? `<span class="feature-tag"><i class="fas fa-palette"></i> ${auto.color}</span>` : ''}
                </div>
                
                <div class="auto-footer-pro">
                    <div class="auto-price-pro">
                        <span class="price-label">Precio</span>
                        <span class="price-value">${formatearPrecio(auto.precio, auto.moneda)}</span>
                    </div>
                    <div class="auto-actions-pro">
                        <button class="btn-icon-pro ver-detalles" data-id="${auto.id}" title="Ver Detalles">
                            <i class="fas fa-info-circle"></i>
                        </button>
                        <a href="https://wa.me/${auto.whatsapp || '543533684820'}?text=Hola, estoy interesado en el ${auto.marca} ${auto.modelo} ${auto.año}" class="btn-icon-pro btn-whatsapp" title="Consultar por WhatsApp" target="_blank">
                            <i class="fab fa-whatsapp"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/* ============================================
   CARGAR AUTOS
   ============================================ */

function cargarAutos(autosAMostrar = autos) {
    const grid = document.getElementById('autos-grid');
    
    if (autosAMostrar.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #6b7280;">No se encontraron autos con esos criterios de búsqueda.</p>';
        return;
    }
    
    grid.innerHTML = autosAMostrar.map(auto => crearTarjetaAuto(auto)).join('');
    
    // Forzar un repaint del navegador
    void grid.offsetHeight;
    
    // Agregar event listeners después de crear las tarjetas
    agregarEventListenersDetalles();
    
    // Desplazar a la sección de inventario
    setTimeout(() => {
        const inventarioSection = document.getElementById('inventario');
        if (inventarioSection) {
            inventarioSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);
}

function agregarEventListenersDetalles() {
    // Remover listeners previos clonando los botones
    document.querySelectorAll('.ver-detalles').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.replaceWith(newBtn);
    });
    
    // Agregar nuevos listeners
    document.querySelectorAll('.ver-detalles').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const autoId = e.currentTarget.dataset.id;
            const auto = autos.find(a => a.id == autoId);
            if (auto) {
                mostrarDetalles(auto);
            }
        });
    });
    
    // Reconfigurar el modal después de agregar los listeners
    configurarModal();
}

/* ============================================
   MOSTRAR DETALLES DEL AUTO
   ============================================ */

function mostrarDetalles(auto) {
    const modalBody = document.getElementById('modal-body');
    
    // Filtrar imágenes válidas (que no estén vacías ni sean placeholders)
    const imagenesValidas = auto.imagenes ? auto.imagenes.filter(img => 
        img && 
        img.trim() !== '' && 
        !img.includes('placeholder') &&
        !img.includes('Sin+Imagen')
    ) : [];
    
    // Normalizar rutas de imágenes para que apunten al servidor de producción
    const imagenesNormalizadas = imagenesValidas.map(img => {
        if (img && !img.startsWith('http')) {
            // Si la ruta no tiene el servidor, agregarlo
            if (img.startsWith('/')) {
                return 'https://gonzalobergmans.pythonanywhere.com' + img;
            } else {
                return 'https://gonzalobergmans.pythonanywhere.com/' + img;
            }
        }
        return img;
    });
    
    // Crear galería de imágenes si existen múltiples imágenes
    const imagenesHTML = imagenesNormalizadas.length > 0 ? `
        <div style="margin-bottom: 1.5rem;">
            <img id="imagen-principal" src="${imagenesNormalizadas[0]}" alt="${auto.marca} ${auto.modelo}" 
                 style="width: 100%; border-radius: 8px; margin-bottom: 1rem;" 
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22600%22%3E%3Crect fill=%22%23ddd%22 width=%22800%22 height=%22600%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2220%22 fill=%22%23999%22 text-anchor=%22middle%22 dy=%22.3em%22%3EImagen no disponible%3C/text%3E%3C/svg%3E'">
            <div style="display: flex; gap: 0.5rem; overflow-x: auto;">
                ${imagenesNormalizadas.map((img, index) => `
                    <img src="${img}" 
                         onclick="document.getElementById('imagen-principal').src='${img}';"
                         style="width: 100px; height: 75px; object-fit: cover; border-radius: 4px; cursor: pointer; border: 2px solid ${index === 0 ? '#1e40af' : '#e5e7eb'};" 
                         alt="Vista ${index + 1}"
                         onerror="this.style.display='none'">
                `).join('')}
            </div>
        </div>
    ` : `<img src="${auto.imagen}" alt="${auto.marca} ${auto.modelo}" style="width: 100%; border-radius: 8px; margin-bottom: 1.5rem;">`;
    
    modalBody.innerHTML = `
        <div style="padding: 2rem;">
            ${imagenesHTML}
            
            <h2 style="margin-bottom: 1rem; color: #1e40af;">${auto.marca.toUpperCase()} ${auto.modelo.toUpperCase()} ${auto.versión ? auto.versión.toUpperCase() : ''}</h2>
            
            <p style="color: #6b7280; margin-bottom: 1.5rem; font-size: 1.1rem;">${auto.descripcion}</p>
            
            <div style="background: #f9fafb; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                <h3 style="margin-bottom: 1rem; color: #1e40af;">Especificaciones</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <strong>Precio:</strong><br>
                        <span style="color: #1e40af; font-size: 1.25rem;">${formatearPrecio(auto.precio, auto.moneda)}</span>
                    </div>
                    <div>
                        <strong>Año:</strong><br>
                        <span>${auto.año}</span>
                    </div>
                    <div>
                        <strong>Categoría:</strong><br>
                        <span style="text-transform: capitalize;">${auto.categoria || 'Auto'}</span>
                    </div>
                    <div>
                        <strong>Kilometraje:</strong><br>
                        <span>${formatearKilometros(auto.kilometraje)} km</span>
                    </div>
                    <div>
                        <strong>Motor:</strong><br>
                        <span>${auto.motor}</span>
                    </div>
                    <div>
                        <strong>Transmisión:</strong><br>
                        <span>${auto.transmision}</span>
                    </div>
                    <div>
                        <strong>Combustible:</strong><br>
                        <span>${auto.combustible.charAt(0).toUpperCase() + auto.combustible.slice(1)}${auto.gnc === 'si' ? ' + GNC' : ''}</span>
                    </div>
                    <div>
                        <strong>Color:</strong><br>
                        <span>${auto.color}</span>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 1.5rem;">
                <h3 style="margin-bottom: 1rem; color: #1e40af;">Características Incluidas</h3>
                <ul style="list-style: none;">
                    ${auto.caracteristicas.map(c => `
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;">
                            <i class="fas fa-check" style="color: #10b981; margin-right: 0.5rem;"></i>
                            ${c}
                        </li>
                    `).join('')}
                </ul>
            </div>
            
            <div style="margin-bottom: 1.5rem; padding: 1rem; background: #f9fafb; border-radius: 8px;">
                <h4 style="margin-bottom: 0.75rem; color: #1e40af; font-size: 0.95rem;">
                    <i class="fas fa-share-alt"></i> Compartir este auto
                </h4>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button onclick="compartirWhatsApp('${auto.marca}', '${auto.modelo}', '${auto.año}')" 
                            style="flex: 1; min-width: 120px; padding: 0.6rem; background: #25D366; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                        <i class="fab fa-whatsapp"></i> WhatsApp
                    </button>
                    <button onclick="compartirFacebook('${auto.marca}', '${auto.modelo}', '${auto.año}')" 
                            style="flex: 1; min-width: 120px; padding: 0.6rem; background: #1877F2; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                        <i class="fab fa-facebook-f"></i> Facebook
                    </button>
                    <button onclick="copiarEnlace()" 
                            style="flex: 1; min-width: 120px; padding: 0.6rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                        <i class="fas fa-link"></i> Copiar enlace
                    </button>
                </div>
            </div>
            
            <div style="display: flex; gap: 1rem;">
                <a href="https://wa.me/${auto.whatsapp || '543533684820'}?text=Hola, estoy interesado en el ${auto.marca} ${auto.modelo} ${auto.año}" target="_blank" class="cta-button btn-contactar-modal" style="text-decoration: none; text-align: center; background: linear-gradient(135deg, #25D366, #128C7E); color: white; font-weight: 700;">
                    <i class="fab fa-whatsapp"></i> WhatsApp
                </a>
                <button class="cta-button btn-cerrar-modal" style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; font-weight: 700;" onclick="document.getElementById('modal-auto').classList.remove('active')">
                    Cerrar
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('modal-auto').classList.add('active');
}

/* ============================================
   FUNCIONES DE COMPARTIR
   ============================================ */

function compartirWhatsApp(marca, modelo, año) {
    const texto = `¡Mira este ${año} ${marca} ${modelo}! 🚗\n\nDisponible en CGI Autos\n${window.location.href}`;
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
}

function compartirFacebook(marca, modelo, año) {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'width=600,height=400');
}

function copiarEnlace() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        alert('¡Enlace copiado al portapapeles!');
    }).catch(() => {
        alert('No se pudo copiar el enlace');
    });
}

function contactarPorAuto(modelo) {
    const email = document.getElementById('email');
    const mensaje = document.getElementById('mensaje');
    
    email.focus();
    mensaje.value = `Estoy interesado en el ${modelo}. Me gustaría recibir más información.`;
    
    // Scroll al formulario
    document.getElementById('contacto').scrollIntoView({ behavior: 'smooth' });
    
    // Cerrar modal
    document.getElementById('modal-auto').classList.remove('active');
}

function abrirFormularioContacto(e) {
    const autoModelo = e.target.dataset.auto;
    contactarPorAuto(autoModelo);
}

/* ============================================
   BÚSQUEDA Y FILTRO
   ============================================ */

function filtrarAutos() {
    const marcaSeleccionada = document.getElementById('marca').value.trim();
    const modeloEscrito = document.getElementById('modelo').value.trim();
    const anoSeleccionado = document.getElementById('ano').value;
    const precioMin = parseFloat(document.getElementById('precio-min').value) || 0;
    const precioMax = parseFloat(document.getElementById('precio-max').value) || Infinity;
    const combustibleSeleccionado = document.getElementById('combustible').value.trim();
    
    // Filtrar autos
    let autosFiltrados = autos.filter(auto => {
        // Filtro por marca
        if (marcaSeleccionada !== '') {
            if (auto.marca.toLowerCase() !== marcaSeleccionada.toLowerCase()) {
                return false;
            }
        }
        
        // Filtro por modelo
        if (modeloEscrito !== '') {
            if (!auto.modelo.toLowerCase().includes(modeloEscrito.toLowerCase())) {
                return false;
            }
        }
        
        // Filtro por año
        if (anoSeleccionado !== '') {
            if (auto.año.toString() !== anoSeleccionado) {
                return false;
            }
        }
        
        // Filtro por precio
        if (auto.precio < precioMin || auto.precio > precioMax) {
            return false;
        }
        
        // Filtro por combustible
        if (combustibleSeleccionado !== '') {
            if (auto.combustible.toLowerCase() !== combustibleSeleccionado.toLowerCase()) {
                return false;
            }
        }
        
        return true;
    });
    
    // Ordenar por relevancia
    autosFiltrados.sort((a, b) => {
        // Primero destacados
        if (a.destacado && !b.destacado) return -1;
        if (!a.destacado && b.destacado) return 1;
        
        // Luego más nuevos
        return b.año - a.año;
    });
    
    cargarAutos(autosFiltrados);
    
    // Scroll al inventario
    document.getElementById('inventario').scrollIntoView({ behavior: 'smooth' });
}

// Filtros por tabs (Todos, Recién Llegados, En Oferta)
function filtrarPorTab(filtro) {
    let autosFiltrados;
    
    if (filtro === 'all') {
        autosFiltrados = autos;
    } else if (filtro === 'destacado') {
        autosFiltrados = autos.filter(auto => auto.destacado === true);
    } else if (filtro === 'oferta') {
        autosFiltrados = autos.filter(auto => auto.oferta === true);
    } else if (filtro === 'nuevo') {
        autosFiltrados = autos.filter(auto => {
            // Buscar autos marcados como nuevo O autos con kilometraje muy bajo
            return auto.nuevo === true || 
                   (auto.kilometraje !== undefined && (auto.kilometraje === 0 || auto.kilometraje === '0' || auto.kilometraje < 100));
        });
    } else if (filtro === 'cero_km') {
        autosFiltrados = autos.filter(auto => {
            // Buscar autos con 0 km, o marcados como cero_km
            return auto.cero_km === true || 
                   auto.kilometraje === 0 || 
                   auto.kilometraje === '0' ||
                   (auto.kilometraje !== undefined && auto.kilometraje < 100);
        });
    }
    
    console.log(`Filtrando por: ${filtro}, resultados: ${autosFiltrados ? autosFiltrados.length : 0} autos`);
    autosFiltrados.forEach(auto => console.log(`  - ${auto.marca} ${auto.modelo}, imagen: ${auto.imagen}`));
    
    cargarAutos(autosFiltrados);
    actualizarContadorResultados(autosFiltrados ? autosFiltrados.length : 0);
    
    // Actualizar contador global
    if (window.CGIAutos && window.CGIAutos.updateAutoCount) {
        setTimeout(() => window.CGIAutos.updateAutoCount(), 100);
    }
}

/* ============================================
   MODAL
   ============================================ */

function configurarModal() {
    const modal = document.getElementById('modal-auto');
    const closeBtn = modal.querySelector('.close');
    
    // Remover event listeners previos para evitar duplicados
    closeBtn.replaceWith(closeBtn.cloneNode(true));
    const newCloseBtn = modal.querySelector('.close');
    
    newCloseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        modal.classList.remove('active');
    });
    
    // Event listener para cerrar al hacer click fuera del modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

/* ============================================
   MENÚ RESPONSIVO
   ============================================ */

function configurarMenuResponsivo() {
    var menuToggle = document.querySelector('.menu-toggle');
    var navMenu = document.querySelector('.nav-menu');
    
    if (!menuToggle || !navMenu) {
        return;
    }
    
    // Click en hamburguesa
    menuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        navMenu.classList.toggle('active');
    });
    
    // Click en enlaces del menú - cerrar menú
    var navLinks = document.querySelectorAll('.nav-menu a');
    for (var i = 0; i < navLinks.length; i++) {
        navLinks[i].addEventListener('click', function() {
            navMenu.classList.remove('active');
        });
    }
    
    // Click fuera del menú - cerrar
    document.addEventListener('click', function(e) {
        if (navMenu.classList.contains('active')) {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        }
    });
}

/* ============================================
   FORMULARIO DE CONTACTO
   ============================================ */

function configurarFormularioContacto() {
    const form = document.getElementById('contacto-form');
    
    // Validar que el formulario exista
    if (!form) {
        return;
    }
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const telefono = document.getElementById('telefono').value;
        const asunto = document.getElementById('asunto').value;
        const mensaje = document.getElementById('mensaje').value;
        
        // Validar
        if (!nombre || !email || !asunto || !mensaje) {
            alert('Por favor, completa todos los campos obligatorios (*)');
            return;
        }
        
        alert('¡Mensaje enviado correctamente! Nos pondremos en contacto pronto.');
        
        form.reset();
    });
}

/* ============================================
   BUSCAR AUTOS
   ============================================ */

function configurarBusqueda() {
    const searchForm = document.getElementById('search-form');
    
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        filtrarAutos();
    });
}

/* ============================================
   CONFIGURAR FILTROS DE TABS
   ============================================ */

function configurarFilterTabs() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remover active de todos
            filterTabs.forEach(t => t.classList.remove('active'));
            // Agregar active al clickeado
            tab.classList.add('active');
            // Filtrar
            const filtro = tab.dataset.filter;
            filtrarPorTab(filtro);
        });
    });
}

/* ============================================
   INICIALIZACIÓN
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Cargar autos desde el servidor
    cargarAutosDesdeServidor();
    
    // Configurar funcionalidades
    configurarModal();
    configurarMenuResponsivo();
    configurarFormularioContacto();
    configurarBusqueda();
    
    // Agregar animaciones de scroll
    agregarAnimacionesScroll();
});

/* ============================================
   ANIMACIONES DE SCROLL
   ============================================ */

function agregarAnimacionesScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    // Aplicar animación a elementos
    document.querySelectorAll('.auto-card, .servicio-card, .stat').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

/* ============================================
   FUNCIONES ADICIONALES
   ============================================ */

// Desplazamiento suave a secciones
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Animación de carga
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

/* ============================================
   FUNCIONES PROFESIONALES DE BÚSQUEDA AVANZADA
   ============================================ */

// Variable global para categoría seleccionada
let categoriaSeleccionada = '';

// Toggle filtros avanzados
function toggleAdvancedFilters() {
    const advancedFilters = document.getElementById('advanced-filters');
    if (advancedFilters.style.display === 'none' || advancedFilters.style.display === '') {
        advancedFilters.style.display = 'block';
    } else {
        advancedFilters.style.display = 'none';
    }
}

// Limpiar filtros
function limpiarFiltros() {
    // Resetear formulario
    document.getElementById('search-form').reset();
    document.getElementById('quick-search').value = '';
    
    // Remover selección de categorías
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    categoriaSeleccionada = '';
    
    // Cargar todos los autos
    cargarAutos(autos);
    actualizarContadorResultados(autos.length);
}

// Búsqueda rápida en tiempo real
document.addEventListener('DOMContentLoaded', () => {
    const quickSearch = document.getElementById('quick-search');
    if (quickSearch) {
        quickSearch.addEventListener('input', (e) => {
            const busqueda = e.target.value.toLowerCase().trim();
            
            if (busqueda === '') {
                cargarAutos(autos);
                actualizarContadorResultados(autos.length);
                return;
            }
            
            const autosFiltrados = autos.filter(auto => {
                return (
                    auto.marca.toLowerCase().includes(busqueda) ||
                    auto.modelo.toLowerCase().includes(busqueda) ||
                    auto.versión?.toLowerCase().includes(busqueda) ||
                    auto.año.toString().includes(busqueda) ||
                    auto.color?.toLowerCase().includes(busqueda) ||
                    auto.combustible.toLowerCase().includes(busqueda) ||
                    auto.transmision.toLowerCase().includes(busqueda)
                );
            });
            
            cargarAutos(autosFiltrados);
            actualizarContadorResultados(autosFiltrados.length);
        });
    }
    
    // Configurar botones de categoría
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Toggle active state
            const categoria = btn.getAttribute('data-category');
            
            if (btn.classList.contains('active')) {
                btn.classList.remove('active');
                categoriaSeleccionada = '';
            } else {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                categoriaSeleccionada = categoria;
            }
            
            // Aplicar filtro inmediatamente
            aplicarFiltrosAvanzados();
        });
    });
    
    // Configurar ordenamiento
    const sortBy = document.getElementById('sort-by');
    if (sortBy) {
        sortBy.addEventListener('change', () => {
            const autosActuales = obtenerAutosFiltrados();
            const autosOrdenados = ordenarAutos(autosActuales, sortBy.value);
            cargarAutos(autosOrdenados);
        });
    }
});

// Aplicar filtros avanzados (mejorado)
function aplicarFiltrosAvanzados() {
    const autosFiltrados = obtenerAutosFiltrados();
    const autosOrdenados = ordenarAutos(autosFiltrados, document.getElementById('sort-by')?.value || 'destacado');
    
    cargarAutos(autosOrdenados);
    actualizarContadorResultados(autosOrdenados.length);
    
    // Scroll al inventario
    document.getElementById('inventario')?.scrollIntoView({ behavior: 'smooth' });
}

// Obtener autos filtrados según todos los criterios
function obtenerAutosFiltrados() {
    const marca = document.getElementById('marca')?.value.toLowerCase() || '';
    const modelo = document.getElementById('modelo')?.value.toLowerCase() || '';
    const anoMin = parseInt(document.getElementById('ano-min')?.value) || 0;
    const anoMax = parseInt(document.getElementById('ano-max')?.value) || 9999;
    const precioMin = parseInt(document.getElementById('precio-min')?.value) || 0;
    const precioMax = parseInt(document.getElementById('precio-max')?.value) || Number.MAX_SAFE_INTEGER;
    const kmMax = parseInt(document.getElementById('km-max')?.value) || Number.MAX_SAFE_INTEGER;
    const transmision = document.getElementById('transmision')?.value.toLowerCase() || '';
    const combustible = document.getElementById('combustible')?.value.toLowerCase() || '';
    const color = document.getElementById('color')?.value.toLowerCase() || '';
    const condicion = document.getElementById('condicion')?.value.toLowerCase() || '';
    
    return autos.filter(auto => {
        // Filtro por categoría
        if (categoriaSeleccionada && auto.categoria?.toLowerCase() !== categoriaSeleccionada) {
            return false;
        }
        
        // Filtro por marca
        if (marca && auto.marca.toLowerCase() !== marca) {
            return false;
        }
        
        // Filtro por modelo
        if (modelo && !auto.modelo.toLowerCase().includes(modelo)) {
            return false;
        }
        
        // Filtro por rango de año
        if (auto.año < anoMin || auto.año > anoMax) {
            return false;
        }
        
        // Filtro por rango de precio
        if (auto.precio < precioMin || auto.precio > precioMax) {
            return false;
        }
        
        // Filtro por kilometraje máximo
        if (auto.kilometraje > kmMax) {
            return false;
        }
        
        // Filtro por transmisión
        if (transmision && auto.transmision.toLowerCase() !== transmision) {
            return false;
        }
        
        // Filtro por combustible
        if (combustible && auto.combustible.toLowerCase() !== combustible) {
            return false;
        }
        
        // Filtro por color
        if (color && auto.color?.toLowerCase() !== color) {
            return false;
        }
        
        // Filtro por condición
        if (condicion === 'nuevo' && (auto.año < new Date().getFullYear() || auto.kilometraje > 100)) {
            return false;
        }
        if (condicion === 'seminuevo' && (auto.kilometraje > 50000 || auto.año < new Date().getFullYear() - 2)) {
            return false;
        }
        if (condicion === 'usado' && auto.kilometraje < 30000) {
            return false;
        }
        
        return true;
    });
}

// Ordenar autos según criterio seleccionado
function ordenarAutos(autosArray, criterio) {
    const autosCopia = [...autosArray];
    
    switch(criterio) {
        case 'precio-asc':
            return autosCopia.sort((a, b) => a.precio - b.precio);
        
        case 'precio-desc':
            return autosCopia.sort((a, b) => b.precio - a.precio);
        
        case 'ano-desc':
            return autosCopia.sort((a, b) => b.año - a.año);
        
        case 'ano-asc':
            return autosCopia.sort((a, b) => a.año - b.año);
        
        case 'km-asc':
            return autosCopia.sort((a, b) => a.kilometraje - b.kilometraje);
        
        case 'destacado':
        default:
            return autosCopia.sort((a, b) => {
                // Primero destacados
                if (a.destacado && !b.destacado) return -1;
                if (!a.destacado && b.destacado) return 1;
                // Luego por año más reciente
                return b.año - a.año;
            });
    }
}

// Actualizar contador de resultados
function actualizarContadorResultados(cantidad) {
    const resultadosText = cantidad === 1 ? '1 vehículo encontrado' : `${cantidad} vehículos encontrados`;
    const contador = document.getElementById('results-count');
    if (contador) {
        contador.textContent = resultadosText;
        
        // Animación de actualización
        contador.style.transform = 'scale(1.1)';
        setTimeout(() => {
            contador.style.transform = 'scale(1)';
        }, 200);
    }
}

// Actualizar formulario de búsqueda para usar filtros avanzados
document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            aplicarFiltrosAvanzados();
        });
    }
});

/* ============================================
   MODAL WHATSAPP
   ============================================ */

function mostrarOpcionesWhatsApp() {
    const modal = document.getElementById('modal-whatsapp');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function cerrarModalWhatsApp() {
    const modal = document.getElementById('modal-whatsapp');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Cerrar modal al hacer clic fuera
window.addEventListener('click', function(event) {
    const modal = document.getElementById('modal-whatsapp');
    if (event.target === modal) {
        cerrarModalWhatsApp();
    }
});

/* ============================================
   MEJORAS AVANZADAS - UX Y PERFORMANCE
   ============================================ */

// Botón Scroll to Top
document.addEventListener('DOMContentLoaded', function() {
    const scrollBtn = document.getElementById('scrollToTop');
    
    if (scrollBtn) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollBtn.classList.add('visible');
            } else {
                scrollBtn.classList.remove('visible');
            }
        });
        
        scrollBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});

// Animaciones al hacer scroll
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Agregar clases a elementos para animar
    document.querySelectorAll('.auto-card, .servicio-card, .service-card-modern').forEach((el, index) => {
        el.classList.add('fade-in');
        el.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(el);
    });
}

// Lazy Loading de imágenes
function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// Toast Notifications
function showToast(message, type = 'success') {
    const container = document.querySelector('.toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// Ripple Effect en botones
function addRippleEffect() {
    document.querySelectorAll('.btn-modern, .ver-detalles, button[type="submit"]').forEach(button => {
        button.classList.add('btn-ripple');
    });
}

// Mejorar formulario de contacto
function enhanceContactForm() {
    const form = document.querySelector('.contacto-form form');
    
    if (form && !form.dataset.enhanced) {
        form.dataset.enhanced = 'true';
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simular envío
            const submitBtn = form.querySelector('button[type="submit"]');
            if (!submitBtn) return;
            
            const originalText = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                if (window.CGIAutos && window.CGIAutos.showToast) {
                    showToast('¡Mensaje enviado correctamente! Te contactaremos pronto.', 'success');
                }
                form.reset();
            }, 2000);
        });
    }
}

// Contador de autos filtrados
function updateAutoCount() {
    const visibleAutos = document.querySelectorAll('.auto-card:not([style*="display: none"])').length;
    const countElement = document.getElementById('auto-count');
    
    if (countElement) {
        countElement.textContent = `${visibleAutos} vehículo${visibleAutos !== 1 ? 's' : ''} encontrado${visibleAutos !== 1 ? 's' : ''}`;
    }
}

// Agregar contador de autos después del título de inventario
function addAutoCounter() {
    const inventarioTitle = document.querySelector('.inventario h2');
    if (inventarioTitle && !document.getElementById('auto-count')) {
        const counter = document.createElement('p');
        counter.id = 'auto-count';
        counter.style.cssText = 'text-align: center; color: #6b7280; font-size: 1rem; margin-top: 0.5rem;';
        inventarioTitle.parentNode.insertBefore(counter, inventarioTitle.nextSibling);
    }
}

// Performance: Debounce para búsqueda
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Mejorar búsqueda rápida con debounce
function enhanceQuickSearch() {
    const quickSearch = document.getElementById('quick-search');
    
    if (quickSearch && quickSearch.dataset.enhanced !== 'true') {
        // Marcar como mejorado para evitar duplicados
        quickSearch.dataset.enhanced = 'true';
        
        // No hacer nada si ya tiene el listener original
        // El listener original ya está configurado en otro DOMContentLoaded
    }
}

// Smooth scroll para enlaces internos
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '#!') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// Detectar dispositivo móvil para optimizaciones
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Optimizaciones para móvil
function mobileOptimizations() {
    if (isMobile()) {
        // Deshabilitar hover effects en móvil
        document.body.classList.add('mobile-device');
        
        // Mejorar rendimiento en scroll
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }
}

// Inicializar todas las mejoras
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un poco para que los autos se carguen primero
    setTimeout(() => {
        initScrollAnimations();
        initLazyLoading();
        addRippleEffect();
        enhanceContactForm();
        addAutoCounter();
        initSmoothScroll();
        mobileOptimizations();
        
        // Actualizar contador al cargar
        updateAutoCount();
        
        console.log('🚀 CGI Autos - Todas las mejoras cargadas correctamente');
    }, 500);
});

// Exportar funciones útiles
window.CGIAutos = {
    showToast,
    updateAutoCount,
    isMobile
};
