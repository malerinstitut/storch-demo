# 🔧 n8n Webhook Setup - Schnelle Hilfe

## ❌ Aktueller Fehler:
```
HTTP Error 404: The requested webhook "storch-demo" is not registered.
```

## ✅ Lösung in 3 Schritten:

### Schritt 1: n8n öffnen
Öffnen Sie: https://n8n.malerinstitut.de

### Schritt 2: Workflow aktivieren
1. Öffnen Sie Ihren Chat-Workflow
2. Oben rechts: Klicken Sie auf **"Inactive"** → **"Active"**
3. Der Toggle muss **GRÜN** sein!

### Schritt 3: Richtige URL kopieren
1. Klicken Sie auf den **Webhook** Node
2. Im Panel rechts → unter **"Webhook URLs"**
3. Kopieren Sie die **"Production URL"** (NICHT Test URL!)
4. Beispiel: `https://n8n.malerinstitut.de/webhook/abc123def456`

### Schritt 4: URL in der Demo aktualisieren
1. Öffnen Sie die Datei: `cors-proxy.py`
2. Finden Sie Zeile 14:
   ```python
   N8N_WEBHOOK_URL = "https://n8n.malerinstitut.de/webhook-test/storch-demo"
   ```
3. Ersetzen Sie durch Ihre Production URL:
   ```python
   N8N_WEBHOOK_URL = "https://n8n.malerinstitut.de/webhook/IHRE-ID"
   ```
4. **SPEICHERN!**

### Schritt 5: Server neu starten
1. Schließen Sie das Server-Fenster (mit dem WebSocket-Server)
2. Starten Sie neu: Doppelklick auf `start-websocket-server.bat`
3. Warten Sie bis "WebSocket-Server läuft..." erscheint

### Schritt 6: Chat-Demo testen
1. Laden Sie die Browser-Seite neu (F5)
2. Status sollte auf **"Online"** wechseln
3. Senden Sie eine Test-Nachricht

## 🔍 Webhook-URL finden - Bebildert:

```
n8n Workflow → Webhook Node → Webhook URLs
├── Test URL (NUR für manuelle Tests!)
│   └── https://n8n.../webhook-test/...
│
└── Production URL ✅ (Diese verwenden!)
    └── https://n8n.../webhook/...
```

## ⚠️ Wichtige Unterschiede:

| Test URL | Production URL |
|----------|----------------|
| `/webhook-test/...` | `/webhook/...` |
| Nur 1x nach "Execute" | Dauerhaft aktiv |
| Für Entwicklung | Für Live-Betrieb ✅ |

## 🎯 Workflow muss AKTIV sein!

```
┌─────────────────────────┐
│  Workflow              │
│                    [🔴] │  ← Inactive (Falsch!)
└─────────────────────────┘

┌─────────────────────────┐
│  Workflow              │
│                    [🟢] │  ← Active (Richtig!)
└─────────────────────────┘
```

## 🧪 URL testen (nach dem Update):

Führen Sie aus:
```bash
python test-webhook.py
```

Oder manuell in PowerShell:
```powershell
Invoke-WebRequest -Uri "IHRE-WEBHOOK-URL" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"message":"Test"}' -UseBasicParsing
```

Erfolgreiche Antwort:
```json
{
  "message": "Ihre KI-Antwort hier..."
}
```

## 📞 Noch Probleme?

Prüfen Sie:
- [ ] Workflow ist AKTIV (grüner Toggle)
- [ ] Production URL verwendet (nicht Test URL)
- [ ] URL in cors-proxy.py aktualisiert
- [ ] cors-proxy.py gespeichert
- [ ] WebSocket-Server neu gestartet
- [ ] Browser-Seite neu geladen

---

**Status:** Sobald alle Schritte erledigt sind, sollte die Verbindung funktionieren! 🚀




