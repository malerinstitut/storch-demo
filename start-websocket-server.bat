@echo off
cd /d "%~dp0"
echo ============================================
echo  WebSocket-Server startet...
echo ============================================
echo.
python cors-proxy.py
pause

