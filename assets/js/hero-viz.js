/* ═══════════════════════════════════════════════════════════
   Hero, courbes de niveau (le terrain) + orbite satellite
   avec trace au sol (l'instrument qui l'observe).

   Canvas 2D natif, aucune dépendance. Les couleurs sont lues
   depuis les tokens CSS : la visualisation suit la bascule
   de thème sans être redessinée par le JS appelant.
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var D = Math.PI / 180;
  var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var canvas = null, ctx = null, raf = null, resizeTimer = null, started = false;
  var W = 0, H = 0, R = 0, cx = 0, cy = 0, rOrbit = 0;
  var globeRot = 0, orbitAngle = 0, drift = 0;
  var track = [];

  var INCLINATION = 51.6 * D;   /* inclinaison de l'orbite  */
  var NODE = -32 * D;           /* nœud ascendant, inertiel */
  var YAOUNDE = { lat: 3.848, lon: 11.502 };

  var colors = { line: '', dot: '', accent: '' };

  /* Sphère de points en spirale de Fibonacci */
  var dots = (function () {
    var n = 440, out = [], golden = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < n; i++) {
      var y = 1 - (i / (n - 1)) * 2;
      out.push({ y: y, r: Math.sqrt(Math.max(0, 1 - y * y)), theta: i * golden });
    }
    return out;
  })();

  function readColors() {
    var s = getComputedStyle(document.documentElement);
    colors.line = s.getPropertyValue('--viz-line').trim();
    colors.dot = s.getPropertyValue('--viz-dot').trim();
    colors.accent = s.getPropertyValue('--ac-rgb').trim() || '63,99,121';
  }
  function accent(alpha) {
    return 'rgba(' + colors.accent + ',' + alpha + ')';
  }

  function resize() {
    var dpr = Math.min(global.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    if (!W || !H) return false;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var narrow = W < 900;
    R = Math.min(W * (narrow ? 0.40 : 0.26), H * (narrow ? 0.30 : 0.40));
    cx = narrow ? W * 0.72 : W * 0.775;
    cy = narrow ? H * 0.20 : H * 0.50;
    rOrbit = R * 1.44;
    return true;
  }

  /* Projection orthographique. Les angles reçus sont absolus. */
  function project(lat, lon, radius) {
    return {
      x: cx + radius * Math.cos(lat) * Math.sin(lon),
      y: cy - radius * Math.sin(lat),
      z: Math.cos(lat) * Math.cos(lon)
    };
  }

  /* Trace une polyligne en ne gardant que l'hémisphère demandé */
  function strokeHemisphere(points, front) {
    var open = false;
    ctx.beginPath();
    for (var i = 0; i < points.length; i++) {
      var p = points[i];
      var visible = front ? p.z > 0 : p.z <= 0;
      if (visible) {
        if (open) ctx.lineTo(p.x, p.y);
        else { ctx.moveTo(p.x, p.y); open = true; }
      } else {
        open = false;
      }
    }
    ctx.stroke();
  }

  /* ── La couche terrain ─────────────────────────────────── */
  function drawContours() {
    var count = 30, gap = (H * 1.5) / count;
    for (var i = 0; i < count; i++) {
      var isIndexLine = i % 5 === 0;          /* courbe maîtresse */
      var base = -H * 0.24 + i * gap;
      var amp = 22 + 18 * Math.sin(i * 0.42);
      ctx.beginPath();
      for (var x = -12; x <= W + 12; x += 9) {
        var y = base
          + amp * Math.sin(x * 0.0038 + i * 0.30 + drift)
          + amp * 0.54 * Math.sin(x * 0.0086 - i * 0.19 + drift * 1.4)
          + amp * 0.25 * Math.sin(x * 0.0175 + drift * 0.7);
        if (x === -12) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = isIndexLine ? accent(0.26) : colors.line;
      ctx.lineWidth = isIndexLine ? 1.1 : 0.75;
      ctx.stroke();
    }
  }

  /* ── L'instrument ──────────────────────────────────────── */
  function drawGlobe() {
    var rot = globeRot * D, i, points, lat, lon;

    for (i = 0; i < dots.length; i++) {
      var d = dots[i];
      var a = d.theta + rot;
      var depth = d.r * Math.cos(a);
      if (depth <= 0) continue;
      ctx.beginPath();
      ctx.arc(cx + R * d.r * Math.sin(a), cy - R * d.y, 0.95, 0, 6.2832);
      ctx.fillStyle = colors.dot;
      ctx.globalAlpha = 0.25 + depth * 0.6;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.lineWidth = 0.7;
    ctx.strokeStyle = colors.line;
    for (lon = -180; lon < 180; lon += 30) {
      points = [];
      for (lat = -90; lat <= 90; lat += 6) points.push(project(lat * D, (lon + globeRot) * D, R));
      strokeHemisphere(points, true);
    }
    for (lat = -60; lat <= 60; lat += 30) {
      points = [];
      for (lon = -180; lon <= 180; lon += 6) points.push(project(lat * D, (lon + globeRot) * D, R));
      if (lat === 0) { ctx.strokeStyle = accent(0.30); ctx.lineWidth = 1; }
      else { ctx.strokeStyle = colors.line; ctx.lineWidth = 0.7; }
      strokeHemisphere(points, true);
    }

    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, 6.2832);
    ctx.strokeStyle = colors.line;
    ctx.lineWidth = 0.9;
    ctx.stroke();
  }

  function drawSatellite() {
    var lat = Math.asin(Math.sin(INCLINATION) * Math.sin(orbitAngle));
    var lon = Math.atan2(Math.cos(INCLINATION) * Math.sin(orbitAngle), Math.cos(orbitAngle)) + NODE;
    var i, p;

    /* La trace est mémorisée en repère terrestre : elle dérive
       vers l'ouest à mesure que le globe tourne sous l'orbite. */
    track.push({ lat: lat / D, lon: lon / D - globeRot });
    if (track.length > 280) track.shift();

    ctx.lineWidth = 1.3;
    ctx.strokeStyle = accent(0.42);
    var segment = [], wasVisible = null;
    for (i = 0; i < track.length; i++) {
      p = project(track[i].lat * D, (track[i].lon + globeRot) * D, R * 1.004);
      var visible = p.z > 0;
      if (visible !== wasVisible && segment.length > 1) {
        flush(segment);
        segment = [];
      }
      if (visible) segment.push(p);
      wasVisible = visible;
    }
    if (segment.length > 1) flush(segment);

    var path = [];
    for (var u = 0; u <= 6.2832; u += 0.06) {
      path.push(project(
        Math.asin(Math.sin(INCLINATION) * Math.sin(u)),
        Math.atan2(Math.cos(INCLINATION) * Math.sin(u), Math.cos(u)) + NODE,
        rOrbit
      ));
    }
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = colors.line;
    strokeHemisphere(path, false);
    ctx.strokeStyle = accent(0.22);
    strokeHemisphere(path, true);

    var city = project(YAOUNDE.lat * D, (YAOUNDE.lon + globeRot) * D, R);
    if (city.z > 0) {
      ctx.beginPath();
      ctx.arc(city.x, city.y, 2.6, 0, 6.2832);
      ctx.fillStyle = accent(0.85);
      ctx.fill();
      ctx.font = '400 9.5px "JetBrains Mono", ui-monospace, monospace';
      ctx.fillStyle = accent(0.5);
      ctx.fillText('YAOUNDÉ', city.x + 11, city.y + 3.2);
    }

    var sat = project(lat, lon, rOrbit);
    if (sat.z > -0.25) {
      ctx.beginPath();
      ctx.arc(sat.x, sat.y, 9, 0, 6.2832);
      ctx.fillStyle = accent(0.09);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sat.x, sat.y, 2.9, 0, 6.2832);
      ctx.fillStyle = accent(0.8);
      ctx.fill();
    }

    function flush(pts) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (var k = 1; k < pts.length; k++) ctx.lineTo(pts[k].x, pts[k].y);
      ctx.stroke();
    }
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    drawContours();
    drawGlobe();
    drawSatellite();
  }

  function frame() {
    render();
    drift += 0.0018;
    globeRot += 0.038;
    orbitAngle += 0.0062;
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    readColors();
    if (!resize()) return;

    if (reduced) {
      /* Une seule image, mais avec une trace déjà constituée :
         figée n'est pas la même chose que vide. */
      if (!track.length) {
        for (var i = 0; i < 170; i++) {
          orbitAngle += 0.0062;
          globeRot += 0.038;
          track.push({
            lat: Math.asin(Math.sin(INCLINATION) * Math.sin(orbitAngle)) / D,
            lon: (Math.atan2(Math.cos(INCLINATION) * Math.sin(orbitAngle), Math.cos(orbitAngle)) + NODE) / D - globeRot
          });
        }
      }
      render();
      return;
    }
    frame();
  }

  /* API publique. app.js appelle init() après avoir monté le
     hero, et refresh() quand le thème change. */
  global.heroViz = {
    init: function (el) {
      canvas = el || document.getElementById('hero-viz');
      if (!canvas || !canvas.getContext) return;
      ctx = canvas.getContext('2d');
      if (!started) {
        global.addEventListener('resize', function () {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(start, 200);
        });
        started = true;
      }
      start();
    },
    refresh: function () {
      if (!ctx) return;
      readColors();
      if (reduced) render();
    }
  };
})(window);
