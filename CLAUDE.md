# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`bf_foot_l1` scrapes French Ligue 1 standings, stores them as timestamped snapshots in a flat JSON file, and serves interactive dashboards. There is **no database and no build step** — the single source of truth is `scraper/data/seasons.json`.

Three parts, each with its own `package.json`:

- **`scraper/`** — Node CLI that fetches standings and writes snapshots.
- **`web/`** — Express server (production) that serves the dashboards and a small API, including a browser UI to trigger scrapes.
- **`dashboard/`** — legacy standalone static dashboard (see "Two dashboards" below).

## Commands

```bash
# --- Scraper (run from scraper/) ---
npm install
node scrape.js                        # footmercato: current general/home/away standings
node scrape.js --source=transfermarkt --season=2025 --min=1 --max=17   # round-by-round
./get_one_season.sh -s=latest -a=fetch-last    # typical weekly update (one season)
./get_one_season.sh -s=2025 -a=status          # inspect what's stored
./get_all_seasons.sh -os=2020 -ns=latest       # batch backfill (WIPES seasons.json first)

# --- Web server (run from web/) ---
npm install
npm start                             # Express on 127.0.0.1:5000, base path /bf_foot_l1
# → http://127.0.0.1:5000/bf_foot_l1/dashboard  and  /manage-data

# --- Legacy static dashboard (run from repo root) ---
./dashboard/server.sh start           # http.server on :8080, serves repo root

# --- Quality & security gate ---
bash checks.sh                        # runs all linters/scanners, writes checks-report.md
```

There is **no test suite** and **no lint config checked in** (eslint is skipped by `checks.sh` until an `eslint.config.js` exists). `checks.sh` is the de-facto CI gate.

## Architecture

### Data flow

`scrape.js` → parser (`lib/parsers/{transfermarkt,footmercato}.js`) → snapshot object → `saveSnapshot()` → `scraper/data/seasons.json`. The web dashboards read that same file back via `GET /bf_foot_l1/api/seasons.json`.

`seasons.json` is keyed by season string `"YYYY/YYYY"`; each value is an **array of snapshots**. Every write (scraper and the web `/api/delete`) is **atomic** (write to `*.tmp.<pid>`, then `rename`). When saving a round that already exists, the old snapshot for that round is **replaced, not duplicated** (keyed on `snapshot.round`).

Snapshot shape (see `scraper/README.md` for a full example) — clubs carry `position, name, played, points, goals_for, goals_against, goal_difference, wins, draws, losses`. The field that distinguishes snapshots:

- `snapshot_type: "current_standings"` + `standings_type: general|home|away` — from **footmercato** (one snapshot per type).
- `snapshot_type: "round_standings"` with a `round` — from **transfermarkt**, the per-matchday history that powers the evolution charts.
- `snapshot_type: "final_standings"` — transfermarkt end-of-season table.

Dashboard code filters to `standings_type === 'general'` for most cross-round views (see `seasonGeneralSnaps` in `web/public/dashboard/app.js`) and drops malformed rows via `isValidClub`.

### Two sources

`scrape.js` picks the source from the args: any of `--source=transfermarkt`, a positional round, `--min`, or `--max` → **transfermarkt** (round history); otherwise → **footmercato** (current general/home/away). Parsing is HTML scraping with cheerio, so a site layout change breaks parsing — fix is localized to the relevant file in `lib/parsers/`.

### Web server (`web/server.js`)

Everything is mounted under `BASE_PATH` (default `/bf_foot_l1`) on an Express `Router`, served behind nginx. Key routes:

- `GET /api/seasons.json` — streams the DB file.
- `GET /api/latest-season`, `GET /api/max-round?year=` — call the transfermarkt parser **in-process** (not via child process — a deliberate choice to avoid inline-script injection; falls back to empty values if scraper deps fail to load).
- `POST /api/delete` — removes a season or specific rounds.
- `POST /api/scrape` — spawns `scrape.js` and streams stdout/stderr to the browser via **SSE**; only one scrape runs at a time (`activeScrape` guard). nginx must keep `proxy_buffering off` for this to stream.

### Two dashboards (don't confuse them)

- **`web/public/dashboard/`** is the **live** one, served by the Express server, fetching `/bf_foot_l1/api/seasons.json`. It has 5 tabs (standings / per-club evolution / points race / attack-defense / palmarès) built on Chart.js. **Edit this one** for dashboard changes.
- **`dashboard/`** (with `assets/`, `server.sh`, `server.py`) is the older standalone that fetches `../scraper/data/seasons.json` directly. Kept for local/offline use; not what `install.sh` deploys.

### Deployment

`install.sh` (run as root on the server) rsyncs the repo to `/opt/bf_foot_l1`, **never overwriting `scraper/data/`** (backs it up first, seeds only missing files), installs production deps, installs the `bf_foot_l1` systemd service (runs `node web/server.js` as `www-data`, reads `/opt/bf_foot_l1/.env`), and wires an nginx snippet that proxies `/bf_foot_l1/` → `127.0.0.1:5000`.

## Critical constraints

- **Node is pinned to 20.20.2 / npm 10.8.2** in every `package.json` `engines` and `.nvmrc`, matching the production box. Do **not** bump a dependency to a version that requires a newer Node. This already bit `undici`: `scraper/package.json` has an `overrides` block pinning it to `^7.30.1` (the 8.x line needs Node ≥ 22). Verify `engines.node` of any security bump against 20.20.2 before applying.
- **`scraper/data/seasons.json` is live data.** `get_all_seasons.sh` (fetch mode) and manual edits can destroy history. `install.sh` protects it; ad-hoc scripts do not.
- **`checks.sh` needs Docker** and pulls an internal SAP registry image (`xmk_linters`); it won't run in environments without that access. The generated `checks-report.md` is large (multi-MB) because it embeds full tool output — search it, don't read it whole.
- The `scraper/*.js` helpers (`check_data.js`, `fix_dates.js`, `fix_rounds.js`, `create_synthetic_data.js`) are one-off data-maintenance tools, not part of the runtime.
