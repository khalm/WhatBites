/* WhatBites rules engine — picks the best bait from what's in the box.
 * Pure functions, no network. Works in browser (window.Engine) and Node (module.exports) for testing.
 */
(function (root) {
  const TYPES = ['spoon', 'spinner', 'wobbler', 'softbait', 'jig', 'fly', 'worm'];

  const TYPE_NAMES = {
    spoon: ['Sluk', 'Spoon'], spinner: ['Spinner', 'Spinner'], wobbler: ['Wobbler', 'Crankbait/wobbler'],
    softbait: ['Softbait', 'Soft plastic'], jig: ['Jigg/pilk', 'Jig'], fly: ['Flue', 'Fly'], worm: ['Mark/naturlig agn', 'Worm/natural bait'],
  };
  const COLOR_NAMES = {
    silver: ['sølv', 'silver'], gold: ['gull', 'gold'], bright: ['sterk farge', 'bright colour'],
    dark: ['mørk', 'dark'], natural: ['naturlig farge', 'natural colour'],
  };

  // Lure preference 0–1 per species, in order of TYPES. habitat: f = fresh, s = salt, b = both
  const S = (no, en, habitat, p) => ({ no, en, habitat, pref: Object.fromEntries(TYPES.map((t, i) => [t, p[i]])) });
  const SPECIES = {
    'Esox lucius': S('Gjedde', 'Pike', 'f', [0.9, 0.7, 0.9, 0.9, 0.4, 0.3, 0.2]),
    'Perca fluviatilis': S('Abbor', 'Perch', 'f', [0.5, 0.9, 0.5, 0.9, 0.7, 0.3, 0.9]),
    'Salmo trutta': S('Ørret', 'Brown trout', 'b', [0.85, 0.9, 0.7, 0.4, 0.2, 0.9, 0.8]),
    'Salmo salar': S('Laks', 'Salmon', 'b', [0.7, 0.7, 0.8, 0.2, 0.1, 0.9, 0.6]),
    'Oncorhynchus mykiss': S('Regnbueørret', 'Rainbow trout', 'b', [0.8, 0.9, 0.6, 0.5, 0.3, 0.8, 0.8]),
    'Salvelinus alpinus': S('Røye', 'Arctic char', 'f', [0.7, 0.8, 0.5, 0.3, 0.4, 0.8, 0.8]),
    'Thymallus thymallus': S('Harr', 'Grayling', 'f', [0.3, 0.6, 0.3, 0.2, 0.3, 1.0, 0.7]),
    'Sander lucioperca': S('Gjørs', 'Zander', 'f', [0.4, 0.4, 0.7, 0.9, 0.8, 0.1, 0.3]),
    'Coregonus lavaretus': S('Sik', 'Whitefish', 'f', [0.2, 0.3, 0.1, 0.3, 0.4, 0.7, 0.7]),
    'Lota lota': S('Lake', 'Burbot', 'f', [0.2, 0.1, 0.2, 0.4, 0.5, 0.0, 0.9]),
    'Anguilla anguilla': S('Ål', 'Eel', 'b', [0, 0, 0, 0.2, 0, 0, 1.0]),
    'Rutilus rutilus': S('Mort', 'Roach', 'f', [0, 0.2, 0, 0.1, 0, 0.3, 1.0]),
    'Abramis brama': S('Brasme', 'Bream', 'f', [0, 0, 0, 0.1, 0, 0.1, 1.0]),
    'Tinca tinca': S('Suter', 'Tench', 'f', [0, 0, 0, 0.1, 0, 0, 1.0]),
    'Carassius carassius': S('Karuss', 'Crucian carp', 'f', [0, 0, 0, 0, 0, 0, 1.0]),
    'Cyprinus carpio': S('Karpe', 'Carp', 'f', [0, 0, 0, 0.1, 0, 0, 1.0]),
    'Leuciscus idus': S('Vederbuk', 'Ide', 'f', [0.3, 0.6, 0.3, 0.3, 0.1, 0.6, 0.9]),
    'Squalius cephalus': S('Stam', 'Chub', 'f', [0.3, 0.6, 0.4, 0.3, 0.1, 0.6, 0.9]),
    'Gadus morhua': S('Torsk', 'Cod', 's', [0.6, 0.2, 0.4, 0.9, 1.0, 0.1, 0.7]),
    'Pollachius virens': S('Sei', 'Saithe', 's', [0.8, 0.3, 0.6, 0.9, 0.9, 0.3, 0.4]),
    'Pollachius pollachius': S('Lyr', 'Pollack', 's', [0.8, 0.3, 0.7, 0.9, 0.9, 0.3, 0.4]),
    'Melanogrammus aeglefinus': S('Hyse', 'Haddock', 's', [0.2, 0, 0.1, 0.5, 0.6, 0, 1.0]),
    'Molva molva': S('Lange', 'Ling', 's', [0.2, 0, 0.2, 0.7, 0.9, 0, 0.8]),
    'Scomber scombrus': S('Makrell', 'Mackerel', 's', [0.9, 0.6, 0.4, 0.4, 0.8, 0.5, 0.3]),
    'Dicentrarchus labrax': S('Havabbor', 'Sea bass', 's', [0.6, 0.3, 0.9, 0.9, 0.5, 0.4, 0.6]),
    'Labrus bergylta': S('Berggylt', 'Ballan wrasse', 's', [0.2, 0.1, 0.3, 0.8, 0.5, 0, 0.9]),
    'Platichthys flesus': S('Skrubbe', 'Flounder', 'b', [0.1, 0.1, 0, 0.4, 0.2, 0, 1.0]),
    'Pleuronectes platessa': S('Rødspette', 'Plaice', 's', [0.1, 0, 0, 0.3, 0.2, 0, 1.0]),
    'Belone belone': S('Horngjel', 'Garfish', 's', [0.8, 0.5, 0.3, 0.2, 0.3, 0.5, 0.3]),
    'Sebastes norvegicus': S('Uer', 'Redfish', 's', [0.3, 0, 0.1, 0.7, 0.9, 0, 0.8]),
    'Anarhichas lupus': S('Steinbit', 'Wolffish', 's', [0.1, 0, 0.1, 0.5, 0.6, 0, 0.9]),
  };

  // Fallback targets when no local records match, per water type
  const DEFAULTS = {
    lake: ['Perca fluviatilis', 'Esox lucius', 'Salmo trutta'],
    river: ['Salmo trutta', 'Thymallus thymallus', 'Salmo salar'],
    sea: ['Gadus morhua', 'Pollachius virens', 'Salmo trutta'],
  };

  const isSeaWater = (w) => w === 'sea';
  const habitatOk = (sp, water) => sp.habitat === 'b' || (isSeaWater(water) ? sp.habitat === 's' : sp.habitat === 'f');

  /** Guess water type from which species are recorded nearby (marine vs freshwater). */
  function guessWater(fishList) {
    let sea = 0, fresh = 0;
    for (const f of fishList || []) {
      const sp = SPECIES[f.name]; if (!sp) continue;
      if (sp.habitat === 's') sea += f.count; else if (sp.habitat === 'f') fresh += f.count;
    }
    if (sea > fresh * 1.5) return 'sea';
    if (fresh > 0) return 'lake';
    return null;
  }

  /** Choose up to 3 target species with weights summing to 1. */
  // Used when the user picks a species we have no profile for
  const GENERIC = { no: '', en: '', habitat: 'b', pref: { spoon: 0.6, spinner: 0.6, wobbler: 0.6, softbait: 0.6, jig: 0.5, fly: 0.5, worm: 0.7 } };

  function pickTargets(fishList, water, preferred) {
    if (preferred && preferred.length) {
      return preferred.map((key) => ({ key, w: 1 / preferred.length, sp: SPECIES[key] || { ...GENERIC, no: key, en: key } }));
    }
    const cand = (fishList || [])
      .filter((f) => SPECIES[f.name] && habitatOk(SPECIES[f.name], water))
      .map((f) => ({ key: f.name, w: Math.log(1 + f.count) * (gameWeight(f.name)) }))
      .sort((a, b) => b.w - a.w).slice(0, 3);
    const list = [...cand];
    // Top up with typical species for this water type so there are always a few targets
    for (const [i, key] of (DEFAULTS[water] || DEFAULTS.lake).entries()) {
      if (list.length >= 3) break;
      if (!list.some((x) => x.key === key)) list.push({ key, w: (cand.length ? 0.5 : 3 - i) });
    }
    const sum = list.reduce((s, x) => s + x.w, 0) || 1;
    return list.map((x) => ({ key: x.key, w: x.w / sum, sp: SPECIES[x.key] }));
  }
  // Prefer popular sport fish over small bait fish when both are present
  function gameWeight(key) {
    const small = ['Rutilus rutilus', 'Abramis brama', 'Carassius carassius', 'Tinca tinca', 'Platichthys flesus', 'Pleuronectes platessa'];
    return small.includes(key) ? 0.4 : 1;
  }

  /**
   * Score each bait.
   * baits: [{id, type, color}]  type ∈ TYPES, color ∈ silver|gold|bright|dark|natural
   * env:   {water: lake|river|sea, clarity: clear|stained|murky, light: sun|overcast|low}
   * wx:    weather object from app (temp, wind, pressureTrend, isDay, month index)
   */
  function rank(baits, env, wx, fishList, lang = 'no', preferred = []) {
    const L = lang === 'no' ? 0 : 1;
    const targets = pickTargets(fishList, env.water, preferred);
    const month = wx?.monthIndex ?? new Date().getMonth();
    const cold = (wx && wx.temp < 6) || [10, 11, 0, 1, 2].includes(month);
    const warm = wx && wx.temp > 16;
    const windy = wx && wx.wind > 8;
    const night = env.light === 'night';
    const low = env.light === 'low' || env.light === 'overcast' || night;

    const scored = baits.map((b) => {
      const why = [];
      let s = targets.reduce((acc, t) => acc + t.w * (t.sp.pref[b.type] ?? 0.3), 0) * 70; // 0–70 from species fit
      const best = targets.slice().sort((a, c) => (c.sp.pref[b.type] * c.w) - (a.sp.pref[b.type] * a.w))[0];
      if (best && best.sp.pref[b.type] >= 0.7) why.push(lang === 'no' ? `bra for ${best.sp.no.toLowerCase()}` : `good for ${best.sp.en.toLowerCase()}`);

      const add = (v, no, en) => { s += v; if (v > 0 && no) why.push(L ? en : no); };
      // Water clarity → colour & vibration
      if (env.clarity === 'murky') {
        if (b.color === 'bright' || b.color === 'gold') add(10, 'sterk farge synes i grumsete vann', 'bright colour shows in murky water');
        if (b.color === 'natural' || b.color === 'silver') add(-4);
        if (b.type === 'spinner' || b.type === 'wobbler') add(6, 'gir vibrasjon fisken kjenner', 'vibration fish can feel');
        if (b.type === 'fly') add(-6);
      } else if (env.clarity === 'clear') {
        if (b.color === 'natural' || b.color === 'silver') add(8, 'naturlig farge i klart vann', 'natural look in clear water');
        if (b.color === 'bright') add(-4);
        if (b.type === 'fly' && !isSeaWater(env.water)) add(4);
      }
      // Light
      if (night) {
        if (b.type === 'wobbler' || b.type === 'spinner') add(6, 'gir vibrasjon i mørket', 'vibration helps fish find it in the dark');
        if (b.type === 'worm') add(5, 'lukt hjelper om natta', 'scent helps at night');
        if (b.type === 'fly' || b.type === 'spoon') add(-3);
      }
      if (low) {
        if (b.color === 'dark') add(6, 'mørk silhuett i lite lys', 'dark silhouette in low light');
        if (b.color === 'gold' || b.color === 'bright') add(4, 'synlig i lite lys', 'visible in low light');
      } else if (env.light === 'sun') {
        if (b.color === 'silver') add(6, 'sølv blinker i sola', 'silver flashes in sunlight');
        if (b.type === 'jig' || b.type === 'softbait') add(3, 'fisken står dypere i sterk sol', 'fish hold deeper in bright sun');
      }
      // Temperature / season
      if (cold) {
        if (b.type === 'jig' || b.type === 'softbait' || b.type === 'worm') add(7, 'kaldt vann: sakte og dypt', 'cold water: slow and deep');
        if (b.type === 'spinner' || b.type === 'wobbler') add(-4);
      } else if (warm) {
        if (b.type === 'spinner' || b.type === 'wobbler' || b.type === 'spoon') add(5, 'aktiv fisk i varmt vær', 'active fish in warm weather');
      }
      // Wind
      if (windy) {
        if (b.type === 'spoon' || b.type === 'jig') add(5, 'tungt nok til å kaste i vind', 'heavy enough to cast in wind');
        if (b.type === 'fly') add(-8);
      }
      // Pressure
      if (wx?.pressureTrend === 'falling') add(3); // fish tend to feed before a front — small boost for all
      if (wx?.pressureTrend === 'rising' && (b.type === 'softbait' || b.type === 'worm')) add(4, 'stigende trykk: fisk er treg, fisk forsiktig', 'rising pressure: sluggish fish, go subtle');
      // Water type
      if (env.water === 'river' && (b.type === 'spinner' || b.type === 'spoon' || b.type === 'fly')) add(4, 'fungerer godt i strøm', 'works well in current');
      if (env.water === 'sea' && (b.type === 'jig' || b.type === 'spoon')) add(4, 'klassisk i sjøen', 'a sea classic');

      return { ...b, score: Math.max(0, Math.min(100, Math.round(s + 15))), why: why.slice(0, 3) };
    });
    scored.sort((a, b) => b.score - a.score);
    const top = scored[0];
    return {
      baits: scored, targets,
      tip: top ? howTo(top.type, env, cold, lang) : '',
      size: top ? sizeFor(top.type, targets, env, windy || cold, lang) : '',
    };
  }

  // Typical bait size per species: lure weight (g), lure length (cm), hook size, fly size
  const SIZES = {
    'Esox lucius': { g: [15, 40], cm: [10, 20], hook: '1/0–4/0', fly: '2/0–4/0' },
    'Perca fluviatilis': { g: [3, 10], cm: [3, 7], hook: '6–10', fly: '8–12' },
    'Salmo trutta': { g: [5, 15], cm: [4, 8], hook: '6–10', fly: '10–16', sea: { g: [15, 25], cm: [6, 10], hook: '2–6', fly: '4–8' } },
    'Salmo salar': { g: [15, 30], cm: [7, 12], hook: '2–6', fly: '4–10' },
    'Oncorhynchus mykiss': { g: [5, 15], cm: [4, 8], hook: '6–10', fly: '10–14' },
    'Salvelinus alpinus': { g: [5, 12], cm: [3, 6], hook: '8–12', fly: '12–16' },
    'Thymallus thymallus': { g: [2, 6], cm: [2, 4], hook: '10–14', fly: '14–18' },
    'Sander lucioperca': { g: [10, 25], cm: [8, 12], hook: '1–2/0', fly: '1/0–2/0' },
    'Coregonus lavaretus': { g: [2, 6], cm: [2, 4], hook: '12–16', fly: '14–18' },
    'Lota lota': { g: [15, 30], cm: [6, 10], hook: '1–4', fly: '-' },
    'Anguilla anguilla': { g: [10, 30], cm: [5, 10], hook: '2–6', fly: '-' },
    'Rutilus rutilus': { g: [1, 4], cm: [2, 3], hook: '14–18', fly: '16–18' },
    'Abramis brama': { g: [1, 5], cm: [2, 4], hook: '12–16', fly: '-' },
    'Tinca tinca': { g: [1, 5], cm: [2, 4], hook: '10–14', fly: '-' },
    'Carassius carassius': { g: [1, 4], cm: [2, 3], hook: '14–18', fly: '-' },
    'Cyprinus carpio': { g: [5, 15], cm: [3, 5], hook: '4–8', fly: '-' },
    'Leuciscus idus': { g: [3, 8], cm: [3, 6], hook: '8–12', fly: '10–14' },
    'Squalius cephalus': { g: [3, 10], cm: [3, 6], hook: '6–10', fly: '8–12' },
    'Gadus morhua': { g: [30, 120], cm: [10, 20], hook: '2/0–6/0', fly: '2/0' },
    'Pollachius virens': { g: [20, 80], cm: [8, 15], hook: '1/0–4/0', fly: '1/0–2/0' },
    'Pollachius pollachius': { g: [20, 60], cm: [8, 15], hook: '1/0–4/0', fly: '1/0–2/0' },
    'Melanogrammus aeglefinus': { g: [60, 200], cm: [8, 12], hook: '2–1/0', fly: '-' },
    'Molva molva': { g: [150, 400], cm: [15, 25], hook: '6/0–10/0', fly: '-' },
    'Scomber scombrus': { g: [20, 40], cm: [5, 8], hook: '4–8', fly: '4–8' },
    'Dicentrarchus labrax': { g: [15, 30], cm: [10, 15], hook: '1–2/0', fly: '1/0–2/0' },
    'Labrus bergylta': { g: [10, 25], cm: [5, 10], hook: '1–4', fly: '-' },
    'Platichthys flesus': { g: [30, 60], cm: [4, 6], hook: '4–8', fly: '-' },
    'Pleuronectes platessa': { g: [30, 60], cm: [4, 6], hook: '4–8', fly: '-' },
    'Belone belone': { g: [10, 25], cm: [5, 8], hook: '4–8', fly: '4–8' },
    'Sebastes norvegicus': { g: [100, 300], cm: [10, 15], hook: '2/0–4/0', fly: '-' },
    'Anarhichas lupus': { g: [100, 300], cm: [10, 20], hook: '4/0–6/0', fly: '-' },
  };

  /** Size/weight advice for the chosen bait type, for the target that suits it best. */
  function sizeFor(type, targets, env, heavier, lang) {
    const no = lang === 'no';
    const t = targets.filter((x) => SIZES[x.key])
      .sort((a, b) => (b.sp.pref[type] * b.w) - (a.sp.pref[type] * a.w))[0];
    if (!t) return '';
    let z = SIZES[t.key];
    if (z.sea && env.water === 'sea') z = z.sea;
    const who = (no ? t.sp.no : t.sp.en).toLowerCase();
    if (type === 'fly') return z.fly === '-' ? '' : (no ? `Flue str. ${z.fly} for ${who}.` : `Fly size ${z.fly} for ${who}.`);
    if (type === 'worm') return no ? `Krok str. ${z.hook} for ${who}.` : `Hook size ${z.hook} for ${who}.`;
    const extra = heavier ? (no ? ' Velg øvre del i vind, kulde eller dypt vann.' : ' Go to the upper end in wind, cold or deep water.') : '';
    return no ? `${z.g[0]}–${z.g[1]} g, ${z.cm[0]}–${z.cm[1]} cm for ${who}.${extra}`
      : `${z.g[0]}–${z.g[1]} g, ${z.cm[0]}–${z.cm[1]} cm for ${who}.${extra}`;
  }

  function howTo(type, env, cold, lang) {
    const no = lang === 'no';
    const slow = cold ? (no ? 'sakte' : 'slowly') : (no ? 'i jevnt tempo' : 'at a steady pace');
    const tips = {
      spoon: no ? `Kast langt, la sluken synke litt og sveiv inn ${slow} med små rykk.` : `Cast far, let it sink a little and retrieve ${slow} with small twitches.`,
      spinner: no ? `Sveiv inn ${slow} rett under overflaten, akkurat fort nok til at bladet roterer.` : `Retrieve ${slow} just under the surface, just fast enough to spin the blade.`,
      wobbler: no ? `Sveiv inn ${slow} med korte pauser — mange hugg kommer i pausen.` : `Retrieve ${slow} with short pauses — many strikes come on the pause.`,
      softbait: no ? `La den synke til bunnen, løft stanga og la den dale ned igjen.` : `Let it sink to the bottom, lift the rod and let it flutter back down.`,
      jig: no ? `Slipp til bunnen, sveiv opp en meter og jigg rolig opp og ned.` : `Drop to the bottom, reel up a metre and jig gently up and down.`,
      fly: no ? `Fisk nær kanter og strømnakker; la flua drive naturlig.` : `Fish near edges and seams; let the fly drift naturally.`,
      worm: no ? `Fisk med dupp eller på bunnen nær struktur, og vær tålmodig.` : `Fish under a float or on the bottom near structure, and be patient.`,
    };
    return tips[type] || '';
  }

  const api = { SIZES, sizeFor, TYPES, TYPE_NAMES, COLOR_NAMES, SPECIES, guessWater, pickTargets, rank };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Engine = api;
})(typeof window !== 'undefined' ? window : globalThis);
