#!/usr/bin/env python3
"""
WebSocket-Server mit n8n Webhook Integration
Haelt eine konstante WebSocket-Verbindung zum Client aufrecht
"""

import asyncio
import websockets
import json
import urllib.request
import urllib.error
from datetime import datetime

# Production URL
DEFAULT_N8N_WEBHOOK_URL = "https://n8n.malerinstitut.de/webhook/storch-demo"
PORT = 3001

# Connected clients
connected_clients = set()

async def handle_client(websocket):
    """Handle WebSocket client connection"""
    client_id = id(websocket)
    connected_clients.add(websocket)
    print(f"Client verbunden: {client_id} (Gesamt: {len(connected_clients)})")
    
    try:
        # Send welcome message
        await websocket.send(json.dumps({
            "type": "connection",
            "status": "connected",
            "message": "WebSocket-Verbindung erfolgreich hergestellt",
            "timestamp": datetime.now().isoformat()
        }))
        
        # Keep connection alive with periodic heartbeats
        async def heartbeat():
            while True:
                try:
                    await asyncio.sleep(30)  # Every 30 seconds
                    if websocket in connected_clients:
                        await websocket.send(json.dumps({
                            "type": "heartbeat",
                            "timestamp": datetime.now().isoformat()
                        }))
                except Exception as e:
                    print(f"Heartbeat-Fehler: {e}")
                    break
        
        # Start heartbeat task
        heartbeat_task = asyncio.create_task(heartbeat())
        
        # Handle incoming messages
        async for message in websocket:
            try:
                data = json.loads(message)
                print(f"Nachricht empfangen von {client_id}: {data.get('message', '')[:50]}...")
                
                # Handle different message types
                if data.get('type') == 'ping':
                    # Respond to ping
                    await websocket.send(json.dumps({
                        "type": "pong",
                        "timestamp": datetime.now().isoformat()
                    }))
                elif data.get('type') == 'message' or 'message' in data:
                    # Forward to n8n webhook
                    response = await forward_to_n8n(data)
                    
                    # Send response back to client
                    await websocket.send(json.dumps({
                        "type": "response",
                        "data": response,
                        "timestamp": datetime.now().isoformat()
                    }))
                    print(f"Antwort gesendet an {client_id}")
                    
            except json.JSONDecodeError:
                print(f"Ungueltige JSON-Nachricht von {client_id}")
                await websocket.send(json.dumps({
                    "type": "error",
                    "message": "Ungueltiges Nachrichtenformat",
                    "timestamp": datetime.now().isoformat()
                }))
            except Exception as e:
                print(f"Fehler beim Verarbeiten der Nachricht: {e}")
                await websocket.send(json.dumps({
                    "type": "error",
                    "message": str(e),
                    "timestamp": datetime.now().isoformat()
                }))
    
    except websockets.exceptions.ConnectionClosed:
        print(f"Client getrennt: {client_id}")
    except Exception as e:
        print(f"Verbindungsfehler: {e}")
    finally:
        # Cleanup
        connected_clients.discard(websocket)
        heartbeat_task.cancel()
        print(f"Client entfernt: {client_id} (Gesamt: {len(connected_clients)})")

async def forward_to_n8n(data):
    """Forward message to n8n webhook"""
    try:
        # Get webhook URL from data or use default
        webhook_url = data.get('webhookUrl', DEFAULT_N8N_WEBHOOK_URL)
        print(f"Empfangene Daten: {data}")
        print(f"Verwende Webhook-URL: {webhook_url}")
        
        # Prepare payload
        payload = json.dumps(data).encode('utf-8')
        
        # Create request
        req = urllib.request.Request(
            webhook_url,
            data=payload,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        
        # Send request (synchronous, but quick)
        print(f"Sende an n8n: {data.get('message', '')[:50]}...")
        with urllib.request.urlopen(req, timeout=120) as response:
            response_data = response.read()
            
            # Check if response is empty
            print(f"n8n Response Status: {response.status}")
            print(f"n8n Response Length: {len(response_data)} bytes")
            
            if not response_data or len(response_data) == 0:
                print("n8n hat eine leere Antwort gesendet")
                print("Tipp: Fuegen Sie einen 'Respond to Webhook' Node in n8n hinzu!")
                return {
                    "message": "Ihre Nachricht wurde empfangen, aber n8n hat keine Antwort konfiguriert.",
                    "hint": "Fuegen Sie einen 'Respond to Webhook' Node in Ihrem n8n Workflow hinzu."
                }
            
            # Try to parse JSON with safe encoding
            try:
                # Decode with error handling for Unicode issues
                try:
                    decoded_response = response_data.decode('utf-8')
                except UnicodeDecodeError:
                    # Try with different encoding or replace problematic characters
                    decoded_response = response_data.decode('utf-8', errors='replace')
                    print("Unicode-Zeichen in n8n-Antwort durch ? ersetzt")
                
                result = json.loads(decoded_response)
                print(f"n8n Antwort (JSON): {str(result)[:100]}...")
                return result
            except json.JSONDecodeError:
                # Response is not JSON, return as text
                try:
                    text_response = response_data.decode('utf-8')
                except UnicodeDecodeError:
                    text_response = response_data.decode('utf-8', errors='replace')
                    print("Unicode-Zeichen in n8n-Antwort durch ? ersetzt")
                
                print(f"n8n Antwort (Text): {text_response[:100]}...")
                return {"message": text_response}
            
    except urllib.error.HTTPError as e:
        error_msg = f"HTTP Error {e.code}: {e.reason}"
        print(f"n8n Fehler: {error_msg}")
        return {"error": error_msg, "message": "Webhook nicht erreichbar"}
    except urllib.error.URLError as e:
        error_msg = f"URL Error: {e.reason}"
        print(f"n8n Fehler: {error_msg}")
        return {"error": error_msg, "message": "Webhook nicht erreichbar"}
    except Exception as e:
        error_msg = str(e)
        print(f"Unerwarteter Fehler: {error_msg}")
        print("Tipp: Stellen Sie sicher, dass Ihr n8n Workflow einen 'Respond to Webhook' Node hat!")
        
        # Handle Unicode encoding errors specifically
        if "charmap" in error_msg and "codec can't encode" in error_msg:
            return {
                "error": "Unicode-Encoding-Fehler",
                "message": "n8n hat eine Antwort mit Unicode-Emojis gesendet, die nicht dargestellt werden können. Bitte verwenden Sie nur ASCII-Zeichen in Ihrem n8n Workflow."
            }
        
        return {
            "error": error_msg, 
            "message": "Nachricht empfangen, aber n8n-Antwort fehlerhaft. Fuegen Sie 'Respond to Webhook' Node hinzu."
        }

async def main():
    """Start WebSocket server"""
    print("=" * 60)
    print("WebSocket-Server startet...")
    print(f"Port: {PORT}")
    print(f"n8n Webhook: {DEFAULT_N8N_WEBHOOK_URL} (dynamisch)")
    print("=" * 60)
    
    async with websockets.serve(handle_client, "localhost", PORT):
        print(f"WebSocket-Server laeuft auf ws://localhost:{PORT}")
        print("Die Verbindung bleibt jetzt konstant bestehen!")
        print("Auto-Reconnect und Heartbeat aktiviert")
        print("=" * 60)
        await asyncio.Future()  # Run forever

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nServer wird beendet...")
