#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test-Script fuer n8n Webhook-Verbindung
"""

import urllib.request
import urllib.error
import json
import sys

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Aktuelle URL aus cors-proxy.py laden
try:
    with open('cors-proxy.py', 'r', encoding='utf-8') as f:
        for line in f:
            if 'N8N_WEBHOOK_URL' in line and '=' in line:
                # Extract URL
                url_part = line.split('=')[1].strip().strip('"').strip("'")
                WEBHOOK_URL = url_part
                break
except Exception as e:
    print(f"[X] Fehler beim Laden der URL aus cors-proxy.py: {e}")
    WEBHOOK_URL = "https://n8n.malerinstitut.de/webhook-test/storch-demo"

print("=" * 60)
print("[TEST] n8n Webhook Test")
print("=" * 60)
print(f"\n[URL] Teste URL: {WEBHOOK_URL}\n")

# Test payload
test_payload = {
    "message": "Test-Nachricht vom Test-Script",
    "test": True,
    "timestamp": "2024-10-17T12:00:00Z"
}

try:
    # Prepare request
    data = json.dumps(test_payload).encode('utf-8')
    req = urllib.request.Request(
        WEBHOOK_URL,
        data=data,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    print("[>>>] Sende Test-Anfrage...\n")
    
    # Send request
    with urllib.request.urlopen(req, timeout=10) as response:
        response_data = response.read()
        result = json.loads(response_data.decode('utf-8'))
        
        print("[OK] ERFOLG! Webhook ist erreichbar!\n")
        print("[<<<] Antwort von n8n:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        print("\n" + "=" * 60)
        print("[OK] Ihr Webhook funktioniert!")
        print("=" * 60)
        
except urllib.error.HTTPError as e:
    print(f"[X] HTTP-Fehler {e.code}: {e.reason}\n")
    
    # Try to read error response
    try:
        error_data = e.read()
        error_json = json.loads(error_data.decode('utf-8'))
        print("[<<<] Fehlermeldung von n8n:")
        print(json.dumps(error_json, indent=2, ensure_ascii=False))
        
        if e.code == 404:
            print("\n" + "=" * 60)
            print("[!] WEBHOOK NICHT REGISTRIERT")
            print("=" * 60)
            print("\nMoegliche Ursachen:")
            print("1. [X] Workflow ist nicht AKTIV in n8n")
            print("2. [X] Sie verwenden die Test-URL statt Production-URL")
            print("3. [X] Die Webhook-URL ist falsch")
            print("\n[i] Loesungsschritte:")
            print("\n1. n8n oeffnen: https://n8n.malerinstitut.de")
            print("2. Workflow oeffnen")
            print("3. Toggle oben rechts auf 'ACTIVE' (gruen) setzen")
            print("4. Im Webhook-Node die 'Production URL' kopieren")
            print("5. In cors-proxy.py einfuegen (Zeile 14)")
            print("6. Server neu starten\n")
            print("[i] Hilfe: Siehe WEBHOOK-SETUP-HILFE.md")
            
    except:
        print(f"Keine Details verfuegbar")
        
except urllib.error.URLError as e:
    print(f"[X] Verbindungsfehler: {e.reason}\n")
    print("Moegliche Ursachen:")
    print("- Keine Internetverbindung")
    print("- n8n-Server nicht erreichbar")
    print("- Firewall blockiert die Verbindung")
    
except Exception as e:
    print(f"[X] Unerwarteter Fehler: {e}")

print("\n" + "=" * 60)
print("[i] Zum Aendern der URL:")
print("   1. Oeffnen: cors-proxy.py")
print("   2. Zeile 14 aendern")
print("   3. Server neu starten")
print("=" * 60)

