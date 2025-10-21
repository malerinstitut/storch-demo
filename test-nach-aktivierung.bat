@echo off
chcp 65001 >nul
echo.
echo Test nach Workflow-Aktivierung
echo ==============================
echo.
echo Sende Test-Request an n8n...
echo.
python test-webhook.py
echo.
echo ==============================
echo.
echo Wenn Sie "ERFOLG" sehen, funktioniert es!
echo Wenn Sie "404" oder "leere Antwort" sehen, ist es noch kaputt.
echo.
pause




