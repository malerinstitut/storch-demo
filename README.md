# Storch Chat Demo - n8n Webhook Integration

Eine moderne Chat-Agenten-Demo, die mit einer selfhosted n8n-Instanz über Webhooks kommuniziert.

## 🚀 SCHNELLSTART

**Lokal (Demo-Modus):**
1. **Doppelklick auf:** `index.html`
2. **Chat ist bereit!** 🎉

**Für echte n8n-Integration:**
- Siehe `INSTALLATION.md`

## Features

- 🎨 **Modernes Design** mit Bootstrap 5.3.2
- 💬 **Echtzeit-Chat** mit n8n Webhook-Integration
- 🔧 **Konfigurierbare Einstellungen**
- 📱 **Responsive Design** für alle Geräte
- 🔊 **Benachrichtigungssounds**
- 💾 **Lokale Datenspeicherung**
- 🛡️ **Robuste Fehlerbehandlung** mit Fallback-Mechanismus
- 🎭 **Demo-Modus** für Offline-Testing
- ⚡ **Intelligente Verbindungstests**

## Installation

1. Alle Dateien in einen Webserver-Ordner kopieren
2. `index.html` im Browser öffnen
3. Webhook-URL in den Einstellungen konfigurieren

## Konfiguration

### n8n Webhook Setup

Der Chat sendet POST-Requests an den konfigurierten Webhook:

```json
{
  "message": "Benutzernachricht",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "sessionId": "session_1234567890_abc123",
  "userAgent": "Mozilla/5.0..."
}
```

### Erwartete n8n Response

```json
{
  "message": "Antwort vom n8n Workflow",
  "status": "success"
}
```

## Dateien

- `index.html` - Haupt-HTML-Datei mit Bootstrap-Design
- `styles.css` - Custom CSS für modernes Chat-Interface
- `script.js` - JavaScript für Chat-Funktionalität und n8n-Integration
- `images.png` - Logo für die Anwendung

## Technische Details

- **Webhook URL**: `https://n8n.malerinstitut.de/webhook-test/storch-demo`
- **HTTP Method**: POST
- **Content-Type**: application/json
- **Session Management**: Lokale Speicherung der Session-ID
- **Error Handling**: Umfassende Fehlerbehandlung für Webhook-Aufrufe

## Browser-Kompatibilität

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Entwicklung

Für lokale Entwicklung:

```bash
# Einfacher HTTP-Server
python -m http.server 8000
# oder
npx serve .
```

## Lizenz

MIT License - Siehe LICENSE-Datei für Details.
