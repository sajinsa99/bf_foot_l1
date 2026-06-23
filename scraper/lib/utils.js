'use strict';

function parseIntSafe(s) {
  const n = parseInt(String(s).replace(/[^0-9-]/g, ''), 10);
  return Number.isNaN(n) ? null : n;
}

// Remove noise added by Transfermarkt (leading rank numbers) and FootMercato
// (duplicated last word, "Logo" prefix).  Each parser previously had its own
// copy with slightly different behaviour — this single version handles both.
function cleanTeamName(text) {
  if (!text) return '';
  let t = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  // Strip "Logo" prefix injected by FootMercato's alt text
  t = t.replace(/^Logo\s*/i, '').trim();
  // Strip leading rank number added by Transfermarkt (e.g. "1. PSG" → "PSG")
  t = t.replace(/^\d+\.?\s*/, '').trim();
  // Deduplicate last word when FootMercato doubles the team abbreviation
  const parts = t.split(' ');
  if (parts.length >= 2) {
    const last = parts[parts.length - 1];
    const secondLast = parts[parts.length - 2];
    if (last === secondLast) parts.pop();
  }
  return parts.join(' ');
}

module.exports = { parseIntSafe, cleanTeamName };
