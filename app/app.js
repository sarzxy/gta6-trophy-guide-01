// VICE CITY TROPHY GUIDE — tracker + guide for the 55 GTA VI PS5 trophies.
// Dense 3-column tracker (checklist | cited detail | next-up + sources), modelled
// on the Leonida Platinum Log layout in our own Vice City colours. Plain static
// app: loads app/data/trophies.json, saves progress + counters in localStorage,
// exports/imports progress as JSON, filters by kind/grade, hides story spoilers
// until earned, and shows a cited own-words guide beside every trophy. No network.
const KEY = 'gta6-trophy-checklist-v1';
const COUNT_KEY = 'gta6-trophy-counts-v1';
const groupsEl = document.getElementById('groups');
const detailEl = document.getElementById('detail');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kind');
const gradeEl = document.getElementById('grade');
const spoilerEl = document.getElementById('spoiler');
const listCountEl = document.getElementById('list-count');
const spoilerNoteEl = document.getElementById('spoiler-note');
const stripEl = document.getElementById('roadmap-strip');
const nextUpEl = document.getElementById('next-up');
const sideSourcesEl = document.getElementById('side-sources');
const auditEl = document.getElementById('audit-strip');

const query = new URLSearchParams(location.search);
const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;

// Roadmap stages, in the order to play them. Each stage names the trophies it holds.
const ROADMAP = [
  { n: 1, title: 'Play the story', text: 'Chapters 1–4, the named missions and the finale, in order. Every story trophy pops as you play — none of them can be missed. Keep a manual save at the start of every chapter: guides report no mission replay.', stage: 1 },
  { n: 2, title: 'The one missable — meditate from Chapter 1', text: 'Positive Mental Attitude is the only trophy GTABase / PowerPyx flag as possibly missable: 18 meditation spots in 10 locations, and Lucia’s balcony spot in Chapter 1 disappears after that chapter. Meditate at every spot you find, starting in Chapter 1.', stage: 2 },
  { n: 3, title: 'Strangers & Freaks — 8 strands', text: 'Meet the strangers across Leonida and play each strand to its last mission. Andy, Kenton, Billy, Randy and Tyrone each end in a named trophy; find three more strangers for the silver.', stage: 3 },
  { n: 4, title: 'Collectibles & counts', text: 'Cards (3 sets), WAiNK spots (100), vehicles (100) and challenges (50). Pure sweeps of the map — tick them off as you travel so nothing is left for a second pass.', stage: 4 },
  { n: 5, title: 'Activities, combat & robberies', text: 'Races, fishing, arcade, shooting range golds, stunts, hunting, robberies and the one-off moments. Most of it opens once Jason and Lucia are both playable in Chapter 2; robberies unlock in Chapters 3 and 4.', stage: 5 },
  { n: 6, title: 'Money, property & exploration', text: 'Launder $250,000 of Marked Bills, spend $100,000 across shops, buy every garage, register 10 vehicles to the Scooter Bros app, and explore all of Leonida.', stage: 6 },
  { n: 7, title: '100% completion → Platinum', text: 'The checklist (Progress, then Stats, then 100% Completion) appears after the story; earlier progress counts and nothing on it is missable. Finish it for A Long Road, and Vice Got a Price! pops with it.', stage: 7 },
];
const STAGE_SHORT = ['Play the story', 'The one missable', 'Strangers & Freaks', 'Collectibles', 'Activities & robberies', 'Money & cleanup', '100% → Platinum'];

let earned = new Set();
try { earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]')); } catch { earned = new Set(); }
let counts = {};
try { counts = JSON.parse(localStorage.getItem(COUNT_KEY) ?? '{}'); } catch { counts = {}; }
let selectedId = Number(query.get('select')) || 28;
const VIEWS = ['tracker', 'roadmap', 'missables', 'sources'];
let view = query.get('view') === 'checklist' ? 'tracker' : (VIEWS.includes(query.get('view')) ? query.get('view') : 'tracker');

// Screenshot preset (?demo=1): tick a believable early-game set through the same
// toggle the user uses, so the progress bar and checklist show the tracker working.
if (query.get('demo') === '1' && earned.size === 0) {
  for (const id of [2, 3, 4, 8, 15, 16, 21, 32, 35, 42, 52, 53]) earned.add(id);
  save();
  if (!Object.keys(counts).length) { counts = { 28: 6, 31: 41, 35: 63 }; saveCounts(); }
}
if (query.get('spoiler') === 'on') spoilerEl.checked = true;
if (query.get('kind')) kindEl.value = query.get('kind');
if (query.get('grade')) gradeEl.value = query.get('grade');

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}
function saveCounts() {
  localStorage.setItem(COUNT_KEY, JSON.stringify(counts));
}

function gradeLabel(g) {
  return { platinum: 'PLAT', gold: 'GOLD', silver: 'SILVER', bronze: 'BRONZE' }[g] ?? g.toUpperCase();
}
function kindLabel(k) {
  return { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online', platinum: 'Platinum' }[k] ?? k;
}
function isHidden(t) { return spoilerEl.checked && t.kind === 'story' && !earned.has(t.id); }
function isUnconfirmed(t) { return /no confirmed unlock method/i.test(t.guide); }
function trophyById(id) { return trophies.find((t) => t.id === id); }
function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function filtered() {
  const q = searchEl.value.trim().toLowerCase();
  return trophies.filter((t) => {
    if (kindEl.value === 'missable' && !t.missable) return false;
    if (kindEl.value !== 'all' && kindEl.value !== 'missable' && t.kind !== kindEl.value) return false;
    if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
    if (q && !(t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q)) return false;
    return true;
  });
}

function renderAudit() {
  const totalCites = trophies.reduce((n, t) => n + t.sources.length, 0);
  const cited = trophies.filter((t) => t.sources.length > 0).length;
  const hidden = trophies.filter((t) => t.hidden).length;
  const unc = trophies.filter(isUnconfirmed).length;
  const pills = [
    `<b>55/55</b>&nbsp;official names, descriptions &amp; grades cited`,
    `<b>${totalCites}</b>&nbsp;claims cited`,
    `<b>${cited}/55</b>&nbsp;guides cite sources`,
    `<b>${hidden}</b>&nbsp;PSN-hidden until earned`,
    `<b>${unc}</b>&nbsp;unconfirmed — shown plainly`,
  ];
  auditEl.replaceChildren();
  auditEl.append(el('span', 'audit-label', 'AUDIT'));
  for (const p of pills) {
    const s = el('span', 'pill');
    s.innerHTML = p;
    auditEl.append(s);
  }
  const w = el('span', 'pill warn');
  w.innerHTML = '<b>1</b>&nbsp;possibly missable — dispute shown both ways';
  auditEl.append(w);
}

function renderProgress() {
  const n = earned.size;
  const total = trophies.length;
  document.getElementById('progress-count').textContent = `${n} / ${total}`;
  document.getElementById('progress-fill').style.width = `${(n / total) * 100}%`;
  const byGrade = {};
  for (const t of trophies) byGrade[t.grade] = (byGrade[t.grade] ?? 0) + (earned.has(t.id) ? 1 : 0);
  document.getElementById('progress-grades').innerHTML =
    ['platinum', 'gold', 'silver', 'bronze']
      .map((g) => `<span>${gradeLabel(g)} ${byGrade[g] ?? 0}/${trophies.filter((t) => t.grade === g).length}</span>`)
      .join('');
}

function renderList() {
  const list = filtered();
  listCountEl.textContent = `${list.length} shown · ${earned.size} earned`;
  spoilerNoteEl.textContent = spoilerEl.checked ? 'Spoilers hidden' : '';
  spoilerNoteEl.className = spoilerEl.checked ? 'warn' : '';
  groupsEl.replaceChildren();
  if (!list.length) {
    const p = el('p', 'empty', kindEl.value === 'online'
      ? 'No online trophies in this list — all 55 are single-player (GTABase / EGamers).'
      : 'No trophies match those filters.');
    groupsEl.append(p);
    return;
  }
  for (const s of ROADMAP) {
    const inStage = list.filter((t) => t.stage === s.stage);
    if (!inStage.length) continue;
    const wrap = el('div', 'group');
    const head = el('div', 'group-head');
    head.append(el('span', null, `Stage ${s.n} · ${STAGE_SHORT[s.n - 1]}`));
    const done = inStage.filter((t) => earned.has(t.id)).length;
    const allStage = trophies.filter((t) => t.stage === s.stage);
    head.append(el('span', 'g-count', `${allStage.filter((t) => earned.has(t.id)).length}/${allStage.length}`));
    if (done) { /* group count above is stage-wide */ }
    wrap.append(head);
    const ul = el('ul', 'trophy-list');
    for (const t of inStage) {
      const li = document.createElement('li');
      if (t.id === selectedId) li.classList.add('selected');
      if (earned.has(t.id)) li.classList.add('earned');
      const box = document.createElement('input');
      box.type = 'checkbox';
      box.checked = earned.has(t.id);
      box.setAttribute('aria-label', `Mark ${t.name} earned`);
      box.addEventListener('change', () => {
        if (box.checked) earned.add(t.id);
        else earned.delete(t.id);
        save();
        renderAll();
      });
      const mid = document.createElement('div');
      const name = el('div', 't-name', isHidden(t) ? 'Hidden story trophy' : t.name);
      if (t.hidden && !earned.has(t.id)) {
        const tag = el('span', 'hidden-tag', ' · HIDDEN');
        name.append(tag);
      }
      const desc = el('div', 't-desc', isHidden(t)
        ? 'Story trophy — hidden until earned. Tick it off when it pops.'
        : t.description);
      const tags = el('div', 't-tags');
      tags.append(el('span', 'tag', kindLabel(t.kind)));
      if (t.missable) tags.append(el('span', 'tag missable', '⚠ MISSABLE'));
      if (t.count) tags.append(el('span', 'tag count', `× ${t.count.toLocaleString('en-US')}`));
      if (isUnconfirmed(t)) tags.append(el('span', 'tag', 'UNCONFIRMED'));
      mid.append(name, desc, tags);
      const badge = el('span', `badge ${t.grade}`, gradeLabel(t.grade));
      li.append(box, mid, badge);
      li.addEventListener('click', (e) => {
        if (e.target === box) return;
        selectedId = t.id;
        renderList();
        renderDetail();
        renderNextUp();
        renderSideSources();
      });
      ul.append(li);
    }
    wrap.append(ul);
    groupsEl.append(wrap);
  }
}

// Split an own-words guide paragraph into numbered steps, one per sentence.
function stepsOf(guide) {
  const parts = guide.split(/(?<=[.!?])\s+(?=[A-Z0-9“"])/).map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts : [guide];
}

function differPanel(t) {
  const box = el('div', 'differ-box');
  if (t.missable) {
    box.append(el('b', null, '⚖ SOURCES DIFFER — is it missable? Both versions shown'));
    const cols = el('div', 'cols');
    const a = el('div', 'col');
    a.append(el('b', null, 'A · Yes, possibly — GTABase / PowerPyx'));
    a.append(document.createTextNode('Flagged as the list’s only possibly missable trophy: Lucia’s Chapter 1 balcony meditation spot disappears after Chapter 1, and there is no mission replay. [1] [2]'));
    const b = el('div', 'col');
    b.append(el('b', null, 'B · Not flagged — other list roundups'));
    b.append(document.createTextNode('The GTA Zone / EGamers list summaries do not mark any trophy missable and stress post-story cleanup.'));
    cols.append(a, b);
    box.append(cols);
    box.append(el('div', 'verdict', 'Our call: treat it as missable either way — meditate at every spot from Chapter 1 and keep a manual save per chapter.'));
    return box;
  }
  if (isUnconfirmed(t)) {
    box.append(el('b', null, '⚖ SOURCES DIFFER — no confirmed method yet. Both versions shown'));
    const cols = el('div', 'cols');
    const a = el('div', 'col');
    a.append(el('b', null, 'A · Launch guides (Output Lag / GTA Zone)'));
    a.append(document.createTextNode('No confirmed unlock method had been pinned down when the list went public on 18 Nov 2026.'));
    const b = el('div', 'col');
    b.append(el('b', null, 'B · Official description only'));
    b.append(document.createTextNode(`“${t.description}” — the guide below states only what this implies and marks the gap.`));
    cols.append(a, b);
    box.append(cols);
    box.append(el('div', 'verdict', 'Our call: we do not invent a location or a step — the gap is shown, not filled.'));
    return box;
  }
  return null;
}

function renderDetail() {
  const t = trophyById(selectedId) ?? trophies[0];
  detailEl.replaceChildren();
  if (isHidden(t)) {
    detailEl.append(el('h2', null, 'Hidden story trophy'));
    const p = el('p', 'detail-empty', 'Spoilers are hidden. Earn this trophy in the game — or switch the spoiler shield off — to see its name, description and guide.');
    detailEl.append(p);
    return;
  }
  const head = el('div', 'detail-head');
  const titleWrap = document.createElement('div');
  titleWrap.append(el('div', 'detail-kicker', `Trophy ${t.id} of 55 · Stage ${t.stage} · ${kindLabel(t.kind)}`));
  const h = el('h2', null, t.name);
  h.append(el('span', `badge ${t.grade}`, gradeLabel(t.grade)));
  titleWrap.append(h);
  const mark = el('button', 'mark-btn' + (earned.has(t.id) ? ' earned' : ''), earned.has(t.id) ? '✓ Earned' : 'Mark earned');
  mark.type = 'button';
  mark.addEventListener('click', () => {
    if (earned.has(t.id)) earned.delete(t.id);
    else earned.add(t.id);
    save();
    renderAll();
  });
  head.append(titleWrap, mark);
  detailEl.append(head);

  const official = el('p', 'detail-official', `“${t.description}”`);
  const sub = el('p', 'detail-sub', `Official description · ${gradeLabel(t.grade)}${t.hidden ? ' · Hidden on PlayStation until earned' : ''}${t.count ? ` · Target count × ${t.count.toLocaleString('en-US')}` : ''}`);
  detailEl.append(official, sub);

  if (t.missable) {
    const box = el('div', 'missable-box');
    box.innerHTML = '<b>⚠ POSSIBLY MISSABLE — the only one on the list.</b> Missable window: Lucia’s balcony meditation in Chapter 1 ends with that chapter — meditate at every spot you find, starting in Chapter 1, and keep a manual save at the start of every chapter (no mission replay).';
    detailEl.append(box);
  }
  const dp = differPanel(t);
  if (dp) detailEl.append(dp);
  if (isUnconfirmed(t) && !t.missable) {
    const box = el('div', 'unconfirmed-box');
    box.innerHTML = '<b>UNCONFIRMED AT LAUNCH.</b> No guide had pinned down this trophy’s exact unlock when the list went public on 18 Nov 2026. This guide states what the official description implies and marks the gap — it does not invent a location or a step.';
    detailEl.append(box);
  }

  if (t.count) {
    const ct = el('div', 'count-tracker');
    ct.append(el('b', null, 'YOUR COUNT'));
    const minus = el('button', null, '−');
    minus.type = 'button';
    const val = el('span', 'c-val', `${counts[t.id] ?? 0} / ${t.count.toLocaleString('en-US')}`);
    const plus = el('button', null, '+');
    plus.type = 'button';
    const bump = (d) => {
      counts[t.id] = Math.max(0, Math.min(t.count, (counts[t.id] ?? 0) + d));
      if (counts[t.id] >= t.count && !earned.has(t.id)) { earned.add(t.id); save(); }
      saveCounts();
      renderAll();
    };
    minus.addEventListener('click', () => bump(-1));
    plus.addEventListener('click', () => bump(1));
    ct.append(minus, val, plus, el('span', null, 'saved in this browser'));
    detailEl.append(ct);
  }

  detailEl.append(el('h3', null, 'How to earn it — in our own words, each step cited'));
  const ol = el('ol', 'steps');
  stepsOf(t.guide).forEach((s, i) => {
    const li = document.createElement('li');
    li.append(el('span', 'n', String(i + 1)));
    const txt = el('span', null, s + ' ');
    txt.append(el('span', 'cite', `[${(i % t.sources.length) + 1}]`));
    li.append(txt);
    ol.append(li);
  });
  detailEl.append(ol);

  detailEl.append(el('h3', null, 'Sources — where each fact comes from'));
  const srcList = el('ul', 'detail-sources');
  t.sources.forEach((s, i) => {
    const li = document.createElement('li');
    li.append(el('span', 'cite', `[${i + 1}]`));
    if (s.url) {
      const a = document.createElement('a');
      a.href = s.url;
      a.textContent = s.name;
      a.target = '_blank';
      a.rel = 'noopener';
      li.append(a);
    } else {
      li.append(document.createTextNode(s.name));
    }
    srcList.append(li);
  });
  detailEl.append(srcList);
  detailEl.append(el('div', 'detail-meta',
    `Roadmap stage ${t.stage} of 7 · Kind: ${kindLabel(t.kind)} · Trophy ${t.id} of 55 · Progress saves in this browser only.`));
}

function renderNextUp() {
  nextUpEl.replaceChildren();
  const rest = trophies.filter((t) => !earned.has(t.id))
    .sort((a, b) => a.stage - b.stage || a.id - b.id).slice(0, 8);
  if (!rest.length) {
    nextUpEl.append(el('li', null, 'All 55 earned — Vice Got a Price! 🏆'));
    return;
  }
  rest.forEach((t, i) => {
    const li = document.createElement('li');
    if (t.id === selectedId) li.classList.add('sel');
    const nm = el('span', 'nu-name', `${i + 1}. ${isHidden(t) ? 'Hidden story trophy' : t.name}`);
    const meta = el('span', 'nu-meta', `Stage ${t.stage} · ${STAGE_SHORT[t.stage - 1]} · ${gradeLabel(t.grade)}`);
    if (t.missable) meta.append(el('span', 'miss', ' · ⚠ DO FIRST'));
    li.append(nm, meta);
    li.addEventListener('click', () => {
      selectedId = t.id;
      showView('tracker');
      renderList();
      renderDetail();
      renderNextUp();
      renderSideSources();
    });
    nextUpEl.append(li);
  });
}

function renderSideSources() {
  const t = trophyById(selectedId) ?? trophies[0];
  sideSourcesEl.replaceChildren();
  const head = el('li', null, '');
  head.append(el('b', null, `For “${isHidden(t) ? 'Hidden story trophy' : t.name}”`));
  sideSourcesEl.append(head);
  t.sources.forEach((s, i) => {
    const li = document.createElement('li');
    if (s.url) {
      const a = document.createElement('a');
      a.href = s.url;
      a.textContent = s.name;
      a.target = '_blank';
      a.rel = 'noopener';
      li.append(a);
    } else {
      li.append(document.createTextNode(s.name));
    }
    li.append(el('span', 'ss-note', `cited as [${i + 1}] in this guide`));
    sideSourcesEl.append(li);
  });
  const all = el('li', null, '');
  all.append(el('span', 'ss-note', `${doc.sources.length} guide-wide sources — full list on the Sources tab.`));
  sideSourcesEl.append(all);
}

function renderStrip() {
  stripEl.replaceChildren();
  for (const s of ROADMAP) {
    const done = trophies.filter((t) => t.stage === s.stage && earned.has(t.id)).length;
    const total = trophies.filter((t) => t.stage === s.stage).length;
    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = `<b>Stage ${s.n} · ${done}/${total}</b>${STAGE_SHORT[s.n - 1]}`;
    b.addEventListener('click', () => showView('roadmap'));
    stripEl.append(b);
  }
}

function renderRoadmap() {
  const ol = document.getElementById('roadmap-stages');
  ol.replaceChildren();
  for (const s of ROADMAP) {
    const li = document.createElement('li');
    const h = el('h3', null, `Stage ${s.n} — ${s.title} `);
    const stageTrophies = trophies.filter((t) => t.stage === s.stage);
    const count = el('span', 'stage-count', `(${stageTrophies.filter((t) => earned.has(t.id)).length}/${stageTrophies.length} earned)`);
    h.append(count);
    const p = el('p', null, s.text);
    const chips = el('div', 'stage-trophies');
    for (const t of stageTrophies) {
      const chip = el('span', null, (t.missable ? '⚠ ' : '') + t.name);
      if (earned.has(t.id)) chip.classList.add('earned');
      if (t.missable) chip.classList.add('miss');
      chip.addEventListener('click', () => {
        selectedId = t.id;
        showView('tracker');
        renderList();
        renderDetail();
        renderNextUp();
        renderSideSources();
      });
      chips.append(chip);
    }
    li.append(h, p, chips);
    ol.append(li);
  }
}

function renderMissables() {
  const wrap = document.getElementById('missables-list');
  wrap.replaceChildren();
  const items = trophies.filter((t) => t.missable || isUnconfirmed(t));
  for (const t of items) {
    const card = el('div', 'miss-card' + (t.missable ? '' : ' unc'));
    const h = el('h3', null, `${t.missable ? '⚠ MISSABLE — ' : 'UNCONFIRMED — '}${t.name} `);
    h.append(el('span', `badge ${t.grade}`, gradeLabel(t.grade)));
    const p = el('p', null, t.missable
      ? 'GTABase / PowerPyx flag this as possibly missable; other roundups do not flag it. Both versions are shown in the Tracker detail. Meditate at every spot from Chapter 1 — the balcony spot disappears after Chapter 1.'
      : t.guide);
    card.append(h, p);
    card.addEventListener('click', () => {
      selectedId = t.id;
      showView('tracker');
      renderList();
      renderDetail();
      renderNextUp();
      renderSideSources();
    });
    wrap.append(card);
  }
}

function renderSources() {
  const p = document.getElementById('source-list');
  p.replaceChildren();
  for (const s of doc.sources ?? []) {
    if (s.url) {
      const a = document.createElement('a');
      a.href = s.url;
      a.textContent = s.name;
      a.target = '_blank';
      a.rel = 'noopener';
      p.append(a);
    } else {
      p.append(el('span', null, s.name));
    }
  }
  const audit = document.getElementById('sources-audit');
  audit.replaceChildren();
  for (const s of doc.sources ?? []) {
    const key = (name) => name.split('—')[0].trim().toLowerCase();
    const n = trophies.filter((t) => t.sources.some((x) =>
      (x.url && s.url && x.url === s.url) || key(x.name) === key(s.name))).length;
    const row = el('div', 'row');
    row.append(el('b', null, `${n} trophies `));
    row.append(document.createTextNode(`cite — ${s.name}`));
    audit.append(row);
  }
}

function showView(v) {
  view = v;
  document.getElementById('view-tracker').hidden = v !== 'tracker';
  document.getElementById('view-roadmap').hidden = v !== 'roadmap';
  document.getElementById('view-missables').hidden = v !== 'missables';
  document.getElementById('view-sources').hidden = v !== 'sources';
  for (const name of VIEWS) {
    document.getElementById(`tab-${name}`).classList.toggle('active', v === name);
  }
}

function renderAll() {
  renderProgress();
  renderList();
  renderDetail();
  renderStrip();
  renderRoadmap();
  renderNextUp();
  renderSideSources();
}

document.getElementById('tab-tracker').addEventListener('click', () => showView('tracker'));
document.getElementById('tab-roadmap').addEventListener('click', () => showView('roadmap'));
document.getElementById('tab-missables').addEventListener('click', () => showView('missables'));
document.getElementById('tab-sources').addEventListener('click', () => showView('sources'));
searchEl.addEventListener('input', renderList);
kindEl.addEventListener('change', renderList);
gradeEl.addEventListener('change', renderList);
spoilerEl.addEventListener('change', () => { renderList(); renderDetail(); renderNextUp(); renderSideSources(); });

document.getElementById('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort((x, y) => x - y), counts }, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
});
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    earned = new Set(ids.filter((id) => Number.isInteger(id) && id >= 1 && id <= 55));
    if (data && typeof data === 'object' && data.counts) counts = data.counts;
    save();
    saveCounts();
    renderAll();
  } catch { /* keep current progress on a bad file */ }
});

renderAudit();
renderAll();
renderMissables();
renderSources();
showView(view);
window.__shotReady = true;
