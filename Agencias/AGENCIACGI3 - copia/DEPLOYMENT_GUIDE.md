# GUÍA DE DEPLOYMENT - CGI AUTOS

## 🚀 DEPLOYMENT EN NETLIFY (Frontend)

### Paso 1: Preparar Repositorio
```bash
# Si no tienes git inicializado
git init
git add .
git commit -m "CGI Autos - Initial commit"
git branch -M main
git remote add origin https://github.com/tusuario/cgiautos-frontend.git
git push -u origin main
```

### Paso 2: Conectar en Netlify
1. Ve a [netlify.com](https://netlify.com)
2. Haz login / Crea cuenta
3. Click "Add new site"
4. Selecciona "Import an existing project"
5. Conecta tu repositorio GitHub
6. Deploy settings:
   - **Build command:** `echo 'Sitio estático listo'`
   - **Publish directory:** `.`
   - **Node version:** N/A (sitio estático)
7. Click "Deploy"

### Paso 3: Configurar Dominio
1. En Netlify, ve a "Domain settings"
2. Click "Add domain"
3. Ingresa tu dominio personalizado
4. Configura DNS según instrucciones de Netlify

### Paso 4: Validar Despliegue
- [ ] Frontend cargue correctamente
- [ ] SEO: robots.txt y sitemap.xml accesibles
- [ ] Imágenes se carguen
- [ ] Links a APIs funcionen (aunque retorne 404 sin backend)

---

## 🐍 DEPLOYMENT EN PYTHONANYWHERE (Backend)

### Paso 1: Crear Cuenta
1. Ve a [pythonanywhere.com](https://pythonanywhere.com)
2. Crea cuenta gratuita o paga
3. Confirma email

### Paso 2: Subir Código
Opción A - Git Clone:
```bash
# En consola bash de PythonAnywhere
git clone https://github.com/tusuario/cgiautos-backend.git cgiautos
cd cgiautos
```

Opción B - Upload manual:
- Upload todos los archivos via consola

### Paso 3: Crear Virtual Environment
```bash
# En consola bash de PythonAnywhere
mkvirtualenv cgiautos --python=/usr/bin/python3.9
pip install -r requirements.txt
```

### Paso 4: Configurar Web App
1. En PythonAnywhere dashboard, ve a "Web"
2. Click "Add a new web app"
3. Selecciona "Manual configuration"
4. Elige "Python 3.9"
5. En la siguiente pantalla:

**Source code:**
```
/home/tu_username/cgiautos
```

**Virtualenv:**
```
/home/tu_username/.virtualenvs/cgiautos
```

**WSGI configuration file:**
Edita el archivo y reemplaza el contenido con:
```python
import sys
import os

# Agregar la carpeta del proyecto al path
project_folder = '/home/tu_username/cgiautos'
sys.path.insert(0, project_folder)
os.chdir(project_folder)

# Importar la aplicación
from app import app as application
```

### Paso 5: Configurar Archivos Estáticos
Ve a "Web" → "Static files" y agrega:

| URL | Directory |
|-----|-----------|
| `/fotos-autos` | `/home/tu_username/cgiautos/fotos-autos` |
| `/clientes-satisfechos` | `/home/tu_username/cgiautos/clientes-satisfechos` |

### Paso 6: Configurar Variables de Entorno
En "Web" → "WSGI configuration file", actualiza:
```python
# Agregar antes de importar app
os.environ['FLASK_ENV'] = 'production'
os.environ['FLASK_DEBUG'] = '0'
```

### Paso 7: Reload la App
1. En "Web", busca el botón "Reload" de tu web app
2. Click para recargar
3. Verifica que aparezca "Loaded successfully"

### Paso 8: Obtener URL
Tu app estará disponible en:
```
https://tu_username.pythonanywhere.com
```

---

## 🔧 CONFIGURACIÓN DESPUÉS DEL DEPLOYMENT

### 1. Cambiar Secret Key (IMPORTANTE)
En `app.py` línea 14:
```python
# ANTES
app.secret_key = 'tu_clave_secreta_super_segura_cambiar_en_produccion'

# DESPUÉS
app.secret_key = 'TU_NUEVA_CLAVE_ALEATORIA_SUPER_SEGURA_AQUI'
```

Generar clave segura:
```python
import secrets
print(secrets.token_hex(32))
```

### 2. Actualizar URLs en Frontend
En el archivo que hace llamadas a API, cambiar:
```javascript
// ANTES (desarrollo)
const API_URL = 'http://localhost:5000'

// DESPUÉS (producción)
const API_URL = 'https://tu_username.pythonanywhere.com'
```

### 3. Configurar CORS si es necesario
En `app.py`, después de crear la app, agregar:
```python
from flask_cors import CORS
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://cgiautos.netlify.app"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type"]
    }
})
```

Luego instalar: `pip install flask-cors`

---

## 🧪 TESTING PRE-DEPLOYMENT

### Test 1: Verificar Frontend
```bash
# Abrir en navegador
https://tu_dominio.netlify.app

# Verifica:
- [ ] Página cargue sin errores
- [ ] Imágenes se vean
- [ ] Responsive en móvil
- [ ] Navegación funcione
```

### Test 2: Verificar Backend
```bash
# Abrir en navegador
https://tu_username.pythonanywhere.com/login

# Verifica:
- [ ] Página de login cargue
- [ ] Puedas hacer login
- [ ] Panel admin cargue después de login
```

### Test 3: Verificar APIs
```bash
# Abrir en navegador o Postman
GET https://tu_username.pythonanywhere.com/api/autos

# Debe devolver:
{
  "autos": [...]
}
```

### Test 4: Verificar Imágenes
```
https://tu_username.pythonanywhere.com/fotos-autos/1_20251128_102103_01clio12.jpg
```

---

## 🔐 CHECKLIST FINAL SEGURIDAD

Antes de mostrar en producción:

- [ ] ✅ Secret key cambió
- [ ] ✅ Debug=False en app.py
- [ ] ✅ HTTPS habilitado en ambas plataformas
- [ ] ✅ robots.txt actualizado
- [ ] ✅ sitemap.xml actualizado
- [ ] ✅ CORS configurado correctamente
- [ ] ✅ Variables sensibles en .env (no en código)
- [ ] ✅ Login funciona
- [ ] ✅ Upload de imágenes funciona
- [ ] ✅ API endpoints responden

---

## 📊 MONITOREO POST-DEPLOYMENT

### Netlify
- Ir a Analytics para ver tráfico
- Configurar alertas de errores
- Revisar Deploy logs si hay problemas

### PythonAnywhere
- Revisar Web app logs para errores
- Monitorear CPU/memoria usage
- Configurar auto-restart

---

## 🆘 TROUBLESHOOTING

### Error 404 al acceder a /api/autos
**Causa:** Frontend intenta conectar a localhost  
**Solución:** Actualizar URL base en frontend a PythonAnywhere

### Error 500 en login
**Causa:** users.json no encontrado  
**Solución:** Verificar archivo existe en servidor

### Error 403 CSRF
**Causa:** Session inválida  
**Solución:** Asegurar que secret_key sea consistente

### Imágenes no cargan
**Causa:** Rutas estáticas mal configuradas  
**Solución:** Verificar static files en Web → Static files

### CORS error
**Causa:** Frontend y backend en dominios diferentes  
**Solución:** Instalar flask-cors y configurar orígenes permitidos

---

## 📝 NOTES

- Ambas plataformas tienen tier gratuito
- Netlify: 300 minutos de build/mes gratis
- PythonAnywhere: 100MB almacenamiento gratis
- Para producción considera tier pago

---

**Última actualización:** 2025-12-09
