# 🏗️ ARQUITECTURA DEL PROYECTO - CGI AUTOS

---

## Diagrama General

```
                     ┌─────────────────────────────────────┐
                     │     USUARIO EN NAVEGADOR            │
                     │  (Chrome, Firefox, Safari, etc)     │
                     └─────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
        ┌──────────────────────┐        ┌──────────────────────┐
        │   NETLIFY (Frontend) │        │ PYTHONANYWHERE       │
        │                      │        │   (Backend)          │
        │  cgiautos.netlify    │        │ usuario.pythonanywhere.com
        │    o dominio         │        │   o dominio          │
        │                      │        │                      │
        │  ├─ index.html       │        │  ├─ app.py (Flask)   │
        │  ├─ styles.css       │────────├──│  ├─ wsgi.py        │
        │  ├─ script.js        │◄──────────│  ├─ users.json     │
        │  ├─ manifest.json    │        │  ├─ autos.json      │
        │  ├─ robots.txt       │        │  ├─ clientes.json   │
        │  └─ sitemap.xml      │        │  │                  │
        │                      │        │  ├─ fotos-autos/    │
        │  Contenido Estático  │        │  │  (30 imágenes)   │
        │  (HTML/CSS/JS)       │        │  │                  │
        │                      │        │  └─ clientes/       │
        │  • Responsive        │        │     (25 imágenes)   │
        │  • SEO Optimizado    │        │                      │
        │  • PWA ready         │        │  API REST + Admin    │
        │  • CDN global        │        │  • 17 endpoints      │
        │                      │        │  • Login secure      │
        └──────────────────────┘        │  • Image upload      │
                                        │  • CORS enabled      │
                                        └──────────────────────┘
```

---

## Flujo de Datos

```
FRONTEND (Netlify)              BACKEND (PythonAnywhere)
==================              =======================

Usuario abre                    
   ↓
index.html cargado             
   ↓
script.js ejecutado
   ↓
Llamada API ────────────────→  app.py recibe solicitud
                                   ↓
                              Verifica autenticación
                                   ↓
                              Procesa lógica
                                   ↓
                              Accede JSON files
                                   ↓
                              Maneja imágenes
                                   ↓
JSON response ←──────────────  Devuelve JSON
   ↓
UI se actualiza
   ↓
Usuario ve datos
```

---

## Estructura de Carpetas

```
cgiautos/
│
├─ Frontend (Netlify)
│  ├─ index.html (44.8 KB)
│  ├─ styles.css
│  ├─ styles-modern.css
│  ├─ script.js
│  ├─ script-modern.js
│  ├─ manifest.json
│  ├─ robots.txt
│  ├─ sitemap.xml
│  ├─ netlify.toml (configuración Netlify)
│  ├─ logo-cgi-autos.png
│  └─ admin.html
│
├─ Backend (PythonAnywhere)
│  ├─ app.py (11.7 KB)
│  ├─ wsgi.py
│  ├─ requirements.txt
│  │
│  ├─ Datos (JSON)
│  ├─ autos.json (6 autos)
│  ├─ users.json (1 usuario)
│  └─ clientes.json (25 clientes)
│
├─ Imágenes
│  ├─ fotos-autos/ (30 archivos)
│  │  └─ Imágenes de vehículos
│  └─ clientes-satisfechos/ (25 archivos)
│     └─ Imágenes de testimonios
│
├─ Templates HTML
│  ├─ templates/admin.html
│  ├─ templates/login.html
│  └─ templates/admin_clientes.html
│
└─ Documentación
   ├─ AUDIT_REPORT.md
   ├─ DEPLOYMENT_GUIDE.md
   ├─ STATUS_REPORT.md
   ├─ SECURITY_GUIDE.md
   ├─ FINAL_REPORT.md
   ├─ README.md
   └─ LOGIN_INFO.md
```

---

## Endpoints API (17 disponibles)

```
AUTENTICACIÓN
├─ POST   /login              → Login usuario
├─ GET    /logout             → Logout usuario
└─ GET    /                   → Panel admin (requiere login)

AUTOS (CRUD)
├─ GET    /api/autos          → Listar todos
├─ GET    /api/auto/<id>      → Obtener auto específico
├─ POST   /api/auto           → Crear nuevo auto
├─ PUT    /api/auto/<id>      → Editar auto
└─ DELETE /api/auto/<id>      → Eliminar auto

IMÁGENES
├─ POST   /api/upload         → Subir imagen auto
├─ DELETE /api/delete-image   → Eliminar imagen
└─ GET    /fotos-autos/<file> → Servir imagen

CLIENTES (Testimonios)
├─ GET    /api/clientes       → Listar clientes
├─ GET    /api/clientes-gallery → Galería pública
├─ POST   /api/cliente-upload → Subir foto cliente
├─ POST   /api/cliente        → Agregar cliente
├─ DELETE /api/cliente/<id>   → Eliminar cliente
└─ GET    /clientes-satisfechos/<file> → Servir imagen cliente
```

---

## Flujo de Trabajo - Admin Panel

```
┌─ USUARIO ACCEDE A:
│  https://api.cgiautos.com/login
│
├─ INGRESA CREDENCIALES:
│  • Usuario: grupocgiautos
│  • Contraseña: paneladmin20
│
├─ BACKEND VALIDA:
│  • Lee users.json
│  • Compara hash de contraseña
│  • Crea session segura
│
├─ ACCESO CONCEDIDO:
│  • Redirige a panel admin
│  • Session cookie generada
│
├─ EN PANEL ADMIN PUEDE:
│  ├─ Ver lista de autos
│  ├─ Agregar nuevo auto
│  ├─ Editar auto existente
│  ├─ Eliminar auto
│  ├─ Subir imágenes (comprimidas automáticamente)
│  ├─ Gestionar clientes satisfechos
│  └─ Salir (logout)
│
└─ CAMBIOS GUARDADOS EN:
   └─ autos.json + clientes.json (local storage)
      (Nota: en producción, considerar base de datos)
```

---

## Ciclo de Vida de una Imagen

```
USUARIO SELECCIONA IMAGEN
         ↓
Frontend valida formato (PNG, JPG, GIF, WEBP)
         ↓
Envía a /api/upload (max 10MB)
         ↓
Backend recibe archivo
         ↓
Convierte a JPEG si es necesario
         ↓
Redimensiona (max 1200x1200)
         ↓
Comprime (calidad 85)
         ↓
Guarda en fotos-autos/ o clientes-satisfechos/
         ↓
Actualiza JSON con referencia
         ↓
Devuelve ruta al frontend
         ↓
Frontend muestra imagen en galería
```

---

## Tecnologías Utilizadas

```
FRONTEND (Netlify)
├─ HTML5
├─ CSS3 (estilos modernos)
├─ Vanilla JavaScript (sin frameworks)
├─ Font Awesome (iconos)
├─ Google Fonts
└─ PWA Manifest

BACKEND (PythonAnywhere)
├─ Python 3.11.9
├─ Flask 3.1.2
├─ Werkzeug 3.0.1 (utilidades Flask)
├─ Pillow (procesamiento de imágenes)
├─ python-dotenv (variables de entorno)
├─ Seguridad: werkzeug.security
└─ JSON como base de datos

INFRAESTRUCTURA
├─ Netlify: Hosting frontend
├─ PythonAnywhere: Hosting backend
├─ GitHub: Control de versiones
└─ SSL/TLS: HTTPS automático
```

---

## Flujo de Deployment

```
DESARROLLO (Local)
    ↓
    ├─ python app.py
    ├─ http://localhost:5000
    └─ Testing local
    
    ↓
    
VERSIÓN CONTROL
    ├─ git add .
    ├─ git commit -m "v1.0"
    └─ git push origin main
    
    ↓
    
PRODUCCIÓN
    ├─ NETLIFY
    │  ├─ Conectar repo GitHub
    │  ├─ Auto-build (sitio estático)
    │  ├─ Deploy automático
    │  └─ https://cgiautos.netlify.app
    │
    └─ PYTHONANYWHERE
       ├─ Clone repo
       ├─ pip install -r requirements.txt
       ├─ Crear virtual environment
       ├─ Configurar Web App
       └─ https://usuario.pythonanywhere.com
```

---

## URLs Post-Deployment

```
PRODUCCIÓN
├─ Frontend
│  ├─ Página principal: https://cgiautos.com
│  ├─ Sitio completo: https://cgiautos.netlify.app
│  └─ Admin (redirige a backend): /login
│
├─ Backend
│  ├─ Base URL: https://api.cgiautos.com
│  ├─ Login: https://api.cgiautos.com/login
│  ├─ Admin panel: https://api.cgiautos.com/
│  ├─ APIs: https://api.cgiautos.com/api/*
│  ├─ Fotos autos: https://api.cgiautos.com/fotos-autos/*
│  └─ Fotos clientes: https://api.cgiautos.com/clientes-satisfechos/*
│
└─ SEO
   ├─ robots.txt: https://cgiautos.com/robots.txt
   ├─ sitemap.xml: https://cgiautos.com/sitemap.xml
   └─ manifest.json: https://cgiautos.com/manifest.json
```

---

## Flujo de Seguridad

```
SOLICITUD HTTP
    ↓
┌─ ¿Es /api/?
│  ├─ Sí → Verifica Session
│  │  ├─ ¿Session válida?
│  │  │  ├─ Sí → Procesa solicitud
│  │  │  └─ No → Error 401
│  └─ No → Permite acceso
│
├─ Valida tipo de archivo (si es upload)
│  ├─ PNG, JPG, GIF, WEBP → Permitido
│  └─ Otros → Rechazado
│
├─ Valida tamaño (max 10MB)
│  ├─ < 10MB → Aceptado
│  └─ > 10MB → Rechazado
│
├─ Procesa imagen
│  ├─ Comprime
│  ├─ Redimensiona
│  └─ Optimiza
│
└─ Responde al cliente
```

---

## Seguridad Implementada

```
FRONTEND
├─ CSP Headers
├─ X-Frame-Options: DENY
├─ X-XSS-Protection
├─ Referrer-Policy
└─ Cache-Control optimizado

BACKEND
├─ Session management
├─ Password hashing (werkzeug.security)
├─ CSRF protection (Flask built-in)
├─ File validation
├─ Size limits
├─ HTTPS enforced
└─ Logging de errores

DATOS
├─ JSON files con permisos restrictivos
├─ Credenciales hasheadas
├─ Backup recomendado
└─ Encriptación en tránsito (HTTPS)
```

---

## Escalabilidad Futura

```
FASE ACTUAL (MVP)
└─ JSON como base de datos
   └─ Perfecto para < 100 autos

FASE SIGUIENTE (Escalable)
├─ Migrar a PostgreSQL/MySQL
├─ Agregar caché (Redis)
├─ Usar CDN para imágenes (Cloudinary)
├─ Agregar búsqueda avanzada
└─ Implementar analytics

FASE AVANZADA (Enterprise)
├─ Microservicios
├─ Kubernetes deployment
├─ RabbitMQ para tasks
├─ ElasticSearch para búsqueda
└─ GraphQL API
```

---

## Monitoreo Recomendado

```
NETLIFY
├─ Analytics (tráfico)
├─ Build logs
├─ Performance metrics
└─ Error tracking

PYTHONANYWHERE
├─ Web app logs
├─ CPU/Memory usage
├─ Request history
├─ Error logs
└─ Auto-reload settings

GENERAL
├─ Uptime monitoring (Pingdom)
├─ Error tracking (Sentry)
├─ Performance (GTmetrix)
└─ SEO monitoring (Google Search Console)
```

---

**Documento Arquitectura - Versión 1.0**  
*Generado: 2025-12-09*
