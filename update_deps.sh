#!/usr/bin/env bash
# Checks for newer versions of the npm packages used by scraper/ and web/,
# respecting the pinned Node version (see CLAUDE.md). Versions that would
# require a newer Node than the pin are held back and only listed, never
# offered. Covers normal dependencies AND the scraper overrides block.
#
# Usage:  bash update_deps.sh
#
# On confirmation it rewrites the affected package.json files (preserving the
# ^ / ~ range prefix) and runs `npm install` in each changed directory.

set -uo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")" || exit 1
ROOT="$(pwd)"

command -v node >/dev/null 2>&1 || { echo "node not found on PATH" >&2; exit 1; }
command -v npm  >/dev/null 2>&1 || { echo "npm not found on PATH"  >&2; exit 1; }

PKG_FILES=("$ROOT/scraper/package.json" "$ROOT/web/package.json")

# Pinned Node version drives the engine filter below.
PINNED_NODE="$(node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{try{console.log((JSON.parse(s).engines||{}).node||"")}catch(e){console.log("")}})' < "$ROOT/scraper/package.json")"
[ -z "$PINNED_NODE" ] && PINNED_NODE="20.20.2"
PINNED_MAJOR="${PINNED_NODE%%.*}"

# ── helpers ───────────────────────────────────────────────────────────────────

# Emit "section<TAB>name<TAB>range" for every string-valued dep/override.
# Reads the package.json on stdin so Windows/MSYS paths never reach node.
list_entries() {
  node -e '
    let s=""; process.stdin.on("data",d=>s+=d); process.stdin.on("end",()=>{
      const p=JSON.parse(s); const out=[];
      for (const sec of ["dependencies","devDependencies","overrides"]) {
        const o=p[sec]; if(!o) continue;
        for (const [k,v] of Object.entries(o)) if(typeof v==="string") out.push(sec+"\t"+k+"\t"+v);
      }
      process.stdout.write(out.join("\n")+(out.length?"\n":""));
    });
  '
}

# Given a `npm view <pkg> versions --json` array on stdin, print the highest
# stable version of each major, newest major first (one per line).
gen_candidates() {
  node -e '
    let s=""; process.stdin.on("data",d=>s+=d); process.stdin.on("end",()=>{
      let vs; try{vs=JSON.parse(s)}catch(e){process.exit(0)}
      if(!Array.isArray(vs)) vs=[vs];
      const stable=vs.filter(v=>typeof v==="string" && !v.includes("-"));
      const key=v=>v.split(".").map(Number);
      const gt=(a,b)=>{a=key(a);b=key(b);for(let i=0;i<3;i++){const x=a[i]||0,y=b[i]||0;if(x!==y)return x>y;}return false;};
      const best=new Map();
      for(const v of stable){const m=v.split(".")[0]; if(!best.has(m)||gt(v,best.get(m))) best.set(m,v);}
      const majors=[...best.keys()].sort((a,b)=>Number(b)-Number(a));
      process.stdout.write(majors.map(m=>best.get(m)).join("\n"));
    });
  '
}

# True (exit 0) if $1 is a strictly higher version than $2. Leading range
# operators (^ ~ >=) and prerelease suffixes are ignored for the comparison.
ver_gt() {
  node -e '
    const k=v=>v.replace(/^[^0-9]*/,"").split("-")[0].split(".").map(Number);
    const a=k(process.argv[1]), b=k(process.argv[2]);
    for(let i=0;i<3;i++){const x=a[i]||0,y=b[i]||0;if(x!==y)process.exit(x>y?0:1);}
    process.exit(1);
  ' "$1" "$2"
}

# True (exit 0) if an engines.node string is satisfiable on the pinned Node.
# Heuristic: take the lowest major required by any >= / > clause; compatible
# when that is <= the pinned major. Empty / operator-less strings = compatible.
node_compatible() {
  local eng="$1" minmaj
  [ -z "$eng" ] && return 0
  minmaj="$(printf '%s' "$eng" | grep -oE '>=?[[:space:]]*[0-9]+' | grep -oE '[0-9]+' | sort -n | head -1)"
  [ -z "$minmaj" ] && return 0
  [ "$minmaj" -le "$PINNED_MAJOR" ]
}

# Rewrite package.json on stdin -> stdout, applying section/name/newrange triples.
apply_triples() {
  node -e '
    let s=""; process.stdin.on("data",d=>s+=d); process.stdin.on("end",()=>{
      const p=JSON.parse(s); const a=process.argv.slice(1);
      for(let i=0;i<a.length;i+=3){const sec=a[i],name=a[i+1],nr=a[i+2]; if(p[sec]&&name in p[sec]) p[sec][name]=nr;}
      process.stdout.write(JSON.stringify(p,null,2)+"\n");
    });
  ' "$@"
}

# ── detect ────────────────────────────────────────────────────────────────────

echo "Pinned Node: $PINNED_NODE  (versions needing a newer Node are held back)"
echo

UPDATES=""   # file<TAB>section<TAB>name<TAB>current<TAB>newrange
SKIPPED=""   # name<TAB>current<TAB>latest<TAB>chosen

for f in "${PKG_FILES[@]}"; do
  [ -f "$f" ] || continue
  entries="$(list_entries < "$f")"
  while IFS=$'\t' read -r section name cur; do
    [ -z "${name:-}" ] && continue
    echo "  checking $name ..." >&2
    vjson="$(npm view "$name" versions --json 2>/dev/null)" || { echo "    (could not query $name)" >&2; continue; }
    [ -z "$vjson" ] && continue
    candidates="$(printf '%s' "$vjson" | gen_candidates)"
    [ -z "$candidates" ] && continue
    latest_stable="$(printf '%s\n' "$candidates" | head -1)"

    chosen=""
    while IFS= read -r cand; do
      [ -z "$cand" ] && continue
      eng="$(npm view "$name@$cand" engines.node 2>/dev/null)"
      if node_compatible "$eng"; then chosen="$cand"; break; fi
    done <<EOF
$candidates
EOF
    [ -z "$chosen" ] && continue

    prefix="${cur%%[0-9]*}"
    if ver_gt "$chosen" "$cur"; then
      UPDATES+="$f"$'\t'"$section"$'\t'"$name"$'\t'"$cur"$'\t'"$prefix$chosen"$'\n'
    fi
    if [ "$latest_stable" != "$chosen" ] && ver_gt "$latest_stable" "$cur"; then
      SKIPPED+="$name"$'\t'"$cur"$'\t'"$latest_stable"$'\t'"$chosen"$'\n'
    fi
  done <<EOF
$entries
EOF
done

echo

# ── report ──────────────────────────────────────────────────────────────────

if [ -n "$SKIPPED" ]; then
  echo "Held back (newest release needs a newer Node than $PINNED_NODE):"
  printf '%s' "$SKIPPED" | while IFS=$'\t' read -r n c l ch; do
    [ -z "${n:-}" ] && continue
    echo "  - $n: latest $l needs newer Node; staying on the $ch line (current $c)"
  done
  echo
fi

if [ -z "$UPDATES" ]; then
  echo "All packages are up to date within the Node $PINNED_NODE constraint."
  exit 0
fi

echo "Available updates:"
printf '%s' "$UPDATES" | while IFS=$'\t' read -r f section name cur newr; do
  [ -z "${name:-}" ] && continue
  cmaj="$(printf '%s' "$cur"  | sed 's/^[^0-9]*//' | cut -d. -f1)"
  nmaj="$(printf '%s' "$newr" | sed 's/^[^0-9]*//' | cut -d. -f1)"
  tag=""
  [ "$cmaj" != "$nmaj" ] && tag="   [MAJOR - review for breaking changes]"
  sectag=""
  [ "$section" = "overrides" ] && sectag=" (override)"
  printf '  %-22s %-18s %s -> %s%s\n' "${f#"$ROOT"/}" "$name$sectag" "$cur" "$newr" "$tag"
done
echo

read -r -p "Apply all these updates and run npm install? [y/N] " ans
case "${ans:-}" in
  [yY]|[yY][eE][sS]) ;;
  *) echo "Aborted. No files changed."; exit 0 ;;
esac

# ── apply ─────────────────────────────────────────────────────────────────────

for f in "${PKG_FILES[@]}"; do
  triples=()
  while IFS=$'\t' read -r uf section name cur newr; do
    [ "${uf:-}" = "$f" ] || continue
    triples+=("$section" "$name" "$newr")
  done <<EOF
$(printf '%s' "$UPDATES")
EOF
  [ ${#triples[@]} -eq 0 ] && continue
  if apply_triples "${triples[@]}" < "$f" > "$f.tmp.$$"; then
    mv "$f.tmp.$$" "$f"
    echo "  patched ${f#"$ROOT"/}"
  else
    rm -f "$f.tmp.$$"
    echo "  FAILED to patch ${f#"$ROOT"/}" >&2
  fi
done

echo
dirs="$(printf '%s' "$UPDATES" | cut -f1 | while read -r p; do [ -n "$p" ] && dirname "$p"; done | sort -u)"
for d in $dirs; do
  echo "==> npm install in ${d#"$ROOT"/}"
  ( cd "$d" && npm install ) || echo "  npm install failed in ${d#"$ROOT"/}" >&2
done

echo
echo "Done. Review the package.json / package-lock.json changes with git diff before committing."
