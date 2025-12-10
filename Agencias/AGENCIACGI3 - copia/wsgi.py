import sys
import os

# Agregar la carpeta del proyecto al path
project_folder = os.path.expanduser('~/cgiautos-admin')
sys.path.insert(0, project_folder)

# Importar la aplicación
from app import app as application
