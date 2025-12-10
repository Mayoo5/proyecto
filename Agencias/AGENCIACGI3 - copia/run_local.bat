@echo off
cd /d "%~dp0"
cd backend
pip install Flask Werkzeug Pillow -q 2>nul
python app.py
