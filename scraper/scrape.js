'use strict';

const path = require('path');
const fs = require('fs');
const minimist = require('minimist');

// Parsers
const footmercato = require('./lib/parsers/footmercato');
const transfermarkt = require('./lib/parsers/transfermarkt');

const argv = minimist(process.argv.slice(2));

async function saveSnapshot(seasonKey, snapshot) {
  const dataDir = path.resolve(__dirname, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const dbFile = path.join(dataDir, 'seasons.json');
  let db = {};
  if (fs.existsSync(dbFile)) {
    try { db = JSON.parse(fs.readFileSync(dbFile, 'utf8') || '{}'); } catch (_) { db = {}; }
  }
  if (!db[seasonKey]) db[seasonKey] = [];

  // Replace existing round snapshot instead of duplicating
  if (snapshot.round !== undefined && snapshot.round !== null) {
    db[seasonKey] = db[seasonKey].filter(snap => snap.round !== snapshot.round);
  }

  db[seasonKey].push(snapshot);

  // Atomic write: write to a tmp file then rename to avoid corruption
  const tmp = dbFile + '.tmp.' + process.pid;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmp, dbFile);

  console.log(`Saved snapshot for season ${seasonKey} (${snapshot.date}) to ${dbFile}`);
}

function normalizeSeason(input) {
  if (!input) return null;
  if (/^\d{4}\/\d{4}$/.test(input)) return input;
  if (/^\d{4}$/.test(input)) return `${input}/${String(Number(input) + 1)}`;
  return input;
}

async function main() {
  try {
    const positional = argv._ || [];
    const roundArg = positional.length > 0 ? positional[0] : null;

    const source = argv.source || (roundArg || argv.min !== undefined || argv.max !== undefined ? 'transfermarkt' : 'footmercato');

    if (source === 'transfermarkt') {
      const season = argv.season || argv.s || String(new Date().getFullYear());
      const seasonKey = normalizeSeason(season) || '2025/2026';

      let minRound = 1;
      let maxRound = parseInt(roundArg, 10) || 1;

      if (argv.min !== undefined) minRound = parseInt(argv.min, 10);
      if (argv.max !== undefined) maxRound = parseInt(argv.max, 10);

      if (roundArg && !argv.max) {
        // Legacy: single positional arg means fetch 1..roundArg
        minRound = 1;
        maxRound = parseInt(roundArg, 10);
      }

      if (argv.min !== undefined || argv.max !== undefined || roundArg) {
        // Fetch standings for each round in the requested range
        for (let round = minRound; round <= maxRound; round++) {
          console.log(`Fetching standings for season ${season}, round ${round}...`);
          const res = await transfermarkt.fetchStandings({ season: String(season), round });
          if (!res.clubs || res.clubs.length === 0) {
            console.warn(`Warning: no clubs parsed for season ${season} round ${round} — snapshot not saved`);
            continue;
          }
          const snapshot = {
            date: new Date().toISOString(),
            source: 'transfermarkt',
            url: res.url,
            params: res.params,
            season: res.season,
            round,
            snapshot_type: 'round_standings',
            clubs: res.clubs,
          };
          await saveSnapshot(seasonKey, snapshot);
          // small delay to be polite
          await new Promise(r => setTimeout(r, 1200));
        }
      } else {
        // Fetch final standings for the requested season(s)
        let seasons = argv.seasons ? [].concat(argv.seasons) : [season];

        for (const s of seasons) {
          const key = normalizeSeason(s) || `${s}/${String(Number(s) + 1)}`;
          console.log(`Fetching final standings for season ${s}...`);
          const res = await transfermarkt.fetchStandings({ season: String(s) });
          if (!res.clubs || res.clubs.length === 0) {
            console.warn(`Warning: no clubs parsed for season ${s} — snapshot not saved`);
            continue;
          }
          const snapshot = {
            date: new Date().toISOString(),
            source: 'transfermarkt',
            url: res.url,
            params: res.params,
            season: res.season,
            snapshot_type: 'final_standings',
            clubs: res.clubs,
          };
          await saveSnapshot(key, snapshot);
          await new Promise(r => setTimeout(r, 1200));
        }
      }
      return;
    }

    // default: footmercato — fetch general, home, and away standings
    const seasonOpt = argv.season || argv.s || null;
    for (const type of ['general', 'home', 'away']) {
      const res = await footmercato.fetchStandings(type);
      const seasonKey = normalizeSeason(seasonOpt || res.season) || '2025/2026';
      const snapshot = {
        date: new Date().toISOString(),
        source: 'footmercato',
        url: footmercato.URL,
        clubs: res.clubs,
        round: Math.max(...res.clubs.map(c => c.played || 0)),
        snapshot_type: 'current_standings',
        standings_type: type,
      };
      await saveSnapshot(seasonKey, snapshot);
      await new Promise(r => setTimeout(r, 500));
    }
  } catch (err) {
    console.error('Error while scraping:', err && (err.stack || err.message || err));
    process.exit(2);
  }
}

main();
