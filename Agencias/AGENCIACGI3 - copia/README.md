# CGI Autos - Agencia de Vehículos

Sistema completo para gestionar catálogo de autos, testimonios de clientes e inventario.

## Estructura del Proyecto

```
AGENCIACGI3/
├── frontend/                    # Sitio web estático
│   ├── index.html              # Página principal
│   ├── admin.html              # Panel de admin
│   ├── admin_clientes_satisfechos.html  # Testimonios
│   ├── styles/                 # CSS
│   ├── scripts/                # JavaScript
│   ├── fotos-autos/            # Imágenes de vehículos
│   ├── clientes-satisfechos/   # Fotos de testimonios
│   └── README.md               # Docs del frontend
│
└── backend/                     # API y servidor
    ├── app.py                  # Aplicación Flask
    ├── wsgi.py                 # Configuración WSGI
    ├── requirements.txt        # Dependencias Python
    ├── autos.json              # BD de vehículos
    ├── clientes.json           # BD de testimonios
    ├── users.json              # BD de usuarios
    ├── templates/              # Templates HTML
    └── README.md               # Docs del backend
```

## Ventajas de esta estructura

✅ **Frontend y Backend separados** - Mejor organización y mantenimiento
✅ **Despliegue independiente** - Actualizar cada uno por separado
✅ **Escalable** - Fácil agregar más funcionalidades
✅ **CDN optimizado** - Frontend en Netlify (gratis y rápido)
✅ **Backend flexible** - Deploy en Railway, Heroku, Render, etc.

## Ejecución Local

### 1. Abrir la página web
```bash
# Opción A: Simplemente abre frontend/index.html en tu navegador
# O con servidor local para desarrollo:
cd frontend
python -m http.server 8000
```

Luego abre `http://localhost:8000`

### 2. Ejecutar el backend (API)
```bash
# Windows - Ejecuta run_local.bat (automático)
# O manualmente:
cd backend
pip install -r requirements.txt
python app.py
```

Backend disponible en `http://localhost:5000`

## Despliegue en Producción

### Frontend → Netlify (Gratis)
1. Push a GitHub
2. En Netlify, crea nuevo proyecto
3. Conecta el repo y selecciona carpeta base: `frontend/`
4. ¡Listo! Tu sitio está online

### Backend → Railway/Heroku/Render
1. Push a GitHub
2. En tu plataforma de deploy:
   - Conecta el repo
   - Carpeta base: `backend/`
   - Start command: `python app.py` (o `gunicorn wsgi:application`)
3. ¡Listo! Tu API está online

## Archivos Importantes

- `backend/app.py` - Backend Flask (APIs)

- `wsgi.py` - Configuración para PythonAnywhere
- `templates/admin.html` - Panel administrador
- `autos.json` - Base de datos (persiste los datos)
- `fotos-autos/` - Carpeta para almacenar imágenes

## Características

✅ Crear, editar y eliminar autos
✅ Subir y gestionar múltiples imágenes
✅ Detalles técnicos (motor, transmisión, combustible)
✅ Características y equipamiento
✅ Dashboard con estadísticas
✅ Búsqueda en tiempo real
✅ Interfaz responsive

## Datos Guardados

- Autos: `autos.json` (estructura JSON)
- Imágenes: carpeta `fotos-autos/`
- Las imágenes se comprimen automáticamente

## Soporte

Si algo no funciona:
1. Verifica que Flask esté instalado
2. Revisa los logs en PythonAnywhere
3. Asegúrate que la carpeta `fotos-autos/` exista
