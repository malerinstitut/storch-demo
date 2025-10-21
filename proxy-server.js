// Einfacher CORS-Proxy für n8n
const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 3000;
const N8N_WEBHOOK = 'https://n8n.malerinstitut.de/webhook-test/storch-demo';

const server = http.createServer((req, res) => {
    // CORS Headers setzen
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // OPTIONS Preflight Request behandeln
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    
    // POST Request an n8n weiterleiten
    if (req.method === 'POST') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            const parsedUrl = url.parse(N8N_WEBHOOK);
            
            const options = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || 443,
                path: parsedUrl.path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(body)
                }
            };
            
            const proxyReq = https.request(options, (proxyRes) => {
                let responseData = '';
                
                proxyRes.on('data', chunk => {
                    responseData += chunk;
                });
                
                proxyRes.on('end', () => {
                    res.writeHead(proxyRes.statusCode, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(responseData);
                    console.log('✅ Request weitergeleitet:', body.substring(0, 100));
                });
            });
            
            proxyReq.on('error', (error) => {
                console.error('❌ Fehler:', error.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            });
            
            proxyReq.write(body);
            proxyReq.end();
        });
    }
});

server.listen(PORT, () => {
    console.log(`🚀 CORS-Proxy läuft auf http://localhost:${PORT}`);
    console.log(`📡 Leitet Anfragen weiter an: ${N8N_WEBHOOK}`);
});


