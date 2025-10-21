@echo off
chcp 65001 >nul
cls
echo.
echo ========================================
echo  n8n Production-URL einrichten
echo ========================================
echo.
echo WICHTIG: Test-URLs funktionieren nur EINMAL!
echo.
echo Aktuelle URL (Test-URL):
echo https://n8n.malerinstitut.de/webhook-test/storch-demo
echo.
echo ========================================
echo  So finden Sie die Production-URL:
echo ========================================
echo.
echo 1. n8n öffnen: https://n8n.malerinstitut.de
echo 2. Workflow öffnen (muss GRÜN/Active sein)
echo 3. Webhook-Node anklicken
echo 4. Rechtes Panel: "Webhook URLs" 
echo 5. PRODUCTION URL kopieren
echo    (NICHT "Test URL"!)
echo.
echo Die Production-URL sieht so aus:
echo https://n8n.malerinstitut.de/webhook/abc123...
echo                                  ^^^^^^^
echo                        (OHNE "-test")
echo.
echo ========================================
echo.
pause
echo.
echo Öffne cors-proxy.py zum Bearbeiten...
echo.
echo Ändern Sie Zeile 14:
echo.
echo ALT: N8N_WEBHOOK_URL = "https://n8n.malerinstitut.de/webhook-test/storch-demo"
echo NEU: N8N_WEBHOOK_URL = "https://n8n.malerinstitut.de/webhook/IHRE-ID"
echo.
pause
notepad cors-proxy.py
echo.
echo ========================================
echo Nach dem Speichern:
echo ========================================
echo.
echo 1. Schließen Sie das Server-Fenster
echo 2. Starten Sie den Server neu:
echo    start-websocket-server.bat
echo 3. Browser-Seite neu laden (F5)
echo.
echo Testen Sie die neue URL:
echo    python test-webhook.py
echo.
pause




