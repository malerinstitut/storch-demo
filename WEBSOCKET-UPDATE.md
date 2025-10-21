# WebSocket Update - Konstante Verbindung

## 🎯 Problem gelöst

**Vorher:** Die Verbindung wurde nach jeder Nachricht geschlossen (HTTP POST)  
**Jetzt:** Die Verbindung bleibt konstant bestehen (WebSocket)

## ✨ Neue Features

### 1. **Konstante WebSocket-Verbindung**
- Die Verbindung wird beim Start aufgebaut und bleibt dauerhaft offen
- Keine ständigen Verbindungsauf- und -abbauten mehr
- Schnellere Nachrichtenübertragung

### 2. **Automatischer Reconnect**
- Bei Verbindungsabbruch wird automatisch neu verbunden
- Bis zu 10 Reconnect-Versuche mit steigendem Delay
- Benutzerfreundliche Statusmeldungen

### 3. **Heartbeat & Ping-Pong**
- Server sendet alle 30 Sekunden einen Heartbeat
- Client sendet alle 25 Sekunden einen Ping
- Hält die Verbindung aktiv und überwacht den Status

### 4. **Echtzeit-Verbindungsstatus**
- Live-Anzeige des Verbindungsstatus (Online/Offline)
- Farbiger Status-Indikator im Header
- Automatische Updates bei Statusänderungen

## 🔧 Technische Details

### Server (cors-proxy.py)
```python
- Verwendet: asyncio + websockets
- Port: 3000
- Protokoll: WebSocket (ws://localhost:3000)
- Heartbeat: Alle 30 Sekunden
- Multi-Client-Support
```

### Client (script.js)
```javascript
- WebSocket API
- Auto-Reconnect mit exponentiell steigendem Delay
- Ping alle 25 Sekunden
- Fallback-Handling bei Verbindungsverlust
```

## 📋 Nachrichtentypen

### Client → Server
- `ping` - Verbindungstest
- `message` - Chat-Nachricht an n8n

### Server → Client
- `connection` - Verbindungsbestätigung
- `heartbeat` - Server-Heartbeat
- `pong` - Antwort auf Ping
- `response` - Antwort von n8n
- `error` - Fehlermeldung

## 🚀 Installation & Start

### 1. Dependencies installieren
```bash
pip install -r requirements.txt
```

### 2. Server starten
```bash
python cors-proxy.py
```

### 3. Chat-Demo öffnen
```bash
# Oder einfach:
START-CHAT-DEMO.bat
```

## ✅ Vorteile

1. **Zuverlässiger**: Verbindung bleibt konstant bestehen
2. **Schneller**: Keine Verbindungsauf-/abbauzeit pro Nachricht
3. **Stabiler**: Automatischer Reconnect bei Problemen
4. **Transparenter**: Klarer Verbindungsstatus für den Benutzer
5. **Skalierbar**: Unterstützt mehrere gleichzeitige Clients

## 🔍 Debugging

### Browser Console
```javascript
// Verbindungsstatus prüfen
console.log(chatInstance.isConnected);
console.log(chatInstance.websocket.readyState);

// Manuelle Verbindung testen
chatInstance.testWebhookConnection();
```

### Server-Logs
Der Server zeigt detaillierte Logs:
- ✅ Client verbunden
- 📨 Nachricht empfangen
- ✅ Antwort gesendet
- 💓 Heartbeat
- 🔌 Client getrennt

## 📝 Hinweise

- **Port 3000**: Muss frei sein
- **Python 3.7+**: Für asyncio/websockets erforderlich
- **Browser**: Moderne Browser mit WebSocket-Support
- **n8n Workflow**: Muss aktiv sein für Antworten

## 🆘 Troubleshooting

### Verbindung wird nicht hergestellt
1. Prüfen Sie, ob der Server läuft: `python cors-proxy.py`
2. Prüfen Sie, ob Port 3000 frei ist
3. Browser-Console auf Fehler überprüfen
4. Firewall-Einstellungen prüfen

### Verbindung bricht ab
- Auto-Reconnect sollte automatisch greifen
- Seite neu laden als letzter Ausweg
- Server-Logs auf Fehler prüfen

### n8n antwortet nicht
- n8n Workflow muss aktiv sein
- Webhook-URL in settings prüfen
- n8n-Logs überprüfen

---

**Erstellt:** Oktober 2025  
**Version:** 2.0 - WebSocket Edition




