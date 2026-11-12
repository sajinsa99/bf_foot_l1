# Checks Report — bf_foot_l1 — 2026-11-12 15:58:22

## Summary

| Check | Status |
|---|---|
| [shellcheck  install.sh](#shellcheck-install-sh) | ✅ PASS |
| [shellcheck  scraper/get_all_seasons.sh  scraper/get_one_season.sh](#shellcheck-scraper-get_all_seasons-sh-scraper-get_one_season-sh) | ✅ PASS |
| [shellcheck  dashboard/server.sh](#shellcheck-dashboard-server-sh) | ✅ PASS |
| [jsonlint  scraper/package.json](#jsonlint-scraper-package-json) | ✅ PASS |
| [jsonlint  web/package.json](#jsonlint-web-package-json) | ✅ PASS |
| [jsonlint  scraper/data/seasons.json](#jsonlint-scraper-data-seasons-json) | ✅ PASS |
| [markdownlint-cli2  Markdown files](#markdownlint-cli2-markdown-files) | ✅ PASS |
| [eslint  (no eslint.config.js found — create one to enable)](#eslint-no-eslint-config-js-found-create-one-to-enable) | ⏭ SKIP |
| [yamllint  YAML files](#yamllint-yaml-files) | ✅ PASS |
| [semgrep  dashboard/server.py + web JS sources](#semgrep-dashboard-server-py-web-js-sources) | ✅ PASS |
| [trivy  HIGH/CRITICAL CVEs](#trivy-high-critical-cves) | ✅ PASS |
| [gitleaks  secrets in repo](#gitleaks-secrets-in-repo) | ✅ PASS |
| [detect-secrets  (run: detect-secrets scan > .secrets.baseline  to create baseline)](#detect-secrets-run-detect-secrets-scan-secrets-baseline-to-create-baseline) | ⏭ SKIP |
| **Total** | PASS: 11 · FAIL: 0 · SKIP: 2 |

---

## Shell

### <a id="shellcheck-install-sh"></a>`shellcheck  install.sh`

**Status:** ✅ PASS

_no output_

---

### <a id="shellcheck-scraper-get_all_seasons-sh-scraper-get_one_season-sh"></a>`shellcheck  scraper/get_all_seasons.sh  scraper/get_one_season.sh`

**Status:** ✅ PASS

_no output_

---

### <a id="shellcheck-dashboard-server-sh"></a>`shellcheck  dashboard/server.sh`

**Status:** ✅ PASS

_no output_

---

## JSON

### <a id="jsonlint-scraper-package-json"></a>`jsonlint  scraper/package.json`

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
    "axios": "^1.21.1",
    "cheerio": "^1.2.0",
    "date-fns": "^4.4.0",
    "minimist": "^1.2.8"
  },
  "overrides": {
    "undici": "^7.30.2",
    "follow-redirects": "^1.16.3"
  }
}
```

---

### <a id="jsonlint-web-package-json"></a>`jsonlint  web/package.json`

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
    "express": "^5.3.0"
  }
}
```

---

### <a id="jsonlint-scraper-data-seasons-json"></a>`jsonlint  scraper/data/seasons.json`

**Status:** ✅ PASS

_output suppressed on pass (file too large to embed)_

---

## Markdown

### <a id="markdownlint-cli2-markdown-files"></a>`markdownlint-cli2  Markdown files`

**Status:** ✅ PASS

```
markdownlint-cli2 v0.24.0 (markdownlint v0.42.0)
Finding: ./README.md ./scraper/README.md ./dashboard/README.md ./CLAUDE.md
Linting: 4 files
Summary: 0 issues in 0 files
```

---

## JavaScript

### <a id="eslint-no-eslint-config-js-found-create-one-to-enable"></a>`eslint  (no eslint.config.js found — create one to enable)`

**Status:** ⏭ SKIP

---

## YAML

### <a id="yamllint-yaml-files"></a>`yamllint  YAML files`

**Status:** ✅ PASS

_no output_

---

## Static Analysis

### <a id="semgrep-dashboard-server-py-web-js-sources"></a>`semgrep  dashboard/server.py + web JS sources`

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


A new version of Semgrep is available. See https://semgrep.dev/docs/upgrading
If Semgrep missed a finding, please send us feedback to let us know!
See https://semgrep.dev/docs/reporting-false-negatives/
```

---

## Dependency CVEs

### <a id="trivy-high-critical-cves"></a>`trivy  HIGH/CRITICAL CVEs`

**Status:** ✅ PASS

```
2026-11-12T14:58:11Z	INFO	[vulndb] Need to update DB
2026-11-12T14:58:11Z	INFO	[vulndb] Downloading vulnerability DB...
2026-11-12T14:58:11Z	INFO	[vulndb] Downloading artifact...	repo="mirror.gcr.io/aquasec/trivy-db:2"
15.38 MiB / 133.50 MiB [------>_____________________________________________________] 11.52% ? p/s ?25.69 MiB / 133.50 MiB [----------->________________________________________________] 19.24% ? p/s ?44.72 MiB / 133.50 MiB [-------------------->_______________________________________] 33.50% ? p/s ?63.56 MiB / 133.50 MiB [---------------------->________________________] 47.61% 80.35 MiB p/s ETA 0s81.06 MiB / 133.50 MiB [---------------------------->__________________] 60.72% 80.35 MiB p/s ETA 0s85.72 MiB / 133.50 MiB [------------------------------>________________] 64.21% 80.35 MiB p/s ETA 0s90.84 MiB / 133.50 MiB [------------------------------->_______________] 68.05% 78.10 MiB p/s ETA 0s95.81 MiB / 133.50 MiB [--------------------------------->_____________] 71.77% 78.10 MiB p/s ETA 0s105.53 MiB / 133.50 MiB [------------------------------------>_________] 79.05% 78.10 MiB p/s ETA 0s115.91 MiB / 133.50 MiB [--------------------------------------->______] 86.82% 75.75 MiB p/s ETA 0s125.34 MiB / 133.50 MiB [------------------------------------------->__] 93.89% 75.75 MiB p/s ETA 0s133.50 MiB / 133.50 MiB [-------------------------------------------->] 100.00% 75.75 MiB p/s ETA 0s133.50 MiB / 133.50 MiB [-------------------------------------------->] 100.00% 72.75 MiB p/s ETA 0s133.50 MiB / 133.50 MiB [-------------------------------------------->] 100.00% 72.75 MiB p/s ETA 0s133.50 MiB / 133.50 MiB [-------------------------------------------->] 100.00% 72.75 MiB p/s ETA 0s133.50 MiB / 133.50 MiB [-------------------------------------------->] 100.00% 68.06 MiB p/s ETA 0s133.50 MiB / 133.50 MiB [-------------------------------------------->] 100.00% 68.06 MiB p/s ETA 0s133.50 MiB / 133.50 MiB [-------------------------------------------->] 100.00% 68.06 MiB p/s ETA 0s133.50 MiB / 133.50 MiB [-------------------------------------------->] 100.00% 63.67 MiB p/s ETA 0s133.50 MiB / 133.50 MiB [-------------------------------------------->] 100.00% 63.67 MiB p/s ETA 0s133.50 MiB / 133.50 MiB [-------------------------------------------->] 100.00% 63.67 MiB p/s ETA 0s133.50 MiB / 133.50 MiB [-------------------------------------------->] 100.00% 59.56 MiB p/s ETA 0s133.50 MiB / 133.50 MiB [-------------------------------------------->] 100.00% 59.56 MiB p/s ETA 0s133.50 MiB / 133.50 MiB [-------------------------------------------->] 100.00% 59.56 MiB p/s ETA 0s133.50 MiB / 133.50 MiB [-------------------------------------------->] 100.00% 55.72 MiB p/s ETA 0s133.50 MiB / 133.50 MiB [-------------------------------------------->] 100.00% 55.72 MiB p/s ETA 0s133.50 MiB / 133.50 MiB [-------------------------------------------->] 100.00% 55.72 MiB p/s ETA 0s133.50 MiB / 133.50 MiB [-------------------------------------------->] 100.00% 52.12 MiB p/s ETA 0s133.50 MiB / 133.50 MiB [-------------------------------------------->] 100.00% 52.12 MiB p/s ETA 0s133.50 MiB / 133.50 MiB [-------------------------------------------->] 100.00% 52.12 MiB p/s ETA 0s133.50 MiB / 133.50 MiB [-------------------------------------------->] 100.00% 48.76 MiB p/s ETA 0s133.50 MiB / 133.50 MiB [-------------------------------------------->] 100.00% 48.76 MiB p/s ETA 0s133.50 MiB / 133.50 MiB [-------------------------------------------->] 100.00% 48.76 MiB p/s ETA 0s133.50 MiB / 133.50 MiB [-------------------------------------------->] 100.00% 45.62 MiB p/s ETA 0s133.50 MiB / 133.50 MiB [-----------------------------------------------] 100.00% 19.68 MiB p/s 7.0s2026-11-12T14:58:18Z	INFO	[vulndb] Artifact successfully downloaded	repo="mirror.gcr.io/aquasec/trivy-db:2"
2026-11-12T14:58:18Z	INFO	[vuln] Vulnerability scanning is enabled
2026-11-12T14:58:18Z	INFO	[npm] Run "npm install" to collect the license information of packages	dir="scraper/node_modules"
2026-11-12T14:58:18Z	INFO	[npm] Run "npm install" to collect the license information of packages	dir="web/node_modules"
2026-11-12T14:58:18Z	INFO	Number of language-specific files	num=2
2026-11-12T14:58:18Z	INFO	[npm] Detecting vulnerabilities...

Report Summary

┌───────────────────────────┬──────┬─────────────────┐
│          Target           │ Type │ Vulnerabilities │
├───────────────────────────┼──────┼─────────────────┤
│ scraper/package-lock.json │ npm  │        0        │
├───────────────────────────┼──────┼─────────────────┤
│ web/package-lock.json     │ npm  │        0        │
└───────────────────────────┴──────┴─────────────────┘
Legend:
- '-': Not scanned
- '0': Clean (no security findings detected)
```

---

## Secrets

### <a id="gitleaks-secrets-in-repo"></a>`gitleaks  secrets in repo`

**Status:** ✅ PASS

```

    ○
    │╲
    │ ○
    ○ ░
    ░    gitleaks

2:58PM INF 74 commits scanned.
2:58PM INF scanned ~7966421 bytes (7.97 MB) in 1.89s
2:58PM INF no leaks found
```

---

### <a id="detect-secrets-run-detect-secrets-scan-secrets-baseline-to-create-baseline"></a>`detect-secrets  (run: detect-secrets scan > .secrets.baseline  to create baseline)`

**Status:** ⏭ SKIP

---

## Overall Status

| Check | Status |
|---|---|
| [shellcheck  install.sh](#shellcheck-install-sh) | ✅ PASS |
| [shellcheck  scraper/get_all_seasons.sh  scraper/get_one_season.sh](#shellcheck-scraper-get_all_seasons-sh-scraper-get_one_season-sh) | ✅ PASS |
| [shellcheck  dashboard/server.sh](#shellcheck-dashboard-server-sh) | ✅ PASS |
| [jsonlint  scraper/package.json](#jsonlint-scraper-package-json) | ✅ PASS |
| [jsonlint  web/package.json](#jsonlint-web-package-json) | ✅ PASS |
| [jsonlint  scraper/data/seasons.json](#jsonlint-scraper-data-seasons-json) | ✅ PASS |
| [markdownlint-cli2  Markdown files](#markdownlint-cli2-markdown-files) | ✅ PASS |
| [eslint  (no eslint.config.js found — create one to enable)](#eslint-no-eslint-config-js-found-create-one-to-enable) | ⏭ SKIP |
| [yamllint  YAML files](#yamllint-yaml-files) | ✅ PASS |
| [semgrep  dashboard/server.py + web JS sources](#semgrep-dashboard-server-py-web-js-sources) | ✅ PASS |
| [trivy  HIGH/CRITICAL CVEs](#trivy-high-critical-cves) | ✅ PASS |
| [gitleaks  secrets in repo](#gitleaks-secrets-in-repo) | ✅ PASS |
| [detect-secrets  (run: detect-secrets scan > .secrets.baseline  to create baseline)](#detect-secrets-run-detect-secrets-scan-secrets-baseline-to-create-baseline) | ⏭ SKIP |
| **Total** | PASS: 11 · FAIL: 0 · SKIP: 2 |

