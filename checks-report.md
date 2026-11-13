# Checks Report — bf_foot_l1 — 2026-11-13 16:33:23

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
| [htmlhint  HTML files](#htmlhint-html-files) | ✅ PASS |
| [stylelint  CSS files](#stylelint-css-files) | ✅ PASS |
| [yamllint  YAML files](#yamllint-yaml-files) | ✅ PASS |
| [pylint  dashboard/server.py](#pylint-dashboard-server-py) | ✅ PASS |
| [bandit  dashboard/server.py](#bandit-dashboard-server-py) | ✅ PASS |
| [semgrep  dashboard/server.py + web JS sources](#semgrep-dashboard-server-py-web-js-sources) | ✅ PASS |
| [trivy  HIGH/CRITICAL CVEs](#trivy-high-critical-cves) | ✅ PASS |
| [gitleaks  secrets in repo](#gitleaks-secrets-in-repo) | ✅ PASS |
| [detect-secrets  (run: detect-secrets scan > .secrets.baseline  to create baseline)](#detect-secrets-run-detect-secrets-scan-secrets-baseline-to-create-baseline) | ⏭ SKIP |
| **Total** | PASS: 15 · FAIL: 0 · SKIP: 2 |

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
    "node": "22.22.1",
    "npm": "9.2.0"
  },
  "dependencies": {
    "axios": "^1.21.1",
    "cheerio": "^1.2.0",
    "date-fns": "^4.4.0",
    "minimist": "^1.2.8"
  },
  "overrides": {
    "undici": "^8.12.4",
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
    "node": "22.22.1",
    "npm": "9.2.0"
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
markdownlint-cli2 v0.24.1 (markdownlint v0.42.1)
Finding: ./README.md ./scraper/README.md ./dashboard/README.md ./CLAUDE.md
Linting: 4 files
Summary: 0 issues in 0 files
```

---

## JavaScript

### <a id="eslint-no-eslint-config-js-found-create-one-to-enable"></a>`eslint  (no eslint.config.js found — create one to enable)`

**Status:** ⏭ SKIP

---

## HTML

### <a id="htmlhint-html-files"></a>`htmlhint  HTML files`

**Status:** ✅ PASS

```

Scanned 3 files, no errors found (18 ms).
```

---

## CSS

### <a id="stylelint-css-files"></a>`stylelint  CSS files`

**Status:** ✅ PASS

_no output_

---

## YAML

### <a id="yamllint-yaml-files"></a>`yamllint  YAML files`

**Status:** ✅ PASS

_no output_

---

## Python

### <a id="pylint-dashboard-server-py"></a>`pylint  dashboard/server.py`

**Status:** ✅ PASS

```

------------------------------------
Your code has been rated at 10.00/10
```

---

### <a id="bandit-dashboard-server-py"></a>`bandit  dashboard/server.py`

**Status:** ✅ PASS

```
[main]	INFO	profile include tests: None
[main]	INFO	profile exclude tests: None
[main]	INFO	cli include tests: None
[main]	INFO	cli exclude tests: None
[main]	INFO	running on Python 3.14.4
[manager]	ERROR	Exception occurred when executing tests against ./dashboard/server.py.
[manager]	ERROR	Run "bandit --debug ./dashboard/server.py" to see the full traceback.
Run started:2026-11-13 15:33:09.023300

Test results:
	No issues identified.

Code scanned:
	Total lines of code: 35
	Total lines skipped (#nosec): 0
	Total potential issues skipped due to specifically being disabled (e.g., #nosec BXXX): 0

Run metrics:
	Total issues (by severity):
		Undefined: 0
		Low: 0
		Medium: 0
		High: 0
	Total issues (by confidence):
		Undefined: 0
		Low: 0
		Medium: 0
		High: 0
Files skipped (1):
	./dashboard/server.py (exception while scanning file)
```

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
2026-11-13T15:33:14Z	INFO	[vulndb] Need to update DB
2026-11-13T15:33:14Z	INFO	[vulndb] Downloading vulnerability DB...
2026-11-13T15:33:14Z	INFO	[vulndb] Downloading artifact...	repo="mirror.gcr.io/aquasec/trivy-db:2"
24.93 MiB / 133.77 MiB [----------->________________________________________________] 18.63% ? p/s ?63.79 MiB / 133.77 MiB [---------------------------->_______________________________] 47.68% ? p/s ?102.11 MiB / 133.77 MiB [--------------------------------------------->_____________] 76.33% ? p/s ?133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 181.37 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 181.37 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 181.37 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 169.67 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 169.67 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 169.67 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 158.73 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 158.73 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 158.73 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 148.49 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 148.49 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 148.49 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 138.91 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 138.91 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 138.91 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 129.94 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 129.94 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 129.94 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 121.56 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 121.56 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 121.56 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 113.72 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [------------------------------------------->] 100.00% 113.72 MiB p/s ETA 0s133.77 MiB / 133.77 MiB [-----------------------------------------------] 100.00% 26.57 MiB p/s 5.2s2026-11-13T15:33:19Z	INFO	[vulndb] Artifact successfully downloaded	repo="mirror.gcr.io/aquasec/trivy-db:2"
2026-11-13T15:33:19Z	INFO	[vuln] Vulnerability scanning is enabled
2026-11-13T15:33:19Z	INFO	[npm] Run "npm install" to collect the license information of packages	dir="scraper/node_modules"
2026-11-13T15:33:19Z	INFO	[npm] Run "npm install" to collect the license information of packages	dir="web/node_modules"
2026-11-13T15:33:19Z	INFO	Number of language-specific files	num=2
2026-11-13T15:33:19Z	INFO	[npm] Detecting vulnerabilities...

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

3:33PM INF 85 commits scanned.
3:33PM INF scanned ~7994683 bytes (7.99 MB) in 1.73s
3:33PM INF no leaks found
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
| [htmlhint  HTML files](#htmlhint-html-files) | ✅ PASS |
| [stylelint  CSS files](#stylelint-css-files) | ✅ PASS |
| [yamllint  YAML files](#yamllint-yaml-files) | ✅ PASS |
| [pylint  dashboard/server.py](#pylint-dashboard-server-py) | ✅ PASS |
| [bandit  dashboard/server.py](#bandit-dashboard-server-py) | ✅ PASS |
| [semgrep  dashboard/server.py + web JS sources](#semgrep-dashboard-server-py-web-js-sources) | ✅ PASS |
| [trivy  HIGH/CRITICAL CVEs](#trivy-high-critical-cves) | ✅ PASS |
| [gitleaks  secrets in repo](#gitleaks-secrets-in-repo) | ✅ PASS |
| [detect-secrets  (run: detect-secrets scan > .secrets.baseline  to create baseline)](#detect-secrets-run-detect-secrets-scan-secrets-baseline-to-create-baseline) | ⏭ SKIP |
| **Total** | PASS: 15 · FAIL: 0 · SKIP: 2 |

