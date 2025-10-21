#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Debug-Script für WebSocket-Server und n8n Webhook
"""

import urllib.request
import urllib.error
import json
import sys

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

WEBHOOK_URL = "https://n8n.malerinstitut.de/webhook-test/storch-demo"

print("=" * 60)
print("[DEBUG] WebSocket-Server n8n Webhook Test")
print("=" * 60)
print(f"\n[URL] Teste URL: {WEBHOOK_URL}\n")

# Test payload (wie es vom WebSocket-Server gesendet wird)
test_payload = {
    "type": "message",
    "message": "Debug-Test vom WebSocket-Server",
    "timestamp": "2024-12-19T12:00:00Z",
    "sessionId": "debug_session_123",
    "userAgent": "WebSocket-Server Debug"
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
    
    print("[>>>] Sende WebSocket-Server Test-Anfrage...\n")
    print(f"[PAYLOAD] {json.dumps(test_payload, indent=2)}\n")
    
    # Send request
    with urllib.request.urlopen(req, timeout=30) as response:
        response_data = response.read()
        
        print(f"[STATUS] HTTP {response.status}")
        print(f"[HEADERS] {dict(response.headers)}\n")
        
        if not response_data or len(response_data) == 0:
            print("[X] PROBLEM: n8n hat eine LEERE Antwort gesendet!")
            print("[X] Das ist der Grund für die Fehlermeldung in der Chat-App")
            print("\n[LÖSUNG] Fügen Sie einen 'Respond to Webhook' Node in n8n hinzu!")
        else:
            try:
                result = json.loads(response_data.decode('utf-8'))
                print("[OK] n8n Antwort (JSON):")
                print(json.dumps(result, indent=2, ensure_ascii=False))
            except json.JSONDecodeError:
                print("[OK] n8n Antwort (Text):")
                print(response_data.decode('utf-8'))
        
except urllib.error.HTTPError as e:
    print(f"[X] HTTP-Fehler {e.code}: {e.reason}")
    try:
        error_data = e.read()
        print(f"[ERROR] {error_data.decode('utf-8')}")
    except:
        pass
        
except Exception as e:
    print(f"[X] Fehler: {e}")

print("\n" + "=" * 60)
print("[INFO] Wenn n8n eine leere Antwort sendet:")
print("1. n8n Workflow muss AKTIV sein")
print("2. 'Respond to Webhook' Node hinzufügen")
print("3. Workflow testen")
print("=" * 60)
