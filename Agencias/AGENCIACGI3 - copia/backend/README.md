# Backend - CGI Autos API

Servidor Flask que gestiona la lógica de la aplicación CGI Autos.

## Estructura

- `app.py` - Aplicación Flask principal
- `wsgi.py` - Configuración WSGI para producción
- `requirements.txt` - Dependencias Python
- `autos.json` - Base de datos de vehículos
- `clientes.json` - Base de datos de clientes/testimonios
- `users.json` - Base de datos de usuarios
- `templates/` - Templates HTML (login, panel admin)

## Instalación

```bash
pip install -r requirements.txt
```

## Ejecutar localmente

```bash
python app.py
```

La aplicación se ejecutará en `http://localhost:5000`

## Despliegue en producción

### Railway
```bash
railway up
```

### Heroku
```bash
heroku create nombre-app
git push heroku main
```

### Render
1. Conecta el repositorio
2. Configura la carpeta base como `backend/`
3. El comando de start debería ser: `gunicorn wsgi:application`

## API Endpoints

### Autenticación
- `POST /login` - Login de usuario
- `GET /logout` - Logout

### Autos
- `GET /api/autos` - Listar todos los autos
- `GET /api/auto/<id>` - Obtener detalles de un auto
- `POST /api/auto` - Crear nuevo auto
- `PUT /api/auto/<id>` - Actualizar auto
- `DELETE /api/auto/<id>` - Eliminar auto

### Imágenes
- `POST /api/upload` - Subir imagen de auto
- `DELETE /api/delete-image` - Eliminar imagen
- `GET /fotos-autos/<filename>` - Servir imagen

### Clientes
- `GET /api/clientes` - Listar clientes
- `GET /api/clientes-gallery` - Galería para web
- `POST /api/cliente-upload` - Subir foto de cliente
- `DELETE /api/cliente/<id>` - Eliminar cliente

## Variables de entorno

Crea un archivo `.env` en esta carpeta:

```
FLASK_ENV=production
FLASK_SECRET_KEY=tu_clave_secreta_aqui
DATABASE_URL=opcional_para_bases_de_datos
```

## Base de datos

Actualmente utiliza archivos JSON. Para producción, considera migrar a:
- PostgreSQL
- MongoDB
- SQLite
