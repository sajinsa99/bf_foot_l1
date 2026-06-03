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

function buildTable(clubs) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>Pos</th><th>Club</th><th>Pts</th><th>P</th><th>GD</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th></tr>';
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  clubs.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${c.position||''}</td><td>${c.name}</td><td>${c.points||''}</td><td>${c.played||''}</td><td>${c.goal_difference||''}</td><td>${c.wins||''}</td><td>${c.draws||''}</td><td>${c.losses||''}</td><td>${c.goals_for||''}</td><td>${c.goals_against||''}</td>`;
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

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const db = await loadData();
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
  } catch (err) {
    document.body.innerHTML = '<pre style="color:red">' + (err.stack || err) + '</pre>';
  }
});
