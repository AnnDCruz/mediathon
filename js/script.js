/* ==========================================================
   IF MY UNIVERSITY WAS A SMALL TOWN — script.js

   1. Photos ......... placeholders → <img> when js/photos.js has a src
   2. Lines .......... split into words so they can fade in like subtitles
   3. Reveals ........ IntersectionObserver adds .is-in (CSS does the motion)
   4. Scroll engine .. ONE requestAnimationFrame loop, only while scrolling.
                       It drives: scene progress (--p), parallax / drift,
                       the town clock, the chapter HUD, the bus route and
                       the light/dark colour of the chrome.
   5. Boot
   ========================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var motionOK = !reduceQuery.matches;
  function onMotionChange() { motionOK = !reduceQuery.matches; schedule(); }
  if (reduceQuery.addEventListener) reduceQuery.addEventListener('change', onMotionChange);
  else if (reduceQuery.addListener) reduceQuery.addListener(onMotionChange);

  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }


  /* ---------- 1. PHOTOS ---------- */
  function initPhotos() {
    var manifest = window.TOWN_PHOTOS || {};
    var frames = document.querySelectorAll('.photo[data-photo]');

    frames.forEach(function (frame) {
      var entry = manifest[frame.dataset.photo] || {};
      var alt = entry.alt || frame.dataset.label || '';
      var media = frame.querySelector('.photo__media');

      // Placeholder state: the frame itself is the accessible image.
      frame.setAttribute('role', 'img');
      frame.setAttribute('aria-label', entry.src ? alt : 'Photograph placeholder: ' + alt);

      if (!entry.src || !media) return;   // nothing to load yet → no request is made

      var img = new Image();
      img.alt = alt;
      img.decoding = 'async';
      img.loading = frame.hasAttribute('data-priority') ? 'eager' : 'lazy';
      if (entry.pos) img.style.objectPosition = entry.pos;

      img.addEventListener('load', function () {
        frame.classList.add('has-image');       // hides the placeholder label
        frame.removeAttribute('role');          // the <img> now carries the alt text
        frame.removeAttribute('aria-label');
      });
      img.addEventListener('error', function () {
        console.warn('[photos] Could not load "' + entry.src + '" for "' + frame.dataset.photo + '". Check the path in js/photos.js.');
        img.remove();
      });

      img.src = entry.src;                      // relative to index.html
      media.appendChild(img);
    });
  }


  /* ---------- 2. LINES → WORDS ---------- */
  // Each word gets an index (--i); CSS staggers the fade with it.
  // Lines marked .line--scrub are driven by scroll position instead.
  function splitLines() {
    document.querySelectorAll('.line:not(.line--scrub)').forEach(function (line) {
      var words = line.textContent.trim().split(/\s+/);
      line.textContent = '';
      words.forEach(function (word, i) {
        var span = document.createElement('span');
        span.className = 'w';
        span.style.setProperty('--i', i);
        span.textContent = word;
        line.appendChild(span);
        if (i < words.length - 1) line.appendChild(document.createTextNode(' '));
      });
    });
  }


  /* ---------- 3. REVEALS ---------- */
  function initReveals() {
    var targets = document.querySelectorAll('[data-reveal], .line:not(.line--scrub)');
    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');     // once — a shot doesn't un-happen
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  }


  /* ---------- 4. SCROLL ENGINE ---------- */
  var vh = 0, docMax = 1;
  var scenes = [], chapters = [], anchors = [], darkZones = [], zoneEls = [];
  var active = new Set();              // parallax / drift elements currently near the viewport
  var chromeEl, routeEl, routeStops, hudTime, hudNum, hudName, hudChapter;
  var chapterIndex = -1, lastTime = '';
  var ticking = false;

  function absTop(el) { return el.getBoundingClientRect().top + window.scrollY; }

  // Everything measured here is cached; the per-frame work only reads scrollY.
  function measure() {
    vh = window.innerHeight;
    docMax = Math.max(1, root.scrollHeight - vh);

    scenes = Array.prototype.map.call(document.querySelectorAll('[data-scene]'), function (el) {
      return { el: el, top: absTop(el), h: el.offsetHeight, p: -1 };
    });

    chapters = Array.prototype.map.call(document.querySelectorAll('[data-chapter]'), function (el) {
      return { top: absTop(el), num: el.dataset.chapter, name: el.dataset.name };
    }).sort(function (a, b) { return a.top - b.top; });

    // route stops sit where chapters begin, so the bus reaches each one exactly
    chapters.forEach(function (c, i) {
      var stop = routeStops[i];
      if (stop) stop.style.setProperty('--y', (clamp((c.top - vh * 0.5) / docMax, 0, 1) * 100).toFixed(2) + '%');
    });

    // town clock: elements with data-time pin a time to a place in the story
    anchors = [];
    document.querySelectorAll('[data-time]').forEach(function (el) {
      var at = parseFloat(el.dataset.timeAt);
      if (isNaN(at)) at = 0.55;
      anchors.push({ y: clamp(absTop(el) - vh * at, 0, docMax), t: parseTime(el.dataset.time) });
    });
    var ending = scenes.filter(function (s) { return s.el.id === 'ending'; })[0];
    if (ending) {   // night passes while the iris closes: 18:45 → 07:30 the next morning
      anchors.push({ y: ending.top + Math.max(1, ending.h - vh) * 0.9, t: 31.5 });
    }
    anchors.sort(function (a, b) { return a.y - b.y; });
    for (var i = 1; i < anchors.length; i++) anchors[i].t = Math.max(anchors[i].t, anchors[i - 1].t);

    // regions where the page is dark, so the chrome can switch to light text
    darkZones = Array.prototype.map.call(document.querySelectorAll('[data-tone="dark"]'), function (el) {
      var top = absTop(el), h = el.offsetHeight;
      var from = parseFloat(el.dataset.toneFrom) || 0;   // fraction of a pinned scene before it turns dark
      return { a: top + Math.max(0, h - vh) * from, b: top + h };
    });
  }

  function parseTime(str) {
    var parts = str.split(':');
    return parseInt(parts[0], 10) + parseInt(parts[1], 10) / 60;
  }

  function timeAt(y) {
    if (!anchors.length) return 7.5;
    if (y <= anchors[0].y) return anchors[0].t;
    for (var i = 1; i < anchors.length; i++) {
      if (y <= anchors[i].y) {
        var a = anchors[i - 1], b = anchors[i];
        return a.t + (b.t - a.t) * ((y - a.y) / ((b.y - a.y) || 1));
      }
    }
    return anchors[anchors.length - 1].t;
  }

  function formatTime(t) {
    var total = Math.round(t * 60) % (24 * 60);
    var h = Math.floor(total / 60), m = total % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }

  function updateChapter(y) {
    var probe = y + vh * 0.5, idx = 0;
    for (var i = 0; i < chapters.length; i++) if (probe >= chapters[i].top) idx = i;
    if (idx === chapterIndex) return;
    chapterIndex = idx;

    // route markers
    routeStops.forEach(function (stop, i) {
      stop.classList.toggle('is-passed', i <= idx);
      stop.classList.toggle('is-current', i === idx);
      var link = stop.firstElementChild;
      if (i === idx) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });

    // chapter readout: dissolve out, swap text, dissolve in
    var c = chapters[idx];
    function swap() { hudNum.textContent = c.num; hudName.textContent = c.name; hudChapter.classList.remove('is-swap'); }
    if (motionOK && hudNum.textContent) { hudChapter.classList.add('is-swap'); window.setTimeout(swap, 280); }
    else swap();
  }

  function updateTone(y) {
    zoneEls.forEach(function (z) {
      var py = y + (z.sample === 'top' ? 34 : z.sample === 'bottom' ? vh - 34 : vh / 2);
      var dark = darkZones.some(function (d) { return py >= d.a && py <= d.b; });
      var value = dark ? 'dark' : 'light';
      if (z.el.dataset.on !== value) z.el.dataset.on = value;
    });
  }

  // Scenes: write progress 0→1 for the part of the scroll where the pinned stage is held.
  function updateScenes(y) {
    scenes.forEach(function (s) {
      if (y + vh < s.top || y > s.top + s.h) return;    // off screen
      var p = clamp((y - s.top) / Math.max(1, s.h - vh), 0, 1);
      if (Math.abs(p - s.p) < 0.0002) return;
      s.p = p;
      s.el.style.setProperty('--p', p.toFixed(4));
    });
  }

  // Parallax / pan / drift: k runs +1 → -1 as an element travels from the bottom to the top of the screen.
  function updateMotion() {
    var narrow = window.innerWidth <= 700 ? 0.5 : 1;    // gentler sideways travel on phones
    active.forEach(function (el) {
      var isParallax = el.hasAttribute('data-parallax');
      var ref = isParallax ? el.parentElement : el;     // measure the frame, not the moving picture
      var r = ref.getBoundingClientRect();
      var k = clamp(((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2), -1, 1);

      if (isParallax) {   // picture lags behind its frame by up to the 7% overscan
        el.style.setProperty('--dy', (-k * 0.07 * r.height * parseFloat(el.dataset.parallax)).toFixed(1));
      }
      if (el.hasAttribute('data-pan')) {     // picture slides sideways inside a wide frame
        el.style.setProperty('--px', (k * parseFloat(el.dataset.pan)).toFixed(2));
      }
      if (el.hasAttribute('data-drift')) {   // whole element crosses sideways
        el.style.setProperty('--dx', (k * parseFloat(el.dataset.drift) * narrow).toFixed(1));
      }
    });
  }

  function update() {
    ticking = false;
    var y = window.scrollY;

    chromeEl.classList.toggle('is-visible', y > vh * 0.45);
    routeEl.style.setProperty('--progress', (y / docMax).toFixed(4));

    var timeStr = formatTime(timeAt(y));
    if (timeStr !== lastTime) { hudTime.textContent = timeStr; lastTime = timeStr; }

    updateChapter(y);
    updateTone(y);

    if (!motionOK) return;
    updateScenes(y);
    updateMotion();
  }

  function schedule() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  function remeasure() { measure(); schedule(); }

  // Only elements near the viewport are animated each frame.
  function initMotionObserver() {
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) active.add(e.target); else active.delete(e.target);
      });
      schedule();
    }, { rootMargin: '15% 0px' });
    document.querySelectorAll('[data-parallax], [data-pan], [data-drift]').forEach(function (el) { io.observe(el); });
  }


  /* ---------- 5. BOOT ---------- */
  function boot() {
    chromeEl   = document.getElementById('chrome');
    routeEl    = document.getElementById('route');
    routeStops = Array.prototype.slice.call(routeEl.querySelectorAll('.route__stop'));
    hudTime    = document.getElementById('hudTime');
    hudNum     = document.getElementById('hudNum');
    hudName    = document.getElementById('hudName');
    hudChapter = document.getElementById('hudChapter');
    zoneEls    = Array.prototype.map.call(document.querySelectorAll('[data-zone]'), function (el) {
      return { el: el, sample: el.dataset.zone };
    });

    initPhotos();
    if (motionOK) splitLines();
    initReveals();
    initMotionObserver();

    measure();
    update();

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', remeasure);
    window.addEventListener('load', remeasure);
    if ('ResizeObserver' in window) new ResizeObserver(remeasure).observe(document.body);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
