import handler from './api/motivasi.js';
import http from 'http';

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  // Set CORS headers - Allow GitHub Pages domain
  const origin = req.headers.origin || '';
  const allowedOrigins = [
    'https://firmanahmad-max.github.io',
    'https://goodday-app-v3.railway.app',
    'http://localhost:3000',
    'http://localhost:5500'
  ];
  
  if (allowedOrigins.includes(origin) || origin.includes('localhost')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '3600');

  // Handle preflight CORS request
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Route: /api/motivasi
  if (req.url === '/api/motivasi' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        
        // Mock req object dengan data dari body
        const mockReq = {
          method: 'POST',
          body: data
        };

        // Mock res object
        let statusCode = 200;
        const responseData = {};
        const resProxy = {
          status: (code) => {
            statusCode = code;
            return resProxy;
          },
          json: (data) => {
            Object.assign(responseData, data);
            return resProxy;
          },
          setHeader: (key, value) => {
            res.setHeader(key, value);
            return resProxy;
          },
          end: () => {
            res.writeHead(statusCode, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(responseData));
          }
        };

        // Call handler
        await handler(mockReq, resProxy);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server error: ' + err.message }));
      }
    });
    return;
  }

  // Health check endpoint
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'GoodDay API running', version: '3.0' }));
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`[GoodDay Server] Running on port ${PORT}`);
  console.log(`[GoodDay Server] API endpoint: http://localhost:${PORT}/api/motivasi`);
});
