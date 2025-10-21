@echo off
chcp 65001 >nul
cls
echo.
echo ========================================
echo  Server neu starten
echo ========================================
echo.
echo Bitte schließen Sie ALLE alten Server-Fenster!
echo.
pause
echo.
echo Starte verbesserten WebSocket-Server...
echo.
cd /d "%~dp0"
python cors-proxy.py
pause




