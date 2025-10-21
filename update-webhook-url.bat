@echo off
echo.
echo ========================================
echo  n8n Webhook URL aktualisieren
echo ========================================
echo.
echo Aktuelle URL:
echo https://n8n.malerinstitut.de/webhook-test/storch-demo
echo.
echo WICHTIG: Diese URL gibt einen 404-Fehler!
echo.
echo So finden Sie die richtige URL:
echo.
echo 1. Oeffnen Sie n8n (https://n8n.malerinstitut.de)
echo 2. Oeffnen Sie Ihren Workflow
echo 3. Klicken Sie auf den WEBHOOK Node
echo 4. Kopieren Sie die PRODUCTION URL
echo    (NICHT die Test-URL!)
echo.
echo 5. Die URL sollte so aussehen:
echo    https://n8n.malerinstitut.de/webhook/[IHRE-ID]
echo.
echo 6. Oeffnen Sie die Datei: cors-proxy.py
echo 7. Aendern Sie Zeile 14:
echo    N8N_WEBHOOK_URL = "IHRE-NEUE-URL"
echo.
echo 8. Speichern und Server neu starten
echo.
pause
notepad cors-proxy.py

