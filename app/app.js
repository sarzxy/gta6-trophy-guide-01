// VICE CITY TROPHY GUIDE — tracker + guide for the 55 GTA VI PS5 trophies.
// Plain static app: loads app/data/trophies.json, saves progress in localStorage,
// exports/imports it as JSON, filters by kind/grade, hides story spoilers until
// earned, and shows a cited own-words guide beside every trophy. No network.
const KEY = 'gta6-trophy-checklist-v1';
const rowsEl = document.getElementById('rows');
const detailEl = document.getElementById('detail');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kind');
const gradeEl = document.getElementById('grade');
const spoilerEl = document.getElementById('spoiler');
const listCountEl = document.getElementById('list-count');
const spoilerNoteEl = document.getElementById('spoiler-note');
const stripEl = document.getElementById('roadmap-strip');

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

let earned = new Set();
try { earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]')); } catch { earned = new Set(); }
let selectedId = Number(query.get('select')) || 28;
let view = query.get('view') === 'roadmap' ? 'roadmap' : 'checklist';

// Screenshot preset (?demo=1): tick a believable early-game set through the same
// toggle the user uses, so the progress bar and checklist show the tracker working.
if (query.get('demo') === '1' && earned.size === 0) {
  for (const id of [2, 3, 4, 8, 15, 16, 21, 32, 35, 42, 52, 53]) earned.add(id);
  save();
}
if (query.get('spoiler') === 'on') spoilerEl.checked = true;
if (query.get('kind')) kindEl.value = query.get('kind');
if (query.get('grade')) gradeEl.value = query.get('grade');

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function gradeLabel(g) {
  return { platinum: 'PLAT', gold: 'GOLD', silver: 'SILVER', bronze: 'BRONZE' }[g] ?? g.toUpperCase();
}
function kindLabel(k) {
  return { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online', platinum: 'Platinum' }[k] ?? k;
}
function isHidden(t) { return spoilerEl.checked && t.kind === 'story' && !earned.has(t.id); }
function trophyById(id) { return trophies.find((t) => t.id === id); }

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

function renderProgress() {
  const n = earned.size;
  const total = trophies.length;
  document.getElementById('progress-count').textContent = `${n} / ${total}`;
  document.getElementById('progress-pct').textContent = `${Math.round((n / total) * 100)}%`;
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
  listCountEl.textContent = `Showing ${list.length} of 55 trophies · ${earned.size} earned`;
  spoilerNoteEl.textContent = spoilerEl.checked
    ? 'Spoilers hidden — story trophies show as hidden until earned.'
    : '';
  spoilerNoteEl.className = spoilerEl.checked ? 'warn' : '';
  rowsEl.replaceChildren();
  if (!list.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = kindEl.value === 'online'
      ? 'No online trophies in this list — all 55 are single-player (GTABase / EGamers).'
      : 'No trophies match those filters.';
    rowsEl.append(li);
    return;
  }
  for (const t of list) {
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
      renderProgress();
      renderList();
      renderDetail();
      renderRoadmap();
    });
    const mid = document.createElement('div');
    const name = document.createElement('div');
    name.className = 't-name';
    name.textContent = isHidden(t) ? 'Hidden story trophy' : t.name;
    if (t.hidden && !earned.has(t.id)) {
      const tag = document.createElement('span');
      tag.className = 'hidden-tag';
      tag.textContent = ' · HIDDEN ON PS';
      name.append(tag);
    }
    const desc = document.createElement('div');
    desc.className = 't-desc';
    desc.textContent = isHidden(t)
      ? 'Story trophy — hidden until earned. Tick it off when it pops.'
      : t.description;
    const tags = document.createElement('div');
    tags.className = 't-tags';
    const kindTag = document.createElement('span');
    kindTag.className = 'tag';
    kindTag.textContent = kindLabel(t.kind);
    tags.append(kindTag);
    if (t.missable) {
      const m = document.createElement('span');
      m.className = 'tag missable';
      m.textContent = '⚠ MISSABLE';
      tags.append(m);
    }
    if (t.count) {
      const c = document.createElement('span');
      c.className = 'tag count';
      c.textContent = `× ${t.count.toLocaleString('en-US')}`;
      tags.append(c);
    }
    mid.append(name, desc, tags);
    const badge = document.createElement('span');
    badge.className = `badge ${t.grade}`;
    badge.textContent = gradeLabel(t.grade);
    li.append(box, mid, badge);
    li.addEventListener('click', (e) => {
      if (e.target === box) return;
      selectedId = t.id;
      renderList();
      renderDetail();
    });
    rowsEl.append(li);
  }
}

function renderDetail() {
  const t = trophyById(selectedId) ?? trophies[0];
  detailEl.replaceChildren();
  if (isHidden(t)) {
    const h = document.createElement('h2');
    h.textContent = 'Hidden story trophy';
    const p = document.createElement('p');
    p.className = 'detail-empty';
    p.textContent = 'Spoilers are hidden. Earn this trophy in the game — or switch the spoiler setting off — to see its name, description and guide.';
    detailEl.append(h, p);
    return;
  }
  const h = document.createElement('h2');
  h.textContent = t.name;
  const badge = document.createElement('span');
  badge.className = `badge ${t.grade}`;
  badge.textContent = gradeLabel(t.grade);
  h.append(badge);
  const official = document.createElement('p');
  official.className = 'detail-official';
  official.textContent = `Official description: “${t.description}”`;
  const guideH = document.createElement('h3');
  guideH.textContent = 'Guide — in our own words';
  const guide = document.createElement('p');
  guide.textContent = t.guide;
  detailEl.append(h, official, guideH, guide);
  if (t.missable) {
    const box = document.createElement('div');
    box.className = 'missable-box';
    box.innerHTML = '<b>⚠ MISSABLE — the only one on the list.</b> GTABase and PowerPyx flag this as the only possibly missable trophy. Lucia’s balcony meditation in Chapter 1 disappears after that chapter and there is no mission replay — meditate at every spot you find, starting in Chapter 1, and keep a manual save at the start of every chapter.';
    detailEl.append(box);
  }
  if (/no confirmed unlock method/i.test(t.guide)) {
    const box = document.createElement('div');
    box.className = 'unconfirmed-box';
    box.innerHTML = '<b>UNCONFIRMED AT LAUNCH.</b> No guide had pinned down this trophy’s exact unlock when the list went public on 18 Nov 2026. This guide states what the official description implies and marks the gap — it does not invent a location or a step.';
    detailEl.append(box);
  }
  const srcH = document.createElement('h3');
  srcH.textContent = 'Sources — where each fact comes from';
  const srcList = document.createElement('ul');
  srcList.className = 'detail-sources';
  for (const s of t.sources) {
    const li = document.createElement('li');
    if (s.url) {
      const a = document.createElement('a');
      a.href = s.url;
      a.textContent = s.name;
      a.target = '_blank';
      a.rel = 'noopener';
      li.append(a);
    } else {
      li.textContent = s.name;
    }
    srcList.append(li);
  }
  const meta = document.createElement('div');
  meta.className = 'detail-meta';
  meta.textContent = `Roadmap stage ${t.stage} of 7 · Kind: ${kindLabel(t.kind)} · ${t.hidden ? 'Hidden on PlayStation until earned · ' : ''}Trophy ${t.id} of 55 · Progress saves in this browser only.`;
  detailEl.append(srcH, srcList, meta);
}

function renderStrip() {
  stripEl.replaceChildren();
  for (const s of ROADMAP) {
    const done = trophies.filter((t) => t.stage === s.stage && earned.has(t.id)).length;
    const total = trophies.filter((t) => t.stage === s.stage).length;
    const b = document.createElement('button');
    b.type = 'button';
    const short = ['Play the story', 'The one missable', 'Strangers & Freaks', 'Collectibles', 'Activities & robberies', 'Money & cleanup', '100% → Platinum'][s.n - 1];
    b.innerHTML = `<b>Stage ${s.n} · ${done}/${total}</b>${short}`;
    b.addEventListener('click', () => showView('roadmap'));
    stripEl.append(b);
  }
}

function renderRoadmap() {
  const ol = document.getElementById('roadmap-stages');
  ol.replaceChildren();
  for (const s of ROADMAP) {
    const li = document.createElement('li');
    const h = document.createElement('h3');
    h.textContent = `Stage ${s.n} — ${s.title} `;
    const count = document.createElement('span');
    count.className = 'stage-count';
    const stageTrophies = trophies.filter((t) => t.stage === s.stage);
    count.textContent = `(${stageTrophies.filter((t) => earned.has(t.id)).length}/${stageTrophies.length} earned)`;
    h.append(count);
    const p = document.createElement('p');
    p.textContent = s.text;
    const chips = document.createElement('div');
    chips.className = 'stage-trophies';
    for (const t of stageTrophies) {
      const chip = document.createElement('span');
      chip.textContent = (t.missable ? '⚠ ' : '') + t.name;
      if (earned.has(t.id)) chip.classList.add('earned');
      if (t.missable) chip.classList.add('miss');
      chip.addEventListener('click', () => {
        selectedId = t.id;
        showView('checklist');
        renderList();
        renderDetail();
      });
      chips.append(chip);
    }
    li.append(h, p, chips);
    ol.append(li);
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
      const span = document.createElement('span');
      span.textContent = s.name;
      p.append(span);
    }
  }
}

function showView(v) {
  view = v;
  document.getElementById('view-checklist').hidden = v !== 'checklist';
  document.getElementById('view-roadmap').hidden = v !== 'roadmap';
  document.getElementById('tab-checklist').classList.toggle('active', v === 'checklist');
  document.getElementById('tab-roadmap').classList.toggle('active', v === 'roadmap');
}

document.getElementById('tab-checklist').addEventListener('click', () => showView('checklist'));
document.getElementById('tab-roadmap').addEventListener('click', () => showView('roadmap'));
searchEl.addEventListener('input', renderList);
kindEl.addEventListener('change', renderList);
gradeEl.addEventListener('change', renderList);
spoilerEl.addEventListener('change', () => { renderList(); renderDetail(); });

document.getElementById('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort((x, y) => x - y) }, null, 2)], { type: 'application/json' }));
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
    save();
    renderProgress();
    renderList();
    renderDetail();
    renderRoadmap();
    renderStrip();
  } catch { /* keep current progress on a bad file */ }
});

renderProgress();
renderList();
renderDetail();
renderStrip();
renderRoadmap();
renderSources();
showView(view);
window.__shotReady = true;
