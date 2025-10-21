# Installation & Setup

## 🎯 Lokale Demo (Demo-Modus)

**Einfachste Methode - SOFORT loslegen:**

1. **Doppelklick auf** `index.html`
2. **Fertig!** Der Chat läuft im Demo-Modus

**Demo-Modus Features:**
- ✅ Vollständig funktionierendes Chat-Interface
- ✅ Intelligente Demo-Antworten
- ✅ Alle UI-Features (Mikrofon, Buttons, etc.)
- ✅ Perfekt für Präsentationen

---

## 🌐 Produktion (Echte n8n-Integration)

**Um die echte n8n-Verbindung zu nutzen:**

### **Schritt 1: Dateien hochladen**
Laden Sie alle Dateien auf Ihren Webserver hoch:
- `index.html`
- `script.js`
- `styles.css`
- `Storch_Logo_DE_Claim.png`

### **Schritt 2: Demo-Modus deaktivieren**
In `script.js` Zeile 6 ändern:
```javascript
this.useDemoMode = false; // War: true
```

### **Schritt 3: n8n Workflow aktivieren**
In n8n:
1. Workflow öffnen
2. Toggle "Active" auf ON (grün)
3. CORS-Header sind bereits konfiguriert

### **Schritt 4: Testen**
- Öffnen Sie: `https://ihre-domain.de/pfad/index.html`
- Verbindung wird automatisch hergestellt
- Chat funktioniert mit echtem n8n-Backend

---

## ⚙️ n8n Konfiguration

**Ihr Workflow ist bereits korrekt konfiguriert:**

```
Webhook (POST, OPTIONS)
  ↓
AI Agent
  ↓
Respond to Webhook (mit CORS-Headern)
```

**CORS-Header im "Respond to Webhook":**
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

**Webhook-URL:**
```
https://n8n.malerinstitut.de/webhook-test/storch-demo
```

---

## 🔧 Troubleshooting

### **Problem: "Verbindung fehlgeschlagen"**
- ✅ **Lösung:** Verwenden Sie Demo-Modus (lokal)
- ✅ **Oder:** Laden Sie auf Webserver hoch

### **Problem: CORS-Fehler**
- ✅ **Ursache:** Lokale `file://` Dateien haben CORS-Beschränkungen
- ✅ **Lösung:** Webserver verwenden oder Demo-Modus

### **Problem: n8n antwortet nicht**
- ✅ Prüfen Sie: Workflow ist "Active" (grün)
- ✅ Prüfen Sie: CORS-Header sind konfiguriert
- ✅ Testen Sie: `Execute workflow` in n8n

---

## 📝 Hinweise

- **Lokal:** Demo-Modus ist aktiviert - funktioniert perfekt für Präsentationen
- **Webserver:** Demo-Modus deaktivieren für echte n8n-Integration
- **CORS:** Wird automatisch gelöst wenn auf Webserver gehostet


