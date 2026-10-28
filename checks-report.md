# Checks Report — bf_foot_l1 — 2026-10-28 10:31:37

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
    "express": "^4.18.0"
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

If Semgrep missed a finding, please send us feedback to let us know!
See https://semgrep.dev/docs/reporting-false-negatives/
```

---

## Dependency CVEs

### <a id="trivy-high-critical-cves"></a>`trivy  HIGH/CRITICAL CVEs`

**Status:** ✅ PASS

```
2026-10-28T09:31:27Z	INFO	[vulndb] Need to update DB
2026-10-28T09:31:27Z	INFO	[vulndb] Downloading vulnerability DB...
2026-10-28T09:31:27Z	INFO	[vulndb] Downloading artifact...	repo="mirror.gcr.io/aquasec/trivy-db:2"
20.42 MiB / 130.06 MiB [--------->__________________________________________________] 15.70% ? p/s ?48.81 MiB / 130.06 MiB [---------------------->_____________________________________] 37.53% ? p/s ?80.52 MiB / 130.06 MiB [------------------------------------->______________________] 61.91% ? p/s ?118.87 MiB / 130.06 MiB [----------------------------------------->___] 91.40% 163.95 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [------------------------------------------->] 100.00% 163.95 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [------------------------------------------->] 100.00% 163.95 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [------------------------------------------->] 100.00% 154.58 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [------------------------------------------->] 100.00% 154.58 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [------------------------------------------->] 100.00% 154.58 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [------------------------------------------->] 100.00% 144.61 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [------------------------------------------->] 100.00% 144.61 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [------------------------------------------->] 100.00% 144.61 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [------------------------------------------->] 100.00% 135.28 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [------------------------------------------->] 100.00% 135.28 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [------------------------------------------->] 100.00% 135.28 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [------------------------------------------->] 100.00% 126.55 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [------------------------------------------->] 100.00% 126.55 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [------------------------------------------->] 100.00% 126.55 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [------------------------------------------->] 100.00% 118.39 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [------------------------------------------->] 100.00% 118.39 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [------------------------------------------->] 100.00% 118.39 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [------------------------------------------->] 100.00% 110.75 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [------------------------------------------->] 100.00% 110.75 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [------------------------------------------->] 100.00% 110.75 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [------------------------------------------->] 100.00% 103.60 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [------------------------------------------->] 100.00% 103.60 MiB p/s ETA 0s130.06 MiB / 130.06 MiB [-----------------------------------------------] 100.00% 25.58 MiB p/s 5.3s2026-10-28T09:31:33Z	INFO	[vulndb] Artifact successfully downloaded	repo="mirror.gcr.io/aquasec/trivy-db:2"
2026-10-28T09:31:33Z	INFO	[vuln] Vulnerability scanning is enabled
2026-10-28T09:31:33Z	INFO	[npm] Run "npm install" to collect the license information of packages	dir="scraper/node_modules"
2026-10-28T09:31:33Z	INFO	Number of language-specific files	num=1
2026-10-28T09:31:33Z	INFO	[npm] Detecting vulnerabilities...

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

### <a id="gitleaks-secrets-in-repo"></a>`gitleaks  secrets in repo`

**Status:** ✅ PASS

```

    ○
    │╲
    │ ○
    ○ ░
    ░    gitleaks

9:31AM INF 68 commits scanned.
9:31AM INF scanned ~7912562 bytes (7.91 MB) in 1.81s
9:31AM INF no leaks found
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

