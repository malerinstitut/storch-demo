# STORCH - KI-Helfer Chat Demo

Eine interaktive Chat-Demo mit n8n Webhook Integration und WebSocket-Kommunikation.

## 🚀 Features

- **Real-time Chat**: WebSocket-basierte Kommunikation
- **n8n Integration**: Nahtlose Verbindung zu n8n Workflows
- **Responsive Design**: Moderne, mobile-freundliche Benutzeroberfläche
- **Auto-Reconnect**: Automatische Verbindungswiederherstellung
- **Unicode-Safe**: Robuste Behandlung von Unicode-Zeichen

## 🛠️ Installation

### Voraussetzungen
- Python 3.7+
- n8n Workflow mit Webhook

### Lokale Installation

1. **Repository klonen**
```bash
git clone https://github.com/IhrUsername/storch-demo.git
cd storch-demo
```

2. **Python-Abhängigkeiten installieren**
```bash
pip install -r requirements.txt
```

3. **WebSocket-Server starten**
```bash
python cors-proxy.py
```

4. **HTTP-Server starten** (in einem neuen Terminal)
```bash
python -m http.server 8080
```

5. **Chat öffnen**
```
http://localhost:8080/index.html
```

## 🔧 Konfiguration

### n8n Webhook Setup

1. Erstellen Sie einen n8n Workflow
2. Fügen Sie einen "Webhook" Node hinzu
3. Fügen Sie einen "Respond to Webhook" Node hinzu
4. Konfigurieren Sie die Webhook-URL in `cors-proxy.py`

### WebSocket-Port ändern

Standardmäßig läuft der WebSocket-Server auf Port 3001. Um den Port zu ändern:

1. Bearbeiten Sie `cors-proxy.py`:
```python
PORT = 3001  # Ändern Sie hier den Port
```

2. Bearbeiten Sie `script.js`:
```javascript
this.websocketUrl = 'ws://localhost:3001';  // Ändern Sie hier den Port
```

## 📁 Projektstruktur

```
storch-demo/
├── cors-proxy.py          # WebSocket-Server mit n8n Integration
├── index.html             # Haupt-HTML-Datei
├── script.js              # Frontend JavaScript
├── styles.css             # CSS-Styling
├── requirements.txt       # Python-Abhängigkeiten
├── README.md              # Diese Datei
└── .gitignore            # Git-Ignore-Datei
```

## 🌐 Online Deployment

### GitHub Pages (Statische Website)

1. Repository auf GitHub erstellen
2. GitHub Pages aktivieren
3. Dateien hochladen
4. Website unter `https://username.github.io/storch-demo` verfügbar

### WebSocket-Server für Produktion

Für eine vollständige Online-Version benötigen Sie:

1. **Heroku** (kostenlos)
2. **Railway** (kostenlos)
3. **DigitalOcean App Platform** (kostenlos)
4. **Vercel** (kostenlos)

## 🔒 Sicherheit

- CORS-Headers sind für lokale Entwicklung konfiguriert
- Für Produktion sollten spezifische Domains konfiguriert werden
- Webhook-URLs sollten über Umgebungsvariablen gesetzt werden

## 🐛 Fehlerbehebung

### WebSocket-Verbindungsfehler
- Stellen Sie sicher, dass der WebSocket-Server läuft
- Prüfen Sie die Port-Konfiguration
- Überprüfen Sie die Firewall-Einstellungen

### n8n-Integration
- Stellen Sie sicher, dass der n8n Workflow aktiv ist
- Prüfen Sie die Webhook-URL
- Überprüfen Sie die n8n-Logs

### Unicode-Fehler
- Verwenden Sie nur ASCII-Zeichen in n8n-Antworten
- Formatieren Sie Antworten als JSON

## 📝 Lizenz

MIT License - siehe LICENSE-Datei für Details.

## 🤝 Beitragen

1. Fork das Repository
2. Erstellen Sie einen Feature-Branch
3. Committen Sie Ihre Änderungen
4. Pushen Sie zum Branch
5. Erstellen Sie einen Pull Request

## 📞 Support

Bei Fragen oder Problemen:
- Erstellen Sie ein Issue auf GitHub
- Kontaktieren Sie den Entwickler

---

**STORCH** - Ihr intelligenter KI-Helfer für n8n Workflows