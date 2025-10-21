@echo off
chcp 65001 >nul
cls
echo.
echo ========================================
echo  Test nach n8n Server-Neustart
echo ========================================
echo.
echo WICHTIG: Haben Sie den Workflow aktiviert?
echo (Grüner Toggle in n8n)
echo.
pause
echo.
echo Teste Webhook...
echo.
cd /d "%~dp0"
python test-webhook.py
echo.
pause




