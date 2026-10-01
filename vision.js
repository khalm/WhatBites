/* WhatBites on-device vision — everything runs on the phone, free, no account.
 * - detectBaits(): OWL-ViT zero-shot object detection (Transformers.js, ~155 MB, downloaded once and cached)
 * - readEnvironment(): quick pixel statistics of the spot photo (light, sky, water colour)
 * - colorOf(): dominant colour class of each detected bait
 */
(function (root) {
  const TF_URL = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.0/dist/transformers.min.js';
  const MODEL = 'Xenova/owlvit-base-patch32';

  // Text prompts → bait type. OWL-ViT matches image regions against these phrases.
  const PROMPTS = [
    ['a metal fishing spoon lure', 'spoon'],
    ['a spinner fishing lure with a rotating blade', 'spinner'],
    ['a hard plastic fishing lure shaped like a small fish', 'wobbler'],
    ['a soft rubber fishing lure', 'softbait'],
    ['a soft plastic worm fishing lure', 'softbait'],
    ['a metal jig fishing lure', 'jig'],
    ['a jig head with a hook', 'jig'],
    ['a fishing fly made of feathers', 'fly'],
    ['live earthworms used as fishing bait', 'worm'],
  ];

  let detectorPromise = null;
  function loadDetector(onProgress) {
    if (!detectorPromise) {
      detectorPromise = (async () => {
        const tf = await import(TF_URL);
        const files = {};
        return tf.pipeline('zero-shot-object-detection', MODEL, {
          dtype: 'q8',
          progress_callback: (p) => {
            if (p.status !== 'progress' || !p.total) return;
            files[p.file] = [p.loaded, p.total];
            const [l, t] = Object.values(files).reduce((a, [x, y]) => [a[0] + x, a[1] + y], [0, 0]);
            onProgress?.(l / t, t);
          },
        });
      })().catch((e) => { detectorPromise = null; throw e; });
    }
    return detectorPromise;
  }

  function iou(a, b) {
    const x0 = Math.max(a.xmin, b.xmin), y0 = Math.max(a.ymin, b.ymin);
    const x1 = Math.min(a.xmax, b.xmax), y1 = Math.min(a.ymax, b.ymax);
    const inter = Math.max(0, x1 - x0) * Math.max(0, y1 - y0);
    const area = (r) => (r.xmax - r.xmin) * (r.ymax - r.ymin);
    return inter / (area(a) + area(b) - inter || 1);
  }

  /** Returns [{id, type, score, box:[x0,y0,x1,y1] fractions}] */
  async function detectBaits(imageUrl, onProgress) {
    const detector = await loadDetector(onProgress);
    onProgress?.(1);
    const labels = PROMPTS.map((p) => p[0]);
    const raw = await detector(imageUrl, labels, { threshold: 0.06, percentage: true });
    const typeOf = Object.fromEntries(PROMPTS);
    const dets = raw
      .map((d) => ({ ...d, type: typeOf[d.label] }))
      .filter((d) => {
        const w = d.box.xmax - d.box.xmin, h = d.box.ymax - d.box.ymin;
        return w * h < 0.5 && w > 0.02 && h > 0.02; // drop "whole box" and specks
      })
      .sort((a, b) => b.score - a.score);
    // Non-max suppression across all labels
    const keep = [];
    for (const d of dets) {
      if (keep.every((k) => iou(k.box, d.box) < 0.4)) keep.push(d);
      if (keep.length >= 15) break;
    }
    return keep.map((d, i) => ({
      id: i + 1, type: d.type, conf: d.score,
      box: [d.box.xmin, d.box.ymin, d.box.xmax, d.box.ymax].map((v) => Math.min(1, Math.max(0, v))),
    }));
  }

  /* ---------- pixel helpers ---------- */
  function pixels(img, x0 = 0, y0 = 0, x1 = 1, y1 = 1, size = 96) {
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    const W = img.naturalWidth, H = img.naturalHeight;
    ctx.drawImage(img, x0 * W, y0 * H, Math.max(1, (x1 - x0) * W), Math.max(1, (y1 - y0) * H), 0, 0, size, size);
    return ctx.getImageData(0, 0, size, size).data;
  }
  function hsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0;
    if (d) {
      if (max === r) h = ((g - b) / d) % 6; else if (max === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
      h = (h * 60 + 360) % 360;
    }
    return [h, max ? d / max : 0, max];
  }
  function stats(data) {
    let n = 0, s = 0, v = 0, hx = 0, hy = 0, vv = 0;
    for (let i = 0; i < data.length; i += 4) {
      const [h, sa, va] = hsv(data[i], data[i + 1], data[i + 2]);
      n++; s += sa; v += va; vv += va * va;
      hx += Math.cos(h * Math.PI / 180) * sa; hy += Math.sin(h * Math.PI / 180) * sa; // saturation-weighted mean hue
    }
    const mv = v / n;
    return { sat: s / n, val: mv, hue: (Math.atan2(hy, hx) * 180 / Math.PI + 360) % 360, contrast: Math.sqrt(Math.max(0, vv / n - mv * mv)) };
  }

  /** Light and water clarity guessed from the spot photo. User can correct in the UI. */
  function readEnvironment(img) {
    const all = stats(pixels(img));
    const sky = stats(pixels(img, 0, 0, 1, 0.3));
    const water = stats(pixels(img, 0, 0.55, 1, 1));
    let light;
    if (all.val < 0.3) light = 'low';
    else if (sky.val > 0.6 && sky.sat < 0.18) light = 'overcast';
    else if (all.val > 0.5) light = 'sun';
    else light = 'overcast';
    let clarity;
    const brownish = water.hue >= 25 && water.hue <= 75; // brown / yellow-green
    if (brownish && water.sat > 0.25) clarity = 'murky';
    else if (brownish || (water.contrast < 0.08 && water.val > 0.45)) clarity = 'stained';
    else clarity = 'clear';
    return { light, clarity };
  }

  /** Colour class of a bait inside its box (centre area, to skip the box background). */
  function colorOf(img, box) {
    const [x0, y0, x1, y1] = box;
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, hw = (x1 - x0) * 0.3, hh = (y1 - y0) * 0.3;
    const d = pixels(img, cx - hw, cy - hh, cx + hw, cy + hh, 32);
    const st = stats(d);
    if (st.val < 0.28) return 'dark';
    if (st.sat < 0.18 && st.val > 0.5) return 'silver';
    if (st.sat >= 0.25 && st.hue >= 35 && st.hue <= 58 && st.val > 0.45) return 'gold';
    if (st.sat > 0.45 && st.val > 0.45) return 'bright';
    return 'natural';
  }

  root.Vision = { detectBaits, readEnvironment, colorOf, loadDetector };
})(window);
