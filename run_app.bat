@echo off
chcp 65001 >nul
echo =======================================================
echo          LINGOVA - ZAMONAVIY TIL O'RGANISH PLATFORMASI
echo =======================================================
echo.

where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Python topildi. Backend server ishga tushirilmoqda...
    start http://localhost:8000
    python server.py
    goto end
)

where py >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Python (py) topildi. Backend server ishga tushirilmoqda...
    start http://localhost:8000
    py server.py
    goto end
)

echo [INFO] Python aniqlanmadi. Web-ilova to'g'ridan-to'g'ri brauzerda ochilmoqda...
echo (Barcha imkoniyatlar: Parol bilan kirish, Google login, shaxsiy darslar ishlaydi)
start index.html

:end
