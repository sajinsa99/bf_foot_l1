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

  child.stdout.on('data', d => send(d.toString()));
  child.stderr.on('data', d => send(d.toString()));
  child.on('close', code => {
    res.write(`data: [done] exit code ${code}\n\n`);
    res.end();
  });

  req.on('close', () => child.kill());
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
