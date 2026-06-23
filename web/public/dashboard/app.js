async function loadData() {
  const resp = await fetch('/bf_foot_l1/api/seasons.json');
  if (!resp.ok) throw new Error('Failed to fetch data: ' + resp.status);
  const data = await resp.json();
  return data;
}

function isValidClub(club) {
  if (!club || !club.name) return false;
  if (club.name.includes('Sélectionner') ||
      club.name.includes('Journée') ||
      club.name.length < 3 ||
      club.position === null ||
      club.position === undefined ||
      typeof club.position !== 'number' ||
      club.position < 1 ||
      club.position > 20) {
    return false;
  }
  return true;
}

function createCheckbox(id, label) {
  const wrapper = document.createElement('div');
  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.id = id;
  const lb = document.createElement('label');
  lb.htmlFor = id;
  lb.textContent = label;
  wrapper.appendChild(cb);
  wrapper.appendChild(lb);
  return { wrapper, cb };
}

function t(v) { return document.createTextNode(v == null || v === '' ? '' : String(v)); }

function buildTable(clubs) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>Pos</th><th>Club</th><th>Pts</th><th>P</th><th>GD</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th></tr>';
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  clubs.forEach(c => {
    const tr = document.createElement('tr');
    [c.position, c.name, c.points, c.played, c.goal_difference, c.wins, c.draws, c.losses, c.goals_for, c.goals_against].forEach(v => {
      const td = document.createElement('td');
      td.appendChild(t(v));
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  return table;
}

function prepareDatasets(dates, snapshots, selectedClubs) {
  const clubMap = {};
  selectedClubs.forEach(name => { clubMap[name] = Array(dates.length).fill(null); });
  snapshots.forEach((snap, i) => {
    snap.clubs.forEach(c => {
      if (clubMap[c.name]) clubMap[c.name][i] = c.position;
    });
  });
  const colors = ['#e6194b','#3cb44b','#ffe119','#4363d8','#f58231','#911eb4','#46f0f0','#f032e6','#bcf60c','#fabebe'];
  return Object.keys(clubMap).map((name, idx) => ({
    label: name,
    data: clubMap[name],
    borderColor: colors[idx % colors.length],
    fill: false,
    tension: 0.2,
  }));
}

function makeChart(ctx, labels, datasets) {
  let maxPosition = 18;
  if (datasets.length > 0) {
    const allPositions = datasets.flatMap(d => d.data.filter(p => p !== null));
    if (allPositions.length > 0) maxPosition = Math.max(...allPositions, 18);
  }
  let maxTicksLimit = 6;
  if (labels.length <= 10) maxTicksLimit = labels.length;
  else if (labels.length <= 20) maxTicksLimit = Math.ceil(labels.length / 2);
  else maxTicksLimit = Math.ceil(labels.length / 3);

  return new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { bottom: 5 } },
      scales: {
        y: {
          reverse: true,
          beginAtZero: false,
          min: 1,
          max: maxPosition,
          ticks: { stepSize: 1, padding: 5 },
          title: { display: true, text: 'Position (1 = best)' }
        },
        x: {
          ticks: { maxRotation: 0, minRotation: 0, font: { size: 10 }, maxTicksLimit }
        }
      },
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: ctx => ctx.dataset.label + ': Position ' + ctx.parsed.y
          }
        }
      },
      interaction: { mode: 'nearest', axis: 'x', intersect: false }
    }
  });
}

// ── Tab 2: final ranking per season for a single club ──────────────────────
function buildCrossSeasonData(db, clubName) {
  // For each season (oldest→newest), find the last available general snapshot and read the club's position
  const seasons = Object.keys(db).sort();
  const labels = [];
  const positions = [];

  for (const season of seasons) {
    const snaps = (db[season] || [])
      .filter(s => (!s.standings_type || s.standings_type === 'general') && s.clubs && s.clubs.length)
      .sort((a, b) => (a.round || 0) - (b.round || 0));
    if (!snaps.length) continue;
    const lastSnap = snaps[snaps.length - 1];
    const club = lastSnap.clubs.find(c => isValidClub(c) && c.name === clubName);
    labels.push(season);
    positions.push(club ? club.position : null);
  }
  return { labels, positions };
}

function makeClubChart(ctx, labels, positions, clubName) {
  const maxPos = Math.max(...positions.filter(p => p !== null), 18);
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: clubName,
        data: positions,
        borderColor: '#4363d8',
        backgroundColor: 'rgba(67,99,216,0.1)',
        fill: true,
        tension: 0.25,
        pointRadius: 5,
        pointHoverRadius: 7,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          reverse: true,
          min: 1,
          max: maxPos,
          ticks: { stepSize: 1 },
          title: { display: true, text: 'Classement final (1 = meilleur)' }
        },
        x: {
          title: { display: true, text: 'Saison' },
          ticks: { maxRotation: 45, font: { size: 10 } }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: c => c.parsed.y !== null ? `${clubName} : ${c.parsed.y}e` : 'Pas de données'
          }
        }
      },
      interaction: { mode: 'nearest', axis: 'x', intersect: false }
    }
  });
}

// ── Main ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const db = await loadData();

    // ── Tab switching ──
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => { p.hidden = true; });
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).hidden = false;
      });
    });

    // ── Tab 1 ──
    const seasonSelect = document.getElementById('seasonSelect');
    const standingsTypeSelect = document.getElementById('standingsTypeSelect');
    const clubFilter = document.getElementById('clubFilter');
    const clubsContainer = document.getElementById('clubs');
    const tableContainer = document.getElementById('tableContainer');
    const ctx = document.getElementById('chart').getContext('2d');
    let chart = null;
    let isFirstLoad = true;
    let selectedClubs = new Set();

    const seasons = Object.keys(db).sort().reverse();
    seasons.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s;
      seasonSelect.appendChild(opt);
    });
    if (seasons.length === 0) throw new Error('No data found in seasons.json');

    function renderForSeason(season, overrideSnapshots = null, standingsType = 'general') {
      if (!isFirstLoad) {
        selectedClubs = new Set(Array.from(clubsContainer.querySelectorAll('input[type="checkbox"]'))
          .filter(c => c.checked)
          .map(c => c.nextSibling.textContent));
      }

      let snapshots = overrideSnapshots || (season ? db[season] : []);
      snapshots = snapshots.filter(snap => !snap.standings_type || snap.standings_type === standingsType);
      snapshots = snapshots
        .filter(snap => snap.clubs && snap.clubs.some(c => isValidClub(c)))
        .map(snap => ({ ...snap, clubs: snap.clubs.filter(c => isValidClub(c)) }))
        .sort((a, b) => (a.round || 0) - (b.round || 0));

      if (snapshots.length === 0) {
        tableContainer.innerHTML = '<p>No data available for this season.</p>';
        clubsContainer.innerHTML = '';
        if (chart) chart.destroy();
        return;
      }

      const isEvolutionData = snapshots.length > 1;
      const useSeasonLabels = snapshots.every(s => s.season) && new Set(snapshots.map(s => s.season)).size > 1;
      const hasRoundData = snapshots.some(s => s.round !== undefined && s.round !== null);
      const dates = useSeasonLabels
        ? snapshots.map(s => s.season)
        : hasRoundData
        ? snapshots.map(s => s.round ? `Journée ${s.round}` : `Snapshot`)
        : snapshots.map((s, i) => `Journée ${i + 1}`);

      const clubNames = Array.from(new Set(snapshots.flatMap(s => s.clubs.map(c => c.name)))).sort();
      clubsContainer.innerHTML = '';
      tableContainer.innerHTML = '';

      const latestSnapshot = snapshots[snapshots.length - 1];
      if (latestSnapshot && latestSnapshot.clubs.length > 0) {
        tableContainer.appendChild(buildTable(latestSnapshot.clubs));
      } else {
        tableContainer.innerHTML = '<p>No table data available</p>';
      }

      if (isEvolutionData) {
        clubNames.forEach(name => {
          const { wrapper, cb } = createCheckbox('cb_' + name.replace(/[^a-z0-9]/gi, '_'), name);
          clubsContainer.appendChild(wrapper);
          const shouldCheck = isFirstLoad
            ? (name === 'Paris SG' || name === 'Marseille')
            : selectedClubs.has(name);
          if (shouldCheck) cb.checked = true;
          cb.addEventListener('change', updateChart);
        });
        clubFilter.value = '';
        clubFilter.oninput = () => {
          const q = clubFilter.value.toLowerCase();
          Array.from(clubsContainer.children).forEach(div => {
            div.style.display = div.querySelector('label').textContent.toLowerCase().includes(q) ? '' : 'none';
          });
        };
        document.getElementById('chartContainer').style.display = '';
        document.getElementById('clubFilter').style.display = '';
        document.querySelector('label[for="clubFilter"]').style.display = '';
        isFirstLoad = false;
        updateChart();
      } else {
        if (chart) chart.destroy();
        document.getElementById('chartContainer').style.display = 'none';
        document.getElementById('clubFilter').style.display = 'none';
        document.querySelector('label[for="clubFilter"]').style.display = 'none';
      }

      function updateChart() {
        const selected = Array.from(clubsContainer.querySelectorAll('input[type=checkbox]'))
          .filter(i => i.checked).map(i => i.nextSibling.textContent);
        selectedClubs = new Set(selected);
        if (chart) chart.destroy();
        chart = makeChart(ctx, dates, prepareDatasets(dates, snapshots, selected));
      }
    }

    seasonSelect.addEventListener('change', () => renderForSeason(seasonSelect.value, null, standingsTypeSelect.value));
    standingsTypeSelect.addEventListener('change', () => renderForSeason(seasonSelect.value, null, standingsTypeSelect.value));
    renderForSeason(seasons[0], null, 'general');

    // ── Tab 2 ──
    const clubSelect = document.getElementById('clubSelect');
    const chart2Container = document.getElementById('chartContainer2');
    const chart2Canvas = document.getElementById('chart2');
    const ctx2 = chart2Canvas.getContext('2d');
    let chart2 = null;
    const chart2NoData = document.createElement('p');
    chart2Container.insertBefore(chart2NoData, chart2Canvas);

    // Collect all unique valid club names across all seasons, sorted
    const allClubs = Array.from(new Set(
      Object.values(db).flatMap(snaps =>
        snaps.flatMap(s => (s.clubs || []).filter(isValidClub).map(c => c.name))
      )
    )).sort((a, b) => a.localeCompare(b, 'fr'));

    allClubs.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      if (name === 'Paris SG') opt.selected = true;
      clubSelect.appendChild(opt);
    });

    function renderClubChart() {
      const clubName = clubSelect.value;
      const { labels, positions } = buildCrossSeasonData(db, clubName);
      if (chart2) { chart2.destroy(); chart2 = null; }
      if (labels.length === 0) {
        chart2Canvas.style.display = 'none';
        chart2NoData.textContent = 'Pas de données disponibles pour ce club.';
        return;
      }
      chart2NoData.textContent = '';
      chart2Canvas.style.display = '';
      chart2 = makeClubChart(ctx2, labels, positions, clubName);
    }

    clubSelect.addEventListener('change', renderClubChart);
    renderClubChart();

  } catch (err) {
    const pre = document.createElement('pre');
    pre.style.color = 'red';
    pre.textContent = err.stack || String(err);
    document.body.replaceChildren(pre);
  }
});
