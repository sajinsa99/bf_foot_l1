#!/usr/bin/env bash
# Fetch data for multiple seasons or show status of all seasons.
# Usage:
#   ./get_all_seasons.sh -os=2020 -ns=2025
#   ./get_all_seasons.sh -status
#   ./get_all_seasons.sh -h (show help)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

usage() {
  cat >&2 << 'EOF'
Usage: ./get_all_seasons.sh [-os=OLDEST_SEASON -ns=NEWEST_SEASON] [-status] [-retry-missing] [-h]

Options:
  -os=SEASON      Oldest season to fetch (YYYY, YYYY/YYYY, or 'latest')
                  - Required together with -ns=NEWEST_SEASON for fetch mode
                  - Error if specified without -ns
  -ns=SEASON      Newest season to fetch (YYYY, YYYY/YYYY, or 'latest')
                  - Required together with -os=OLDEST_SEASON for fetch mode
                  - Error if specified without -os
  -status         Show status for all seasons in data/seasons.json (from newest to oldest)
  -retry-missing  Retry fetching missing journeys (use with -status; retries once per missing round)
  -h, --help      Display help message

Examples:
  Fetch all seasons from 2020 to latest (auto-detects latest from Transfermarkt):
    ./get_all_seasons.sh -os=2020 -ns=latest

  Fetch seasons 2020 to 2025 (with confirmation prompt):
    ./get_all_seasons.sh -os=2020 -ns=2025

  Fetch seasons 2019/2020 to 2025/2026 (with confirmation prompt):
    ./get_all_seasons.sh -os=2019/2020 -ns=2025/2026

  Show status for all available seasons:
    ./get_all_seasons.sh -status

  Show status and retry missing journeys:
    ./get_all_seasons.sh -status -retry-missing

  Show help:
    ./get_all_seasons.sh -h

Note: Fetch mode requires BOTH -os and -ns. Missing one will cause an error.
      A confirmation prompt will ask before clearing data/seasons.json.
EOF
  exit 2
}

# Parse arguments
oldest_season=""
newest_season=""
show_status=false
retry_missing=false

for arg in "$@"; do
  case "$arg" in
    -h|--help) usage ;;
    -status) show_status=true ;;
    -retry-missing) retry_missing=true ;;
    -os=*) oldest_season="${arg#-os=}" ;;
    -ns=*) newest_season="${arg#-ns=}" ;;
    *) printf '%s\n' "Unknown option: $arg" >&2; usage ;;
  esac
done

# Handle -status action
if [ "$show_status" = true ]; then
  db_file="$SCRIPT_DIR/data/seasons.json"
  
  if [ ! -f "$db_file" ]; then
    printf '%s\n' "Error: $db_file not found" >&2
    exit 3
  fi
  
  # Get all seasons and sort from newest to oldest
  seasons=$(node -e "
    const fs = require('fs');
    const db = JSON.parse(fs.readFileSync('$db_file', 'utf8'));
    const seasons = Object.keys(db).sort().reverse();
    seasons.forEach(s => console.log(s));
  " 2>&1) || { printf '%s\n' "Failed to read seasons from database" >&2; exit 1; }
  
  printf '\n=== Status for all available seasons (newest to oldest) ===\n'
  
  # Loop through seasons and show status
  while IFS= read -r season; do
    [ -z "$season" ] && continue
    printf '\n>>> Season %s:\n' "$season"
    ./get_one_season.sh -s="$season" -a=status
    
    # If retry_missing flag is set, attempt to fetch missing journeys
    if [ "$retry_missing" = true ]; then
      sleep 0.5

      season_year=$(echo "$season" | cut -d/ -f1)
      max_on_site=$(node -e "
        const tm = require('./lib/parsers/transfermarkt.js');
        tm.getMaxRound('$season_year').then(max => {
          console.log(max || 0);
        }).catch(() => { console.log('0'); });
      ")

      printf '  [INFO] Max rounds on Transfermarkt for %s: %s\n' "$season" "$max_on_site"

      # Build the list of missing rounds: gaps within fetched range + rounds beyond max_in_db
      missing_journeys=$(node -e "
        const fs = require('fs');
        const db = JSON.parse(fs.readFileSync('$db_file', 'utf8'));
        const season = '$season';
        const maxOnSite = parseInt('$max_on_site', 10) || 0;
        if (!maxOnSite || !db[season] || !Array.isArray(db[season])) { process.exit(0); }
        const have = new Set(
          db[season].map(s => s.round).filter(r => typeof r === 'number' && r > 0)
        );
        const missing = [];
        for (let i = 1; i <= maxOnSite; i++) {
          if (!have.has(i)) missing.push(i);
        }
        if (missing.length > 0) process.stdout.write(missing.join(','));
      ")

      if [ -n "$missing_journeys" ]; then
        printf '  ⚠ Missing journeys: %s\n' "$missing_journeys"
        printf '  Retrying missing journeys...\n'
        if ./get_one_season.sh -s="$season" -j="$missing_journeys" -a=fetch; then
          printf '  ✓ Successfully fetched missing journeys\n'
          ./get_one_season.sh -s="$season" -a=status
        else
          printf '  ✗ Retry failed for missing journeys: %s\n' "$missing_journeys" >&2
        fi
      else
        printf '  ✓ All available journeys present (max: %s)\n' "$max_on_site"
      fi
    fi
  done <<< "$seasons"
  
  exit 0
fi

# Validate required parameters for fetch
if [ -z "$oldest_season" ] && [ -z "$newest_season" ]; then
  # Neither -status nor fetch args provided — show usage
  printf '%s\n' "Error: specify -status or both -os=OLDEST_SEASON -ns=NEWEST_SEASON" >&2
  usage
elif [ -z "$oldest_season" ] && [ -n "$newest_season" ]; then
  printf '%s\n' "Error: -os=OLDEST_SEASON is required when -ns=NEWEST_SEASON is specified" >&2
  usage
elif [ -n "$oldest_season" ] && [ -z "$newest_season" ]; then
  printf '%s\n' "Error: -ns=NEWEST_SEASON is required when -os=OLDEST_SEASON is specified" >&2
  usage
fi

# If we have both os and ns, validate and ask for confirmation
if [ -n "$oldest_season" ] && [ -n "$newest_season" ]; then
  # Extract year from season format (2025 or 2025/2026 -> 2025)
  extract_year() {
    echo "${1}" | cut -d/ -f1
  }

  # Resolve "latest" season
  if [ "$newest_season" = "latest" ]; then
    printf 'Auto-detecting latest season from Transfermarkt...\n'
    newest_season=$(node -e "
      const tm = require('./lib/parsers/transfermarkt.js');
      tm.getLatestSeason().then(latest => {
        if (latest) {
          console.log(latest);
        } else {
          console.error('Failed to detect latest season');
          process.exit(1);
        }
      }).catch(err => {
        console.error('Error:', err.message);
        process.exit(1);
      });
    " 2>&1) || { printf '%s\n' "Failed to detect latest season" >&2; exit 1; }
    printf 'Latest season: %s\n' "$newest_season"
  fi

  oldest_year=$(extract_year "$oldest_season")
  newest_year=$(extract_year "$newest_season")

  # Validate year format
  if ! [[ "$oldest_year" =~ ^[0-9]{4}$ ]]; then
    printf '%s\n' "Invalid oldest season format: $oldest_season. Use YYYY or YYYY/YYYY" >&2
    exit 2
  fi

  if ! [[ "$newest_year" =~ ^[0-9]{4}$ ]]; then
    printf '%s\n' "Invalid newest season format: $newest_season. Use YYYY or YYYY/YYYY" >&2
    exit 2
  fi

  # Validate year range
  if [ "$oldest_year" -gt "$newest_year" ]; then
    printf '%s\n' "Error: oldest season ($oldest_year) cannot be greater than newest season ($newest_year)" >&2
    exit 2
  fi

  # Ask for confirmation before clearing data
  printf '\n⚠️  WARNING: This will clear %s/data/seasons.json and fetch seasons %s to %s\n' "$SCRIPT_DIR" "$oldest_year" "$newest_year"
  printf 'All existing data will be permanently deleted.\n\n'
  printf 'Do you want to proceed? (yes/no): '
  read -r confirm

  if [ "$confirm" != "yes" ]; then
    printf 'Cancelled.\n'
    exit 0
  fi

  # Clear data (always)
  db_file="$SCRIPT_DIR/data/seasons.json"
  if [ -f "$db_file" ]; then
    printf 'Clearing %s...\n' "$db_file"
    echo '{}' > "$db_file"
  fi

  # Loop through seasons and fetch
  printf '\n=== Starting season fetch from %s to %s ===\n\n' "$oldest_year" "$newest_year"

  for year in $(seq "$oldest_year" "$newest_year"); do
    printf '\n>>> Fetching season %s...\n' "$year"
    
    if ! ./get_one_season.sh -s="$year" -a=fetch-all; then
      printf 'Warning: Failed to fetch season %s\n' "$year" >&2
      # Continue to next season instead of failing
    fi
    
    printf '\nStatus for season %s:\n' "$year"
    ./get_one_season.sh -s="$year" -a=status
    
    printf 'Completed season %s\n' "$year"
    
    # Add 1 second delay between seasons to avoid timeouts
    sleep 1
  done

  printf '\n=== All seasons completed ===\n'
  printf 'Data saved to: %s\n' "$SCRIPT_DIR/data/seasons.json"

  ./get_one_season.sh -a=status
fi
