/* WhatBites trips — saved data for fishing without signal.
 * Pure functions (testable in Node). app.js stores the spots in localStorage.
 *
 * A saved spot = { lat, lon, ts, place, fish, gps, raw (Open-Meteo hourly forecast, ~4 days), name }
 */
(function (root) {
  const R = 6371;
  function distKm(a, b, c, d) {
    const r = Math.PI / 180;
    const x = Math.sin((c - a) * r / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin((d - b) * r / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
  }

  /** Nearest saved spot within maxKm, with its distance. */
  function nearestSpot(spots, lat, lon, maxKm = 30) {
    let best = null;
    for (const s of spots || []) {
      const km = distKm(lat, lon, s.lat, s.lon);
      if (km <= maxKm && (!best || km < best.km)) best = { ...s, km };
    }
    return best;
  }

  /** Add/replace a spot (same place = within 3 km), newest first, keep at most `max`. */
  function upsertSpot(spots, spot, max = 8) {
    const rest = (spots || []).filter((s) => distKm(s.lat, s.lon, spot.lat, spot.lon) > 3);
    return [spot, ...rest].slice(0, max);
  }

  /**
   * Weather for a moment in time from a saved Open-Meteo hourly forecast.
   * Returns null if the forecast doesn't cover that time.
   */
  function weatherAt(raw, nowMs = Date.now()) {
    const h = raw && raw.hourly;
    if (!h || !h.time || !h.time.length) return null;
    const off = (raw.utc_offset_seconds || 0) * 1000;
    const toMs = (s) => Date.parse(s + 'Z') - off;
    let idx = -1, bestD = Infinity;
    for (let i = 0; i < h.time.length; i++) {
      const d = Math.abs(toMs(h.time[i]) - nowMs);
      if (d < bestD) { bestD = d; idx = i; }
    }
    if (bestD > 90 * 60 * 1000) return null; // outside the forecast
    const at = (k) => (h[k] ? h[k][idx] : null);
    const p = h.surface_pressure || [];
    const trend = idx >= 6 && p[idx] != null && p[idx - 6] != null ? p[idx] - p[idx - 6] : 0;
    let rain24 = 0;
    for (let i = Math.max(0, idx - 23); i <= idx; i++) rain24 += (h.precipitation?.[i] || 0);
    // Sunrise/sunset for the local date
    const localDate = new Date(nowMs + off).toISOString().slice(0, 10);
    const di = raw.daily?.time ? raw.daily.time.indexOf(localDate) : -1;
    return {
      temp: at('temperature_2m'), code: at('weather_code'), cloud: at('cloud_cover'),
      wind: at('wind_speed_10m'), windDeg: at('wind_direction_10m'),
      pressure: Math.round(at('surface_pressure') || 0),
      pressureTrend: trend > 1 ? 'rising' : trend < -1 ? 'falling' : 'steady',
      rain: at('precipitation'), isDay: !!at('is_day'),
      sunrise: di >= 0 ? raw.daily.sunrise[di]?.slice(11) : '', sunset: di >= 0 ? raw.daily.sunset[di]?.slice(11) : '',
      monthIndex: new Date(nowMs).getMonth(),
      rain24,
      forecastHoursAhead: Math.round((toMs(h.time[idx]) - (raw._fetched || nowMs)) / 3600000),
    };
  }

  /** Water type for a searched place (Nominatim result class/type), used for planned trips. */
  function waterFromPlace(r) {
    if (!r) return null;
    const c = r.class, ty = r.type;
    let type = null;
    if (c === 'natural' && ['water', 'lake', 'reservoir'].includes(ty)) type = 'lake';
    else if (c === 'waterway' || (c === 'natural' && ty === 'river')) type = 'river';
    else if (c === 'natural' && ['bay', 'strait', 'coastline', 'sea', 'fjord'].includes(ty)) type = 'sea';
    else if (c === 'place' && ty === 'sea') type = 'sea';
    return type ? { type, name: (r.name || r.display_name || '').split(',')[0], types: [type], ambiguous: false, tier: 'plan' } : null;
  }

  const api = { distKm, nearestSpot, upsertSpot, weatherAt, waterFromPlace };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Trip = api;
})(typeof window !== 'undefined' ? window : globalThis);
