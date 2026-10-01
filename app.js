/* WhatBites — velg riktig agn fra boksen din / pick the right bait from your box.
 * Data (free, no key): Open-Meteo (weather), GBIF (fish records), OpenStreetMap Nominatim (place name).
 * Photo analysis: Claude API with the user's own key, stored in localStorage on the device only.
 */
const $ = (id) => document.getElementById(id);

/* ---------- language ---------- */
const T = {
  no: {
    settings: 'Innstillinger', s1title: 'Sted og vær', s1intro: 'Finn plassen din for å hente vær og hvilke fisk som finnes der.',
    useLoc: '📍 Bruk min posisjon', refreshLoc: '📍 Oppdater posisjon', finding: 'Finner deg…', loading: 'Henter vær og fisk…',
    gotIt: 'Klart. Vis meg vannet nå.', noGeo: 'Nettleseren støtter ikke posisjon.',
    geoFail: (m) => `Fikk ikke posisjon (${m}). Tillat posisjon for denne siden og prøv igjen.`,
    fishNearby: 'Fisk registrert i nærheten', fishSource: 'Arter fra GBIF-observasjoner innen ca. 30 km.',
    noFish: 'Fant ingen fiskeregistreringer i nærheten — bildesjekken virker likevel.', noWeather: 'Vær er ikke tilgjengelig akkurat nå.',
    wind: 'Vind', cloud: 'Skydekke', rainNow: 'Nedbør nå', day: '☀️ Dag', night: '🌙 Natt',
    hpa: { rising: 'hPa, stigende', falling: 'hPa, fallende', steady: 'hPa, stabilt' },
    s2title: 'Vis vannet', s2intro: 'Ta et bilde av plassen du fisker — vannet, bredden og himmelen.', s2btn: '📷 Ta bilde av plassen',
    readingWater: 'Leser vannet…', structure: 'Struktur', target: 'Mål', how: 'Slik',
    s3title: 'Vis agnboksen', s3intro: 'Åpne boksen og ta bilde rett ovenfra i godt lys.', s3btn: '🎣 Ta bilde av agnboksen',
    checkingBaits: 'Sjekker agnet ditt…', use: 'Bruk', others: 'Andre alternativer',
    noBaits: 'Fant ikke noe agn. Prøv et nærmere og lysere bilde rett ovenfra.',
    doStep1: 'Tips: gjør steg 1 først, så passer valget til vær og lokal fisk.',
    disclaimer: 'Agnvalg er forslag — sjekk lokale fiskeregler og fredningstider.',
    keyHelp: 'WhatBites bruker Claude til å se på bildene dine. Lim inn en Anthropic API-nøkkel (fra console.anthropic.com). Den lagres bare på denne telefonen.',
    apiKey: 'API-nøkkel', model: 'Modell', cancel: 'Avbryt', save: 'Lagre',
    needKey: 'Legg inn API-nøkkelen i Innstillinger først.', badAnswer: 'Uventet svar fra AI. Prøv et annet bilde.',
    aiLang: 'Norwegian (bokmål)',
  },
  en: {
    settings: 'Settings', s1title: 'Where & weather', s1intro: 'Find your spot to load weather and the fish that live there.',
    useLoc: '📍 Use my location', refreshLoc: '📍 Refresh location', finding: 'Finding you…', loading: 'Loading weather and fish…',
    gotIt: 'Got it. Now show me the water.', noGeo: 'This browser has no location support.',
    geoFail: (m) => `Couldn't get location (${m}). Allow location for this site and try again.`,
    fishNearby: 'Fish recorded nearby', fishSource: 'Species from GBIF observation records within ~30 km.',
    noFish: 'No fish records found nearby — the photo check will still work.', noWeather: 'Weather unavailable right now.',
    wind: 'Wind', cloud: 'Cloud cover', rainNow: 'Rain now', day: '☀️ Day', night: '🌙 Night',
    hpa: { rising: 'hPa, rising', falling: 'hPa, falling', steady: 'hPa, steady' },
    s2title: 'Show the water', s2intro: "Take a photo of the spot you're fishing — the water, shore and sky.", s2btn: '📷 Photograph the spot',
    readingWater: 'Reading the water…', structure: 'Structure', target: 'Target', how: 'How',
    s3title: 'Show your bait box', s3intro: 'Open your tackle box and photograph it from above in good light.', s3btn: '🎣 Photograph bait box',
    checkingBaits: 'Checking your baits…', use: 'Use', others: 'Other options',
    noBaits: "I couldn't spot any baits. Try a closer, brighter photo from above.",
    doStep1: 'Tip: do step 1 first for a pick that matches weather and local fish.',
    disclaimer: 'Bait picks are suggestions — check local fishing rules and seasons.',
    keyHelp: 'WhatBites uses Claude to look at your photos. Paste an Anthropic API key (from console.anthropic.com). It is stored only on this phone.',
    apiKey: 'API key', model: 'Model', cancel: 'Cancel', save: 'Save',
    needKey: 'Add your API key in Settings first.', badAnswer: 'Unexpected answer from the AI. Try another photo.',
    aiLang: 'English',
  },
};
let lang = localStorage.getItem('wb_ui') || 'no';
const t = (k) => T[lang][k];

function applyLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  $('langBtn').textContent = lang === 'no' ? 'EN' : 'NO';
  if (state.lat !== null) { $('locBtn').textContent = t('refreshLoc'); renderConditions(); }
}
$('langBtn').onclick = () => { lang = lang === 'no' ? 'en' : 'no'; localStorage.setItem('wb_ui', lang); applyLang(); };

/* ---------- state ---------- */
const state = { lat: null, lon: null, place: '', weather: null, fish: [], environment: null };

/* ---------- settings ---------- */
const settings = {
  get key() { return localStorage.getItem('wb_key') || ''; },
  get model() { return localStorage.getItem('wb_model') || 'claude-sonnet-5-5'; },
};
function openSettings() {
  $('apiKey').value = settings.key;
  $('model').value = localStorage.getItem('wb_model') || '';
  $('settings').showModal();
}
$('settingsBtn').onclick = openSettings;
$('settings').addEventListener('close', () => {
  if ($('settings').returnValue !== 'save') return;
  localStorage.setItem('wb_key', $('apiKey').value.trim());
  const m = $('model').value.trim(); m ? localStorage.setItem('wb_model', m) : localStorage.removeItem('wb_model');
});

/* ---------- helpers ---------- */
function busy(on, text = '') { $('busyText').textContent = text; $('busy').classList.toggle('hidden', !on); }
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function showError(el, msg) { el.classList.remove('hidden', 'pick'); el.innerHTML = `<p class="err">${esc(msg)}</p>`; }
async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

// WMO weather codes → [Norwegian, English]
const WMO = {
  0: ['Klart', 'Clear'], 1: ['Lettskyet', 'Mostly clear'], 2: ['Delvis skyet', 'Partly cloudy'], 3: ['Overskyet', 'Overcast'],
  45: ['Tåke', 'Fog'], 48: ['Rimtåke', 'Rime fog'], 51: ['Lett yr', 'Light drizzle'], 53: ['Yr', 'Drizzle'], 55: ['Kraftig yr', 'Heavy drizzle'],
  61: ['Lett regn', 'Light rain'], 63: ['Regn', 'Rain'], 65: ['Kraftig regn', 'Heavy rain'], 66: ['Underkjølt regn', 'Freezing rain'],
  67: ['Underkjølt regn', 'Freezing rain'], 71: ['Lett snø', 'Light snow'], 73: ['Snø', 'Snow'], 75: ['Kraftig snø', 'Heavy snow'],
  77: ['Snøkorn', 'Snow grains'], 80: ['Regnbyger', 'Showers'], 81: ['Regnbyger', 'Showers'], 82: ['Kraftige byger', 'Heavy showers'],
  85: ['Snøbyger', 'Snow showers'], 86: ['Snøbyger', 'Snow showers'], 95: ['Torden', 'Thunderstorm'], 96: ['Torden', 'Thunderstorm'], 99: ['Torden', 'Thunderstorm'],
};
const sky = (code) => (WMO[code] || ['Ukjent', 'Unknown'])[lang === 'no' ? 0 : 1];
const compass = (deg) => ['N', lang === 'no' ? 'NØ' : 'NE', lang === 'no' ? 'Ø' : 'E', lang === 'no' ? 'SØ' : 'SE', 'S', 'SW', 'W', 'NW'][Math.round(deg / 45) % 8]
  .replace(/W/g, lang === 'no' ? 'V' : 'W');

// Common names for frequent Nordic/European species: scientific → [Norwegian, English]
const NAMES = {
  'Salmo trutta': ['Ørret', 'Brown trout'], 'Salmo salar': ['Laks', 'Atlantic salmon'], 'Salvelinus alpinus': ['Røye', 'Arctic char'],
  'Oncorhynchus mykiss': ['Regnbueørret', 'Rainbow trout'], 'Thymallus thymallus': ['Harr', 'Grayling'], 'Esox lucius': ['Gjedde', 'Pike'],
  'Perca fluviatilis': ['Abbor', 'Perch'], 'Sander lucioperca': ['Gjørs', 'Zander'], 'Rutilus rutilus': ['Mort', 'Roach'],
  'Abramis brama': ['Brasme', 'Bream'], 'Tinca tinca': ['Suter', 'Tench'], 'Carassius carassius': ['Karuss', 'Crucian carp'],
  'Cyprinus carpio': ['Karpe', 'Carp'], 'Leuciscus idus': ['Vederbuk', 'Ide'], 'Coregonus lavaretus': ['Sik', 'Whitefish'],
  'Lota lota': ['Lake', 'Burbot'], 'Anguilla anguilla': ['Ål', 'European eel'], 'Phoxinus phoxinus': ['Ørekyt', 'Minnow'],
  'Gadus morhua': ['Torsk', 'Atlantic cod'], 'Pollachius virens': ['Sei', 'Saithe'], 'Pollachius pollachius': ['Lyr', 'Pollack'],
  'Melanogrammus aeglefinus': ['Hyse', 'Haddock'], 'Merlangius merlangus': ['Hvitting', 'Whiting'], 'Molva molva': ['Lange', 'Ling'],
  'Scomber scombrus': ['Makrell', 'Mackerel'], 'Clupea harengus': ['Sild', 'Herring'], 'Platichthys flesus': ['Skrubbe', 'Flounder'],
  'Pleuronectes platessa': ['Rødspette', 'Plaice'], 'Hippoglossus hippoglossus': ['Kveite', 'Atlantic halibut'], 'Sebastes norvegicus': ['Uer', 'Redfish'],
  'Anarhichas lupus': ['Steinbit', 'Atlantic wolffish'], 'Labrus bergylta': ['Berggylt', 'Ballan wrasse'], 'Dicentrarchus labrax': ['Havabbor', 'Sea bass'],
  'Myoxocephalus scorpius': ['Ulke', 'Shorthorn sculpin'], 'Gasterosteus aculeatus': ['Trepigget stingsild', 'Three-spined stickleback'],
  'Belone belone': ['Horngjel', 'Garfish'], 'Scophthalmus maximus': ['Piggvar', 'Turbot'], 'Squalius cephalus': ['Stam', 'Chub'],
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
  $('locBtn').textContent = t('refreshLoc');
  renderConditions();
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
    localTime: c.time?.slice(11),
    month: new Date().toLocaleString('en', { month: 'long' }),
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
      for (const r of d.results || []) {
        if (!r.species) continue;
        counts[r.species] = (counts[r.species] || 0) + 1;
      }
      const list = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 25)
        .map(([name, count]) => ({ name, count }));
      if (list.length) return list;
    } catch { /* try next */ }
  }
  return [];
}
const commonName = (sci) => (NAMES[sci] || [])[lang === 'no' ? 0 : 1] || '';

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
  $('fishList').innerHTML = state.fish.length
    ? state.fish.map((f) => { const c = commonName(f.name); return `<span class="chip">${c ? esc(c) + ' ' : ''}<i>${esc(f.name)}</i></span>`; }).join('')
    : `<span class="muted">${esc(t('noFish'))}</span>`;
}

/* ---------- image utils ---------- */
async function loadImage(file) {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode();
  return img;
}
function toJpegBase64(img, max = 1400) {
  const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement('canvas');
  c.width = Math.round(img.naturalWidth * scale);
  c.height = Math.round(img.naturalHeight * scale);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.85).split(',')[1];
}

/* ---------- Claude ---------- */
async function askClaude(imageB64, prompt, maxTokens = 2000) {
  if (!settings.key) { openSettings(); throw new Error(t('needKey')); }
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': settings.key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: settings.model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: [
        { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageB64 } },
        { type: 'text', text: prompt },
      ] }],
    }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error?.message || `API error ${r.status}`);
  const text = (d.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error(t('badAnswer'));
  return JSON.parse(m[0]);
}

function contextText() {
  const w = state.weather;
  const lines = [`Location: ${state.place || 'unknown'}${state.lat !== null ? ` (${state.lat.toFixed(3)}, ${state.lon.toFixed(3)})` : ''}`];
  if (w) lines.push(`Weather now: ${WMO[w.code]?.[1] || 'unknown'}, ${w.temp}°C air, wind ${w.wind} m/s from ${w.windDeg}°, cloud ${w.cloud}%, pressure ${w.pressure} hPa (${w.pressureTrend}), rain ${w.rain} mm, ${w.isDay ? 'daytime' : 'night'}, local time ${w.localTime}, sunrise ${w.sunrise}, sunset ${w.sunset}, month ${w.month}.`);
  if (state.fish.length) lines.push(`Fish species recorded nearby (observation count): ${state.fish.map((f) => `${f.name} (${f.count})`).join('; ')}.`);
  if (state.environment) lines.push(`Fishing spot analysis: ${JSON.stringify(state.environment)}`);
  return lines.join('\n');
}

/* ---------- step 2: environment ---------- */
$('envInput').onchange = async (e) => {
  const file = e.target.files[0]; if (!file) return;
  const out = $('envResult');
  try {
    const img = await loadImage(file);
    $('envPreview').src = img.src; $('envPreview').classList.remove('hidden');
    busy(true, t('readingWater'));
    const res = await askClaude(toJpegBase64(img), `You are an expert angler. Look at this photo of a fishing spot.
Context:
${contextText()}

Reply ONLY with JSON. Write all text values in ${t('aiLang')}, using local common fish names:
{"water_type": "lake, river, stream, sea/coast, fjord, pond…",
 "water_clarity": "clear / slightly stained / murky",
 "light": "bright sun / overcast / low light / dark",
 "structure": "short description of cover/structure: weeds, rocks, drop-offs, current, etc.",
 "likely_targets": ["most likely species to target here now, using the nearby species list if given"],
 "summary": "2 short sentences on how fish will likely behave here right now"}`, 800);
    state.environment = res;
    out.classList.remove('hidden');
    out.innerHTML = `<h4>${esc(res.water_type)} · ${esc(res.water_clarity)} · ${esc(res.light)}</h4>
      <p>${esc(res.summary)}</p>
      <p class="muted"><b>${t('structure')}:</b> ${esc(res.structure)}</p>
      <p class="muted"><b>${t('target')}:</b> ${esc((res.likely_targets || []).join(', '))}</p>`;
  } catch (err) { showError(out, err.message); }
  finally { busy(false); e.target.value = ''; }
};

/* ---------- step 3: bait box ---------- */
$('baitInput').onchange = async (e) => {
  const file = e.target.files[0]; if (!file) return;
  const out = $('baitResult');
  try {
    const img = await loadImage(file);
    drawBaits(img, []);
    busy(true, t('checkingBaits'));
    const res = await askClaude(toJpegBase64(img), `You are an expert angler helping choose a lure/bait from a tackle box.
Context:
${contextText()}

The photo shows the user's bait/tackle box. Identify each distinct bait or lure you can see (up to 12).
For each, give a bounding box as fractions of the image width/height (0 to 1): [x_min, y_min, x_max, y_max]. Be as accurate as you can.
Score how well each suits the current conditions, spot and likely species (0-100).

Reply ONLY with JSON. Write all text values in ${t('aiLang')}, using local common fish and lure names:
{"baits": [{"id": 1, "name": "e.g. silver spoon", "box": [0.1,0.2,0.3,0.4], "score": 85, "reason": "one short sentence"}],
 "best_id": 1,
 "target_species": "species this pick targets",
 "how_to_fish": "1-2 sentences: retrieve speed, depth, where to cast",
 "missing": "optional: a bait type that would be better that is not in the box, or empty string"}`, 2500);
    const baits = (res.baits || []).sort((a, b) => b.score - a.score);
    if (!baits.length) throw new Error(t('noBaits'));
    const best = baits.find((b) => b.id === res.best_id) || baits[0];
    drawBaits(img, baits, best);
    out.classList.remove('hidden');
    out.classList.add('pick');
    out.innerHTML = `<h4>✅ ${t('use')}: ${esc(best.name)}</h4>
      <p>${esc(best.reason)}</p>
      <p><b>${t('target')}:</b> ${esc(res.target_species)}<br><b>${t('how')}:</b> ${esc(res.how_to_fish)}</p>
      ${res.missing ? `<p class="muted">💡 ${esc(res.missing)}</p>` : ''}
      ${baits.length > 1 ? `<h3>${t('others')}</h3><ol>${baits.filter((b) => b !== best).slice(0, 4)
        .map((b) => `<li><b>${esc(b.name)}</b> (${Number(b.score) || 0}) — ${esc(b.reason)}</li>`).join('')}</ol>` : ''}
      ${state.weather ? '' : `<p class="tiny muted">${t('doStep1')}</p>`}`;
  } catch (err) { showError(out, err.message); }
  finally { busy(false); e.target.value = ''; }
};

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
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, W, H); // dim everything
  [...baits.filter((b) => b !== best), best].forEach((b) => {   // winner drawn last, on top
    const [x0, y0, x1, y1] = (b.box || []).map(Number);
    if ([x0, y0, x1, y1].some((v) => Number.isNaN(v))) return;
    const x = x0 * W, y = y0 * H, w = (x1 - x0) * W, h = (y1 - y0) * H;
    const isBest = b === best;
    if (isBest) { ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.drawImage(img, 0, 0, W, H); ctx.restore(); }
    ctx.lineWidth = isBest ? lw * 2 : lw;
    ctx.strokeStyle = isBest ? '#4fd1a5' : 'rgba(255,255,255,0.6)';
    ctx.strokeRect(x, y, w, h);
    const label = isBest ? `★ ${b.name}` : `${Number(b.score) || 0}`;
    const fs = Math.max(14, W / (isBest ? 28 : 40));
    ctx.font = `700 ${fs}px system-ui, sans-serif`;
    const tw = ctx.measureText(label).width + fs * 0.8;
    const ly = y - fs * 1.4 < 0 ? y + h : y - fs * 1.4;
    const lx = Math.min(x, W - tw);
    ctx.fillStyle = isBest ? '#4fd1a5' : 'rgba(0,0,0,0.7)';
    ctx.fillRect(lx, ly, tw, fs * 1.4);
    ctx.fillStyle = isBest ? '#04211a' : '#fff';
    ctx.fillText(label, lx + fs * 0.4, ly + fs * 1.05);
  });
  $('baitStage').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------- start ---------- */
applyLang();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
if (!settings.key) setTimeout(openSettings, 400);
