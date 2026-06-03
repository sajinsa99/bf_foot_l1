const logSection = document.getElementById('logSection');
const logEl = document.getElementById('log');

function setRunning(running) {
  document.querySelectorAll('button').forEach(b => b.disabled = running);
}

function startLog() {
  logSection.hidden = false;
  logEl.textContent = '';
  setRunning(true);
}

async function runScrape(body) {
  startLog();
  try {
    const res = await fetch('/bf_foot_l1/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      logEl.textContent = `Error: HTTP ${res.status}`;
      setRunning(false);
      return;
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      // Parse SSE lines
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          logEl.textContent += line.slice(6) + '\n';
          logEl.scrollTop = logEl.scrollHeight;
        }
      }
    }
  } catch (err) {
    logEl.textContent += '\nError: ' + err.message;
  }
  setRunning(false);
}

document.getElementById('btnFootmercato').addEventListener('click', () => {
  runScrape({ source: 'footmercato' });
});

document.getElementById('formTransfermarkt').addEventListener('submit', e => {
  e.preventDefault();
  const data = new FormData(e.target);
  const body = { source: 'transfermarkt' };
  const season = data.get('season').trim();
  const min = data.get('min').trim();
  const max = data.get('max').trim();
  if (season) body.season = season;
  if (min) body.min = min;
  if (max) body.max = max;
  runScrape(body);
});
