const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = 'C:\\Users\\Admin\\AppData\\Local\\Temp\\chrome_team_check_' + Date.now();
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9229',
    `--user-data-dir=${userDataDir}`,
    '--window-size=1280,1200',
    '--disable-gpu',
    'http://localhost:5173/#/team'
  ]);

  let target = null;
  for (let i = 0; i < 20; i++) {
    await sleep(400);
    try {
      const list = await fetchJson('http://127.0.0.1:9229/json/list');
      if (list && list.length > 0) {
        target = list.find(t => t.type === 'page') || list[0];
        if (target) break;
      }
    } catch (e) {}
  }

  if (!target) {
    console.error('Target not found');
    chromeProc.kill();
    return;
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let msgId = 1;
  const callbacks = new Map();
  ws.onmessage = (e) => {
    const res = JSON.parse(e.data);
    if (res.id && callbacks.has(res.id)) callbacks.get(res.id)(res);
  };
  await new Promise(r => ws.onopen = r);
  function send(method, params = {}) {
    return new Promise(resolve => {
      const id = msgId++;
      callbacks.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: 'http://localhost:5173/#/team' });

  // Wait 9s for loader to finish and fade out completely
  console.log('Waiting 9s for loader to fade out...');
  await sleep(9000);

  // Scroll down a bit to see cards nicely
  await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 380)' });
  await sleep(500);

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  if (shot && shot.result && shot.result.data) {
    fs.writeFileSync('c:\\projects\\sebcclubwebsite\\sandip-club\\team_cards_check.png', Buffer.from(shot.result.data, 'base64'));
    console.log('Saved team_cards_check.png');
  }

  ws.close();
  chromeProc.kill();
  try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
}

run();
