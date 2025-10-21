# GitHub Pages Deployment Guide

## Schritt 1: GitHub Repository erstellen

1. Gehen Sie zu https://github.com
2. Klicken Sie auf "New Repository"
3. Name: `storch-demo`
4. Beschreibung: "STORCH - KI-Helfer Chat Demo"
5. Wählen Sie "Public"
6. Klicken Sie "Create repository"

## Schritt 2: Lokales Git Repository initialisieren

```bash
# Git initialisieren
git init

# Alle Dateien hinzufügen
git add .

# Ersten Commit erstellen
git commit -m "Initial commit: STORCH Chat Demo"

# Remote Repository hinzufügen
git remote add origin https://github.com/IhrUsername/storch-demo.git

# Auf GitHub pushen
git push -u origin main
```

## Schritt 3: GitHub Pages aktivieren

1. Gehen Sie zu Ihrem Repository auf GitHub
2. Klicken Sie auf "Settings"
3. Scrollen Sie zu "Pages"
4. Wählen Sie "Deploy from a branch"
5. Wählen Sie "main" branch
6. Wählen Sie "/ (root)" folder
7. Klicken Sie "Save"

## Schritt 4: Website anpassen

Die Website wird verfügbar sein unter:
`https://IhrUsername.github.io/storch-demo`

## Schritt 5: WebSocket-Server für Produktion

Für eine vollständige Online-Version benötigen Sie einen WebSocket-Server:

### Option A: Heroku (Kostenlos)

1. Gehen Sie zu https://heroku.com
2. Erstellen Sie ein kostenloses Konto
3. Installieren Sie Heroku CLI
4. Erstellen Sie eine neue App
5. Deployen Sie den Code

### Option B: Railway (Kostenlos)

1. Gehen Sie zu https://railway.app
2. Verbinden Sie Ihr GitHub Repository
3. Deployen Sie automatisch

### Option C: DigitalOcean App Platform (Kostenlos)

1. Gehen Sie zu https://cloud.digitalocean.com
2. Erstellen Sie eine neue App
3. Verbinden Sie Ihr GitHub Repository
4. Deployen Sie

## Schritt 6: Umgebungsvariablen konfigurieren

Für Produktion sollten Sie die Webhook-URL als Umgebungsvariable setzen:

```python
import os
DEFAULT_N8N_WEBHOOK_URL = os.getenv('N8N_WEBHOOK_URL', 'https://n8n.malerinstitut.de/webhook/storch-demo')
```

## Schritt 7: CORS für Produktion anpassen

```python
# In cors-proxy.py
res.setHeader('Access-Control-Allow-Origin', 'https://IhrUsername.github.io')
```

## Schritt 8: HTTPS für WebSocket

Für Produktion sollten Sie HTTPS verwenden:

```javascript
// In script.js
this.websocketUrl = 'wss://your-domain.com:3001';
```

## Schritt 9: Domain konfigurieren (Optional)

1. Kaufen Sie eine Domain
2. Konfigurieren Sie DNS
3. Setzen Sie Custom Domain in GitHub Pages
4. Aktualisieren Sie WebSocket-URL

## Schritt 10: Monitoring und Logs

- Überwachen Sie die Server-Logs
- Setzen Sie Up-Time-Monitoring
- Konfigurieren Sie Error-Tracking

---

**Hinweis**: GitHub Pages unterstützt nur statische Websites. Für WebSocket-Funktionalität benötigen Sie einen separaten Server (Heroku, Railway, etc.).
