# Panel Administrador CGI Autos

Panel completo para gestionar autos, imágenes y detalles del inventario.

## Instalación Local (Windows)

1. Abre `run_local.bat` - instalará dependencias y ejecutará la app
2. Abre tu navegador en `http://localhost:5000`
3. ¡Listo! Empieza a agregar autos

## Instalación en PythonAnywhere

### 1. Crear cuenta y Clonar el proyecto
```bash
git clone tu-repositorio
cd cgiautos-admin
```

### 2. Crear Virtual Environment
```bash
mkvirtualenv cgiautos --python=/usr/bin/python3.9
pip install -r requirements.txt
```

### 3. Configurar Web App en PythonAnywhere
- Ve a "Web" en tu dashboard
- Click "Add a new web app"
- Elige "Manual configuration" + Python 3.9
- En "Source code" apunta a `/home/tu_usuario/cgiautos-admin`
- En "WSGI configuration file" edita el archivo y asegúrate que importe:
```python
import sys
sys.path.insert(0, '/home/tu_usuario/cgiautos-admin')
from app import app as application
```

### 4. Configurar Rutas de archivos estáticos
En "Web" → "Static files":
- URL: `/static`
- Directory: `/home/tu_usuario/cgiautos-admin/static`

- URL: `/fotos-autos`
- Directory: `/home/tu_usuario/cgiautos-admin/fotos-autos`

### 5. Reload la app
- Botón "Reload" en la web app

## Archivos Importantes

- `app.py` - Backend Flask (APIs y rutas)
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
