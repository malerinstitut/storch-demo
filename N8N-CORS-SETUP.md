# n8n CORS Setup - Vollständige Anleitung

## 🎯 Problem
Ihr Chat kann nicht mit n8n kommunizieren wegen CORS (Cross-Origin Resource Sharing).

## ✅ LÖSUNG: n8n Workflow anpassen

### **Schritt 1: Webhook Node konfigurieren**

1. Öffnen Sie Ihren n8n Workflow
2. Klicken Sie auf den **Webhook Node**
3. Scrollen Sie nach unten zu **"Options"** (im Node-Settings)
4. Klicken Sie auf **"Add Option"**
5. Wählen Sie **"Allowed Origins (CORS)"**
6. Tragen Sie ein: `*` (Sternchen für alle Origins)

**Alternative:** Spezifisch für lokale Entwicklung:
```
file://
http://localhost
http://127.0.0.1
```

### **Schritt 2: HTTP Method**

Im selben Webhook Node:
1. Lassen Sie **"HTTP Method"** auf **`POST`**

**Hinweis:** n8n akzeptiert kein "POST, OPTIONS" in einem Feld. Die OPTIONS-Anfrage wird über "Allowed Origins (CORS)" in Schritt 1 automatisch behandelt.

### **Schritt 3: CORS wird automatisch behandelt**

Mit "Allowed Origins (CORS): *" in Schritt 1 behandelt n8n OPTIONS-Requests automatisch!

**Sie brauchen KEINEN IF Node!** 🎉

### **Schritt 4: AI Agent konfigurieren**

Stellen Sie sicher, dass Ihr AI Agent:
- **Prompt:** `={{ $json.message }}`
- **Source:** Manual (nicht "Chat Trigger")

### **Schritt 5: Respond to Webhook konfigurieren**

Nach dem AI Agent:

**Respond to Webhook Node:**
- **Respond**: `Using 'Respond to Webhook' Node`
- **Respond With**: `Using an Expression`

**Expression für Response:**
```javascript
={{ { "message": $json.output || $json.text || "Antwort erhalten" } }}
```

**WICHTIG - Headers hinzufügen:**
Klicken Sie auf "Options" → "Add Option" → "Response Headers"

Header 1:
- Name: `Access-Control-Allow-Origin`
- Value: `*`

Header 2:
- Name: `Access-Control-Allow-Methods`
- Value: `POST, OPTIONS, GET`

Header 3:
- Name: `Access-Control-Allow-Headers`
- Value: `Content-Type`

---

## 🧪 TESTEN

### **Test 1: Workflow aktivieren**
1. In n8n: Toggle **"Active"** auf **grün**
2. **NICHT** "Execute Workflow" - das ist nur für Test-Mode

### **Test 2: Mit cURL testen**

Öffnen Sie PowerShell:

```powershell
# OPTIONS Test (Preflight)
curl -X OPTIONS https://n8n.malerinstitut.de/webhook-test/storch-demo -v

# Erwartete Antwort:
# HTTP/1.1 204 No Content
# Access-Control-Allow-Origin: *
```

```powershell
# POST Test (Echte Anfrage)
curl -X POST https://n8n.malerinstitut.de/webhook-test/storch-demo `
  -H "Content-Type: application/json" `
  -d '{"message":"Hallo"}'

# Erwartete Antwort:
# {"message":"... AI-Antwort ..."}
```

### **Test 3: Chat Demo**

1. Öffnen Sie `index.html`
2. Drücken Sie `F12` (Developer Console)
3. Klicken Sie auf "🔄 Verbindung testen"
4. **Keine CORS-Fehler** = ✅ Erfolg!

---

## 🔍 Troubleshooting

### **Problem: "No 'Access-Control-Allow-Origin' header"**
→ Headers im Respond to Webhook Node fehlen

### **Problem: "Response to preflight request doesn't pass"**
→ IF Node fehlt oder OPTIONS-Response falsch konfiguriert

### **Problem: "Webhook is not registered for GET requests"**
→ HTTP Method muss `POST, OPTIONS` sein (nicht nur POST)

### **Problem: 404 Not Found**
→ Workflow ist nicht "Active" (grün)

### **Problem: Funktioniert nur einmal**
→ Sie nutzen "Execute Workflow" statt "Active" Toggle

---

## 💡 WICHTIG

**Lokale Entwicklung (file:///):**
- CORS ist sehr restriktiv
- Besser: Python HTTP Server verwenden
- Oder: Demo-Modus nutzen

**Produktion (Webserver):**
- CORS funktioniert problemlos
- Einfach Dateien hochladen
- Kein Proxy nötig!

---

## 📋 Checkliste

- [ ] Webhook Node: HTTP Method = `POST`
- [ ] Webhook Node: Options → Allowed Origins (CORS) = `*`
- [ ] AI Agent: Prompt = `={{ $json.message }}`
- [ ] Respond to Webhook: CORS-Headers konfiguriert
- [ ] Workflow: Active = **grün** (nicht Execute!)
- [ ] Test mit cURL: POST → JSON-Antwort mit CORS-Headers
- [ ] Chat Demo: Keine CORS-Fehler in F12 Console

**Wenn alle Punkte ✅ sind → Chat funktioniert!**

