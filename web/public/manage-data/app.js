const logSection = document.getElementById('logSection');
const logEl = document.getElementById('log');
const statusArea = document.getElementById('statusArea');
const statusList = document.getElementById('statusList');

function setRunning(running) {
  document.querySelectorAll('button').forEach(b => b.disabled = running);
}

function appendLog(text) {
  logEl.textContent += text + '\n';
  logEl.scrollTop = logEl.scrollHeight;
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
      appendLog(`Erreur HTTP ${res.status}`);
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
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) {
        if (line.startsWith('data: ')) appendLog(line.slice(6));
      }
    }
  } catch (err) {
    appendLog('Erreur : ' + err.message);
  }
  setRunning(false);
}

// ── FootMercato ──
document.getElementById('btnFootmercato').addEventListener('click', () => {
  runScrape({ source: 'footmercato' });
});

// ── Mode selector ──
const rangeFields = document.getElementById('rangeFields');
document.querySelectorAll('input[name="mode"]').forEach(r => {
  r.addEventListener('change', () => {
    rangeFields.hidden = r.value !== 'range';
  });
});

function getMode() {
  return document.querySelector('input[name="mode"]:checked').value;
}

// ── Détecter la dernière saison ──
document.getElementById('btnDetectSeason').addEventListener('click', async () => {
  const btn = document.getElementById('btnDetectSeason');
  btn.disabled = true;
  btn.textContent = 'Détection…';
  try {
    const res = await fetch('/bf_foot_l1/api/latest-season');
    const { season } = await res.json();
    if (season) {
      document.getElementById('inpSeason').value = season;
    } else {
      alert('Impossible de détecter la dernière saison.');
    }
  } catch (e) {
    alert('Erreur : ' + e.message);
  }
  btn.disabled = false;
  btn.textContent = 'Détecter la dernière saison';
});

// ── Détecter le max ──
document.getElementById('btnDetectMax').addEventListener('click', async () => {
  const season = document.getElementById('inpSeason').value.trim();
  const year = season.split('/')[0];
  if (!year) { alert('Veuillez d\'abord saisir une saison.'); return; }
  const btn = document.getElementById('btnDetectMax');
  btn.disabled = true;
  btn.textContent = 'Détection…';
  try {
    const res = await fetch(`/bf_foot_l1/api/max-round?year=${encodeURIComponent(year)}`);
    const { max } = await res.json();
    if (max) {
      document.getElementById('inpMax').value = max;
      if (!document.getElementById('inpMin').value) document.getElementById('inpMin').value = 1;
    } else {
      alert('Impossible de détecter le nombre maximum de journées.');
    }
  } catch (e) {
    alert('Erreur : ' + e.message);
  }
  btn.disabled = false;
  btn.textContent = 'Détecter le max';
});

// ── Récupérer les journées ──
document.getElementById('btnFetch').addEventListener('click', () => {
  const season = document.getElementById('inpSeason').value.trim();
  if (!season) { alert('Veuillez saisir une saison.'); return; }
  const mode = getMode();
  const body = { source: 'transfermarkt', season };
  if (mode === 'range') {
    const min = document.getElementById('inpMin').value.trim();
    const max = document.getElementById('inpMax').value.trim();
    if (!min || !max) { alert('Veuillez saisir les journées de début et de fin.'); return; }
    body.min = min;
    body.max = max;
  } else if (mode === 'last') {
    fetchLast(season);
    return;
  }
  // mode === 'all': no min/max — server spawns scrape.js which auto-detects max via getMaxRound
  runScrape(body);
});

async function fetchLast(season) {
  const year = season.split('/')[0];
  startLog();
  appendLog('Détection de la dernière journée disponible…');
  let max;
  try {
    const res = await fetch(`/bf_foot_l1/api/max-round?year=${encodeURIComponent(year)}`);
    const data = await res.json();
    max = data.max;
    if (!max) { appendLog('Impossible de détecter la dernière journée.'); setRunning(false); return; }
    appendLog(`Dernière journée détectée : ${max}`);
  } catch (e) {
    appendLog('Erreur : ' + e.message);
    setRunning(false);
    return;
  }
  // runScrape calls startLog which resets the log — we want to keep the detection message,
  // so we continue streaming directly here instead of delegating to runScrape.
  try {
    const res = await fetch('/bf_foot_l1/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'transfermarkt', season, min: String(max), max: String(max) }),
    });
    if (!res.ok) { appendLog(`Erreur HTTP ${res.status}`); setRunning(false); return; }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) {
        if (line.startsWith('data: ')) appendLog(line.slice(6));
      }
    }
  } catch (e) {
    appendLog('Erreur : ' + e.message);
  }
  setRunning(false);
}

// ── Statut de la base ──
document.getElementById('btnStatus').addEventListener('click', loadStatus);

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function loadStatus() {
  statusArea.hidden = false;
  statusList.innerHTML = '<p>Chargement…</p>';
  try {
    const res = await fetch('/bf_foot_l1/api/seasons.json');
    const db = await res.json();
    const seasons = Object.keys(db).sort().reverse();
    if (seasons.length === 0) {
      statusList.innerHTML = '<p>Aucune saison dans la base de données.</p>';
      return;
    }
    statusList.innerHTML = seasons.map(s => buildSeasonRow(s, db[s])).join('');
    // Attach delete listeners
    statusList.querySelectorAll('[data-delete-season]').forEach(btn => {
      btn.addEventListener('click', () => deleteSeason(btn.dataset.deleteSeason));
    });
    // Attach refetch listeners
    statusList.querySelectorAll('[data-refetch-season]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('inpSeason').value = btn.dataset.refetchSeason;
        document.querySelector('input[name="mode"][value="all"]').checked = true;
        rangeFields.hidden = true;
        document.getElementById('btnFetch').click();
      });
    });
  } catch (e) {
    statusList.innerHTML = `<p class="err">Erreur : ${esc(e.message)}</p>`;
  }
}

function buildSeasonRow(season, data) {
  const rounds = Array.isArray(data) ? data.map(s => s.round).filter(r => typeof r === 'number').sort((a, b) => a - b) : [];
  const min = rounds.length ? rounds[0] : '—';
  const max = rounds.length ? rounds[rounds.length - 1] : '—';
  const count = rounds.length;

  // Detect gaps
  const missing = [];
  if (rounds.length > 0) {
    for (let i = rounds[0]; i <= rounds[rounds.length - 1]; i++) {
      if (!rounds.includes(i)) missing.push(i);
    }
  }
  const missingHtml = missing.length
    ? `<span class="warn">⚠ Manquantes : ${esc(missing.join(', '))}</span>`
    : '';

  // season values come from the JSON keys we wrote ourselves — but escape defensively
  const eSeason = esc(season);
  return `<div class="season-row">
    <div class="season-info">
      <strong>Saison ${eSeason}</strong>
      <span>${count} journée${count !== 1 ? 's' : ''} (J${esc(String(min))}–J${esc(String(max))})</span>
      ${missingHtml}
    </div>
    <div class="season-actions">
      <button type="button" class="btn-secondary" data-refetch-season="${eSeason}">Tout récupérer</button>
      <button type="button" class="btn-danger" data-delete-season="${eSeason}">Supprimer</button>
    </div>
  </div>`;
}

async function deleteSeason(season) {
  if (!confirm(`Supprimer toutes les données de la saison ${season} ?`)) return;
  try {
    const res = await fetch('/bf_foot_l1/api/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ season }),
    });
    const json = await res.json();
    if (json.ok) {
      loadStatus();
    } else {
      alert('Erreur : ' + (json.message || json.error));
    }
  } catch (e) {
    alert('Erreur : ' + e.message);
  }
}
