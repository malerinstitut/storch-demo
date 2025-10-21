# 🔍 Production-URL in n8n finden

## ❌ Problem: Test-URL funktioniert nicht dauerhaft!

**Test-URLs** (`webhook-test`) werden nach jedem Request deaktiviert!  
→ Deshalb bekommen Sie den 404-Fehler.

## ✅ Lösung: Production-URL verwenden

Die **Production-URL** (`webhook`) bleibt **dauerhaft aktiv**.

---

## 📋 Schritt-für-Schritt-Anleitung:

### 1️⃣ n8n öffnen
```
https://n8n.malerinstitut.de
```

### 2️⃣ Workflow öffnen
- Ihr Chat-Workflow muss **GRÜN** (Active) sein
- Wenn nicht: Toggle oben rechts anklicken

### 3️⃣ Webhook-Node anklicken
- Klicken Sie im Canvas auf den **"Webhook"** Node
- Das rechte Panel öffnet sich

### 4️⃣ Webhook URLs finden
Im rechten Panel scrollen Sie zu **"Webhook URLs"**

Sie sehen **ZWEI URLs**:

```
┌─────────────────────────────────────────────────────────┐
│ Webhook URLs                                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 🧪 Test URL                                            │
│ https://n8n.malerinstitut.de/webhook-test/storch-demo  │
│ ❌ NUR für manuelle Tests!                             │
│ ❌ Deaktiviert sich nach 1 Request!                    │
│                                                         │
│ ─────────────────────────────────────────────────────   │
│                                                         │
│ 🚀 Production URL                                      │
│ https://n8n.malerinstitut.de/webhook/abc123def456      │
│ ✅ Diese URL verwenden!                                │
│ ✅ Bleibt dauerhaft aktiv!                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 5️⃣ Production URL kopieren
- Klicken Sie auf das **Kopieren-Symbol** 📋 neben der **Production URL**
- NICHT die Test URL!

---

## 🔧 URL in cors-proxy.py eintragen

### Manuelle Methode:

1. Öffnen Sie `cors-proxy.py`
2. Gehen Sie zu **Zeile 14**
3. Ändern Sie:

**VORHER (Test-URL):**
```python
N8N_WEBHOOK_URL = "https://n8n.malerinstitut.de/webhook-test/storch-demo"
#                                                    ^^^^^
#                                               ❌ MIT "-test"
```

**NACHHER (Production-URL):**
```python
N8N_WEBHOOK_URL = "https://n8n.malerinstitut.de/webhook/abc123def456"
#                                                    ^^^
#                                               ✅ OHNE "-test"
```

4. **SPEICHERN!** (Strg+S)

### Automatische Hilfe:

Führen Sie aus:
```bash
URL-AENDERN.bat
```

Das Script öffnet automatisch die Datei und zeigt Ihnen, was zu ändern ist.

---

## 🔄 Server neu starten

Nach der Änderung **MUSS** der Server neu gestartet werden:

1. **Server-Fenster schließen** (mit dem WebSocket-Server)
2. **Neu starten**: Doppelklick auf `start-websocket-server.bat`
3. Warten bis: "WebSocket-Server läuft..." erscheint

---

## ✅ Testen

### Methode 1: Automatischer Test
```bash
python test-webhook.py
```

**Erfolg sieht so aus:**
```
[OK] ERFOLG! Webhook ist erreichbar!
[<<<] Antwort von n8n:
{
  "message": "..."
}
```

### Methode 2: Im Browser
1. Browser-Seite **neu laden** (F5)
2. Status sollte auf **"Online"** wechseln
3. Test-Nachricht senden
4. Sie sollten eine Antwort erhalten!

---

## ⚠️ Wichtiger Unterschied

| Eigenschaft | Test URL ❌ | Production URL ✅ |
|------------|------------|-------------------|
| **Pfad** | `/webhook-test/...` | `/webhook/...` |
| **Aktivierung** | Nur 1x nach "Execute" | Dauerhaft |
| **Verwendung** | Manuelle Tests | Live-Betrieb |
| **Konstante Verbindung** | NEIN | JA |

## 🎯 Zusammenfassung

1. ✅ Test-URL → Production-URL wechseln
2. ✅ In `cors-proxy.py` Zeile 14 ändern
3. ✅ Speichern
4. ✅ Server neu starten
5. ✅ Browser neu laden
6. ✅ Testen!

---

**Jetzt sollte die Verbindung konstant bestehen bleiben!** 🚀




