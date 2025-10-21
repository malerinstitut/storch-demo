# 🔧 n8n Workflow richtig einrichten

## ✅ Gute Nachrichten!

Ihre Webhook-Verbindung funktioniert bereits! 🎉

Der Fehler "Expecting value" bedeutet nur, dass n8n keine oder eine ungültige Antwort sendet.

---

## 📋 n8n Workflow Struktur (Minimal)

Ihr Workflow braucht **mindestens 2 Nodes**:

```
┌─────────────┐      ┌──────────────────────┐
│   Webhook   │ ───→ │ Respond to Webhook   │
└─────────────┘      └──────────────────────┘
```

### **1. Webhook Node** (haben Sie bereits ✅)
- Empfängt die Chat-Nachricht
- HTTP Method: POST
- Path: Ihr eindeutiger Pfad

### **2. Respond to Webhook Node** (FEHLT! ❌)
- Sendet Antwort zurück an den Chat
- **MUSS vorhanden sein!**

---

## 🔧 So fügen Sie "Respond to Webhook" hinzu:

### Schritt 1: Node hinzufügen
1. Klicken Sie auf das **+** rechts neben Ihrem Webhook-Node
2. Suchen Sie: **"Respond to Webhook"**
3. Klicken Sie darauf, um es hinzuzufügen

### Schritt 2: Respond to Webhook konfigurieren

Im rechten Panel:

```
┌─────────────────────────────────────┐
│ Respond to Webhook                  │
├─────────────────────────────────────┤
│ Respond With: Using 'Respond to     │
│              Webhook' Node          │
├─────────────────────────────────────┤
│ Response Code: 200                  │
├─────────────────────────────────────┤
│ Response Body                       │
│ ┌─────────────────────────────────┐ │
│ │ {                               │ │
│ │   "message": "Hallo! Ich bin    │ │
│ │   der KI-Assistent."            │ │
│ │ }                               │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Minimale Konfiguration:

**Response Body:**
```json
{
  "message": "Hallo! Ich habe Ihre Nachricht erhalten."
}
```

---

## 🤖 Mit KI-Integration (OpenAI, etc.)

Wenn Sie eine KI verwenden möchten:

```
┌──────────┐   ┌─────────────┐   ┌──────────────────┐
│ Webhook  │ → │  OpenAI     │ → │ Respond to       │
│          │   │  Chat       │   │ Webhook          │
└──────────┘   └─────────────┘   └──────────────────┘
```

### OpenAI Node Konfiguration:
- **Model:** gpt-4 oder gpt-3.5-turbo
- **Prompt:** `{{ $json.message }}`
- **Output:** Die KI-Antwort

### Respond to Webhook:
```json
{
  "message": "{{ $json.choices[0].message.content }}"
}
```

Oder einfacher mit Expression:
```
{{ $json.message }}
```

---

## 📝 Beispiel-Workflows

### Minimal-Workflow (Einfaches Echo):

```json
{
  "message": "Sie haben geschrieben: {{ $json.message }}"
}
```

### Mit OpenAI:

1. **Webhook Node** empfängt Nachricht
2. **OpenAI Chat Model Node**
   - Prompt: `{{ $('Webhook').item.json.message }}`
3. **Respond to Webhook Node**
   - Body: `{"message": "{{ $json.choices[0].message.content }}"}`

---

## ⚠️ Häufige Fehler

### ❌ Fehler 1: Kein "Respond to Webhook" Node
**Symptom:** JSON Parse Error, leere Antwort  
**Lösung:** "Respond to Webhook" Node hinzufügen

### ❌ Fehler 2: Respond to Webhook am falschen Ort
**Symptom:** Workflow läuft, aber keine Antwort  
**Lösung:** "Respond to Webhook" muss am **Ende** des Workflows stehen

### ❌ Fehler 3: Ungültiges JSON im Response Body
**Symptom:** JSON Parse Error  
**Lösung:** JSON-Syntax prüfen (z.B. auf jsonlint.com)

---

## ✅ Workflow testen

### Test 1: In n8n
1. Klicken Sie auf "Execute Workflow"
2. Webhook wird einmal aktiviert
3. Senden Sie eine Test-Nachricht vom Chat
4. Prüfen Sie die Workflow-Execution

### Test 2: Von Ihrer Chat-Demo
1. Öffnen Sie die Chat-Demo
2. Senden Sie eine Nachricht
3. Sie sollten eine Antwort erhalten!

### Test 3: Mit dem Test-Script
```bash
python test-webhook.py
```

Erfolgreiche Antwort:
```
[OK] ERFOLG! Webhook ist erreichbar!
{
  "message": "..."
}
```

---

## 🎯 Zusammenfassung

### Was Sie brauchen:
1. ✅ Webhook Node (haben Sie)
2. ✅ Production-URL aktiv (haben Sie)
3. ✅ Workflow aktiv/grün (haben Sie)
4. ❌ **Respond to Webhook Node** (BITTE HINZUFÜGEN!)

### Nach dem Hinzufügen:
1. Workflow speichern
2. Server neu starten (optional, wenn bereits läuft ist OK)
3. Browser neu laden
4. Test-Nachricht senden

**Dann sollte alles funktionieren!** 🚀

---

## 📞 Weitere Hilfe

Workflow-JSON-Beispiele finden Sie in:
- `n8n-workflow-simple.json` (Einfaches Echo)
- `n8n-workflow-template.json` (Mit KI)

Diese können Sie direkt in n8n importieren!

