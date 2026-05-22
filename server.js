const http = require('http');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 3000;

const HTML = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
  <title>PMODGAME – HAMA</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%; height: 100vh;
      font-family: 'Inter', sans-serif;
      background:
        radial-gradient(ellipse 90% 55% at 40% 10%, #2d1b7e 0%, transparent 55%),
        radial-gradient(ellipse 70% 50% at 85% 85%, #0a3d52 0%, transparent 55%),
        linear-gradient(160deg, #13102e 0%, #0a0916 60%, #0b1620 100%);
      overflow: hidden; color: #fff;
    }
    .bg-page { width:100%; height:100%; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:16px; }
    .bg-page h1 { font-size:24px; font-weight:800; }
    .bg-page p { font-size:13px; color:#7777aa; }
    .btn-open { padding:16px 40px; background:linear-gradient(90deg,#3b7ef8,#5b9dff); color:#fff; border:none; border-radius:50px; font-size:15px; font-weight:700; cursor:pointer; box-shadow:0 4px 24px rgba(59,126,248,0.5); font-family:'Inter',sans-serif; }
    .overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:10; backdrop-filter:blur(5px); align-items:center; justify-content:center; }
    .overlay.show { display:flex; }
    .tv { width:92vw; max-width:430px; height:80vh; max-height:700px; background:#0f0f1a; border-radius:22px; overflow:hidden; box-shadow:0 28px 90px rgba(0,0,0,0.85),0 0 0 1px rgba(255,255,255,0.08); display:flex; flex-direction:column; animation:popIn 0.3s cubic-bezier(.22,1,.36,1); }
    @keyframes popIn { from{transform:scale(0.85) translateY(40px);opacity:0} to{transform:scale(1) translateY(0);opacity:1} }
    .tv-bar { display:flex; align-items:center; padding:10px 14px; background:#1c1c38; border-bottom:1px solid rgba(255,255,255,0.07); flex-shrink:0; gap:8px; }
    .tv-dots { display:flex; gap:5px; }
    .tv-dots span { width:10px; height:10px; border-radius:50%; }
    .tv-url { flex:1; background:rgba(255,255,255,0.06); border-radius:6px; padding:5px 10px; font-size:11px; color:#888; font-family:monospace; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .tv-close { width:28px; height:28px; border-radius:50%; border:none; background:rgba(255,60,60,0.2); color:#ff6060; font-size:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-weight:700; font-family:'Inter',sans-serif; }
    .tv-controls { display:flex; gap:8px; padding:10px 12px; background:#161630; border-bottom:1px solid rgba(255,255,255,0.05); flex-shrink:0; }
    select { flex:1; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:8px; padding:8px 12px; font-family:'Inter',sans-serif; font-size:13px; color:#fff; appearance:none; -webkit-appearance:none; outline:none; cursor:pointer; }
    select option { background:#1a1a35; }
    .btn-load { padding:8px 16px; background:linear-gradient(90deg,#3b7ef8,#5b9dff); color:#fff; border:none; border-radius:8px; font-family:'Inter',sans-serif; font-size:13px; font-weight:700; cursor:pointer; white-space:nowrap; }
    iframe { flex:1; width:100%; border:none; display:block; background:#0f0f1a; }
    .loading-wrap { flex:1; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:12px; color:#666; font-size:13px; }
    .spinner { width:32px; height:32px; border:3px solid rgba(255,255,255,0.1); border-top-color:#3b7ef8; border-radius:50%; animation:spin 0.8s linear infinite; }
    @keyframes spin { to{transform:rotate(360deg)} }
  </style>
</head>
<body>
  <div class="bg-page">
    <h1>🔑 PMODGAME</h1>
    <p>Reseller: HAMA · Active</p>
    <button class="btn-open" onclick="openTV()">Lấy Key ngay</button>
  </div>
  <div class="overlay" id="overlay">
    <div class="tv">
      <div class="tv-bar">
        <div class="tv-dots">
          <span style="background:#ff5f57"></span>
          <span style="background:#febc2e"></span>
          <span style="background:#28c840"></span>
        </div>
        <div class="tv-url" id="tvUrl">getkey.pmodgame.com/?reseller=HAMA</div>
        <button class="tv-close" onclick="closeTV()">✕</button>
      </div>
      <div class="tv-controls">
        <select id="gameSelect">
          <option value="FCM">FC Online (FCM)</option>
          <option value="PUBG">PUBG Mobile</option>
          <option value="ML">Mobile Legends</option>
          <option value="FF">Free Fire</option>
          <option value="COD">Call of Duty Mobile</option>
          <option value="VALO">Valorant</option>
          <option value="LOL">League of Legends</option>
        </select>
        <button class="btn-load" onclick="loadGame()">Tải ▶</button>
      </div>
      <div class="loading-wrap" id="loadingWrap">
        <div class="spinner"></div>
        <span>Đang tải...</span>
      </div>
      <iframe id="tvIframe" style="display:none" onload="iframeLoaded()"></iframe>
    </div>
  </div>
  <script>
    function openTV() {
      document.getElementById('overlay').classList.add('show');
      loadGame();
    }
    function closeTV() {
      document.getElementById('overlay').classList.remove('show');
      document.getElementById('tvIframe').style.display='none';
      document.getElementById('tvIframe').src='';
      document.getElementById('loadingWrap').style.display='flex';
    }
    function loadGame() {
      const game = document.getElementById('gameSelect').value;
      document.getElementById('tvUrl').textContent = 'getkey.pmodgame.com/?reseller=HAMA&game='+game;
      document.getElementById('loadingWrap').style.display='flex';
      document.getElementById('tvIframe').style.display='none';
      document.getElementById('tvIframe').src = '/proxy?game='+game;
    }
    function iframeLoaded() {
      document.getElementById('loadingWrap').style.display='none';
      document.getElementById('tvIframe').style.display='block';
    }
    document.getElementById('overlay').addEventListener('click', function(e) {
      if(e.target===this) closeTV();
    });
  </script>
</body>
</html>`;

http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (pathname === '/' || pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML);
    return;
  }

  if (pathname === '/proxy') {
    const game = parsedUrl.query.game || 'FCM';
    const targetUrl = 'https://getkey.pmodgame.com/?reseller=HAMA&game=' + game;

    https.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9',
        'Referer': 'https://getkey.pmodgame.com/',
      }
    }, (proxyRes) => {
      let body = '';
      proxyRes.setEncoding('utf8');
      proxyRes.on('data', chunk => body += chunk);
      proxyRes.on('end', () => {
        body = body.replace(/src="\//g, 'src="https://getkey.pmodgame.com/');
        body = body.replace(/href="\//g, 'href="https://getkey.pmodgame.com/');
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
  console.log('Server chay tai port ' + PORT);
});
