'use strict';

const express = require('express');
const path = require('path');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 5000;
const BASE_PATH = process.env.BASE_PATH || '/bf_foot_l1';
const SCRAPER_DIR = path.join(__dirname, '..', 'scraper');

const app = express();
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
  res.sendFile(path.join(SCRAPER_DIR, 'data', 'seasons.json'));
});

// Get latest season from Transfermarkt
router.get('/api/latest-season', (req, res) => {
  const child = spawn('node', ['-e', `
    const tm = require('./lib/parsers/transfermarkt.js');
    tm.getLatestSeason().then(s => { console.log(s || ''); process.exit(0); }).catch(() => { console.log(''); process.exit(1); });
  `], { cwd: SCRAPER_DIR, env: process.env });
  let out = '';
  child.stdout.on('data', d => { out += d.toString(); });
  child.on('close', () => res.json({ season: out.trim() }));
});

// Get max round for a season from Transfermarkt
router.get('/api/max-round', (req, res) => {
  const year = String(req.query.year || '').replace(/[^0-9]/g, '');
  if (!year) return res.status(400).json({ error: 'year required' });
  const child = spawn('node', ['-e', `
    const tm = require('./lib/parsers/transfermarkt.js');
    tm.getMaxRound('${year}').then(n => { console.log(n || 0); process.exit(0); }).catch(() => { console.log(0); process.exit(1); });
  `], { cwd: SCRAPER_DIR, env: process.env });
  let out = '';
  child.stdout.on('data', d => { out += d.toString(); });
  child.on('close', () => res.json({ max: parseInt(out.trim()) || 0 }));
});

// Delete a season or specific journeys from seasons.json
router.post('/api/delete', (req, res) => {
  const { season, journeys } = req.body || {};
  if (!season) return res.status(400).json({ error: 'season required' });
  const fs = require('fs');
  const dbFile = path.join(SCRAPER_DIR, 'data', 'seasons.json');
  try {
    const db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
    if (!db[season]) return res.json({ ok: false, message: `Saison ${season} introuvable` });
    if (journeys && journeys.length > 0) {
      db[season] = db[season].filter(s => !journeys.includes(s.round));
      fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf8');
      res.json({ ok: true, message: `Journées ${journeys.join(', ')} supprimées de la saison ${season}` });
    } else {
      delete db[season];
      fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf8');
      res.json({ ok: true, message: `Saison ${season} supprimée` });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Run a scrape job — spawn scrape.js with provided args and stream output via SSE
router.post('/api/scrape', (req, res) => {
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

  const send = (text) => {
    for (const line of text.split('\n')) {
      if (line) res.write(`data: ${line}\n\n`);
    }
  };

  let childDone = false;

  child.stdout.on('data', d => send(d.toString()));
  child.stderr.on('data', d => send(d.toString()));
  child.on('close', (code, signal) => {
    childDone = true;
    const msg = signal ? `[terminé] signal ${signal}` : `[terminé] code de sortie ${code}`;
    res.write(`data: ${msg}\n\n`);
    res.end();
  });

  req.on('close', () => { if (!childDone) child.kill(); });
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
