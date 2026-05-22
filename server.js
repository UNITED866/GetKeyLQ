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
    html, body { width: 100%; height: 100vh; font-family: 'Inter', sans-serif;
      background: radial-gradient(ellipse 90% 55% at 40% 10%, #2d1b7e 0%, transparent 55%),
        radial-gradient(ellipse 70% 50% at 85% 85%, #0a3d52 0%, transparent 55%),
        linear-gradient(160deg, #13102e 0%, #0a0916 60%, #0b1620 100%);
      overflow: hidden; color: #fff; }
    .bg-page { width:100%; height:100%; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:16px; }
    .bg-page h1 { font-size:24px; font-weight:800; }
    .bg-page p { font-size:13px; color:#7777aa; }
    .btn-open { padding:16px 40px; background:linear-gradient(90deg,#3b7ef8,#5b9dff); color:#fff; border:none; border-radius:50px; font-size:15px; font-weight:700; cursor:pointer; font-family:'Inter',sans-serif; }
    .overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:10; backdrop-filter:blur(5px); align-items:center; justify-content:center; }
    .overlay.show { display:flex; }
    .tv { width:92vw; max-width:430px; height:82vh; background:#0f0f1a; border-radius:22px; overflow:hidden; box-shadow:0 28px 90px rgba(0,0,0,0.85),0 0 0 1px rgba(255,255,255,0.08); display:flex; flex-direction:column; animation:popIn 0.3s cubic-bezier(.22,1,.36,1); }
    @keyframes popIn { from{transform:scale(0.85) translateY(40px);opacity:0} to{transform:scale(1) translateY(0);opacity:1} }
    .tv-bar { display:flex; align-items:center; padding:10px 14px; background:#1c1c38; border-bottom:1px solid rgba(255,255,255,0.07); flex-shrink:0; gap:8px; }
    .tv-dots { display:flex; gap:5px; }
    .tv-dots span { width:10px; height:10px; border-radius:50%; }
    .tv-url { flex:1; background:rgba(255,255,255,0.06); border-radius:6px; padding:5px 10px; font-size:11px; color:#aaa; font-family:monospace; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .tv-close { width:28px; height:28px; border-radius:50%; border:none; background:rgba(255,60,60,0.2); color:#ff6060; font-size:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-weight:700; font-family:'Inter',sans-serif; }
    iframe { flex:1; width:100%; border:none; display:block; background:#0f0f1a; }
    .loading-wrap { flex:1; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:12px; color:#666; font-size:13px; }
    .spinner { width:32px; height:32px; border:3px solid rgba(255,255,255,0.1); border-top-color:#3b7ef8; border-radius:50%; animation:spin 0.8s linear infinite; }
    @keyframes spin { to{transform:rotate(360deg)} }
    /* Popup link kết quả */
    .result-popup { display:none; position:fixed; bottom:0; left:0; right:0; background:#13132a; border-top:1px solid rgba(255,255,255,0.1); border-radius:20px 20px 0 0; padding:24px 20px 36px; z-index:100; animation:slideUp 0.3s cubic-bezier(.22,1,.36,1); }
    .result-popup.show { display:block; }
    @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
    .r-title { font-size:12px; color:#22c55e; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:10px; }
    .r-link { font-family:monospace; font-size:13px; color:#93c5fd; word-break:break-all; line-height:1.7; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px 14px; margin-bottom:14px; }
    .r-btns { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px; }
    .btn-copy { padding:14px; border-radius:10px; border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.05); color:#ccc; font-family:'Inter',sans-serif; font-size:13px; font-weight:600; cursor:pointer; }
    .btn-copy.copied { color:#22c55e; border-color:rgba(34,197,94,0.4); }
    .btn-golink { padding:14px; border-radius:10px; border:none; background:linear-gradient(135deg,#16a34a,#22c55e); color:#fff; font-family:'Inter',sans-serif; font-size:13px; font-weight:700; cursor:pointer; text-decoration:none; display:flex; align-items:center; justify-content:center; }
    .btn-dismiss { width:100%; padding:12px; border-radius:10px; border:1px solid rgba(255,255,255,0.07); background:transparent; color:#666; font-family:'Inter',sans-serif; font-size:13px; cursor:pointer; }
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
      <div class="loading-wrap" id="loadingWrap">
        <div class="spinner"></div>
        <span>Đang tải...</span>
      </div>
      <iframe id="tvIframe" style="display:none" onload="iframeLoaded()"></iframe>
    </div>
  </div>

  <!-- Popup hiện link kết quả -->
  <div class="result-popup" id="resultPopup">
    <div class="r-title">✓ Link đã tạo thành công</div>
    <div class="r-link" id="rLink"></div>
    <div class="r-btns">
      <button class="btn-copy" id="btnCopy" onclick="copyLink()">📋 Sao chép</button>
      <a class="btn-golink" id="btnGo" href="#" target="_blank">🚀 Mở lấy key</a>
    </div>
    <button class="btn-dismiss" onclick="dismissResult()">Đóng</button>
  </div>

  <script>
    let currentGame = 'FCM';
    const gameNames = { FCM:'FC Online (FCM)', PUBG:'PUBG Mobile', ML:'Mobile Legends', FF:'Free Fire', COD:'Call of Duty Mobile', VALO:'Valorant', LOL:'League of Legends' };

    function openTV() {
      document.getElementById('overlay').classList.add('show');
      loadGame('FCM');
    }

    function closeTV() {
      document.getElementById('overlay').classList.remove('show');
      document.getElementById('tvIframe').style.display='none';
      document.getElementById('tvIframe').src='';
      document.getElementById('loadingWrap').style.display='flex';
      dismissResult();
    }

    function loadGame(game) {
      currentGame = game || 'FCM';
      document.getElementById('tvUrl').textContent='getkey.pmodgame.com/?reseller=HAMA&game='+currentGame;
      document.getElementById('loadingWrap').style.display='flex';
      document.getElementById('tvIframe').style.display='none';
      document.getElementById('tvIframe').src='/proxy?game='+currentGame;
    }

    function iframeLoaded() {
      document.getElementById('loadingWrap').style.display='none';
      document.getElementById('tvIframe').style.display='block';
    }

    // Nhận message từ iframe khi bấm "Tạo link ngay"
    window.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'GAME_SELECTED') {
        currentGame = e.data.game;
        loadGame(currentGame);
      }
      if (e.data && e.data.type === 'CREATE_LINK') {
        const game = e.data.game || currentGame;
        const link = 'https://getkey.pmodgame.com/?reseller=HAMA&game=' + game;
        showResult(link);
      }
    });

    function showResult(link) {
      document.getElementById('rLink').textContent = link;
      document.getElementById('btnGo').href = link;
      document.getElementById('resultPopup').classList.add('show');
    }

    function dismissResult() {
      document.getElementById('resultPopup').classList.remove('show');
    }

    let copiedLink = '';
    function copyLink() {
      const link = document.getElementById('rLink').textContent;
      navigator.clipboard.writeText(link).then(() => {
        const btn = document.getElementById('btnCopy');
        btn.textContent = '✓ Đã sao chép';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = '📋 Sao chép'; btn.classList.remove('copied'); }, 2000);
      });
    }

    document.getElementById('overlay').addEventListener('click', function(e) {
      if(e.target===this) closeTV();
    });
  </script>
</body>
</html>`;

function proxyRequest(targetUrl, res) {
  https.get(targetUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,*/*;q=0.9',
      'Accept-Language': 'vi-VN,vi;q=0.9',
      'Referer': 'https://getkey.pmodgame.com/',
    }
  }, (proxyRes) => {
    if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
      proxyRequest(proxyRes.headers.location, res);
      return;
    }

    const contentType = proxyRes.headers['content-type'] || 'text/html';
    let chunks = [];
    proxyRes.on('data', chunk => chunks.push(chunk));
    proxyRes.on('end', () => {
      let body = Buffer.concat(chunks).toString('utf8');

      if (contentType.includes('text/html')) {
        const base = 'https://getkey.pmodgame.com';
        body = body.replace(/<head>/i, '<head><base href="' + base + '/">');

        // Inject script để bắt nút "Tạo link ngay" và gửi message ra ngoài
        const inject = \`
<script>
(function() {
  function hookBtn() {
    // Bắt dropdown chọn game
    var selects = document.querySelectorAll('select');
    selects.forEach(function(sel) {
      sel.addEventListener('change', function() {
        window.parent.postMessage({ type: 'GAME_SELECTED', game: sel.value }, '*');
      });
    });

    // Bắt nút tạo link
    var btns = document.querySelectorAll('button');
    btns.forEach(function(btn) {
      if (btn.textContent.toLowerCase().includes('t') && btn.textContent.toLowerCase().includes('link')) {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          var sel = document.querySelector('select');
          var game = sel ? sel.value : 'FCM';
          window.parent.postMessage({ type: 'CREATE_LINK', game: game }, '*');
        });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hookBtn);
  } else {
    hookBtn();
    setTimeout(hookBtn, 1000);
  }
})();
<\/script>\`;

        body = body.replace('</body>', inject + '</body>');
      }

      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
      });
      res.end(body);
    });
  }).on('error', (e) => {
    res.writeHead(500);
    res.end('Proxy error: ' + e.message);
  });
}

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
    proxyRequest('https://getkey.pmodgame.com/?reseller=HAMA&game=' + game, res);
    return;
  }

  res.writeHead(404);
  res.end('Not found');

}).listen(PORT, () => {
  console.log('Server chay tai port ' + PORT);
});
