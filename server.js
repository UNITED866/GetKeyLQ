const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Serve trang chủ
  if (pathname === '/' || pathname === '/index.html') {
    const filePath = path.join(__dirname, 'index.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Loi doc file: ' + err.message);
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  // Proxy trang getkey
  if (pathname === '/proxy') {
    const game = parsedUrl.query.game || '';
    const targetUrl = `https://getkey.pmodgame.com/?reseller=HAMA${game ? '&game=' + game : ''}`;

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9',
        'Referer': 'https://getkey.pmodgame.com/',
      }
    };

    https.get(targetUrl, options, (proxyRes) => {
      let body = '';
      proxyRes.on('data', chunk => body += chunk);
      proxyRes.on('end', () => {
        body = body.replace(/src="\//g, 'src="https://getkey.pmodgame.com/');
        body = body.replace(/href="\//g, 'href="https://getkey.pmodgame.com/');
        body = body.replace(/(src|href)="(?!http)/g, '$1="https://getkey.pmodgame.com/');
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        });
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
  console.log(`Server chay tai port ${PORT}`);
});
