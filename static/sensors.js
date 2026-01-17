const containerEl = document.getElementById('sensor-container');
const statTemp = document.getElementById('stat-temp');
const statPh = document.getElementById('stat-ph');
const statTurbidity = document.getElementById('stat-turbidity');
const lastUpdateEl = document.getElementById('last-update');
const statWqi = document.getElementById('stat-wqi');
const badgeWqi = document.getElementById('badge-wqi');
const sensorSafetyEl = document.getElementById('sensor-safety');
const wqiMarkerSensor = document.getElementById('wqi-marker-sensor');
const sensorWhyList = document.getElementById('sensor-why-list');

function formatLocalTimestamp(ts) {
  if (!ts) return '';
  const iso = ts.endsWith('Z') ? ts : ts + 'Z';
  const d = new Date(iso);
  const fmt = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  return fmt.format(d);
}

async function fetchLatest() {
  try {
    const res = await fetch('/api/iot');
    if (!res.ok) {
      containerEl.classList.add('d-none');
      lastUpdateEl.textContent = 'Waiting for data…';
      return;
    }
    const item = await res.json();
    await renderStats(item);
    containerEl.classList.remove('d-none');
    lastUpdateEl.textContent = `Last update: ${formatLocalTimestamp(item.timestamp)}`;
  } catch (e) {
    containerEl.classList.add('d-none');
    lastUpdateEl.textContent = 'Waiting for data…';
  }
}

async function renderStats(item) {
  if (!item) {
    statTemp.textContent = '—';
    statPh.textContent = '—';
    statTurbidity.textContent = '—';
    statWqi.textContent = '—';
    badgeWqi.textContent = '—';
    badgeWqi.className = 'badge bg-secondary';
    if (sensorSafetyEl) {
      sensorSafetyEl.textContent = 'Waiting for data from the sensor…';
    }
    return;
  }
  statTemp.textContent = item.temperature_c != null ? Number(item.temperature_c).toFixed(2) : '—';
  statPh.textContent = item.ph != null ? Number(item.ph).toFixed(2) : '—';
  const turb = item.turbidity;
  statTurbidity.textContent = turb != null ? Number(turb).toFixed(2) : '—';
  let wqi = null;
  let status = '—';
  let color = 'secondary';
  try {
    const payload = {
      ph: item.ph != null ? Number(item.ph) : undefined,
      turbidity: turb != null ? Number(turb) : undefined,
      temperature: item.temperature_c != null ? Number(item.temperature_c) : undefined
    };
    const res = await fetch('/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const out = await res.json();
      wqi = out.wqi;
      status = out.status;
      color = out.color;
    }
  } catch (e) {}
  statWqi.textContent = wqi != null ? Number(wqi).toFixed(2) : '—';
  badgeWqi.textContent = status;
  badgeWqi.className = `badge bg-${color}`;
  statWqi.className = `badge px-4 py-3 stat-value bg-${color}`;

  if (sensorSafetyEl) {
    if (wqi == null) {
      sensorSafetyEl.textContent = 'Waiting for data from the sensor…';
    } else if (color === 'success') {
      sensorSafetyEl.textContent = '✅ Safe for daily use.';
    } else if (color === 'primary') {
      sensorSafetyEl.textContent = '✅ Generally safe, with minor concerns.';
    } else if (color === 'warning') {
      sensorSafetyEl.textContent = '⚠️ Use with caution. Consider treatment before drinking.';
    } else if (color === 'danger') {
      sensorSafetyEl.textContent = '❌ Not safe for drinking without proper treatment.';
    } else {
      sensorSafetyEl.textContent = '❌ Not safe for drinking. Water quality is very poor.';
    }
  }

  if (wqiMarkerSensor) {
    const clamped = wqi != null ? Math.max(0, Math.min(Number(wqi), 120)) : 0;
    const position = (clamped / 120) * 100;
    wqiMarkerSensor.style.left = position + '%';
  }

  if (sensorWhyList) {
    sensorWhyList.innerHTML = '';
    const ideal = {
      temperature_c: 25.0,
      ph: 7.0,
      turbidity: 1.0
    };
    const differences = [
      {
        key: 'temperature_c',
        label: 'Temperature',
        score: item.temperature_c != null ? Math.abs(Number(item.temperature_c) - ideal.temperature_c) / 2.0 : 0
      },
      {
        key: 'ph',
        label: 'pH',
        score: item.ph != null ? Math.abs(Number(item.ph) - ideal.ph) : 0
      },
      {
        key: 'turbidity',
        label: 'Turbidity',
        score: item.turbidity != null ? Math.max(0, Number(item.turbidity) - ideal.turbidity) : 0
      }
    ];

    differences.sort((a, b) => b.score - a.score);
    const topIssues = differences.filter(d => d.score > 0.1).slice(0, 3);

    if (topIssues.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'Current sensor readings are close to comfortable levels for clean water.';
      sensorWhyList.appendChild(li);
    } else {
      topIssues.forEach(issue => {
        const li = document.createElement('li');
        if (issue.key === 'temperature_c') {
          li.textContent = 'The water temperature is away from the comfortable range, which can affect how healthy the water feels.';
        } else if (issue.key === 'ph') {
          li.textContent = item.ph > ideal.ph
            ? 'The pH is higher than the ideal level, making the water slightly more basic.'
            : 'The pH is lower than the ideal level, making the water slightly more acidic.';
        } else if (issue.key === 'turbidity') {
          li.textContent = 'The water looks more cloudy (higher turbidity), which can indicate tiny floating particles.';
        }
        sensorWhyList.appendChild(li);
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchLatest();
  setInterval(fetchLatest, 5000);
});
