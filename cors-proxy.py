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
    print(f"Client verbunden (Gesamt: {len(connected_clients)})")
    
    async def heartbeat():
        """Send periodic heartbeats to keep connection alive"""
        while websocket in connected_clients:
            try:
                await asyncio.sleep(30)
                await websocket.send(json.dumps({
                    "type": "heartbeat",
                    "timestamp": datetime.now().isoformat()
                }))
            except:
                break
    
    heartbeat_task = asyncio.create_task(heartbeat())
    
    try:
        # Send welcome message
        await websocket.send(json.dumps({
            "type": "connection",
            "status": "connected",
            "message": "WebSocket-Verbindung hergestellt"
        }))
        
        # Handle incoming messages
        async for message in websocket:
            try:
                data = json.loads(message)
                
                if data.get('type') == 'ping':
                    await websocket.send(json.dumps({"type": "pong"}))
                    
                elif data.get('type') == 'message' or 'message' in data:
                    print(f"Nachricht: {data.get('message', '')[:50]}...")
                    response = await forward_to_n8n(data)
                    await websocket.send(json.dumps({
                        "type": "response",
                        "data": response
                    }))
                    
            except json.JSONDecodeError:
                await websocket.send(json.dumps({
                    "type": "error",
                    "message": "Ungueltiges JSON-Format"
                }))
            except Exception as e:
                print(f"Fehler: {e}")
                await websocket.send(json.dumps({
                    "type": "error",
                    "message": str(e)
                }))
    
    except websockets.exceptions.ConnectionClosed:
        print(f"Client getrennt")
    finally:
        connected_clients.discard(websocket)
        heartbeat_task.cancel()
        print(f"Verbindungen: {len(connected_clients)}")

async def forward_to_n8n(data):
    """Forward message to n8n webhook"""
    try:
        webhook_url = data.get('webhookUrl', DEFAULT_N8N_WEBHOOK_URL)
        print(f"Sende an n8n: {data.get('message', '')[:50]}...")
        
        # Prepare and send request
        payload = json.dumps(data).encode('utf-8')
        req = urllib.request.Request(
            webhook_url,
            data=payload,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        
        with urllib.request.urlopen(req, timeout=120) as response:
            response_data = response.read()
            
            if not response_data:
                return {
                    "message": "Nachricht empfangen. Fuegen Sie einen 'Respond to Webhook' Node in n8n hinzu."
                }
            
            # Decode and parse response
            decoded = response_data.decode('utf-8', errors='replace')
            try:
                result = json.loads(decoded)
                print(f"n8n Antwort: {str(result)[:100]}...")
                return result
            except json.JSONDecodeError:
                return {"message": decoded}
            
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.reason}")
        return {"error": f"HTTP {e.code}", "message": "Webhook nicht erreichbar"}
    except urllib.error.URLError as e:
        print(f"URL Error: {e.reason}")
        return {"error": "Verbindungsfehler", "message": "Webhook nicht erreichbar"}
    except Exception as e:
        print(f"Fehler: {e}")
        return {"error": str(e), "message": "Fehler beim Verarbeiten der Anfrage"}

async def main():
    """Start WebSocket server"""
    print("=" * 50)
    print(f"WebSocket-Server startet auf Port {PORT}")
    print(f"n8n Webhook: {DEFAULT_N8N_WEBHOOK_URL}")
    print("=" * 50)
    
    async with websockets.serve(handle_client, "localhost", PORT):
        print(f"✓ Server laeuft auf ws://localhost:{PORT}")
        print("✓ Heartbeat und Auto-Reconnect aktiv")
        print("=" * 50)
        await asyncio.Future()  # Run forever

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nServer wird beendet...")
