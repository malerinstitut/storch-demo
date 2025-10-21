# Coolify Deployment Guide für STORCH Chat Demo

## 🚀 Coolify Setup

### Schritt 1: Repository auf GitHub erstellen
1. Erstellen Sie ein GitHub Repository: `storch-demo`
2. Laden Sie alle Dateien hoch
3. Notieren Sie sich die GitHub-URL

### Schritt 2: Coolify konfigurieren

#### In Coolify Dashboard:
1. **Neue Anwendung erstellen**
   - Name: `storch-demo`
   - Typ: `Docker`
   - Repository: `https://github.com/malerinstitut/storch-demo`

2. **Umgebungsvariablen setzen**
   ```
   N8N_WEBHOOK_URL=https://n8n.malerinstitut.de/webhook/storch-demo
   PORT=3001
   PYTHONUNBUFFERED=1
   ```

3. **Port-Konfiguration**
   - Port: `3001`
   - Health Check: `/health`
   - Health Check Port: `8080`

4. **Domain konfigurieren**
   - Domain: `storch-demo.ihre-domain.com`
   - SSL: Automatisch (Let's Encrypt)

### Schritt 3: Frontend anpassen

#### WebSocket-URL in script.js aktualisieren:
```javascript
// Für Coolify (Produktion)
this.websocketUrl = 'wss://storch-demo.ihre-domain.com';

// Für lokale Entwicklung
// this.websocketUrl = 'ws://localhost:3001';
```

#### CORS für Produktion anpassen:
```python
# In cors-proxy.py
res.setHeader('Access-Control-Allow-Origin', 'https://storch-demo.ihre-domain.com')
```

### Schritt 4: Deployment

1. **Coolify Deployment starten**
   - Klicken Sie "Deploy" in Coolify
   - Warten Sie auf den Build-Prozess
   - Überwachen Sie die Logs

2. **Health Check prüfen**
   - URL: `https://storch-demo.ihre-domain.com/health`
   - Erwartete Antwort: `{"status": "healthy", "service": "storch-websocket"}`

3. **WebSocket testen**
   - URL: `wss://storch-demo.ihre-domain.com`
   - Sollte Verbindung herstellen

### Schritt 5: Frontend deployen

#### Option A: GitHub Pages (Statisch)
1. Repository: `storch-demo`
2. GitHub Pages aktivieren
3. Website: `https://malerinstitut.github.io/storch-demo`

#### Option B: Coolify (Vollständig)
1. Separates Frontend-Repository erstellen
2. Nginx-Konfiguration für statische Dateien
3. Beide Services in Coolify

### Schritt 6: Monitoring

#### Coolify Dashboard:
- **Logs**: Überwachen Sie die Anwendungslogs
- **Health**: Prüfen Sie den Health Check
- **Metrics**: Überwachen Sie CPU/Memory

#### WebSocket-Test:
```javascript
// Browser-Konsole
const ws = new WebSocket('wss://storch-demo.ihre-domain.com');
ws.onopen = () => console.log('Connected!');
ws.onmessage = (e) => console.log('Message:', e.data);
```

### Schritt 7: SSL und Domain

#### Automatisches SSL:
- Coolify konfiguriert automatisch Let's Encrypt
- SSL-Zertifikat wird automatisch erneuert

#### Custom Domain:
1. DNS A-Record auf Coolify-Server
2. Domain in Coolify konfigurieren
3. SSL automatisch aktiviert

## 🔧 Troubleshooting

### WebSocket-Verbindungsfehler:
1. Prüfen Sie die Domain-Konfiguration
2. Überprüfen Sie die Firewall-Einstellungen
3. Testen Sie mit `wscat`: `wscat -c wss://storch-demo.ihre-domain.com`

### Health Check fehlschlägt:
1. Prüfen Sie die Port-Konfiguration
2. Überwachen Sie die Anwendungslogs
3. Testen Sie: `curl https://storch-demo.ihre-domain.com/health`

### n8n-Integration:
1. Überprüfen Sie die Webhook-URL
2. Testen Sie den n8n Workflow
3. Prüfen Sie die CORS-Einstellungen

## 📱 Finale URLs

- **WebSocket**: `wss://storch-demo.ihre-domain.com`
- **Health Check**: `https://storch-demo.ihre-domain.com/health`
- **Frontend**: `https://malerinstitut.github.io/storch-demo`

## 🎉 Fertig!

Ihre STORCH Chat Demo läuft jetzt vollständig online mit:
- ✅ WebSocket-Server auf Coolify
- ✅ Statische Website auf GitHub Pages
- ✅ SSL-Zertifikat
- ✅ Automatische Updates
- ✅ Monitoring und Logs
