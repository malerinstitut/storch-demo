@echo off
echo.
echo ========================================
echo  STORCH KI-HELFER - Chat Demo
echo ========================================
echo.
echo Pruefe Python-Dependencies...
python -m pip install -q -r requirements.txt

echo.
echo Starte WebSocket-Server auf Port 3000...
start "WebSocket Server" cmd /k "python cors-proxy.py"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo  Chat-Demo ist bereit!
echo ========================================
echo.
echo Oeffnen Sie jetzt die Datei:
echo    index.html
echo.
echo (Doppelklick im Explorer)
echo.
echo WICHTIG:
echo Der WebSocket-Server laeuft im Hintergrund.
echo Schliessen Sie das Server-Fenster NICHT!
echo Die Verbindung bleibt konstant bestehen.
echo.
pause


