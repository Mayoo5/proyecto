# 🔐 GUÍA DE SEGURIDAD - CAMBIO DE SECRET KEY

## ⚠️ CRITICIDAD: ALTA

La secret key en tu aplicación Flask es usada para:
- Encriptación de sesiones
- CSRF tokens
- Cookies seguras

**DEBE ser cambiada ANTES de subir a producción**

---

## 🔑 ¿Cómo cambiarla?

### Paso 1: Generar una nueva secret key

Ejecuta este código Python:

```python
import secrets
print(secrets.token_hex(32))
```

Esto te generará algo como:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

### Paso 2: Reemplazar en app.py

Abre `app.py` y encuentra la línea 14:

```python
app.secret_key = 'tu_clave_secreta_super_segura_cambiar_en_produccion'
```

Reemplázala por (tu clave generada):

```python
app.secret_key = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6'
```

### Paso 3: Verificar cambio

Asegúrate que no dice más "cambiar_en_produccion":

```bash
grep "secret_key" app.py
```

Debe mostrar tu nueva clave, no el placeholder.

---

## 🛡️ ALTERNATIVA: Usar Variables de Entorno (RECOMENDADO)

Es más seguro guardar la secret key en variables de entorno:

### En app.py:

```python
import os
from dotenv import load_dotenv

load_dotenv()  # Cargar archivo .env

app.secret_key = os.getenv('SECRET_KEY', 'fallback_key_123')
```

### Crear archivo .env:

En la raíz del proyecto, crear archivo `.env`:

```
SECRET_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
FLASK_ENV=production
FLASK_DEBUG=0
```

### En .gitignore:

Agregar `.env` para NO subir al repositorio:

```
.env
__pycache__/
*.pyc
.DS_Store
```

---

## ✅ VERIFICAR CAMBIO

Después de cambiar la secret key, ejecuta:

```bash
python app.py
```

Si ve algo como:

```
* Running on http://localhost:5000
```

Significa que funcionó. Luego test el login:

1. Abre http://localhost:5000/login
2. Intenta login con:
   - Usuario: `grupocgiautos`
   - Contraseña: `paneladmin20`
3. Si funciona, ¡cambio exitoso!

---

## 📝 SEGURIDAD ADICIONAL

### Cambiar también la contraseña de admin:

En `users.json`, la contraseña está hasheada. Para cambiarla:

1. Usa esta función Python:

```python
from werkzeug.security import generate_password_hash

nueva_password = generate_password_hash("tu_nueva_contraseña")
print(nueva_password)
```

2. Reemplaza en users.json:

```json
{
  "users": [
    {
      "username": "grupocgiautos",
      "password": "NEW_HASH_AQUI"
    }
  ]
}
```

---

## ⚠️ IMPORTANTE PARA PYTHONANYWHERE

Una vez en PythonAnywhere:

1. Edita app.py y cambia la secret key
2. O mejor aún, usa variables de entorno:

En "Web" → "WSGI configuration file":

```python
import os
os.environ['SECRET_KEY'] = 'tu_clave_generada'
os.environ['FLASK_ENV'] = 'production'
```

3. Luego Reload la app

---

## 🔄 DIFERENTES CLAVES PARA CADA AMBIENTE

**Desarrollo (local):**
```python
app.secret_key = 'dev_key_123_insegura_ok_solo_para_desarrollo'
```

**Producción (PythonAnywhere):**
```python
app.secret_key = 'prod_key_aleatoria_super_segura_cambiar_periodicamente'
```

---

## 📊 LISTADO DE TODAS LAS CONTRASEÑAS/KEYS A CAMBIAR

| Item | Actual | Tipo | Prioridad |
|------|--------|------|-----------|
| app.secret_key | 'tu_clave_secreta...' | Texto | 🔴 CRÍTICA |
| admin password | grupocgiautos/paneladmin20 | Hash | 🟠 Alta |
| FLASK_DEBUG | No especificado | Boolean | 🟡 Media |

---

## ✅ CHECKLIST SEGURIDAD ANTES DE PRODUCCIÓN

- [ ] Secret key cambiada ✅
- [ ] .env no subido a git ✅
- [ ] FLASK_DEBUG = False ✅
- [ ] FLASK_ENV = production ✅
- [ ] Contraseña admin cambiada (opcional) ✅
- [ ] HTTPS habilitado ✅
- [ ] CORS configurado ✅

---

**Última actualización:** 2025-12-09  
**Leer antes de deployment:** OBLIGATORIO
