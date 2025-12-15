from flask import Flask, render_template, request, jsonify, send_from_directory, session, redirect, url_for
from flask_cors import CORS
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from PIL import Image
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

app = Flask(__name__, template_folder=TEMPLATES_DIR, static_folder=os.path.join(FRONTEND_DIR), static_url_path='')
app.secret_key = 'tu_clave_secreta_super_segura_cambiar_en_produccion'
CORS(app)

# Configuración
UPLOAD_FOLDER = os.path.join(FRONTEND_DIR, 'fotos-autos')
CLIENTES_FOLDER = os.path.join(FRONTEND_DIR, 'clientes-satisfechos')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Crear carpetas si no existen
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CLIENTES_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_autos_data():
    """Carga los datos de autos.json"""
    try:
        autos_path = os.path.join(BACKEND_DIR, 'autos.json')
        with open(autos_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data
    except:
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
    """Guarda los datos en autos.json"""
    autos_path = os.path.join(BACKEND_DIR, 'autos.json')
    with open(autos_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def get_clientes_data():
    """Carga los datos de clientes"""
    try:
        clientes_path = os.path.join(BACKEND_DIR, 'clientes.json')
        with open(clientes_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
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
        
        # Guardar optimizada
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
        # Permitir GET a /api/autos y /api/clientes-gallery sin autenticación (público)
        if request.path in ['/api/autos', '/api/clientes-gallery'] and request.method == 'GET':
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
    data = get_autos_data()
    return jsonify(data.get('autos_ejemplo', []))

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
    """Crea un nuevo auto"""
    data = get_autos_data()
    autos = data.get('autos_ejemplo', [])
    
    new_auto = request.json
    
    # Generar nuevo ID
    new_id = max([auto.get('id', 0) for auto in autos], default=0) + 1
    new_auto['id'] = new_id
    new_auto['imagenes'] = new_auto.get('imagenes', [])
    
    autos.append(new_auto)
    data['autos_ejemplo'] = autos
    save_autos_data(data)
    
    return jsonify(new_auto), 201

@app.route('/api/auto/<int:auto_id>', methods=['PUT'])
def update_auto(auto_id):
    """Actualiza un auto existente"""
    data = get_autos_data()
    autos = data.get('autos_ejemplo', [])
    
    for i, auto in enumerate(autos):
        if auto.get('id') == auto_id:
            autos[i].update(request.json)
            data['autos_ejemplo'] = autos
            save_autos_data(data)
            return jsonify(autos[i])
    
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

@app.route('/api/upload', methods=['POST'])
def upload_image():
    """Carga una imagen"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    auto_id = request.form.get('auto_id', 'temp')
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Tipo de archivo no permitido'}), 400
    
    # Generar nombre seguro con timestamp
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{auto_id}_{timestamp}_01.{ext}"
    
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    
    # Comprimir imagen
    compress_image(filepath)
    
    return jsonify({
        'success': True,
        'filename': filename,
        'path': f"fotos-autos/{filename}"
    })

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
    data = get_clientes_data()
    images = [{'url': f"/{cliente['imagen']}"} for cliente in data.get('clientes', [])]
    return jsonify({'images': images})

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

@app.route('/clientes-satisfechos/<path:filename>')
def serve_cliente_image(filename):
    """Sirve imágenes de clientes"""
    try:
        return send_from_directory(CLIENTES_FOLDER, filename)
    except:
        return jsonify({'error': 'Imagen no encontrada'}), 404

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0')
