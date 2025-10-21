#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test-Script für Production Webhook
"""

import urllib.request
import urllib.error
import json
import sys

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

PRODUCTION_WEBHOOK_URL = "https://n8n.malerinstitut.de/webhook/storch-demo"

print("=" * 60)
print("[TEST] Production Webhook Test")
print("=" * 60)
print(f"\n[URL] Teste Production-URL: {PRODUCTION_WEBHOOK_URL}\n")

# Test payload
test_payload = {
    "type": "message",
    "message": "Production-Test vom WebSocket-Server",
    "timestamp": "2024-12-19T12:00:00Z",
    "sessionId": "production_test_123",
    "userAgent": "WebSocket-Server Production Test",
    "webhookUrl": PRODUCTION_WEBHOOK_URL
}

try:
    # Prepare request
    data = json.dumps(test_payload).encode('utf-8')
    req = urllib.request.Request(
        PRODUCTION_WEBHOOK_URL,
        data=data,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    print("[>>>] Sende Production-Test-Anfrage...\n")
    print(f"[PAYLOAD] {json.dumps(test_payload, indent=2)}\n")
    
    # Send request
    with urllib.request.urlopen(req, timeout=30) as response:
        response_data = response.read()
        
        print(f"[STATUS] HTTP {response.status}")
        print(f"[HEADERS] {dict(response.headers)}\n")
        
        if not response_data or len(response_data) == 0:
            print("[X] PROBLEM: Production-Webhook hat eine LEERE Antwort gesendet!")
        else:
            try:
                result = json.loads(response_data.decode('utf-8'))
                print("[OK] Production-Webhook Antwort (JSON):")
                print(json.dumps(result, indent=2, ensure_ascii=False))
            except json.JSONDecodeError:
                print("[OK] Production-Webhook Antwort (Text):")
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
print("[INFO] Production-Webhook Test abgeschlossen")
print("=" * 60)

