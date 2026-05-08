// ══ STATE ══════════════════════════════════════════
function loadState() {
  try {
    return JSON.parse(localStorage.getItem('rewire_state') || 'null');
  } catch {
    localStorage.removeItem('rewire_state');
    return null;
  }
}

let state = loadState() || {
  startDate: new Date().toISOString().split('T')[0],
  dailyLogs: {},
  currentDay: 1,
  milestones: {},
  reminder: { enabled: false, time: '21:00' },
};

if (!state.dailyLogs) state.dailyLogs = {};
if (!state.milestones) state.milestones = {};
if (!state.reminder) state.reminder = { enabled: false, time: '21:00' };

// ══ HABITS ═════════════════════════════════════════
const habits = [
  { id: 'noporn',   label: 'Zero Pornography',          desc: 'No porn, no suggestive content',             pts: 20 },
  { id: 'exercise', label: 'Exercise / Training',        desc: '30 min strength or cardio',                  pts: 15 },
  { id: 'sleep',    label: 'Quality Sleep 7–9h',         desc: 'Track above in sleep slider',                pts: 15 },
  { id: 'breath',   label: 'Box Breathing 2 min',        desc: '4-4-4-4 pattern, morning',                   pts: 10 },
  { id: 'cold',     label: 'Cold Shower 60 sec',         desc: 'Morning dopamine reset',                     pts: 10 },
  { id: 'kegel',    label: 'Kegel Exercises',            desc: '3 sets × 10 contractions',                   pts: 8  },
  { id: 'nutrition',label: 'Clean Nutrition',            desc: 'High protein, zinc, no junk',                pts: 8  },
  { id: 'noscreens',label: 'No Screens 1h Before Bed',  desc: 'Blue light disrupts testosterone',           pts: 8  },
  { id: 'journal',  label: 'Journal Entry',              desc: 'Wins, urges, gratitude',                     pts: 5  },
  { id: 'sunlight', label: 'Morning Sunlight',           desc: '10 min outdoor light, Vitamin D',            pts: 5  },
];

const milestoneData = [
  { week:1,  day:7,   title:'First 7 Days',          desc:'Dopamine receptors begin upregulating. Urges will be strong — this is your brain adapting.',     key:'w1' },
  { week:2,  day:14,  title:'Two Weeks Clean',        desc:'Cortisol levels begin dropping. Morning erections may become more consistent.',                   key:'w2' },
  { week:3,  day:21,  title:'Flatline Survived',      desc:'Hardest phase. Zero libido is normal here. Your D2 receptors are regrowing. Trust the process.',  key:'w3' },
  { week:4,  day:30,  title:'Phase 1 Complete',       desc:'Full dopamine reset milestone. Sensitivity to real stimulation should be noticeably higher.',      key:'w4' },
  { week:5,  day:35,  title:'Rewiring Begins',        desc:'Begin sensate focus and start-stop exercises. This is where new circuits are formed.',             key:'w5' },
  { week:6,  day:42,  title:'Six Weeks',              desc:'Morning erections should be regular and strong. Libido for real connection emerging.',             key:'w6' },
  { week:7,  day:49,  title:'Partner Readiness',      desc:'Begin partner-involved sensate focus. No penetration goal yet — only connection and sensation.',   key:'w7' },
  { week:8,  day:56,  title:'Phase 2 Complete',       desc:'Neural rewiring largely complete. Anxiety levels should be measurably lower than day 1.',         key:'w8' },
  { week:9,  day:63,  title:'Performance Phase',      desc:'Gradual penetration attempts when erection ≥ 80%. Squeeze technique active.',                     key:'w9' },
  { week:10, day:70,  title:'Breakthrough Week',      desc:'Most men report first successful penetration sessions here. Document the win.',                    key:'w10'},
  { week:11, day:77,  title:'Consistency Building',   desc:'Focus shifts from recovery to building positive sexual memories with partner.',                    key:'w11'},
  { week:12, day:84,  title:'90-Day Approach',        desc:'Ejaculation control improving. Confidence measurably higher. Review all tracker data.',           key:'w12'},
  { week:13, day:90,  title:'MISSION COMPLETE',       desc:'90-day protocol complete. Assess results. Maintain lifestyle changes permanently. You rebuilt.',  key:'w13'},
];

const protectionSteps = [
  { id: 'breathe', label: '2-min breathing' },
  { id: 'move', label: 'Leave the room' },
  { id: 'cold', label: 'Cold water reset' },
  { id: 'block', label: 'Block the trigger' },
  { id: 'message', label: 'Message support' },
  { id: 'journal', label: 'Write the urge down' },
];

const emergencySteps = [
  { id: 'stand', label: 'Stand up now' },
  { id: 'breathe', label: '10 slow breaths' },
  { id: 'water', label: 'Cold water on face' },
  { id: 'phone', label: 'Put phone away' },
  { id: 'move', label: 'Walk for 5 minutes' },
  { id: 'log', label: 'Log the trigger' },
];

// ══ CURRENT DAY ════════════════════════════════════
function getCurrentDay() {
  const start = new Date(state.startDate);
  const now = new Date();
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, Math.min(90, diff));
}

function getTodayKey() {
  return toDateKey(new Date());
}

function defaultLog() {
  return {
    habits: { noporn: true },
    me: 'none', pmo: 'clean', mast: 0,
    sleep: 7, anxiety: 5, libido: 3, conf: 2,
    relapse: { trigger: '', emotion: '', prevention: '' },
    protection: {},
    notes: '',
  };
}

function getLogByKey(key) {
  if (!state.dailyLogs[key]) {
    state.dailyLogs[key] = defaultLog();
  } else {
    const defaults = defaultLog();
    state.dailyLogs[key] = {
      ...defaults,
      ...state.dailyLogs[key],
      habits: { ...defaults.habits, ...(state.dailyLogs[key].habits || {}) },
      relapse: { ...defaults.relapse, ...(state.dailyLogs[key].relapse || {}) },
      protection: { ...defaults.protection, ...(state.dailyLogs[key].protection || {}) },
    };
  }
  return state.dailyLogs[key];
}

function getTodayLog() {
  return getLogByKey(getTodayKey());
}

// ══ RENDER HABITS ═══════════════════════════════════
function renderHabits() {
  const log = getTodayLog();
  const el = document.getElementById('habit-list');
  el.innerHTML = habits.map(h => `
    <div class="habit-item ${log.habits[h.id] ? 'checked' : ''}" onclick="toggleHabit('${h.id}')">
      <div class="habit-check">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div class="habit-content">
        <div class="habit-name">${h.label}</div>
        <div class="habit-desc">${h.desc}</div>
      </div>
      <div class="habit-pts">+${h.pts}</div>
    </div>
  `).join('');
  updateHabitScore();
}

function toggleHabit(id) {
  const log = getTodayLog();
  log.habits[id] = !log.habits[id];
  renderHabits();
  saveState();
}

function updateHabitScore() {
  const log = getTodayLog();
  const score = calculateScore(log);
  document.getElementById('habit-score-display').textContent = score + ' pts';
  document.getElementById('total-score').textContent = score;
  document.getElementById('daily-prog').style.width = score + '%';
  updateScoreRing(score);
}

function calculateScore(log) {
  let score = 0;
  const habitState = log.habits || {};
  habits.forEach(h => { if (habitState[h.id]) score += h.pts; });
  if (log.pmo === 'relapse') score = Math.max(0, score - 40);
  if (log.mast > 1) score = Math.max(0, score - 10);
  return Math.min(100, score);
}

function clampPct(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function setProgress(id, pct, textId, extraClass = '') {
  const bar = document.getElementById(id);
  const label = document.getElementById(textId);
  if (!bar || !label) return;

  const safePct = clampPct(pct);
  bar.style.width = safePct + '%';
  bar.classList.remove('green', 'yellow', 'danger');
  if (extraClass) bar.classList.add(extraClass);
  label.textContent = safePct + '%';
}

function renderRecoveryIndicators() {
  const log = getTodayLog();
  const libido = Number.isFinite(Number(log.libido)) ? Number(log.libido) : 3;
  const confidence = Number.isFinite(Number(log.conf)) ? Number(log.conf) : 2;
  const anxiety = Number.isFinite(Number(log.anxiety)) ? Number(log.anxiety) : 5;
  const anxietyControl = 100 - (anxiety / 10) * 100;

  setProgress('libido-bar', (libido / 10) * 100, 'libido-pct', 'green');
  setProgress('conf-bar', (confidence / 10) * 100, 'conf-pct', 'yellow');
  setProgress('anx-bar', anxietyControl, 'anx-pct', anxietyControl < 40 ? 'danger' : anxietyControl < 70 ? 'yellow' : 'green');
}

function updateScoreRing(score) {
  const ring = document.getElementById('score-ring');
  const circumference = 301.6;
  const offset = circumference - (score / 100) * circumference;
  ring.style.strokeDashoffset = offset;
}

// ══ TRACKERS ════════════════════════════════════════
function setME(val) {
  getTodayLog().me = val;
  document.querySelectorAll('#me-tracker .tracker-btn').forEach(b => {
    b.classList.remove('active','green');
    if (b.textContent.toLowerCase().includes(val) || b.getAttribute('onclick').includes(val)) {
      b.classList.add('active','green');
    }
  });
  saveState();
}

function setPMO(val) {
  getTodayLog().pmo = val;
  setButtonGroup('pmo-tracker', val, { clean: [0, 'green'], urge: [1, 'active'], relapse: [2, 'red'] });
  updateHabitScore();
  renderStatusSupport();
  refreshDashboard();
  saveState();
}

function setMast(val) {
  getTodayLog().mast = val;
  document.querySelectorAll('#mast-tracker .tracker-btn').forEach((b,i) => {
    b.classList.remove('active','green');
    if (i === val) b.classList.add('active', val === 0 ? 'green' : '');
  });
  updateHabitScore();
  saveState();
}

function updateSleep(val) {
  getTodayLog().sleep = parseFloat(val);
  document.getElementById('sleep-val').textContent = parseFloat(val).toFixed(1) + 'h';
  document.getElementById('sleep-display').textContent = parseFloat(val).toFixed(1);
  renderWeeklyInsights();
  saveState();
}

function updateAnxiety(val) {
  getTodayLog().anxiety = parseInt(val);
  document.getElementById('anxiety-val').textContent = val;
  document.getElementById('anxiety-display').textContent = val;
  renderRecoveryIndicators();
  renderWeeklyInsights();
  saveState();
}

function updateLibido(val) {
  getTodayLog().libido = parseInt(val);
  document.getElementById('libido-val').textContent = val;
  renderRecoveryIndicators();
  renderWeeklyInsights();
  saveState();
}

function updateConf(val) {
  getTodayLog().conf = parseInt(val);
  document.getElementById('conf-val').textContent = val;
  renderRecoveryIndicators();
  renderWeeklyInsights();
  saveState();
}

// ══ RELAPSE + PROTECTION ════════════════════════════
function renderStatusSupport() {
  const log = getTodayLog();
  const protectionPanel = document.getElementById('protection-panel');
  const relapsePanel = document.getElementById('relapse-panel');
  if (!protectionPanel || !relapsePanel) return;

  protectionPanel.classList.toggle('show', log.pmo === 'urge');
  relapsePanel.classList.toggle('show', log.pmo === 'relapse');

  renderProtectionPlan();
  const relapse = log.relapse || (log.relapse = { trigger: '', emotion: '', prevention: '' });
  document.getElementById('relapse-trigger').value = relapse.trigger || '';
  document.getElementById('relapse-emotion').value = relapse.emotion || '';
  document.getElementById('relapse-prevention').value = relapse.prevention || '';
}

function renderProtectionPlan() {
  const el = document.getElementById('protection-list');
  if (!el) return;
  const log = getTodayLog();
  if (!log.protection) log.protection = {};

  el.innerHTML = protectionSteps.map(step => `
    <button class="protection-item ${log.protection[step.id] ? 'checked' : ''}" type="button" onclick="toggleProtectionStep('${step.id}')">
      <span class="habit-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span>
      ${step.label}
    </button>
  `).join('');
}

function toggleProtectionStep(id) {
  const log = getTodayLog();
  if (!log.protection) log.protection = {};
  log.protection[id] = !log.protection[id];
  renderProtectionPlan();
  saveState();
}

function updateRelapseAnalysis(field, value) {
  const log = getTodayLog();
  if (!log.relapse) log.relapse = { trigger: '', emotion: '', prevention: '' };
  log.relapse[field] = value;
  saveState();
}

// ══ STREAK ══════════════════════════════════════════
function calcStreak() {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 90; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const log = state.dailyLogs[key];
    if (log && log.pmo === 'clean') streak++;
    else break;
  }
  return streak;
}

function updateStreak() {
  const streak = calcStreak();
  document.getElementById('streak-display').textContent = streak;
  document.getElementById('pmo-streak').textContent = streak;
}

// ══ CALENDAR ═════════════════════════════════════════
function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  const label = document.getElementById('calendar-month');
  if (!grid) return;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = toDateKey(today);
  const dayNames = ['S','M','T','W','T','F','S'];
  const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (label) label.textContent = monthName;

  const cells = dayNames.map(day => `<div class="calendar-head">${day}</div>`);
  for (let i = 0; i < firstDay.getDay(); i++) {
    cells.push('<div class="calendar-day empty" aria-hidden="true"></div>');
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const key = toDateKey(date);
    const log = state.dailyLogs[key];
    let cls = 'calendar-day';
    let title = `Day ${day}`;

    if (log?.pmo === 'clean') {
      cls += ' clean';
      title += ' - clean';
    } else if (log?.pmo === 'urge') {
      cls += ' urge';
      title += ' - urge';
    } else if (log?.pmo === 'relapse') {
      cls += ' relapse';
      title += ' - relapse';
    }

    if (key === todayKey) cls += ' today';
    cells.push(`<button class="${cls}" type="button" title="${title}" aria-label="${title}" onclick="openCalendarDetail('${key}')">${day}</button>`);
  }

  grid.innerHTML = cells.join('');
}

function renderWeeklyInsights() {
  const el = document.getElementById('weekly-insights');
  if (!el) return;

  const today = new Date();
  const logs = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = toDateKey(d);
    logs.push(state.dailyLogs[key] || null);
  }

  const filled = logs.filter(Boolean);
  const cleanDays = logs.filter(log => log?.pmo === 'clean').length;
  const urgeDays = logs.filter(log => log?.pmo === 'urge').length;
  const relapseDays = logs.filter(log => log?.pmo === 'relapse').length;
  const avg = (field, fallback = 0) => {
    const values = filled.map(log => Number(log[field])).filter(Number.isFinite);
    if (!values.length) return fallback;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  };

  const avgSleep = avg('sleep', 0);
  const avgAnxiety = avg('anxiety', 0);
  const avgLibido = avg('libido', 0);
  const avgConf = avg('conf', 0);

  el.innerHTML = `
    <div class="insight-item"><div class="insight-value">${cleanDays}/7</div><div class="insight-label">Clean Days</div></div>
    <div class="insight-item"><div class="insight-value">${relapseDays}</div><div class="insight-label">Relapse</div></div>
    <div class="insight-item"><div class="insight-value">${avgSleep ? avgSleep.toFixed(1) : '--'}h</div><div class="insight-label">Avg Sleep</div></div>
    <div class="insight-item"><div class="insight-value">${filled.length ? avgAnxiety.toFixed(1) : '--'}</div><div class="insight-label">Avg Anxiety</div></div>
    <div class="insight-item"><div class="insight-value">${urgeDays}</div><div class="insight-label">Urge Days</div></div>
    <div class="insight-item"><div class="insight-value">${filled.length ? avgLibido.toFixed(1) : '--'}</div><div class="insight-label">Avg Libido</div></div>
    <div class="insight-item"><div class="insight-value">${filled.length ? avgConf.toFixed(1) : '--'}</div><div class="insight-label">Avg Confidence</div></div>
    <div class="insight-item"><div class="insight-value">${filled.length}</div><div class="insight-label">Logged Days</div></div>
  `;
}

function getLogsForRange(days, offset = 0) {
  const today = new Date();
  const rows = [];
  for (let i = days - 1 + offset; i >= offset; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    rows.push(state.dailyLogs[toDateKey(d)] || null);
  }
  return rows;
}

function averageLogs(logs, field) {
  const values = logs.filter(Boolean).map(log => Number(log[field])).filter(Number.isFinite);
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function renderTrendSummary() {
  const el = document.getElementById('trend-summary');
  if (!el) return;

  const current = getLogsForRange(7, 0);
  const previous = getLogsForRange(7, 7);
  const currentClean = current.filter(log => log?.pmo === 'clean').length;
  const previousClean = previous.filter(log => log?.pmo === 'clean').length;
  const currentRelapse = current.filter(log => log?.pmo === 'relapse').length;
  const previousRelapse = previous.filter(log => log?.pmo === 'relapse').length;
  const currentAnxiety = averageLogs(current, 'anxiety');
  const previousAnxiety = averageLogs(previous, 'anxiety');
  const currentSleep = averageLogs(current, 'sleep');
  const previousSleep = averageLogs(previous, 'sleep');

  const trends = [];
  const cleanDiff = currentClean - previousClean;
  trends.push({
    cls: cleanDiff >= 0 ? 'good' : 'warn',
    text: cleanDiff === 0 ? `Clean days are steady at ${currentClean}/7.` : `Clean days ${cleanDiff > 0 ? 'improved' : 'dropped'} by ${Math.abs(cleanDiff)} compared with the previous week.`,
  });

  const relapseDiff = currentRelapse - previousRelapse;
  trends.push({
    cls: relapseDiff <= 0 ? 'good' : 'bad',
    text: relapseDiff === 0 ? `Relapse count is unchanged at ${currentRelapse}.` : `Relapse count ${relapseDiff > 0 ? 'increased' : 'decreased'} by ${Math.abs(relapseDiff)} this week.`,
  });

  if (currentAnxiety !== null && previousAnxiety !== null) {
    const diff = currentAnxiety - previousAnxiety;
    trends.push({
      cls: diff <= 0 ? 'good' : 'warn',
      text: `Average anxiety ${diff <= 0 ? 'improved' : 'rose'} by ${Math.abs(diff).toFixed(1)} points.`,
    });
  }

  if (currentSleep !== null && previousSleep !== null) {
    const diff = currentSleep - previousSleep;
    trends.push({
      cls: diff >= 0 ? 'good' : 'warn',
      text: `Average sleep ${diff >= 0 ? 'increased' : 'decreased'} by ${Math.abs(diff).toFixed(1)} hours.`,
    });
  }

  el.innerHTML = trends.map(t => `<div class="trend-item ${t.cls}">${t.text}</div>`).join('');
}

// ══ PROGRESS CHART ══════════════════════════════════
let chartMetric = 'score';

function setChartMetric(metric) {
  chartMetric = metric;
  document.querySelectorAll('.chart-tab').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.chart-tab').forEach(btn => {
    if (btn.getAttribute('onclick')?.includes(`'${metric}'`)) btn.classList.add('active');
  });
  renderProgressChart();
}

function renderProgressChart() {
  const canvas = document.getElementById('progress-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const points = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = toDateKey(d);
    const log = state.dailyLogs[key];
    let value = null;
    if (log) {
      if (chartMetric === 'score') value = calculateScore(log);
      else if (chartMetric === 'sleep') value = Math.round((Number(log.sleep || 0) / 10) * 100);
      else if (chartMetric === 'anxiety') value = 100 - Math.round((Number(log.anxiety || 0) / 10) * 100);
      else value = Math.round((Number(log[chartMetric] || 0) / 10) * 100);
    }
    points.push({ value, day: d.getDate() });
  }

  const pad = 28;
  const chartW = w - pad * 2;
  const chartH = h - pad * 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(w - pad, y);
    ctx.stroke();
  }

  const plotted = points.map((p, i) => ({
    x: pad + (chartW / 29) * i,
    y: p.value === null ? null : pad + chartH - (p.value / 100) * chartH,
    value: p.value,
    day: p.day,
  }));

  ctx.strokeStyle = '#0a6ef5';
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  let started = false;
  plotted.forEach(p => {
    if (p.y === null) return;
    if (!started) {
      ctx.moveTo(p.x, p.y);
      started = true;
    } else {
      ctx.lineTo(p.x, p.y);
    }
  });
  if (started) ctx.stroke();

  plotted.forEach((p, i) => {
    if (p.y === null) return;
    ctx.fillStyle = i === plotted.length - 1 ? '#00d4ff' : '#0a6ef5';
    ctx.beginPath();
    ctx.arc(p.x, p.y, i === plotted.length - 1 ? 5 : 3, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = '#5a6880';
  ctx.font = '11px monospace';
  ctx.fillText('0', 4, h - pad + 4);
  ctx.fillText('100', 4, pad + 4);
  ctx.fillText(points[0].day, pad - 6, h - 8);
  ctx.fillText(points[points.length - 1].day, w - pad - 6, h - 8);

  if (!started) {
    ctx.fillStyle = '#5a6880';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No chart data yet', w / 2, h / 2);
    ctx.textAlign = 'left';
  }
}

function renderMonthlyReport() {
  const el = document.getElementById('monthly-report');
  const label = document.getElementById('monthly-report-label');
  if (!el) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const logs = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const key = toDateKey(new Date(year, month, day));
    if (state.dailyLogs[key]) logs.push(state.dailyLogs[key]);
  }

  if (label) label.textContent = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const clean = logs.filter(log => log.pmo === 'clean').length;
  const urge = logs.filter(log => log.pmo === 'urge').length;
  const relapse = logs.filter(log => log.pmo === 'relapse').length;
  const cleanRate = logs.length ? Math.round((clean / logs.length) * 100) : 0;
  const avgSleep = averageLogs(logs, 'sleep');
  const avgAnxiety = averageLogs(logs, 'anxiety');
  const avgScore = logs.length ? logs.reduce((sum, log) => sum + calculateScore(log), 0) / logs.length : null;

  el.innerHTML = `
    <div class="insight-item"><div class="insight-value">${logs.length}</div><div class="insight-label">Logged Days</div></div>
    <div class="insight-item"><div class="insight-value">${cleanRate}%</div><div class="insight-label">Clean Rate</div></div>
    <div class="insight-item"><div class="insight-value">${relapse}</div><div class="insight-label">Relapse</div></div>
    <div class="insight-item"><div class="insight-value">${urge}</div><div class="insight-label">Urge Days</div></div>
    <div class="insight-item"><div class="insight-value">${avgSleep === null ? '--' : avgSleep.toFixed(1) + 'h'}</div><div class="insight-label">Avg Sleep</div></div>
    <div class="insight-item"><div class="insight-value">${avgAnxiety === null ? '--' : avgAnxiety.toFixed(1)}</div><div class="insight-label">Avg Anxiety</div></div>
    <div class="insight-item"><div class="insight-value">${avgScore === null ? '--' : Math.round(avgScore)}</div><div class="insight-label">Avg Score</div></div>
    <div class="insight-item"><div class="insight-value">${calcStreak()}</div><div class="insight-label">Current Streak</div></div>
  `;
}

// ══ CALENDAR DETAIL ═════════════════════════════════
let selectedDetailKey = null;

function formatDisplayDate(key) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function setButtonGroup(containerId, value, map) {
  const buttons = document.querySelectorAll(`#${containerId} .tracker-btn`);
  buttons.forEach(btn => btn.classList.remove('active', 'green', 'red'));
  const config = map[value];
  if (config && buttons[config[0]]) buttons[config[0]].classList.add('active', config[1]);
}

function refreshTodayControls() {
  const log = getTodayLog();
  setButtonGroup('pmo-tracker', log.pmo, { clean: [0, 'green'], urge: [1, 'active'], relapse: [2, 'red'] });
  document.getElementById('sleep-slider').value = log.sleep ?? 7;
  document.getElementById('sleep-val').textContent = Number(log.sleep ?? 7).toFixed(1) + 'h';
  document.getElementById('sleep-display').textContent = Number(log.sleep ?? 7).toFixed(1);
  document.getElementById('anxiety-slider').value = log.anxiety ?? 5;
  document.getElementById('anxiety-val').textContent = log.anxiety ?? 5;
  document.getElementById('anxiety-display').textContent = log.anxiety ?? 5;
  document.getElementById('libido-slider').value = log.libido ?? 3;
  document.getElementById('libido-val').textContent = log.libido ?? 3;
  document.getElementById('conf-slider').value = log.conf ?? 2;
  document.getElementById('conf-val').textContent = log.conf ?? 2;
  updateHabitScore();
  renderRecoveryIndicators();
  renderStatusSupport();
}

function refreshDashboard() {
  updateStreak();
  renderCalendar();
  renderWeeklyInsights();
  renderTrendSummary();
  renderRecoveryIndicators();
  renderProgressChart();
  renderMonthlyReport();
}

function openCalendarDetail(key) {
  selectedDetailKey = key;
  const log = getLogByKey(key);
  const modal = document.getElementById('calendar-modal');
  document.getElementById('calendar-detail-title').textContent = formatDisplayDate(key);
  setButtonGroup('detail-pmo', log.pmo, { clean: [0, 'green'], urge: [1, 'active'], relapse: [2, 'red'] });

  document.getElementById('detail-sleep').value = log.sleep ?? 7;
  document.getElementById('detail-sleep-val').textContent = Number(log.sleep ?? 7).toFixed(1) + 'h';
  document.getElementById('detail-anxiety').value = log.anxiety ?? 5;
  document.getElementById('detail-anxiety-val').textContent = log.anxiety ?? 5;
  document.getElementById('detail-libido').value = log.libido ?? 3;
  document.getElementById('detail-libido-val').textContent = log.libido ?? 3;
  document.getElementById('detail-conf').value = log.conf ?? 2;
  document.getElementById('detail-conf-val').textContent = log.conf ?? 2;
  document.getElementById('detail-notes').value = log.notes || '';

  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
}

function closeCalendarDetail() {
  const modal = document.getElementById('calendar-modal');
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  selectedDetailKey = null;
}

function setDetailPMO(value) {
  if (!selectedDetailKey) return;
  const log = getLogByKey(selectedDetailKey);
  log.pmo = value;
  setButtonGroup('detail-pmo', value, { clean: [0, 'green'], urge: [1, 'active'], relapse: [2, 'red'] });
  if (selectedDetailKey === getTodayKey()) refreshTodayControls();
  saveState();
  refreshDashboard();
}

function updateDetailMetric(field, value) {
  if (!selectedDetailKey) return;
  const log = getLogByKey(selectedDetailKey);
  const numeric = field === 'sleep' ? parseFloat(value) : parseInt(value);
  log[field] = numeric;

  if (field === 'sleep') document.getElementById('detail-sleep-val').textContent = numeric.toFixed(1) + 'h';
  if (field === 'anxiety') document.getElementById('detail-anxiety-val').textContent = numeric;
  if (field === 'libido') document.getElementById('detail-libido-val').textContent = numeric;
  if (field === 'conf') document.getElementById('detail-conf-val').textContent = numeric;

  if (selectedDetailKey === getTodayKey()) refreshTodayControls();
  saveState();
  refreshDashboard();
}

function updateDetailNotes(value) {
  if (!selectedDetailKey) return;
  getLogByKey(selectedDetailKey).notes = value;
  saveState();
}

// ══ EMERGENCY MODE ══════════════════════════════════
let emergencyTimer = null;
let emergencyRemaining = 600;
let emergencyChecks = {};

function startEmergencyMode() {
  emergencyRemaining = 600;
  emergencyChecks = {};
  renderEmergencyMode();
  const modal = document.getElementById('emergency-modal');
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  if (emergencyTimer) clearInterval(emergencyTimer);
  emergencyTimer = setInterval(() => {
    emergencyRemaining = Math.max(0, emergencyRemaining - 1);
    updateEmergencyTimer();
    if (emergencyRemaining === 0) completeEmergencyMode();
  }, 1000);
}

function updateEmergencyTimer() {
  const title = document.getElementById('emergency-title');
  if (!title) return;
  const mins = String(Math.floor(emergencyRemaining / 60)).padStart(2, '0');
  const secs = String(emergencyRemaining % 60).padStart(2, '0');
  title.textContent = `${mins}:${secs}`;
}

function renderEmergencyMode() {
  updateEmergencyTimer();
  const list = document.getElementById('emergency-list');
  if (!list) return;
  list.innerHTML = emergencySteps.map(step => `
    <button class="protection-item ${emergencyChecks[step.id] ? 'checked' : ''}" type="button" onclick="toggleEmergencyStep('${step.id}')">
      <span class="habit-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span>
      ${step.label}
    </button>
  `).join('');
}

function toggleEmergencyStep(id) {
  emergencyChecks[id] = !emergencyChecks[id];
  renderEmergencyMode();
}

function closeEmergencyMode() {
  if (emergencyTimer) clearInterval(emergencyTimer);
  emergencyTimer = null;
  const modal = document.getElementById('emergency-modal');
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
}

function completeEmergencyMode() {
  const log = getTodayLog();
  if (!log.protection) log.protection = {};
  Object.keys(emergencyChecks).forEach(key => {
    if (emergencyChecks[key]) log.protection[key] = true;
  });
  closeEmergencyMode();
  renderStatusSupport();
  saveState();
}

// ══ MILESTONES ═══════════════════════════════════════
function renderMilestones() {
  const day = getCurrentDay();
  const el = document.getElementById('milestone-list');
  el.innerHTML = milestoneData.map(m => {
    const unlocked = day >= m.day;
    const checked = !!state.milestones[m.key];
    return `
      <button class="milestone-item ${checked ? 'reached' : ''} ${unlocked ? 'unlocked' : ''}" type="button" onclick="toggleMilestone('${m.key}')" aria-pressed="${checked}">
        <div style="flex:1;">
          <div class="milestone-day">WEEK ${m.week} — DAY ${m.day}</div>
          <div class="milestone-title">${m.title}</div>
          <div class="milestone-desc">${m.desc}</div>
        </div>
        <div class="milestone-status">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      </button>
    `;
  }).join('');
}

function toggleMilestone(key) {
  state.milestones[key] = !state.milestones[key];
  saveState();
  renderMilestones();
}

// ══ DAY COUNTER ══════════════════════════════════════
function updateDayCounter() {
  const day = getCurrentDay();
  document.getElementById('day-counter').innerHTML = `${day}<span class="unit">/ 90</span>`;
  document.getElementById('day-badge').textContent = `Day ${day}`;
  const pct = Math.round((day / 90) * 100);
  document.getElementById('overall-prog').style.width = pct + '%';
  document.getElementById('prog-pct').textContent = pct + '%';

  const phase = day <= 30 ? 1 : day <= 60 ? 2 : 3;
  const phaseLabels = {1:'Reset', 2:'Rewiring', 3:'Performance'};
  document.getElementById('current-phase').textContent = phase;
  document.getElementById('phase-label').textContent = phaseLabels[phase];
}

function renderProgramSettings() {
  const input = document.getElementById('start-date-input');
  if (input) input.value = state.startDate;
}

function updateStartDate(value) {
  if (!value) return;
  state.startDate = value;
  saveState();
  updateDayCounter();
  renderMilestones();
  refreshDashboard();
}

function resetProgram() {
  if (!confirm('Reset program? This clears daily logs and milestone checks, but keeps reminder settings.')) return;
  state.startDate = getTodayKey();
  state.dailyLogs = {};
  state.milestones = {};
  saveState();
  init();
}

// ══ SAVE ═════════════════════════════════════════════
function saveState() {
  try {
    localStorage.setItem('rewire_state', JSON.stringify(state));
  } catch {
    alert('Storage is full or blocked. Your latest changes could not be saved on this device.');
  }
}

function saveDay() {
  saveState();
  refreshDashboard();
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ══ BACKUP DATA ══════════════════════════════════════
function normalizeState(nextState) {
  return {
    startDate: nextState?.startDate || new Date().toISOString().split('T')[0],
    dailyLogs: nextState?.dailyLogs && typeof nextState.dailyLogs === 'object' ? nextState.dailyLogs : {},
    currentDay: nextState?.currentDay || 1,
    milestones: nextState?.milestones && typeof nextState.milestones === 'object' ? nextState.milestones : {},
    reminder: nextState?.reminder && typeof nextState.reminder === 'object' ? nextState.reminder : { enabled: false, time: '21:00' },
  };
}

function exportData() {
  const payload = {
    app: 'ReWire',
    version: 1,
    exportedAt: new Date().toISOString(),
    state,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `rewire-backup-${getTodayKey()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const importedState = parsed.state || parsed;
      if (!importedState || typeof importedState !== 'object') throw new Error('Invalid backup');
      if (!confirm('Import backup data? This will replace current local progress.')) return;

      state = normalizeState(importedState);
      saveState();
      init();
      alert('Backup imported successfully.');
    } catch {
      alert('Import failed. Please choose a valid ReWire JSON backup file.');
    } finally {
      event.target.value = '';
    }
  };
  reader.readAsText(file);
}

// ══ REMINDERS ═══════════════════════════════════════
let reminderTimer = null;

function renderReminderSettings() {
  const timeInput = document.getElementById('reminder-time');
  const btn = document.getElementById('reminder-btn');
  const status = document.getElementById('reminder-status');
  if (!timeInput || !btn || !status) return;

  timeInput.value = state.reminder?.time || '21:00';
  btn.textContent = state.reminder?.enabled ? 'Disable Reminder' : 'Enable Reminder';
  status.textContent = state.reminder?.enabled
    ? `Reminder is on for ${state.reminder.time}. Keep the PWA/browser active for local reminders.`
    : 'Reminder is off. Works while the PWA/browser is active; Android may pause local timers when fully closed.';
  scheduleReminder();
}

function updateReminderTime(value) {
  state.reminder.time = value || '21:00';
  saveState();
  renderReminderSettings();
}

async function toggleReminder() {
  if (!state.reminder.enabled) {
    if (!('Notification' in window)) {
      alert('Notifications are not supported in this browser.');
      return;
    }
    const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    if (permission !== 'granted') {
      alert('Notification permission was not granted.');
      return;
    }
    state.reminder.enabled = true;
  } else {
    state.reminder.enabled = false;
  }
  saveState();
  renderReminderSettings();
}

function scheduleReminder() {
  if (reminderTimer) clearTimeout(reminderTimer);
  if (!('Notification' in window) || !state.reminder?.enabled || !state.reminder?.time || Notification.permission !== 'granted') return;

  const [hour, minute] = state.reminder.time.split(':').map(Number);
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  if (next <= new Date()) next.setDate(next.getDate() + 1);

  reminderTimer = setTimeout(() => {
    showReminderNotification();
    scheduleReminder();
  }, next - new Date());
}

function showReminderNotification() {
  const title = 'ReWire Daily Log';
  const options = {
    body: 'Take one minute to log today and protect your streak.',
    icon: 'assets/icons/icon-192.png',
    badge: 'assets/icons/icon-192.png',
  };

  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.ready.then(reg => reg.showNotification(title, options)).catch(() => new Notification(title, options));
  } else {
    new Notification(title, options);
  }
}

// ══ NAVIGATION ═══════════════════════════════════════
function showPage(id) {
  const page = document.getElementById('page-' + id);
  if (!page) return;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  page.classList.add('active');
  const tabs = document.querySelectorAll('.nav-tab');
  const idx = ['dashboard','tracker','phases','protocol','milestones','science','alerts'];
  const activeTab = tabs[idx.indexOf(id)];
  activeTab?.classList.add('active');
  activeTab?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  if (id === 'dashboard') {
    refreshDashboard();
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ══ BREATHING ════════════════════════════════════════
let breathInterval = null;
const breathPhases = [{text:'Inhale',dur:4000},{text:'Hold',dur:4000},{text:'Exhale',dur:4000},{text:'Hold',dur:4000}];

function startBreathing() {
  if (breathInterval) { clearInterval(breathInterval); breathInterval = null; return; }
  let phase = 0;
  const circle = document.getElementById('breath-circle');
  const lbl = document.getElementById('breath-label');
  function tick() {
    const p = breathPhases[phase % 4];
    circle.textContent = p.text;
    lbl.textContent = `${p.text} — ${p.dur/1000} seconds`;
    phase++;
  }
  tick();
  breathInterval = setInterval(tick, 4000);
  setTimeout(() => { clearInterval(breathInterval); breathInterval = null;
    circle.textContent = 'Done ✓'; lbl.textContent = 'Great session! Mark breathing habit as complete.';
  }, 120000);
}

// ══ PWA INSTALL ══════════════════════════════════════
let deferredPrompt = null;
const banner = document.getElementById('install-banner');
const installBtn = document.getElementById('install-btn');
const dismissBtn = document.getElementById('dismiss-btn');
const installMessage = document.getElementById('install-message');
const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent);
const isAndroid = /Android/i.test(navigator.userAgent);
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

function setInstallCopy(mode) {
  if (!installMessage || !installBtn) return;

  if (mode === 'ready') {
    installMessage.textContent = 'Install on Android for full-screen use and offline access.';
    installBtn.textContent = 'Install';
    return;
  }

  if (isIos) {
    installMessage.textContent = 'Tap Share, then Add to Home Screen.';
    installBtn.textContent = 'How';
    return;
  }

  installMessage.textContent = 'Use Chrome menu, then Install app or Add to Home screen.';
  installBtn.textContent = 'How';
}

function showInstallBanner(mode = 'help') {
  if (!banner || isStandalone || localStorage.getItem('install_dismissed')) return;
  setInstallCopy(mode);
  banner.classList.add('show');
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallBanner('ready');
});

installBtn.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      banner.classList.remove('show');
      localStorage.setItem('install_dismissed','1');
    }
    deferredPrompt = null;
  } else {
    alert('Install instructions:\n\nAndroid Chrome: tap Menu (⋮), then Install app or Add to Home screen.\n\niPhone Safari: tap Share, then Add to Home Screen.');
  }
});

dismissBtn.addEventListener('click', () => {
  banner.classList.remove('show');
  localStorage.setItem('install_dismissed','1');
});

window.addEventListener('appinstalled', () => {
  banner.classList.remove('show');
  deferredPrompt = null;
  localStorage.setItem('install_dismissed','1');
});

if (!isStandalone && !localStorage.getItem('install_dismissed')) {
  setTimeout(() => {
    if (!deferredPrompt) showInstallBanner(isAndroid ? 'help' : 'help');
  }, 1800);
}

document.getElementById('calendar-modal')?.addEventListener('click', (event) => {
  if (event.target.id === 'calendar-modal') closeCalendarDetail();
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && document.getElementById('calendar-modal')?.classList.contains('show')) {
    closeCalendarDetail();
  }
  if (event.key === 'Escape' && document.getElementById('emergency-modal')?.classList.contains('show')) {
    closeEmergencyMode();
  }
});

// ══ INIT ═════════════════════════════════════════════
function init() {
  updateDayCounter();
  renderHabits();
  renderStatusSupport();
  renderCalendar();
  renderWeeklyInsights();
  renderTrendSummary();
  renderProgressChart();
  renderMonthlyReport();
  renderMilestones();
  renderReminderSettings();
  renderProgramSettings();
  updateStreak();

  // Restore sliders
  const log = getTodayLog();
  document.getElementById('sleep-slider').value = log.sleep ?? 7;
  updateSleep(log.sleep ?? 7);
  document.getElementById('anxiety-slider').value = log.anxiety !== undefined ? log.anxiety : 5;
  updateAnxiety(log.anxiety !== undefined ? log.anxiety : 5);
  document.getElementById('libido-slider').value = log.libido ?? 3;
  updateLibido(log.libido ?? 3);
  document.getElementById('conf-slider').value = log.conf ?? 2;
  updateConf(log.conf ?? 2);

  // Restore PMO status
  if (log.pmo) setPMO(log.pmo);
}

init();
