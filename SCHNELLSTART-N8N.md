# ⚡ n8n SCHNELLSTART (3 Schritte)

## 🎯 Ihr Workflow sollte SO aussehen:

```
Webhook (POST, CORS: *) 
    → AI Agent (Prompt: ={ $json.message }) 
        → Respond to Webhook (mit CORS-Headers)
```

---

## ✅ SCHRITT 1: Webhook Node

Klicken Sie auf Ihren **Webhook Node**:

1. **HTTP Method:** `POST` ✅
2. **Path:** `storch-demo` ✅
3. Scrollen Sie zu **"Options"**
4. Klicken Sie **"Add Option"**
5. Wählen Sie **"Allowed Origins (CORS)"**
6. Tragen Sie ein: `*` (Sternchen)

**Screenshot-Hilfe:**
```
┌─────────────────────────┐
│ Webhook Node Settings   │
├─────────────────────────┤
│ HTTP Method: POST       │
│ Path: storch-demo       │
│                         │
│ Options:                │
│  ✅ Allowed Origins     │
│     Value: *            │
└─────────────────────────┘
```

---

## ✅ SCHRITT 2: AI Agent Node

Klicken Sie auf Ihren **AI Agent Node**:

1. **Prompt (User Message):**
   - Source: **Manual** (nicht "Chat Trigger")
   - Text: `={ $json.message }`

**Screenshot-Hilfe:**
```
┌─────────────────────────┐
│ AI Agent Settings       │
├─────────────────────────┤
│ Source: Manual          │
│ Prompt:                 │
│  ={ $json.message }     │
└─────────────────────────┘
```

---

## ✅ SCHRITT 3: Respond to Webhook Node

Klicken Sie auf Ihren **Respond to Webhook Node**:

### **Response Body:**
1. **Respond With:** `Using an Expression`
2. **Expression:**
   ```javascript
   ={ { "message": $json.output || $json.text || "Antwort" } }
   ```

### **CORS Headers (WICHTIG!):**
1. Scrollen Sie zu **"Options"**
2. Klicken Sie **"Add Option"**
3. Wählen Sie **"Response Headers"**
4. Fügen Sie 3 Headers hinzu:

**Header 1:**
- Name: `Access-Control-Allow-Origin`
- Value: `*`

**Header 2:**
- Name: `Access-Control-Allow-Methods`
- Value: `POST, OPTIONS, GET`

**Header 3:**
- Name: `Access-Control-Allow-Headers`
- Value: `Content-Type`

**Screenshot-Hilfe:**
```
┌─────────────────────────────────┐
│ Respond to Webhook Settings     │
├─────────────────────────────────┤
│ Respond With: Expression        │
│ Expression:                     │
│  ={ { "message": $json.output } }│
│                                 │
│ Options:                        │
│  ✅ Response Headers            │
│    1. Access-Control-Allow-...  │
│    2. Access-Control-Allow-...  │
│    3. Access-Control-Allow-...  │
└─────────────────────────────────┘
```

---

## ✅ SCHRITT 4: Workflow aktivieren

1. Oben rechts: Toggle **"Active"** auf **GRÜN** ✅
2. **NICHT** auf "Execute Workflow" klicken!

---

## 🧪 TESTEN

### **Test 1: Mit cURL (PowerShell)**

```powershell
curl -X POST https://n8n.malerinstitut.de/webhook-test/storch-demo `
  -H "Content-Type: application/json" `
  -d '{\"message\":\"Hallo\"}'
```

**Erwartete Antwort:**
```json
{"message":"Hallo! Wie kann ich Ihnen helfen?"}
```

### **Test 2: Mit Chat Demo**

1. Doppelklick auf `index.html`
2. Drücken Sie `F12` (Developer Console)
3. Klicken Sie auf **🔄 Verbindung testen**
4. **Status sollte "Online" (grün) sein** ✅
5. Schreiben Sie: "Hallo"
6. **AI Agent antwortet!** 🎉

---

## 🔍 Troubleshooting

### ❌ "No 'Access-Control-Allow-Origin' header"
→ **Lösung:** Headers in Schritt 3 fehlen oder falsch geschrieben

### ❌ "Webhook is not registered"
→ **Lösung:** Workflow auf "Active" (grün) setzen

### ❌ "No prompt specified"
→ **Lösung:** AI Agent Prompt auf `={ $json.message }` setzen

### ❌ Chat zeigt den rohen Expression-Code als Text
→ **Lösung:** Response Expression muss `={ ... }` starten (mit `=`)

### ❌ Funktioniert nur einmal nach "Execute Workflow"
→ **Lösung:** Workflow muss auf "Active" sein, nicht nur executed

---

## ✅ Checkliste

- [ ] Webhook: HTTP Method = POST ✅
- [ ] Webhook: Options → Allowed Origins = `*` ✅
- [ ] AI Agent: Prompt = `={ $json.message }` ✅
- [ ] Respond: CORS-Headers (3 Stück) ✅
- [ ] Workflow: Active = GRÜN ✅
- [ ] Test: cURL gibt JSON zurück ✅
- [ ] Test: Chat zeigt "Online" (grün) ✅

**Alles ✅? → FERTIG!** 🎉


