#!/usr/bin/env bash
# Code quality and security checks for bf_foot_l1.
# Runs all tools inside the xmk_linters Docker image — no local install required.
# Generates checks-report.md with per-tool sections and a summary table.
# Usage:  bash checks.sh

set -uo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")" || exit 1

IMAGE="xmake-deploy-milestone.int.repositories.cloud.sap/com.sap.internal.prd.xmk.tools/xmk_linters:1.1.4"
DOCKER_RUN=(docker run --rm --user root -v "$(pwd):/work" -w /work "$IMAGE")
REPORT="checks-report.md"

# ── colour (terminal only) ────────────────────────────────────────────────────
if [ -t 1 ]; then
  C_BLUE=$'\033[0;34m'; C_GREEN=$'\033[0;32m'
  C_RED=$'\033[0;31m';  C_YELLOW=$'\033[1;33m'; C_RESET=$'\033[0m'
else
  C_BLUE=''; C_GREEN=''; C_RED=''; C_YELLOW=''; C_RESET=''
fi

PASS=0; FAIL=0; SKIP=0
MD_RESULTS=()   # "label|STATUS" — built up during run, used for summary table
MD_BODY=""      # accumulated section bodies

m() { MD_BODY+="${1-}"$'\n'; }

section() {
  printf "\n%s══ %s %s\n" "$C_BLUE" "$1" "$C_RESET"
  m "## $1"
  m ""
}

step() {
  local label="$1"; shift
  printf "\n%s┌─ %s%s\n" "$C_BLUE" "$label" "$C_RESET"

  # stream output to terminal and capture it simultaneously
  local tmpfile exit_code output
  tmpfile=$(mktemp)
  "$@" 2>&1 | tee "$tmpfile"
  exit_code=${PIPESTATUS[0]}
  output=$(< "$tmpfile")
  rm -f "$tmpfile"

  m "### \`$label\`"
  m ""

  if [[ $exit_code -eq 0 ]]; then
    printf "%s└─ PASS%s\n" "$C_GREEN" "$C_RESET"
    PASS=$((PASS + 1))
    m "**Status:** ✅ PASS"
    MD_RESULTS+=("$label|PASS")
  else
    printf "%s└─ FAIL (exit %d)%s\n" "$C_RED" "$exit_code" "$C_RESET"
    FAIL=$((FAIL + 1))
    m "**Status:** ❌ FAIL (exit $exit_code)"
    MD_RESULTS+=("$label|FAIL")
  fi

  m ""
  if [[ -n "$output" ]]; then
    m '```'
    m "$output"
    m '```'
  else
    m '_no output_'
  fi
  m ""
  m "---"
  m ""
}

skip() {
  local label="$1"
  printf "\n%s○ SKIP%s  %s\n" "$C_YELLOW" "$C_RESET" "$label"
  SKIP=$((SKIP + 1))
  m "### \`$label\`"
  m ""
  m "**Status:** ⏭ SKIP"
  m ""
  m "---"
  m ""
  MD_RESULTS+=("$label|SKIP")
}

write_report() {
  local ts lbl st icon entry
  ts=$(date '+%Y-%m-%d %H:%M:%S')
  {
    printf '# Checks Report — bf_foot_l1 — %s\n\n' "$ts"
    printf '## Summary\n\n'
    printf '| Check | Status |\n'
    printf '|---|---|\n'
    for entry in "${MD_RESULTS[@]+"${MD_RESULTS[@]}"}"; do
      lbl="${entry%|*}"
      st="${entry##*|}"
      case "$st" in
        PASS) icon="✅ PASS" ;;
        FAIL) icon="❌ FAIL" ;;
        SKIP) icon="⏭ SKIP" ;;
        *)    icon="$st"    ;;
      esac
      printf '| %s | %s |\n' "$lbl" "$icon"
    done
    printf '| **Total** | PASS: %d · FAIL: %d · SKIP: %d |\n' "$PASS" "$FAIL" "$SKIP"
    printf '\n---\n\n'
    printf '%s' "$MD_BODY"
  } > "$REPORT"
  printf "\n%s Report written → %s%s\n" "$C_BLUE" "$REPORT" "$C_RESET"
}

# ─────────────────────────────────────────────────────────────────────────────

section "Shell"
step "shellcheck  web/install.sh" \
  "${DOCKER_RUN[@]}" shellcheck web/install.sh
step "shellcheck  scraper/get_all_seasons.sh  scraper/get_one_season.sh" \
  "${DOCKER_RUN[@]}" shellcheck scraper/get_all_seasons.sh scraper/get_one_season.sh
step "shellcheck  dashboard/server.sh" \
  "${DOCKER_RUN[@]}" shellcheck dashboard/server.sh

section "JSON"
step "jsonlint  scraper/package.json" \
  "${DOCKER_RUN[@]}" jsonlint scraper/package.json
step "jsonlint  web/package.json" \
  "${DOCKER_RUN[@]}" jsonlint web/package.json
step "jsonlint  scraper/data/seasons.json" \
  "${DOCKER_RUN[@]}" jsonlint scraper/data/seasons.json

section "Markdown"
mapfile -t md_files < <(find . -path './.git' -prune -o -name 'checks-report.md' -prune -o -name '*.md' -print)
if [[ ${#md_files[@]} -gt 0 ]]; then
  step "markdownlint-cli2  Markdown files" \
    "${DOCKER_RUN[@]}" markdownlint-cli2 --fix "${md_files[@]}"
else
  skip "markdownlint-cli2  (no *.md files found)"
fi

section "JavaScript"
if [[ -f eslint.config.js || -f web/eslint.config.js || -f .eslintrc.json ]]; then
  step "eslint  web/server.js  web/public/manage-data/app.js  web/public/dashboard/app.js" \
    "${DOCKER_RUN[@]}" bash -c 'cd web && eslint --fix server.js public/manage-data/app.js public/dashboard/app.js'
else
  skip "eslint  (no eslint.config.js found — create one to enable)"
fi

section "YAML"
mapfile -t yaml_files < <(find . -path './.git' -prune -o \( -name '*.yaml' -o -name '*.yml' \) -print)
if [[ ${#yaml_files[@]} -gt 0 ]]; then
  step "yamllint  YAML files" \
    "${DOCKER_RUN[@]}" yamllint "${yaml_files[@]}"
else
  skip "yamllint  (no *.yaml / *.yml files found)"
fi

section "Static Analysis"
step "semgrep  dashboard/server.py + web JS sources" \
  "${DOCKER_RUN[@]}" semgrep scan --config auto --error \
    dashboard/server.py web/server.js web/public/manage-data/app.js web/public/dashboard/app.js

section "Dependency CVEs"
step "trivy  HIGH/CRITICAL CVEs" \
  "${DOCKER_RUN[@]}" trivy fs --scanners vuln --exit-code 1 --severity HIGH,CRITICAL .

section "Secrets"
step "gitleaks  secrets in repo" \
  "${DOCKER_RUN[@]}" \
    bash -c 'git config --global --add safe.directory /work && gitleaks detect --source . --redact'
if [[ -f .secrets.baseline ]]; then
  step "detect-secrets  new secrets vs baseline" \
    "${DOCKER_RUN[@]}" detect-secrets scan --baseline .secrets.baseline
else
  skip "detect-secrets  (run: detect-secrets scan > .secrets.baseline  to create baseline)"
fi

# ── Terminal summary ──────────────────────────────────────────────────────────
printf "\n%s\n" "════════════════════════════════════"
printf "  %sPASS%s %-3d  %sFAIL%s %-3d  %sSKIP%s %d\n" \
  "$C_GREEN" "$C_RESET" "$PASS" \
  "$C_RED"   "$C_RESET" "$FAIL" \
  "$C_YELLOW" "$C_RESET" "$SKIP"
printf "%s\n" "════════════════════════════════════"

write_report

[ "$FAIL" -eq 0 ]
