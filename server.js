const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // Serve file HTML
  if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/index.html') {
    const filePath = path.join(__dirname, 'index.html');
    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  // Proxy trang getkey
  if (parsedUrl.pathname === '/proxy') {
    const game = parsedUrl.query.game || '';
    const targetUrl = `https://getkey.pmodgame.com/?reseller=HAMA${game ? '&game=' + game : ''}`;

    https.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
        'Referer': 'https://getkey.pmodgame.com/',
      }
    }, (proxyRes) => {
      let body = '';
      proxyRes.on('data', chunk => body += chunk);
      proxyRes.on('end', () => {
        // Xóa header chặn iframe
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          // KHÔNG set X-Frame-Options để cho phép nhúng
        });
        // Fix các link tương đối trong HTML
        body = body.replace(/src="\//g, 'src="https://getkey.pmodgame.com/');
        body = body.replace(/href="\//g, 'href="https://getkey.pmodgame.com/');
        res.end(body);
      });
    }).on('error', (e) => {
      res.writeHead(500);
      res.end('Proxy error: ' + e.message);
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');

}).listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
  console.log(`📺 Mở trình duyệt vào http://localhost:${PORT}`);
});
      
