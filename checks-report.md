# Checks Report — bf_foot_l1 — 2026-10-28 09:58:24

## Summary

| Check | Status |
|---|---|
| shellcheck  install.sh | ✅ PASS |
| shellcheck  scraper/get_all_seasons.sh  scraper/get_one_season.sh | ✅ PASS |
| shellcheck  dashboard/server.sh | ✅ PASS |
| jsonlint  scraper/package.json | ✅ PASS |
| jsonlint  web/package.json | ✅ PASS |
| jsonlint  scraper/data/seasons.json | ✅ PASS |
| markdownlint-cli2  Markdown files | ✅ PASS |
| eslint  (no eslint.config.js found — create one to enable) | ⏭ SKIP |
| yamllint  YAML files | ✅ PASS |
| semgrep  dashboard/server.py + web JS sources | ✅ PASS |
| trivy  HIGH/CRITICAL CVEs | ✅ PASS |
| gitleaks  secrets in repo | ✅ PASS |
| detect-secrets  (run: detect-secrets scan > .secrets.baseline  to create baseline) | ⏭ SKIP |
| **Total** | PASS: 11 · FAIL: 0 · SKIP: 2 |

---

## Shell

### `shellcheck  install.sh`

**Status:** ✅ PASS

_no output_

---

### `shellcheck  scraper/get_all_seasons.sh  scraper/get_one_season.sh`

**Status:** ✅ PASS

_no output_

---

### `shellcheck  dashboard/server.sh`

**Status:** ✅ PASS

_no output_

---

## JSON

### `jsonlint  scraper/package.json`

**Status:** ✅ PASS

```
{
  "name": "bf_foot_scraper",
  "version": "0.1.0",
  "description": "Scraper that fetches Ligue 1 standings from Foot Mercato and stores snapshots in a flat JSON DB.",
  "main": "scrape.js",
  "scripts": {
    "scrape": "node scrape.js"
  },
  "author": "",
  "license": "MIT",
  "engines": {
    "node": "20.20.2",
    "npm": "10.8.2"
  },
  "dependencies": {
    "axios": "^1.20.0",
    "cheerio": "^1.0.0-rc.12",
    "date-fns": "^2.30.0",
    "minimist": "^1.2.8"
  },
  "overrides": {
    "undici": "^7.30.1",
    "follow-redirects": "^1.16.1"
  }
}
```

---

### `jsonlint  web/package.json`

**Status:** ✅ PASS

```
{
  "name": "bf_foot_l1_web",
  "version": "0.1.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": "20.20.2",
    "npm": "10.8.2"
  },
  "dependencies": {
    "express": "^4.18.0"
  }
}
```

---

### `jsonlint  scraper/data/seasons.json`

**Status:** ✅ PASS

_output suppressed on pass (file too large to embed)_

---

## Markdown

### `markdownlint-cli2  Markdown files`

**Status:** ✅ PASS

```
markdownlint-cli2 v0.24.0 (markdownlint v0.42.0)
Finding: ./README.md ./scraper/README.md ./dashboard/README.md ./CLAUDE.md
Linting: 4 files
Summary: 0 issues in 0 files
```

---

## JavaScript

### `eslint  (no eslint.config.js found — create one to enable)`

**Status:** ⏭ SKIP

---

## YAML

### `yamllint  YAML files`

**Status:** ✅ PASS

_no output_

---

## Static Analysis

### `semgrep  dashboard/server.py + web JS sources`

**Status:** ✅ PASS

```
               
               
┌─────────────┐
│ Scan Status │
└─────────────┘
  Scanning 4 files tracked by git with 1074 Code rules:
                                                                                                                        
  Language      Rules   Files          Origin      Rules                                                                
 ─────────────────────────────        ───────────────────                                                               
  <multilang>      47       4          Community    1074                                                                
  js              153       3                                                                                           
  python          243       1                                                                                           
                                                                                                                        
                
                
┌──────────────┐
│ Scan Summary │
└──────────────┘
✅ Scan completed successfully.
 • Findings: 0 (0 blocking)
 • Rules run: 442
 • Targets scanned: 4
 • Parsed lines: ~100.0%
 • No ignore information available
Ran 442 rules on 4 files: 0 findings.
(need more rules? `semgrep login` for additional free Semgrep Registry rules)

If Semgrep missed a finding, please send us feedback to let us know!
See https://semgrep.dev/docs/reporting-false-negatives/
```

---

## Dependency CVEs

### `trivy  HIGH/CRITICAL CVEs`

**Status:** ✅ PASS

```
2026-10-28T08:58:14Z	INFO	[vulndb] Need to update DB
2026-10-28T08:58:14Z	INFO	[vulndb] Downloading vulnerability DB...
2026-10-28T08:58:14Z	INFO	[vulndb] Downloading artifact...	repo="mirror.gcr.io/aquasec/trivy-db:2"
12.66 MiB / 130.06 MiB [----->_______________________________________________________] 9.73% ? p/s ?39.86 MiB / 130.06 MiB [------------------>_________________________________________] 30.65% ? p/s ?64.58 MiB / 130.06 MiB [----------------------------->______________________________] 49.65% ? p/s ?88.05 MiB / 130.06 MiB [------------------------------->______________] 67.70% 125.59 MiB p/s ETA 0s113.71 MiB / 130.06 MiB [--------------------------------------->_____] 87.43% 125.59 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [------------------------------------------->] 100.00% 125.59 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [------------------------------------------->] 100.00% 122.01 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [------------------------------------------->] 100.00% 122.01 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [------------------------------------------->] 100.00% 122.01 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [------------------------------------------->] 100.00% 114.14 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [------------------------------------------->] 100.00% 114.14 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [------------------------------------------->] 100.00% 114.14 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [------------------------------------------->] 100.00% 106.77 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [------------------------------------------->] 100.00% 106.77 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [------------------------------------------->] 100.00% 106.77 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [-------------------------------------------->] 100.00% 99.88 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [-------------------------------------------->] 100.00% 99.88 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [-------------------------------------------->] 100.00% 99.88 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [-------------------------------------------->] 100.00% 93.44 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [-------------------------------------------->] 100.00% 93.44 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [-------------------------------------------->] 100.00% 93.44 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [-------------------------------------------->] 100.00% 87.41 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [-------------------------------------------->] 100.00% 87.41 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [-------------------------------------------->] 100.00% 87.41 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [-------------------------------------------->] 100.00% 81.77 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [-------------------------------------------->] 100.00% 81.77 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [-------------------------------------------->] 100.00% 81.77 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [-----------------------------------------------] 100.00% 24.56 MiB p/s 5.5s2026-10-28T08:58:20Z	INFO	[vulndb] Artifact successfully downloaded	repo="mirror.gcr.io/aquasec/trivy-db:2"
2026-10-28T08:58:20Z	INFO	[vuln] Vulnerability scanning is enabled
2026-10-28T08:58:20Z	INFO	[npm] Run "npm install" to collect the license information of packages	dir="scraper/node_modules"
2026-10-28T08:58:20Z	INFO	Number of language-specific files	num=1
2026-10-28T08:58:20Z	INFO	[npm] Detecting vulnerabilities...

Report Summary

┌───────────────────────────┬──────┬─────────────────┐
│          Target           │ Type │ Vulnerabilities │
├───────────────────────────┼──────┼─────────────────┤
│ scraper/package-lock.json │ npm  │        0        │
└───────────────────────────┴──────┴─────────────────┘
Legend:
- '-': Not scanned
- '0': Clean (no security findings detected)
```

---

## Secrets

### `gitleaks  secrets in repo`

**Status:** ✅ PASS

```

    ○
    │╲
    │ ○
    ○ ░
    ░    gitleaks

[90m8:58AM[0m [32mINF[0m [1m64 commits scanned.[0m
[90m8:58AM[0m [32mINF[0m [1mscanned ~7904587 bytes (7.90 MB) in 1.75s[0m
[90m8:58AM[0m [32mINF[0m [1mno leaks found[0m
```

---

### `detect-secrets  (run: detect-secrets scan > .secrets.baseline  to create baseline)`

**Status:** ⏭ SKIP

---

## Overall Status

| Check | Status |
|---|---|
| shellcheck  install.sh | ✅ PASS |
| shellcheck  scraper/get_all_seasons.sh  scraper/get_one_season.sh | ✅ PASS |
| shellcheck  dashboard/server.sh | ✅ PASS |
| jsonlint  scraper/package.json | ✅ PASS |
| jsonlint  web/package.json | ✅ PASS |
| jsonlint  scraper/data/seasons.json | ✅ PASS |
| markdownlint-cli2  Markdown files | ✅ PASS |
| eslint  (no eslint.config.js found — create one to enable) | ⏭ SKIP |
| yamllint  YAML files | ✅ PASS |
| semgrep  dashboard/server.py + web JS sources | ✅ PASS |
| trivy  HIGH/CRITICAL CVEs | ✅ PASS |
| gitleaks  secrets in repo | ✅ PASS |
| detect-secrets  (run: detect-secrets scan > .secrets.baseline  to create baseline) | ⏭ SKIP |
| **Total** | PASS: 11 · FAIL: 0 · SKIP: 2 |

