'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 5000;
const BASE_PATH = process.env.BASE_PATH || '/bf_foot_l1';
const SCRAPER_DIR = path.join(__dirname, '..', 'scraper');
const DB_FILE = path.join(SCRAPER_DIR, 'data', 'seasons.json');

// Import parsers directly — avoids spawning child processes for simple lookups
// and eliminates the code-injection shape of inline -e scripts.
const transfermarkt = require('../scraper/lib/parsers/transfermarkt');

const app = express(); // nosemgrep: javascript.express.security.audit.express-check-csurf-middleware-usage.express-check-csurf-middleware-usage
const router = express.Router();

app.use(express.json());

// No-cache middleware for all responses
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.set('Pragma', 'no-cache');
  next();
});

// Static files for each sub-app
router.use('/dashboard', express.static(path.join(__dirname, 'public', 'dashboard')));
router.use('/manage-data', express.static(path.join(__dirname, 'public', 'manage-data')));

// Serve seasons.json from scraper/data directly
router.get('/api/seasons.json', (req, res) => {
  if (!fs.existsSync(DB_FILE)) {
    return res.json({});
  }
  res.sendFile(DB_FILE);
});

// Get latest season from Transfermarkt
router.get('/api/latest-season', async (req, res) => {
  try {
    const season = await transfermarkt.getLatestSeason();
    res.json({ season: season || '' });
  } catch {
    res.json({ season: '' });
  }
});

// Get max round for a season from Transfermarkt
router.get('/api/max-round', async (req, res) => {
  const year = String(req.query.year || '').replace(/[^0-9]/g, '');
  if (!year) return res.status(400).json({ error: 'year required' });
  try {
    const max = await transfermarkt.getMaxRound(year);
    res.json({ max: max || 0 });
  } catch {
    res.json({ max: 0 });
  }
});

// Delete a season or specific journeys from seasons.json
router.post('/api/delete', (req, res) => {
  const { season, journeys } = req.body || {};
  if (!season) return res.status(400).json({ error: 'season required' });
  try {
    const db = fs.existsSync(DB_FILE)
      ? JSON.parse(fs.readFileSync(DB_FILE, 'utf8'))
      : {};
    if (!db[season]) return res.json({ ok: false, message: `Saison ${season} introuvable` });
    if (journeys && journeys.length > 0) {
      db[season] = db[season].filter(s => !journeys.includes(s.round));
    } else {
      delete db[season];
    }
    writeDbAtomic(db);
    const msg = journeys && journeys.length > 0
      ? `Journées ${journeys.join(', ')} supprimées de la saison ${season}`
      : `Saison ${season} supprimée`;
    res.json({ ok: true, message: msg });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Atomic write for the JSON database
function writeDbAtomic(db) {
  const tmp = DB_FILE + '.tmp.' + process.pid;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmp, DB_FILE);
}

// Track active scrape process so we reject concurrent runs
let activeScrape = null;

// Run a scrape job — spawn scrape.js with provided args and stream output via SSE
router.post('/api/scrape', (req, res) => {
  if (activeScrape) {
    res.set({
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.write('data: [erreur] Un scraping est déjà en cours. Attendez qu\'il se termine.\n\n');
    return res.end();
  }

  const { source, season, min, max } = req.body || {};

  const args = [];
  if (source) args.push(`--source=${source}`);
  if (season) args.push(`--season=${season}`);
  if (min !== undefined && min !== '') args.push(`--min=${min}`);
  if (max !== undefined && max !== '') args.push(`--max=${max}`);

  res.set({
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const child = spawn('node', ['scrape.js', ...args], {
    cwd: SCRAPER_DIR,
    env: process.env,
  });

  activeScrape = child;

  const send = (text) => {
    for (const line of text.split('\n')) {
      if (line) res.write(`data: ${line}\n\n`);
    }
  };

  child.stdout.on('data', d => send(d.toString()));
  child.stderr.on('data', d => send(d.toString()));
  child.on('close', (code, signal) => {
    activeScrape = null;
    const msg = signal ? `[terminé] signal ${signal}` : `[terminé] code de sortie ${code}`;
    res.write(`data: ${msg}\n\n`);
    res.end();
  });

  req.on('close', () => {
    if (activeScrape === child) {
      child.kill();
      activeScrape = null;
    }
  });
});

app.use(BASE_PATH, router);

// Root redirect
app.get('/', (req, res) => res.redirect(`${BASE_PATH}/dashboard`));
app.get(BASE_PATH, (req, res) => res.redirect(`${BASE_PATH}/dashboard`));

app.listen(PORT, '127.0.0.1', () => {
  console.log(`bf_foot_l1 web running on http://127.0.0.1:${PORT}${BASE_PATH}`);
  console.log(`  dashboard:   http://127.0.0.1:${PORT}${BASE_PATH}/dashboard`);
  console.log(`  manage-data: http://127.0.0.1:${PORT}${BASE_PATH}/manage-data`);
});
