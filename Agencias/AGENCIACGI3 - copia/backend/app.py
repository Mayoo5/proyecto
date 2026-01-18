from flask import Flask, render_template, request, jsonify, send_from_directory, session, redirect, url_for
from flask_cors import CORS
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from PIL import Image

# Intentar importar pillow_heif (opcional para HEIC/HEC support)
try:
    import pillow_heif  # type: ignore
    pillow_heif.register_heic_opener()
except ImportError:
    pass  # pillow_heif no está instalado, HEIC/HEC no serán soportados

import json
import os
from datetime import datetime
import mimetypes
import io
import base64

# Obtener la ruta base del proyecto
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend')
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATES_DIR = os.path.join(BACKEND_DIR, 'templates')

# Asegurar que autos.json existe en BACKEND_DIR (carpeta persistente)
AUTOS_JSON_PATH = os.path.join(BACKEND_DIR, 'autos.json')

app = Flask(__name__, template_folder=TEMPLATES_DIR, static_folder=os.path.join(FRONTEND_DIR), static_url_path='')
app.secret_key = 'tu_clave_secreta_super_segura_cambiar_en_produccion'
CORS(app)

# Configuración
UPLOAD_FOLDER = os.path.join(FRONTEND_DIR, 'fotos-autos')
CLIENTES_FOLDER = os.path.join(FRONTEND_DIR, 'clientes-satisfechos')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'heic', 'hec'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Crear carpetas si no existen
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CLIENTES_FOLDER, exist_ok=True)

# Debug: Imprimir rutas para verificar
print(f"UPLOAD_FOLDER: {UPLOAD_FOLDER}")
print(f"¿Existe UPLOAD_FOLDER? {os.path.exists(UPLOAD_FOLDER)}")
print(f"¿Puede escribir en UPLOAD_FOLDER? {os.access(UPLOAD_FOLDER, os.W_OK)}")

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_autos_data():
    """Carga los datos de autos.json desde carpeta persistente"""
    try:
        print(f"[DEBUG] Intentando cargar autos.json desde: {AUTOS_JSON_PATH}")
        print(f"[DEBUG] ¿Existe el archivo? {os.path.exists(AUTOS_JSON_PATH)}")
        
        with open(AUTOS_JSON_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
            print(f"[DEBUG] Datos cargados exitosamente. Keys: {data.keys()}")
            return data
    except FileNotFoundError:
        print(f"[ERROR] Archivo no encontrado: {AUTOS_JSON_PATH}")
        # Si no existe, crear archivo por defecto
        default_data = {"autos_ejemplo": []}
        save_autos_data(default_data)
        return default_data
    except Exception as e:
        print(f"[ERROR] Error cargando autos.json: {e}")
        return {"autos_ejemplo": []}

def get_users_data():
    """Carga los datos de usuarios"""
    try:
        users_path = os.path.join(BACKEND_DIR, 'users.json')
        with open(users_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        # Crear usuario por defecto
        default_users = {
            "users": [
                {
                    "username": "grupocgiautos",
                    "password": generate_password_hash("paneladmin20")
                }
            ]
        }
        save_users_data(default_users)
        return default_users

def save_users_data(data):
    """Guarda los datos de usuarios"""
    users_path = os.path.join(BACKEND_DIR, 'users.json')
    with open(users_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def save_autos_data(data):
    """Guarda los datos en autos.json (carpeta persistente)"""
    try:
        with open(AUTOS_JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"✓ Autos guardados en: {AUTOS_JSON_PATH}")
    except Exception as e:
        print(f"✗ Error guardando autos.json: {e}")

def get_clientes_data():
    """Carga los datos de clientes"""
    try:
        clientes_path = os.path.join(BACKEND_DIR, 'clientes.json')
        print(f"[DEBUG] Intentando cargar clientes.json desde: {clientes_path}")
        print(f"[DEBUG] ¿Existe el archivo? {os.path.exists(clientes_path)}")
        
        with open(clientes_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            print(f"[DEBUG] Clientes cargados exitosamente. Keys: {data.keys()}")
            return data
    except FileNotFoundError:
        print(f"[ERROR] Archivo no encontrado: clientes.json")
        return {"clientes": []}
    except Exception as e:
        print(f"[ERROR] Error cargando clientes.json: {e}")
        return {"clientes": []}

def save_clientes_data(data):
    """Guarda los datos de clientes"""
    clientes_path = os.path.join(BACKEND_DIR, 'clientes.json')
    with open(clientes_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def compress_image(filepath, max_width=1200, max_height=1200, quality=85):
    """Comprime y optimiza la imagen"""
    try:
        img = Image.open(filepath)
        
        # Convertir RGBA a RGB si es necesario
        if img.mode == 'RGBA':
            img = img.convert('RGB')
        
        # Redimensionar si es más grande
        img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
        
        # Guardar optimizada (siempre como JPEG para compatibilidad)
        img.save(filepath, 'JPEG', quality=quality, optimize=True)
        return True
    except Exception as e:
        print(f"Error comprimiendo imagen: {e}")
        return False

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Login de usuario"""
    if request.method == 'POST':
        data = request.json
        username = data.get('username')
        password = data.get('password')
        
        users_data = get_users_data()
        for user in users_data.get('users', []):
            if user.get('username') == username and check_password_hash(user.get('password', ''), password):
                session['logged_in'] = True
                session['username'] = username
                return jsonify({'success': True})
        
        return jsonify({'success': False, 'error': 'Usuario o contraseña incorrectos'}), 401
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    """Logout"""
    session.clear()
    return redirect(url_for('login'))

@app.before_request
def check_login():
    """Verifica si el usuario está logeado"""
    if request.path.startswith('/api/'):
        # Permitir GET a endpoints públicos sin autenticación
        if request.path in ['/api/autos', '/api/clientes-gallery', '/api/carousel-images'] and request.method == 'GET':
            return None
        # Resto de APIs requieren autenticación
        if not session.get('logged_in'):
            return jsonify({'error': 'No autenticado'}), 401
    elif request.path not in ['/login', '/static']:
        if not session.get('logged_in') and request.path != '/':
            return redirect(url_for('login'))

@app.route('/')
def index():
    """Redirige al login"""
    if session.get('logged_in'):
        return render_template('admin.html')
    return redirect(url_for('login'))

@app.route('/admin')
def admin_page():
    """Sirve la página de admin pública"""
    return send_from_directory(FRONTEND_DIR, 'admin.html')

@app.route('/clientes-satisfechos-page')
def clientes_page():
    """Sirve la página de clientes satisfechos"""
    return send_from_directory(FRONTEND_DIR, 'admin_clientes_satisfechos.html')

@app.route('/api/autos', methods=['GET'])
def get_autos():
    """Obtiene lista de autos"""
    try:
        data = get_autos_data()
        # Si tiene 'autos_ejemplo', usar eso; si no, devolver vacío
        autos = data.get('autos_ejemplo', data.get('autos', []))
        print(f"[API] GET /api/autos - Retornando {len(autos)} autos")
        return jsonify(autos)
    except Exception as e:
        print(f"[ERROR] GET /api/autos - {str(e)}")
        return jsonify([]), 500

@app.route('/api/auto/<int:auto_id>', methods=['GET'])
def get_auto(auto_id):
    """Obtiene detalles de un auto específico"""
    data = get_autos_data()
    for auto in data.get('autos_ejemplo', []):
        if auto.get('id') == auto_id:
            return jsonify(auto)
    return jsonify({'error': 'Auto no encontrado'}), 404

@app.route('/api/auto', methods=['POST'])
def create_auto():
    """Crea un nuevo auto - SIN temporales, guardado directo y permanente"""
    data = get_autos_data()
    autos = data.get('autos_ejemplo', [])
    
    new_auto = request.json
    
    # Generar nuevo ID PRIMERO (antes de procesar imágenes)
    new_id = max([auto.get('id', 0) for auto in autos], default=0) + 1
    new_auto['id'] = new_id
    new_auto['imagenes'] = new_auto.get('imagenes', [])
    
    # Procesar imágenes - renombrar sin usar temporales
    imagenes_finales = []
    for img_path in new_auto.get('imagenes', []):
        if img_path and img_path.startswith('fotos-autos/'):
            # Obtener nombre del archivo
            old_filename = img_path.replace('fotos-autos/', '')
            
            # Si aún tiene _temp_, renombrarlo con el ID real
            if '_temp_' in old_filename:
                new_filename = old_filename.replace('_temp_', f'{new_id}_', 1)
            else:
                # Si ya no tiene _temp_, simplemente usar como está
                new_filename = old_filename
            
            old_path = os.path.join(UPLOAD_FOLDER, old_filename)
            new_path = os.path.join(UPLOAD_FOLDER, new_filename)
            
            try:
                if os.path.exists(old_path) and old_path != new_path:
                    os.rename(old_path, new_path)
                    print(f"✓ Imagen guardada permanentemente: {new_filename}")
                
                imagenes_finales.append(f'fotos-autos/{new_filename}')
            except Exception as e:
                print(f"Error procesando imagen: {e}")
                imagenes_finales.append(f'fotos-autos/{new_filename}')
        else:
            imagenes_finales.append(img_path)
    
    new_auto['imagenes'] = imagenes_finales
    new_auto['imagen'] = imagenes_finales[0] if imagenes_finales else ''
    
    # GUARDAR INMEDIATAMENTE EN autos.json
    autos.append(new_auto)
    data['autos_ejemplo'] = autos
    save_autos_data(data)
    
    print(f"✅ Auto #{new_id} guardado permanentemente en autos.json")
    return jsonify(new_auto), 201

@app.route('/api/auto/<int:auto_id>', methods=['PUT'])
def update_auto(auto_id):
    """Actualiza un auto existente - SIN temporales, guardado directo"""
    data = get_autos_data()
    autos = data.get('autos_ejemplo', [])
    
    for i, auto in enumerate(autos):
        if auto.get('id') == auto_id:
            updated_data = request.json
            
            # Procesar imágenes - sin usar temporales
            imagenes_finales = []
            for img_path in updated_data.get('imagenes', []):
                if img_path and img_path.startswith('fotos-autos/'):
                    # Obtener nombre del archivo
                    old_filename = img_path.replace('fotos-autos/', '')
                    
                    # Si aún tiene _temp_, renombrarlo con el ID real
                    if '_temp_' in old_filename:
                        new_filename = old_filename.replace('_temp_', f'{auto_id}_', 1)
                    else:
                        # Si ya no tiene _temp_, simplemente usar como está
                        new_filename = old_filename
                    
                    old_path = os.path.join(UPLOAD_FOLDER, old_filename)
                    new_path = os.path.join(UPLOAD_FOLDER, new_filename)
                    
                    try:
                        if os.path.exists(old_path) and old_path != new_path:
                            os.rename(old_path, new_path)
                            print(f"✓ Imagen guardada permanentemente en update: {new_filename}")
                        
                        imagenes_finales.append(f'fotos-autos/{new_filename}')
                    except Exception as e:
                        print(f"Error procesando imagen en update: {e}")
                        imagenes_finales.append(f'fotos-autos/{new_filename}')
                else:
                    imagenes_finales.append(img_path)
            
            # Actualizar datos del auto
            autos[i].update(updated_data)
            autos[i]['imagenes'] = imagenes_finales
            autos[i]['imagen'] = imagenes_finales[0] if imagenes_finales else autos[i].get('imagen', '')
            
            # GUARDAR INMEDIATAMENTE EN autos.json
            data['autos_ejemplo'] = autos
            save_autos_data(data)
            
            print(f"✅ Auto #{auto_id} actualizado permanentemente en autos.json")
            return jsonify(autos[i]), 200
    
    return jsonify({'error': 'Auto no encontrado'}), 404
    
    return jsonify({'error': 'Auto no encontrado'}), 404

@app.route('/api/auto/<int:auto_id>/toggle-estado', methods=['PUT'])
def toggle_auto_estado(auto_id):
    """Cambia el estado publicado de un auto (true/false)"""
    data = get_autos_data()
    autos = data.get('autos_ejemplo', [])
    
    for i, auto in enumerate(autos):
        if auto.get('id') == auto_id:
            # Cambiar el estado publicado
            auto['publicado'] = not auto.get('publicado', True)
            
            # Guardar cambios
            data['autos_ejemplo'] = autos
            save_autos_data(data)
            
            return jsonify({
                'success': True,
                'nuevo_estado': auto['publicado'],
                'mensaje': f"Auto {'activado' if auto['publicado'] else 'pausado'} correctamente"
            }), 200
    
    return jsonify({'error': 'Auto no encontrado'}), 404

@app.route('/api/auto/<int:auto_id>', methods=['DELETE'])
def delete_auto(auto_id):
    """Elimina un auto"""
    data = get_autos_data()
    autos = data.get('autos_ejemplo', [])
    
    autos = [auto for auto in autos if auto.get('id') != auto_id]
    data['autos_ejemplo'] = autos
    save_autos_data(data)
    
    return jsonify({'success': True})

@app.route('/api/guardar-todos-autos', methods=['POST'])
def guardar_todos_autos():
    """Recibe todos los autos desde el cliente y los guarda en autos.json"""
    try:
        autos_list = request.json.get('autos', [])
        data = {'autos_ejemplo': autos_list}
        save_autos_data(data)
        return jsonify({
            'success': True,
            'total_autos': len(autos_list),
            'mensaje': f'Se guardaron {len(autos_list)} autos correctamente'
        }), 200
    except Exception as e:
        print(f"Error guardando autos: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/upload', methods=['POST'])
def upload_image():
    """Carga una imagen con ID temporal si el auto aún no se ha guardado"""
    print("=== INICIO UPLOAD ===")
    print(f"UPLOAD_FOLDER: {app.config['UPLOAD_FOLDER']}")
    print(f"Carpeta existe: {os.path.exists(app.config['UPLOAD_FOLDER'])}")
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    auto_id = request.form.get('auto_id', 'temp')
    print(f"Auto ID: {auto_id}")
    print(f"Filename: {file.filename}")
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Tipo de archivo no permitido'}), 400
    
    # Generar nombre seguro con timestamp
    # Si auto_id es 'temp', usamos '_temp_' en el nombre para poder renombrar después
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    ext = file.filename.rsplit('.', 1)[1].lower()
    
    # Usar '_temp_' como separador para identificar imágenes temporales
    if auto_id == 'temp':
        filename = f"0_temp_{timestamp}_01.{ext}"
    else:
        filename = f"{auto_id}_{timestamp}_01.{ext}"
    
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    print(f"Guardando en: {filepath}")
    
    try:
        file.save(filepath)
        print(f"Archivo guardado. Existe: {os.path.exists(filepath)}")
        
        # Comprimir imagen
        compress_image(filepath)
        print(f"Imagen comprimida. Existe: {os.path.exists(filepath)}")
        
        return jsonify({
            'success': True,
            'filename': filename,
            'path': f"fotos-autos/{filename}"
        })
    except Exception as e:
        print(f"ERROR al guardar: {str(e)}")
        return jsonify({'error': f'Error al guardar: {str(e)}'}), 500

@app.route('/api/delete-image', methods=['POST'])
def delete_image():
    """Elimina una imagen"""
    image_path = request.json.get('path')
    
    if not image_path:
        return jsonify({'error': 'No path provided'}), 400
    
    full_path = os.path.join(app.config['UPLOAD_FOLDER'], image_path.split('/')[-1])
    
    try:
        if os.path.exists(full_path):
            os.remove(full_path)
            return jsonify({'success': True})
        else:
            return jsonify({'error': 'Archivo no encontrado'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/fotos-autos/<path:filename>')
def serve_image(filename):
    """Sirve imágenes"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# ============ ENDPOINTS PARA CLIENTES ============
@app.route('/api/clientes', methods=['GET'])
def get_clientes():
    """Obtiene todos los clientes"""
    data = get_clientes_data()
    return jsonify(data)

@app.route('/api/clientes-gallery', methods=['GET'])
def get_clientes_gallery():
    """Obtiene galería de clientes para la web pública"""
    try:
        data = get_clientes_data()
        clientes = [{'imagen': cliente['imagen']} for cliente in data.get('clientes', [])]
        print(f"[API] GET /api/clientes-gallery - Retornando {len(clientes)} clientes")
        return jsonify({'clientes': clientes})
    except Exception as e:
        print(f"[ERROR] GET /api/clientes-gallery - {str(e)}")
        return jsonify({'clientes': []}), 500

@app.route('/api/cliente', methods=['POST'])
def add_cliente():
    """Agrega un cliente"""
    data = get_clientes_data()
    cliente = {
        'id': len(data.get('clientes', [])),
        'imagen': request.json.get('imagen'),
        'fecha': request.json.get('fecha')
    }
    data.setdefault('clientes', []).append(cliente)
    save_clientes_data(data)
    return jsonify({'success': True, 'cliente': cliente})

@app.route('/api/cliente-upload', methods=['POST'])
def upload_cliente():
    """Sube una foto de cliente y la guarda en clientes-satisfechos/"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and allowed_file(file.filename):
        # Generar nombre único
        filename = secure_filename(f"cliente_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}.jpg")
        filepath = os.path.join(CLIENTES_FOLDER, filename)
        
        # Guardar archivo
        file.save(filepath)
        
        # Comprimir imagen
        compress_image(filepath)
        
        # Agregar a clientes.json
        data = get_clientes_data()
        cliente = {
            'id': len(data.get('clientes', [])),
            'imagen': f'clientes-satisfechos/{filename}'
        }
        data.setdefault('clientes', []).append(cliente)
        save_clientes_data(data)
        
        return jsonify({'success': True, 'path': f'clientes-satisfechos/{filename}', 'cliente': cliente})
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/api/cliente/<int:cliente_id>', methods=['DELETE'])
def delete_cliente(cliente_id):
    """Elimina un cliente y su imagen"""
    data = get_clientes_data()
    clientes = data.get('clientes', [])
    
    if 0 <= cliente_id < len(clientes):
        cliente = clientes[cliente_id]
        
        # Eliminar archivo físico si existe
        if 'imagen' in cliente:
            imagen_path = cliente['imagen']
            # Construir ruta absoluta
            full_path = os.path.join(FRONTEND_DIR, imagen_path)
            try:
                if os.path.exists(full_path):
                    os.remove(full_path)
            except Exception as e:
                print(f"Error eliminando archivo: {e}")
        
        # Eliminar de la lista
        clientes.pop(cliente_id)
        data['clientes'] = clientes
        save_clientes_data(data)
        return jsonify({'success': True})
    
    return jsonify({'error': 'Cliente no encontrado'}), 404

# Endpoint para forzar guardar todos los autos
@app.route('/api/guardar-autos', methods=['POST'])
def guardar_autos_endpoint():
    """Fuerza el guardado de todos los autos actuales en autos.json"""
    data = get_autos_data()
    save_autos_data(data)
    return jsonify({
        'success': True, 
        'total_autos': len(data.get('autos_ejemplo', [])),
        'mensaje': f'Se guardaron {len(data.get("autos_ejemplo", []))} autos correctamente'
    })

@app.route('/clientes-satisfechos/<path:filename>')
def serve_cliente_image(filename):
    """Sirve imágenes de clientes"""
    try:
        return send_from_directory(CLIENTES_FOLDER, filename)
    except:
        return jsonify({'error': 'Imagen no encontrada'}), 404

@app.route('/api/carousel-images', methods=['GET'])
def get_carousel_images():
    """Obtiene lista de imágenes de clientes satisfechos para el carrusel del hero"""
    try:
        if not os.path.exists(CLIENTES_FOLDER):
            return jsonify({'images': []})
        
        # Obtener lista de archivos de imagen
        image_files = []
        valid_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
        
        for filename in sorted(os.listdir(CLIENTES_FOLDER)):
            file_ext = os.path.splitext(filename)[1].lower()
            if file_ext in valid_extensions:
                # Retornar ruta relativa para que funcione en frontend
                image_files.append({
                    'url': f'clientes-satisfechos/{filename}',
                    'name': filename
                })
        
        return jsonify({
            'success': True,
            'images': image_files,
            'total': len(image_files)
        })
    except Exception as e:
        print(f"Error obteniendo imágenes del carrusel: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ============= ENDPOINTS DE CONFIGURACIÓN =============
CONFIG_FILE = os.path.join(BACKEND_DIR, 'config.json')

def get_config_data():
    """Carga la configuración desde archivo"""
    try:
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        print(f"Error cargando config.json: {e}")
    
    return {
        'banner_text': 'Encuentra el Auto de tus Sueños',
        'whatsapp_schedule': {
            'enabled': True,
            'days': {
                'mon': {'active': True, 'from': '09:00', 'to': '18:00'},
                'tue': {'active': True, 'from': '09:00', 'to': '18:00'},
                'wed': {'active': True, 'from': '09:00', 'to': '18:00'},
                'thu': {'active': True, 'from': '09:00', 'to': '18:00'},
                'fri': {'active': True, 'from': '09:00', 'to': '18:00'},
                'sat': {'active': False, 'from': '10:00', 'to': '16:00'},
                'sun': {'active': False, 'from': '10:00', 'to': '16:00'},
            }
        }
    }

def save_config_data(data):
    """Guarda la configuración en archivo"""
    try:
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"Error guardando config.json: {e}")
        return False

@app.route('/api/config/banner', methods=['GET'])
def get_banner_config():
    """Obtiene la configuración del banner"""
    config = get_config_data()
    return jsonify({
        'success': True,
        'banner_text': config.get('banner_text', 'Encuentra el Auto de tus Sueños')
    })

@app.route('/api/config/banner', methods=['POST'])
def save_banner_config():
    """Guarda la configuración del banner"""
    try:
        data = request.get_json()
        banner_text = data.get('banner_text', '')
        
        if not banner_text or len(banner_text) < 3:
            return jsonify({'success': False, 'message': 'Texto del banner inválido'}), 400
        
        config = get_config_data()
        config['banner_text'] = banner_text
        
        if save_config_data(config):
            return jsonify({'success': True, 'message': 'Banner guardado correctamente'})
        else:
            return jsonify({'success': False, 'message': 'Error al guardar'}), 500
    except Exception as e:
        print(f"Error guardando banner: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/config/whatsapp-schedule', methods=['GET'])
def get_whatsapp_schedule():
    """Obtiene los horarios de atención de WhatsApp"""
    config = get_config_data()
    return jsonify({
        'success': True,
        'schedule': config.get('whatsapp_schedule')
    })

@app.route('/api/config/whatsapp-schedule', methods=['POST'])
def save_whatsapp_schedule():
    """Guarda los horarios de atención de WhatsApp"""
    try:
        data = request.get_json()
        config = get_config_data()
        config['whatsapp_schedule'] = data
        
        if save_config_data(config):
            return jsonify({'success': True, 'message': 'Horarios guardados correctamente'})
        else:
            return jsonify({'success': False, 'message': 'Error al guardar'}), 500
    except Exception as e:
        print(f"Error guardando horarios: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0')
