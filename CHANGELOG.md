# Changelog - STORCH KI-Helfer

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2024-12-19

### Hinzugefügt
- **Verbesserte Link-Formatierung**
  - Korrekte Behandlung von schließenden Klammern in URLs
  - Sichtbarer Text zeigt "(Link)" statt "Link"
  - Bereinigung von URL-Artefakten

### Geändert
- **Regex-Pattern für Shop-Links**
  - Ausschluss von schließenden Klammern aus URLs
  - Verbesserte URL-Erkennung für shop.storch.de

### Behoben
- **Link-Darstellung**
  - Schließende Klammern werden nicht mehr in URLs eingeschlossen
  - Korrekte Formatierung: "(Link)" als sichtbarer Text
  - Saubere Trennung zwischen URL und Anzeigetext

## [0.2.0-alpha] - 2024-12-19

### Hinzugefügt
- **Bild-Unterstützung im Chat**
  - Automatische Erkennung von Bild-URLs aus der Datenbank
  - Markdown-Bild-Syntax: `![alt text](image_url)`
  - Klick zum Vergrößern (Modal-Overlay)
  - Fehlerbehandlung bei ungültigen Bild-URLs
  - Responsive Bild-Darstellung (max-width: 100%, max-height: 300px)

- **Shop-Link-Integration**
  - Automatische Erkennung von shop.storch.de URLs
  - Anzeige als klickbarer "Link" (ohne vollständige URL)
  - Öffnet in neuem Tab mit Sicherheitsattributen

- **Bold-Text-Unterstützung**
  - Markdown-Bold-Syntax: `**text**`
  - Artikelnummern und wichtige Begriffe werden fett dargestellt
  - Gemischte Text- und Bold-Bereiche werden korrekt gerendert

- **Erweiterte URL-Verarbeitung**
  - Automatische .jpg-Ergänzung bei unvollständigen Bild-URLs
  - Bereinigung von Markdown-Artefakten (`![text](` und `jpg )`)
  - Intelligente Trennung von Bild-URLs und Shop-Links

### Geändert
- **Chat-Interface**
  - Titel aktualisiert zu "KI-Helfer V.0.2 alpha"
  - Verbesserte Nachrichten-Rendering-Engine
  - Saubere Trennung von Text, Bildern und Links

- **WebSocket-Server**
  - Timeout erhöht von 10s auf 60s für komplexe AI-Antworten
  - Bessere Fehlerbehandlung für n8n-Responses
  - Robuste JSON-Parsing für leere Antworten

### Behoben
- **AI Agent Integration**
  - Korrekte Prompt-Konfiguration: `{{ $json.body.message }}`
  - Session ID-Handling für Postgres Chat Memory
  - Workflow-Aktivierung und Webhook-Registrierung

- **Bild-Darstellung**
  - Vollständige Bild-URLs (automatische .jpg-Ergänzung)
  - Entfernung störender Markdown-Texte
  - Korrekte Bild-Größenanpassung

- **Link-Darstellung**
  - Shop-Links werden nur als "Link" angezeigt
  - Keine doppelten URL-Anzeigen mehr
  - Sichere Link-Attribute (noopener, noreferrer)

## [0.1.0] - 2024-12-19

### Hinzugefügt
- **Basis-Chat-Interface**
  - WebSocket-Verbindung zu n8n
  - Automatische Wiederverbindung bei Verbindungsabbruch
  - Heartbeat-Mechanismus für stabile Verbindung
  - Status-Anzeige (Online/Offline)

- **n8n Integration**
  - WebSocket-Server (cors-proxy.py) auf Port 3000
  - Forwarding von Chat-Nachrichten an n8n Webhook
  - Response-Handling und Fehlerbehandlung
  - Support für Test- und Production-URLs

- **AI Agent Funktionalität**
  - Integration mit OpenAI GPT-4o-mini
  - Postgres Chat Memory für Kontext
  - Pinecone Vektorsuche für Produktdatenbank
  - STORCH-spezifische Produktsuche

- **Benutzeroberfläche**
  - Responsive Design mit Bootstrap
  - STORCH-Branding und Logo
  - Einstellungen-Modal
  - Chat-Historie und Clear-Funktion
  - Sprachassistent-Integration (ElevenLabs)

### Technische Details
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Backend:** Python WebSocket-Server
- **AI:** n8n Workflow mit OpenAI und Pinecone
- **Datenbank:** Postgres für Chat Memory
- **Deployment:** Lokale Entwicklungsumgebung

---

## Geplante Features (Roadmap)

### Version 0.3.0
- [ ] Erweiterte Markdown-Unterstützung (Listen, Tabellen)
- [ ] Produktvergleichs-Funktion
- [ ] Favoriten-System für Produkte
- [ ] Export-Funktion für Chat-Verlauf

### Version 0.4.0 ✅ ABGESCHLOSSEN
- [x] Verbesserte Link-Formatierung
- [x] Korrekte URL-Behandlung
- [ ] Multi-Language Support (EN, NL, FR) - für Version 0.5.0
- [ ] Erweiterte Suchfilter - für Version 0.5.0
- [ ] Produktempfehlungen basierend auf Chat-Historie - für Version 0.5.0
- [ ] Integration mit STORCH Bestellsystem - für Version 0.5.0

### Version 1.0.0
- [ ] Vollständige Produktdatenbank-Integration
- [ ] Benutzer-Authentifizierung
- [ ] Admin-Dashboard
- [ ] Analytics und Reporting

---

## Support

Bei Fragen oder Problemen wenden Sie sich an:
- **E-Mail:** info@storch.de
- **Telefon:** 0800 78 67 244
- **Website:** https://shop.storch.de

---

*Letzte Aktualisierung: 19. Dezember 2024*
