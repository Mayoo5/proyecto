@echo off
REM Script para probar la estructura del proyecto

echo =========================================
echo     VERIFICANDO ESTRUCTURA CGI AUTOS
echo =========================================
echo.

REM Verificar carpetas
if exist "frontend\" (
    echo [OK] Carpeta frontend/ existe
) else (
    echo [ERROR] Carpeta frontend/ no existe
    goto error
)

if exist "backend\" (
    echo [OK] Carpeta backend/ existe
) else (
    echo [ERROR] Carpeta backend/ no existe
    goto error
)

REM Verificar archivos frontend
if exist "frontend\index.html" (
    echo [OK] frontend/index.html existe
) else (
    echo [ERROR] frontend/index.html no existe
)

if exist "frontend\styles.css" (
    echo [OK] frontend/styles.css existe
) else (
    echo [ERROR] frontend/styles.css no existe
)

REM Verificar archivos backend
if exist "backend\app.py" (
    echo [OK] backend/app.py existe
) else (
    echo [ERROR] backend/app.py no existe
    goto error
)

if exist "backend\requirements.txt" (
    echo [OK] backend/requirements.txt existe
) else (
    echo [ERROR] backend/requirements.txt no existe
)

if exist "backend\autos.json" (
    echo [OK] backend/autos.json existe
) else (
    echo [ERROR] backend/autos.json no existe
)

echo.
echo =========================================
echo Estructura verificada exitosamente!
echo =========================================
echo.
echo Proximos pasos:
echo   1. Para ejecutar el backend: cd backend && python app.py
echo   2. Para servir el frontend: cd frontend && python -m http.server 8000
echo.

goto end

:error
echo.
echo [ERROR] Estructura incompleta!
echo.

:end
pause
