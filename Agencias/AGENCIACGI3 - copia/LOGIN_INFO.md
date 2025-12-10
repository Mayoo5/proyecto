# 🔐 Sistema de Login - CGI Autos Admin Panel

## Credenciales por Defecto

**Usuario:** admin  
**Contraseña:** admin123

## Cómo Usar

1. Ejecuta la aplicación (`run_local.bat` o `python app.py`)
2. Abre `http://localhost:5000/login`
3. Ingresa las credenciales
4. ¡Acceso al panel!

## Cambiar Contraseña (Línea de comandos)

```python
from werkzeug.security import generate_password_hash
import json

# Generar nueva contraseña encriptada
new_password = generate_password_hash("tu_nueva_contraseña")

# Actualizar en users.json
with open('users.json', 'r') as f:
    data = json.load(f)

data['users'][0]['password'] = new_password

with open('users.json', 'w') as f:
    json.dump(data, f, indent=2)

print("Contraseña actualizada")
```

## Agregar Nuevo Usuario

Edita `users.json` y agrega:

```json
{
  "users": [
    {
      "username": "admin",
      "password": "pbkdf2:sha256:600000$..."
    },
    {
      "username": "nuevo_usuario",
      "password": "pbkdf2:sha256:600000$..."
    }
  ]
}
```

## Seguridad en PythonAnywhere

⚠️ **IMPORTANTE:** Antes de subir a producción:

1. Cambia la `secret_key` en `app.py` a algo único y fuerte
2. Cambia la contraseña del admin
3. No dejes `debug=True` en el servidor

### En app.py:
```python
app.secret_key = 'una_clave_super_larga_y_aleatoria_aqui'
```

Puedes generar una clave aleatoria con:
```python
import secrets
print(secrets.token_hex(32))
```

## Funciones del Login

✅ Validación de usuario y contraseña  
✅ Sesiones seguras  
✅ Protección de rutas (sin login = redirect)  
✅ Protección de APIs (sin login = error 401)  
✅ Botón "Cerrar Sesión" en el panel  
✅ Cookies de sesión seguras

