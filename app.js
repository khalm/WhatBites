/* WhatBites — velg riktig agn fra boksen din / pick the right bait from your box.
 * 100 % free: weather from Open-Meteo, fish records from GBIF, place names from OpenStreetMap,
 * species names/photos/info from Wikipedia, and all photo analysis runs on the phone
 * (vision.js) with a rules engine (engine.js).
 */
const $ = (id) => document.getElementById(id);

/* ---------- language ---------- */
const T = {
  no: {
    s1title: 'Sted og vær', s1intro: 'Finn plassen din for å hente vær og hvilke fisk som finnes der.',
    useLoc: '📍 Bruk min posisjon', refreshLoc: '📍 Oppdater posisjon', finding: 'Finner deg…', loading: 'Henter vær og fisk…',
    gotIt: 'Klart. Vis meg vannet nå.', noGeo: 'Nettleseren støtter ikke posisjon.',
    geoFail: (m) => `Fikk ikke posisjon (${m}). Tillat posisjon for denne siden og prøv igjen.`,
    fishNearby: 'Fisk registrert i nærheten', fishSource: 'Arter fra GBIF-observasjoner innen ca. 30 km. Info og bilder fra Wikipedia.',
    fishTap: 'Trykk på en art for bilde og info, og for å velge hva du fisker etter i dag.',
    fishingFor: 'Fisker etter:', clearPref: 'alle arter',
    noFish: 'Fant ingen fiskeregistreringer i nærheten — appen bruker vanlige arter for vanntypen.', noWeather: 'Vær er ikke tilgjengelig akkurat nå.',
    wind: 'Vind', cloud: 'Skydekke', rainNow: 'Nedbør nå', day: '☀️ Dag', night: '🌙 Natt',
    hpa: { rising: 'hPa, stigende', falling: 'hPa, fallende', steady: 'hPa, stabilt' },
    s2title: 'Vis vannet', s2intro: 'Ta et bilde av plassen du fisker. Appen leser lys og vannfarge — trykk for å rette om det er feil.',
    s2btn: '📷 Ta bilde av plassen', water: 'Vanntype', clarity: 'Sikt i vannet', light: 'Lys',
    opts: {
      water: { lake: 'Innsjø', river: 'Elv', sea: 'Sjø' },
      clarity: { clear: 'Klart', stained: 'Litt farget', murky: 'Grumsete' },
      light: { sun: 'Sol', overcast: 'Overskyet', low: 'Skumring', night: 'Natt' },
    },
    segHelp: 'Bildet og været fyller inn dette automatisk. Du kan alltid endre selv.',
    tooDark: 'Det er for mørkt til å lese bildet. Velg lys, vanntype og sikt selv under.',
    darkNow: 'Det er mørkt nå, så bildet kan ikke leses. Velg vanntype og sikt selv.',
    s3title: 'Vis agnboksen', s3intro: 'Åpne boksen og ta bilde rett ovenfra i godt lys (bruk lommelykt om det er mørkt).', s3btn: '🎣 Ta bilde av agnboksen',
    modelNote: 'Første gang lastes en gratis AI-modell ned (ca. 155 MB).',
    modelReady: 'AI-modellen er lastet ned og ligger på telefonen.',
    bannerTitle: '📶 Last ned AI-modellen mens du har Wi-Fi',
    bannerText: 'Appen trenger en gratis AI-modell (ca. 155 MB) for å finne agnet i bildet. Last den ned nå, så virker den ute ved vannet uten å bruke mobildata.',
    bannerMobile: 'Det ser ut som du er på mobildata. Vent gjerne til du har Wi-Fi.',
    later: 'Senere', downloadNow: 'Last ned nå', bannerDone: '✅ Ferdig! Modellen ligger nå på telefonen.',
    downloading: (p, mb) => `Laster ned AI-modell… ${Math.round(p * 100)} % av ${mb} MB`,
    detecting: 'Ser etter agn i bildet…', use: 'Bruk', others: 'Andre i boksen', target: 'Mål', how: 'Slik', size: 'Størrelse',
    noBaits: 'Fant ikke noe agn. Prøv et nærmere og lysere bilde rett ovenfra, med agnet spredt litt utover.',
    fixType: 'Feil type? Endre den, så regnes valget ut på nytt.',
    modelFail: 'Kunne ikke laste AI-modellen. Sjekk nettet og prøv igjen.',
    disclaimer: 'Agnvalg er forslag — sjekk lokale fiskeregler og fredningstider.',
    pickOn: '🎯 Jeg fisker etter denne', pickOff: '✖ Fjern fra dagens arter', readWiki: 'Les mer på Wikipedia ↗', close: 'Lukk',
    noInfo: 'Fant ingen artikkel om denne arten.', typicalSize: 'Typisk agn',
  },
  en: {
    s1title: 'Where & weather', s1intro: 'Find your spot to load weather and the fish that live there.',
    useLoc: '📍 Use my location', refreshLoc: '📍 Refresh location', finding: 'Finding you…', loading: 'Loading weather and fish…',
    gotIt: 'Got it. Now show me the water.', noGeo: 'This browser has no location support.',
    geoFail: (m) => `Couldn't get location (${m}). Allow location for this site and try again.`,
    fishNearby: 'Fish recorded nearby', fishSource: 'Species from GBIF observation records within ~30 km. Info and photos from Wikipedia.',
    fishTap: 'Tap a species for a photo and info, and to choose what you are fishing for today.',
    fishingFor: 'Fishing for:', clearPref: 'all species',
    noFish: 'No fish records nearby — the app uses common species for the water type.', noWeather: 'Weather unavailable right now.',
    wind: 'Wind', cloud: 'Cloud cover', rainNow: 'Rain now', day: '☀️ Day', night: '🌙 Night',
    hpa: { rising: 'hPa, rising', falling: 'hPa, falling', steady: 'hPa, steady' },
    s2title: 'Show the water', s2intro: "Take a photo of your spot. The app reads the light and water colour — tap to correct it if it's wrong.",
    s2btn: '📷 Photograph the spot', water: 'Water type', clarity: 'Water clarity', light: 'Light',
    opts: {
      water: { lake: 'Lake', river: 'River', sea: 'Sea' },
      clarity: { clear: 'Clear', stained: 'Stained', murky: 'Murky' },
      light: { sun: 'Sunny', overcast: 'Overcast', low: 'Dusk', night: 'Night' },
    },
    segHelp: 'The photo and weather fill this in automatically. You can always change it.',
    tooDark: 'Too dark to read the photo. Choose light, water type and clarity yourself below.',
    darkNow: "It's dark now, so a photo can't be read. Choose water type and clarity yourself.",
    s3title: 'Show your bait box', s3intro: 'Open your tackle box and photograph it from above in good light (use a torch if dark).', s3btn: '🎣 Photograph bait box',
    modelNote: 'The first time, a free AI model is downloaded (about 155 MB).',
    modelReady: 'The AI model is downloaded and stored on your phone.',
    bannerTitle: '📶 Download the AI model while on Wi-Fi',
    bannerText: 'The app needs a free AI model (about 155 MB) to find the baits in your photo. Download it now so it works by the water without using mobile data.',
    bannerMobile: 'Looks like you are on mobile data. You may want to wait for Wi-Fi.',
    later: 'Later', downloadNow: 'Download now', bannerDone: '✅ Done! The model is now stored on your phone.',
    downloading: (p, mb) => `Downloading AI model… ${Math.round(p * 100)}% of ${mb} MB`,
    detecting: 'Looking for baits in the photo…', use: 'Use', others: 'Others in the box', target: 'Target', how: 'How', size: 'Size',
    noBaits: "I couldn't find any baits. Try a closer, brighter photo from above, with the baits spread out a bit.",
    fixType: 'Wrong type? Change it and the pick is recalculated.',
    modelFail: "Couldn't load the AI model. Check your connection and try again.",
    disclaimer: 'Bait picks are suggestions — check local fishing rules and seasons.',
    pickOn: "🎯 I'm fishing for this", pickOff: "✖ Remove from today's species", readWiki: 'Read more on Wikipedia ↗', close: 'Close',
    noInfo: 'No article found for this species.', typicalSize: 'Typical bait',
  },
};
let lang = localStorage.getItem('wb_ui') || 'no';
const t = (k) => T[lang][k];
const L = () => (lang === 'no' ? 0 : 1);

/* ---------- state ---------- */
const state = {
  lat: null, lon: null, place: '', weather: null, fish: [],
  env: { water: 'lake', clarity: 'stained', light: 'overcast' },
  envSetByUser: {}, envFromPhoto: false,
  bait: null, // { img, baits:[{id,type,color,box}] }
  // Species the user is fishing for in this session (cleared when the app/tab is closed)
  preferred: JSON.parse(sessionStorage.getItem('wb_pref') || '[]'),
};
const savePref = () => sessionStorage.setItem('wb_pref', JSON.stringify(state.preferred));

function applyLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  // The button shows the language you switch TO
  $('langFlag').textContent = lang === 'no' ? '🇬🇧' : '🇳🇴';
  $('langCode').textContent = lang === 'no' ? 'EN' : 'NO';
  $('modelNote').textContent = modelOk() ? t('modelReady') : t('modelNote');
  renderBanner();
  if (state.lat !== null) { $('locBtn').textContent = t('refreshLoc'); renderConditions(); loadWikiNames(); }
  renderSegs(); renderDarkNote();
  if (state.bait) renderBaitResult();
}
$('langBtn').onclick = () => { lang = lang === 'no' ? 'en' : 'no'; localStorage.setItem('wb_ui', lang); applyLang(); };

/* ---------- helpers ---------- */
function busy(on, text = '', progress = null) {
  $('busyText').textContent = text;
  $('busy').classList.toggle('hidden', !on);
  $('busyBar').classList.toggle('hidden', progress === null);
  if (progress !== null) $('busyFill').style.width = `${Math.round(progress * 100)}%`;
}
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function showError(el, msg) { el.classList.remove('hidden', 'pick'); el.innerHTML = `<p class="err">${esc(msg)}</p>`; }
async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}
const modelOk = () => !!localStorage.getItem('wb_model_ok');

const WMO = {
  0: ['Klart', 'Clear'], 1: ['Lettskyet', 'Mostly clear'], 2: ['Delvis skyet', 'Partly cloudy'], 3: ['Overskyet', 'Overcast'],
  45: ['Tåke', 'Fog'], 48: ['Rimtåke', 'Rime fog'], 51: ['Lett yr', 'Light drizzle'], 53: ['Yr', 'Drizzle'], 55: ['Kraftig yr', 'Heavy drizzle'],
  61: ['Lett regn', 'Light rain'], 63: ['Regn', 'Rain'], 65: ['Kraftig regn', 'Heavy rain'], 66: ['Underkjølt regn', 'Freezing rain'],
  67: ['Underkjølt regn', 'Freezing rain'], 71: ['Lett snø', 'Light snow'], 73: ['Snø', 'Snow'], 75: ['Kraftig snø', 'Heavy snow'],
  77: ['Snøkorn', 'Snow grains'], 80: ['Regnbyger', 'Showers'], 81: ['Regnbyger', 'Showers'], 82: ['Kraftige byger', 'Heavy showers'],
  85: ['Snøbyger', 'Snow showers'], 86: ['Snøbyger', 'Snow showers'], 95: ['Torden', 'Thunderstorm'], 96: ['Torden', 'Thunderstorm'], 99: ['Torden', 'Thunderstorm'],
};
const sky = (code) => (WMO[code] || ['Ukjent', 'Unknown'])[L()];
const compass = (deg) => (lang === 'no'
  ? ['N', 'NØ', 'Ø', 'SØ', 'S', 'SV', 'V', 'NV'] : ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'])[Math.round(deg / 45) % 8];

/* ---------- species names & info (Wikipedia) ---------- */
const wikiCache = {}; // `${lang}|${sci}` -> {title, extract, img, url} | null
function wikiKey(sci, lg = lang) { return `${lg}|${sci}`; }
function loadWikiCacheFromStorage() {
  try { Object.assign(wikiCache, JSON.parse(localStorage.getItem('wb_wiki') || '{}')); } catch { /* ignore */ }
}
function saveWikiCache() { try { localStorage.setItem('wb_wiki', JSON.stringify(wikiCache)); } catch { /* full */ } }

async function wikiSummary(sci, lg = lang) {
  const k = wikiKey(sci, lg);
  if (k in wikiCache) return wikiCache[k];
  const host = lg === 'no' ? 'no' : 'en';
  let v = null;
  try {
    const d = await getJSON(`https://${host}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(sci.replace(/ /g, '_'))}`);
    if (d.type !== 'disambiguation' && d.extract) {
      v = {
        title: d.title,
        extract: d.extract,
        img: d.thumbnail?.source || d.originalimage?.source || '',
        url: d.content_urls?.mobile?.page || d.content_urls?.desktop?.page || '',
      };
    }
  } catch { /* not found */ }
  wikiCache[k] = v;
  saveWikiCache();
  return v;
}

/** Common name: built-in list first, then the Wikipedia article title (if it isn't just the Latin name). */
function commonName(sci) {
  const s = Engine.SPECIES[sci];
  if (s) return lang === 'no' ? s.no : s.en;
  const w = wikiCache[wikiKey(sci)];
  if (w && w.title && w.title.toLowerCase() !== sci.toLowerCase()) {
    const name = w.title.replace(/\s*\(.*\)$/, '');
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  return '';
}

let wikiLoading = false;
async function loadWikiNames() {
  if (wikiLoading) return;
  wikiLoading = true;
  const missing = state.fish.filter((f) => !Engine.SPECIES[f.name] && !(wikiKey(f.name) in wikiCache));
  // a few at a time, to be gentle on Wikipedia
  for (let i = 0; i < missing.length; i += 5) {
    await Promise.all(missing.slice(i, i + 5).map((f) => wikiSummary(f.name)));
    renderFishChips();
  }
  wikiLoading = false;
}

/* ---------- species sheet ---------- */
let sheetSci = null;
async function openSheet(sci) {
  sheetSci = sci;
  const name = commonName(sci);
  $('sheetTitle').textContent = name || sci;
  $('sheetSci').textContent = sci;
  $('sheetText').textContent = '…';
  $('sheetImgWrap').classList.add('hidden');
  $('sheetWiki').classList.add('hidden');
  const z = Engine.SIZES[sci];
  $('sheetSize').textContent = z ? `${t('typicalSize')}: ${z.g[0]}–${z.g[1]} g, ${z.cm[0]}–${z.cm[1]} cm · ${lang === 'no' ? 'krok' : 'hook'} ${z.hook}` : '';
  renderSheetPick();
  $('sheet').showModal();
  let w = await wikiSummary(sci);
  if (!w) w = await wikiSummary(sci, lang === 'no' ? 'en' : 'no'); // fall back to the other language
  if (sheetSci !== sci) return;
  if (w) {
    if (!name && w.title.toLowerCase() !== sci.toLowerCase()) $('sheetTitle').textContent = w.title;
    $('sheetText').textContent = w.extract;
    if (w.img) { $('sheetImg').src = w.img; $('sheetImg').alt = w.title; $('sheetImgWrap').classList.remove('hidden'); }
    if (w.url) { $('sheetWiki').href = w.url; $('sheetWiki').textContent = t('readWiki'); $('sheetWiki').classList.remove('hidden'); }
  } else {
    $('sheetText').textContent = t('noInfo');
  }
  renderFishChips();
}
function renderSheetPick() {
  const on = state.preferred.includes(sheetSci);
  $('sheetPick').textContent = on ? t('pickOff') : t('pickOn');
  $('sheetPick').classList.toggle('primary', !on);
}
$('sheetPick').onclick = () => {
  const i = state.preferred.indexOf(sheetSci);
  if (i >= 0) state.preferred.splice(i, 1); else state.preferred.push(sheetSci);
  savePref(); renderSheetPick(); renderFishChips(); rerank();
};
$('sheetClose').onclick = () => $('sheet').close();
$('sheet').addEventListener('click', (e) => { if (e.target === $('sheet')) $('sheet').close(); }); // tap outside

/* ---------- model download banner ---------- */
function renderBanner() {
  const show = !modelOk() && !sessionStorage.getItem('wb_banner_later');
  $('modelBanner').classList.toggle('hidden', !show && !$('modelBanner').dataset.done);
  if (!show) return;
  const conn = navigator.connection;
  const onMobile = conn && (conn.type === 'cellular' || conn.saveData);
  $('bannerText').textContent = t('bannerText') + (onMobile ? ` ${t('bannerMobile')}` : '');
}
$('bannerLater').onclick = () => { sessionStorage.setItem('wb_banner_later', '1'); $('modelBanner').classList.add('hidden'); };
$('bannerGo').onclick = async () => {
  $('bannerGo').disabled = true; $('bannerLater').disabled = true;
  $('bannerBar').classList.remove('hidden');
  try {
    await Vision.loadDetector((p, total) => {
      $('bannerFill').style.width = `${Math.round(p * 100)}%`;
      $('bannerText').textContent = t('downloading')(p, total ? Math.round(total / 1e6) : 155);
    });
    localStorage.setItem('wb_model_ok', '1');
    $('modelBanner').dataset.done = '1';
    $('bannerText').textContent = t('bannerDone');
    $('bannerBar').classList.add('hidden');
    $('bannerGo').classList.add('hidden');
    $('bannerLater').textContent = t('close'); $('bannerLater').disabled = false;
    $('bannerLater').onclick = () => $('modelBanner').classList.add('hidden');
    $('modelNote').textContent = t('modelReady');
  } catch (err) {
    console.error(err);
    $('bannerText').innerHTML = `${esc(t('modelFail'))}<br><small class="errdetail">${esc(String(err.message).slice(0, 300))}</small>`;
    $('bannerGo').disabled = false; $('bannerLater').disabled = false;
  }
};

/* ---------- step 1: location, weather, fish ---------- */
$('locBtn').onclick = () => {
  if (!navigator.geolocation) { $('condStatus').textContent = t('noGeo'); return; }
  $('condStatus').textContent = t('finding');
  navigator.geolocation.getCurrentPosition(
    (pos) => loadConditions(pos.coords.latitude, pos.coords.longitude),
    (err) => { $('condStatus').textContent = t('geoFail')(err.message); },
    { enableHighAccuracy: true, timeout: 15000 },
  );
};

async function loadConditions(lat, lon) {
  state.lat = lat; state.lon = lon;
  $('condStatus').textContent = t('loading');
  const [w, f, p] = await Promise.allSettled([loadWeather(lat, lon), loadFish(lat, lon), loadPlace(lat, lon)]);
  state.weather = w.status === 'fulfilled' ? w.value : null;
  state.fish = f.status === 'fulfilled' ? f.value : [];
  state.place = p.status === 'fulfilled' ? p.value : `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
  // Fill in conditions the user hasn't set themselves
  const guessW = Engine.guessWater(state.fish);
  if (guessW && !state.envSetByUser.water) state.env.water = guessW;
  if (state.weather && !state.envSetByUser.light && !state.envFromPhoto) {
    const wx = state.weather;
    state.env.light = !wx.isDay ? 'night' : wx.cloud > 70 ? 'overcast' : 'sun';
  }
  $('locBtn').textContent = t('refreshLoc');
  renderConditions(); renderSegs(); renderDarkNote(); rerank();
  loadWikiNames();
}

async function loadWeather(lat, lon) {
  const url = 'https://api.open-meteo.com/v1/forecast?' + new URLSearchParams({
    latitude: lat, longitude: lon, timezone: 'auto', wind_speed_unit: 'ms',
    current: 'temperature_2m,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,surface_pressure,precipitation,is_day',
    hourly: 'surface_pressure', past_hours: 6, forecast_hours: 1,
    daily: 'sunrise,sunset', forecast_days: 1,
  });
  const d = await getJSON(url);
  const c = d.current;
  const p = d.hourly?.surface_pressure || [];
  const trend = p.length > 1 ? p[p.length - 1] - p[0] : 0;
  return {
    temp: c.temperature_2m, code: c.weather_code, cloud: c.cloud_cover,
    wind: c.wind_speed_10m, windDeg: c.wind_direction_10m,
    pressure: Math.round(c.surface_pressure),
    pressureTrend: trend > 1 ? 'rising' : trend < -1 ? 'falling' : 'steady',
    rain: c.precipitation, isDay: !!c.is_day,
    sunrise: d.daily?.sunrise?.[0]?.slice(11), sunset: d.daily?.sunset?.[0]?.slice(11),
    monthIndex: new Date().getMonth(),
  };
}

// GBIF moved occurrences to Catalogue of Life keys in 2026. Try that first, then the old backbone key.
const GBIF_FISH_QUERIES = [
  { taxonKey: '8V4VD', checklistKey: '7ddf754f-d193-4cc9-b351-99906754a03b' }, // Teleostei (COL)
  { taxonKey: '204' },                                                          // Actinopterygii (old backbone)
];
async function loadFish(lat, lon) {
  const dLat = 0.27, dLon = 0.27 / Math.max(Math.cos(lat * Math.PI / 180), 0.2); // ~30 km box
  for (const q of GBIF_FISH_QUERIES) {
    try {
      const url = 'https://api.gbif.org/v1/occurrence/search?' + new URLSearchParams({
        decimalLatitude: `${lat - dLat},${lat + dLat}`, decimalLongitude: `${lon - dLon},${lon + dLon}`,
        limit: 300, ...q,
      });
      const d = await getJSON(url);
      const counts = {};
      for (const r of d.results || []) if (r.species) counts[r.species] = (counts[r.species] || 0) + 1;
      const list = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 25).map(([name, count]) => ({ name, count }));
      if (list.length) return list;
    } catch { /* try next */ }
  }
  return [];
}

async function loadPlace(lat, lon) {
  const d = await getJSON(`https://nominatim.openstreetmap.org/reverse?format=json&zoom=12&accept-language=${lang === 'no' ? 'nb' : 'en'}&lat=${lat}&lon=${lon}`);
  const a = d.address || {};
  return [a.village || a.town || a.city || a.municipality || a.county, a.country].filter(Boolean).join(', ') || d.display_name;
}

function renderConditions() {
  $('condStatus').textContent = t('gotIt');
  $('conditions').classList.remove('hidden');
  $('placeName').textContent = state.place;
  const w = state.weather;
  $('weatherGrid').innerHTML = w ? [
    [`${Math.round(w.temp)}°C`, sky(w.code)],
    [`${w.wind.toFixed(1)} m/s`, `${t('wind')} ${compass(w.windDeg)}`],
    [`${w.cloud}%`, t('cloud')],
    [`${w.pressure}`, t('hpa')[w.pressureTrend]],
    [`${w.rain} mm`, t('rainNow')],
    [w.isDay ? t('day') : t('night'), `${w.sunrise}–${w.sunset}`],
  ].map(([b, s]) => `<div class="stat"><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join('')
    : `<p class="err">${esc(t('noWeather'))}</p>`;
  renderFishChips();
}

function renderFishChips() {
  // Known sport fish first, then by number of records
  const fish = [...state.fish].sort((a, b) => (!!Engine.SPECIES[b.name] - !!Engine.SPECIES[a.name]) || b.count - a.count);
  $('fishList').innerHTML = fish.length
    ? fish.map((f) => {
      const c = commonName(f.name);
      const sel = state.preferred.includes(f.name);
      return `<button type="button" class="chip${sel ? ' sel' : ''}" data-sci="${esc(f.name)}">${sel ? '🎯 ' : ''}${c ? esc(c) + ' ' : ''}<i>${esc(f.name)}</i></button>`;
    }).join('')
    : `<span class="muted">${esc(t('noFish'))}</span>`;
  const pl = $('prefLine');
  if (state.preferred.length) {
    pl.classList.remove('hidden');
    pl.innerHTML = `🎯 <b>${t('fishingFor')}</b> ${esc(state.preferred.map((s) => commonName(s) || s).join(', '))} · <button type="button" id="clearPref">${t('clearPref')}</button>`;
    $('clearPref').onclick = () => { state.preferred = []; savePref(); renderFishChips(); rerank(); };
  } else pl.classList.add('hidden');
}
$('fishList').addEventListener('click', (e) => {
  const chip = e.target.closest('button.chip'); if (chip) openSheet(chip.dataset.sci);
});

/* ---------- step 2: environment ---------- */
function renderSegs() {
  document.querySelectorAll('.seg').forEach((seg) => {
    const g = seg.dataset.group;
    seg.innerHTML = Object.entries(t('opts')[g]).map(([k, label]) =>
      `<button type="button" data-v="${k}" class="${state.env[g] === k ? 'on' : ''}">${esc(label)}</button>`).join('');
  });
}
document.querySelectorAll('.seg').forEach((seg) => seg.addEventListener('click', (e) => {
  const v = e.target.dataset?.v; if (!v) return;
  state.env[seg.dataset.group] = v;
  state.envSetByUser[seg.dataset.group] = true;
  renderSegs(); rerank();
}));

let photoTooDark = false;
function renderDarkNote() {
  const dark = photoTooDark || (state.weather && !state.weather.isDay);
  $('darkNote').classList.toggle('hidden', !dark);
  $('darkNote').textContent = photoTooDark ? t('tooDark') : t('darkNow');
}

$('envInput').onchange = async (e) => {
  const file = e.target.files[0]; if (!file) return;
  try {
    const img = await loadImage(file);
    $('envPreview').src = img.src; $('envPreview').classList.remove('hidden');
    const r = Vision.readEnvironment(img);
    photoTooDark = r.tooDark;
    if (r.tooDark) {
      // Too dark to read anything reliable: keep the user's / weather's choices, only nudge light
      if (!state.envSetByUser.light && !['night', 'low'].includes(state.env.light)) state.env.light = 'night';
    } else {
      if (!state.envSetByUser.light) state.env.light = state.weather && !state.weather.isDay ? 'night' : r.light;
      if (!state.envSetByUser.clarity) state.env.clarity = r.clarity;
      state.envFromPhoto = true;
    }
    renderSegs(); renderDarkNote(); rerank();
  } finally { e.target.value = ''; }
};

/* ---------- image utils ---------- */
async function loadImage(file) {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode();
  return img;
}
// Downscale for the detector (keeps it fast and light on memory, important on iPhone)
function scaledUrl(img, max = 1024) {
  const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement('canvas');
  c.width = Math.round(img.naturalWidth * scale); c.height = Math.round(img.naturalHeight * scale);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.9);
}

/* ---------- step 3: bait box ---------- */
$('baitInput').onchange = async (e) => {
  const file = e.target.files[0]; if (!file) return;
  const out = $('baitResult');
  try {
    const img = await loadImage(file);
    drawBaits(img, []);
    const firstTime = !modelOk();
    busy(true, firstTime ? t('downloading')(0, 155) : t('detecting'), firstTime ? 0 : null);
    let dets;
    try {
      dets = await Vision.detectBaits(scaledUrl(img), (p, total) => {
        if (p >= 1) busy(true, t('detecting'));
        else busy(true, t('downloading')(p, total ? Math.round(total / 1e6) : 155), p);
      });
    } catch (err) { console.error(err); throw new Error(`${t('modelFail')} (${String(err.message).slice(0, 300)})`); }
    localStorage.setItem('wb_model_ok', '1');
    $('modelNote').textContent = t('modelReady');
    $('modelBanner').classList.add('hidden');
    if (!dets.length) throw new Error(t('noBaits'));
    state.bait = { img, baits: dets.map((d) => ({ ...d, color: Vision.colorOf(img, d.box) })) };
    renderBaitResult();
    $('baitStage').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) { state.bait = null; showError(out, err.message); }
  finally { busy(false); e.target.value = ''; }
};

function rerank() { if (state.bait) renderBaitResult(); }

function renderBaitResult() {
  const { img, baits } = state.bait;
  const res = Engine.rank(baits, state.env, state.weather, state.fish, lang, state.preferred);
  const best = res.baits[0];
  drawBaits(img, res.baits, best);
  const name = (b) => `${Engine.TYPE_NAMES[b.type][L()]} (${Engine.COLOR_NAMES[b.color][L()]})`;
  const typeSelect = (b) => `<select data-id="${b.id}">${Engine.TYPES.map((ty) =>
    `<option value="${ty}"${ty === b.type ? ' selected' : ''}>${esc(Engine.TYPE_NAMES[ty][L()])}</option>`).join('')}</select>`;
  const targets = res.targets.map((x) => (Engine.SPECIES[x.key] ? (lang === 'no' ? x.sp.no : x.sp.en) : (commonName(x.key) || x.key))).join(', ');
  const out = $('baitResult');
  out.classList.remove('hidden'); out.classList.add('pick');
  out.innerHTML = `<h4>✅ ${t('use')} #${best.id}: ${esc(name(best))}</h4>
    <p>${esc(best.why.join(' · ') || '')}</p>
    <p><b>${t('target')}:</b> ${state.preferred.length ? '🎯 ' : ''}${esc(targets)}<br>
    ${res.size ? `<b>${t('size')}:</b> ${esc(res.size)}<br>` : ''}
    <b>${t('how')}:</b> ${esc(res.tip)}</p>
    <h3>${t('others')}</h3>
    <ul class="baits">${res.baits.map((b) => `<li class="${b === best ? 'best' : ''}">
      <span class="badge">#${b.id}</span>${typeSelect(b)}<span class="score">${b.score}</span></li>`).join('')}</ul>
    <p class="tiny muted">${t('fixType')}</p>`;
  out.querySelectorAll('select').forEach((sel) => sel.onchange = () => {
    const b = state.bait.baits.find((x) => x.id === Number(sel.dataset.id));
    if (b) { b.type = sel.value; renderBaitResult(); }
  });
}

function drawBaits(img, baits, best) {
  $('baitStage').classList.remove('hidden');
  const cv = $('baitCanvas');
  const scale = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
  cv.width = Math.round(img.naturalWidth * scale);
  cv.height = Math.round(img.naturalHeight * scale);
  const ctx = cv.getContext('2d');
  ctx.drawImage(img, 0, 0, cv.width, cv.height);
  if (!baits.length) return;
  const W = cv.width, H = cv.height, lw = Math.max(3, W / 200);
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0, 0, W, H); // dim everything
  [...baits.filter((b) => b !== best), best].forEach((b) => {   // winner drawn last, on top
    const [x0, y0, x1, y1] = b.box;
    const x = x0 * W, y = y0 * H, w = (x1 - x0) * W, h = (y1 - y0) * H;
    const isBest = b === best;
    if (isBest) { ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.drawImage(img, 0, 0, W, H); ctx.restore(); }
    ctx.lineWidth = isBest ? lw * 2 : lw;
    ctx.strokeStyle = isBest ? '#4fd1a5' : 'rgba(255,255,255,0.6)';
    ctx.strokeRect(x, y, w, h);
    const label = isBest ? `★ #${b.id}` : `#${b.id}`;
    const fs = Math.max(14, W / (isBest ? 24 : 36));
    ctx.font = `700 ${fs}px system-ui, sans-serif`;
    const tw = ctx.measureText(label).width + fs * 0.8;
    const ly = y - fs * 1.4 < 0 ? y + h : y - fs * 1.4;
    const lx = Math.min(x, W - tw);
    ctx.fillStyle = isBest ? '#4fd1a5' : 'rgba(0,0,0,0.75)';
    ctx.fillRect(lx, ly, tw, fs * 1.4);
    ctx.fillStyle = isBest ? '#04211a' : '#fff';
    ctx.fillText(label, lx + fs * 0.4, ly + fs * 1.05);
  });
}

/* ---------- start ---------- */
loadWikiCacheFromStorage();
applyLang();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
