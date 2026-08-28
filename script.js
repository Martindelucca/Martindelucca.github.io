/* ============================================================
   Martin de Lucca — interacciones
   Todo es progresivo: sin JS la página se ve completa y usable.
   ============================================================ */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HOVER = window.matchMedia('(hover: hover)').matches;
  var DESKTOP = function () { return window.innerWidth > 940; };

  /* ── Scroll: un solo listener, en dos fases ─────────────────
     Había tres listeners (header, escena sticky, FAB) y cada uno leía layout y
     escribía clases por su cuenta. Aun juntándolos en un frame quedaba la
     alternancia leer-escribir-leer-escribir, y cada escritura invalida el
     layout: la lectura siguiente obliga al navegador a recalcularlo de forma
     síncrona. Lighthouse lo medía en 94ms de forced reflow.

     Por eso cada trabajo se registra partido en dos. Primero corren TODAS las
     lecturas, que no ensucian nada, y recién después TODAS las escrituras. El
     navegador recalcula una vez por frame en vez de una vez por trabajo.

     `leer` devuelve un estado y no toca el DOM. `escribir` recibe ese estado y
     no lee el DOM. Si agregás un trabajo nuevo, respetá el corte. */
  var scrollJobs = [];
  var scrollTick = null;
  function onScroll(leer, escribir) { scrollJobs.push({ leer: leer, escribir: escribir }); }
  function correrJobs() {
    var n = scrollJobs.length, estados = new Array(n), i;
    for (i = 0; i < n; i++) estados[i] = scrollJobs[i].leer();
    for (i = 0; i < n; i++) scrollJobs[i].escribir(estados[i]);
  }
  window.addEventListener('scroll', function () {
    if (scrollTick) return;
    scrollTick = requestAnimationFrame(function () { scrollTick = null; correrJobs(); });
  }, { passive: true });
  window.addEventListener('resize', correrJobs);

  /* ── Reveals al entrar en viewport ───────────────────────── */
  function initReveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll('[data-r]'));
    if (!els.length || REDUCED || !('IntersectionObserver' in window)) return;

    var from = function (kind) {
      if (kind === 'left') return 'translateX(-26px)';
      if (kind === 'right') return 'translateX(26px)';
      if (kind === 'scale') return 'scale(.955)';
      return 'translateY(30px)';
    };

    els.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = from(el.getAttribute('data-r'));
      el.style.transition = 'opacity .85s cubic-bezier(.16,1,.3,1), transform 1s cubic-bezier(.16,1,.3,1)';
      // `will-change` NO se pone acá. Ponerlo de entrada promovía los ~63
      // elementos revelables a capa propia desde el load, y los que nunca
      // entran al viewport se quedaban promovidos para siempre. Se pone un
      // frame antes de animar y se saca al terminar.
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        // El stagger es coreografía de desktop. En una sola columna los elementos
        // entran casi a la vez, así que el delay se lee como demora: se anula.
        var delay = DESKTOP() ? parseInt(e.target.getAttribute('data-rd') || '0', 10) : 0;
        setTimeout(function () {
          e.target.style.willChange = 'opacity, transform';
          requestAnimationFrame(function () {
            e.target.style.opacity = '1';
            e.target.style.transform = 'none';
            setTimeout(function () { e.target.style.willChange = 'auto'; }, 1100);
          });
        }, delay);
        io.unobserve(e.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

    els.forEach(function (el) { io.observe(el); });
  }

  /* ── Reloj / coordenadas del hero ────────────────────────── */
  function initClock() {
    var el = document.querySelector('[data-clock]');
    if (!el) return;
    var tick = function () {
      var t;
      try {
        t = new Date().toLocaleTimeString('es-AR', {
          hour: '2-digit', minute: '2-digit', hour12: false,
          timeZone: 'America/Argentina/Cordoba'
        });
      } catch (err) {
        t = new Date().toTimeString().slice(0, 5);
      }
      el.textContent = 'Córdoba, AR · 31°25′S 64°11′O · ' + t;
    };
    tick();
    setInterval(tick, 20000);
  }

  /* ── Header: estado al scrollear ─────────────────────────── */
  function initHeader() {
    var pill = document.querySelector('[data-header-pill]');
    if (!pill) return;
    onScroll(
      function () { return window.scrollY > 50; },
      function (pasado) { pill.classList.toggle('is-scrolled', pasado); }
    );
  }

  /* ── Hero: parallax de las cards con el cursor ───────────── */
  function initHero() {
    var stage = document.querySelector('[data-hero-stage]');
    if (!stage || REDUCED || !HOVER) return;

    var cards = Array.prototype.slice.call(stage.querySelectorAll('[data-depth]'));
    var raf = null, tx = 0, ty = 0, cx = 0, cy = 0;

    var loop = function () {
      cx += (tx - cx) * 0.09;
      cy += (ty - cy) * 0.09;
      cards.forEach(function (c) {
        var d = parseFloat(c.getAttribute('data-depth')) || 1;
        c.style.transform =
          'translate3d(' + (cx * 16 * d).toFixed(2) + 'px,' + (cy * 12 * d).toFixed(2) + 'px,0)' +
          ' rotateY(' + (cx * 4).toFixed(2) + 'deg) rotateX(' + (-cy * 3).toFixed(2) + 'deg)';
      });
      raf = (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) ? requestAnimationFrame(loop) : null;
    };

    window.addEventListener('mousemove', function (e) {
      var r = stage.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) / r.width;
      ty = (e.clientY - (r.top + r.height / 2)) / r.height;
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });

    stage.addEventListener('mouseleave', function () {
      tx = 0; ty = 0;
      if (!raf) raf = requestAnimationFrame(loop);
    });
  }

  /* ── Escena sticky de la sección 02. La cantidad de pasos sale del DOM. ── */
  function initJourney() {
    var sec = document.querySelector('[data-journey]');
    if (!sec) return;
    var steps = Array.prototype.slice.call(sec.querySelectorAll('[data-step]'));
    var blocks = Array.prototype.slice.call(sec.querySelectorAll('[data-build] > [data-b]'));
    var label = sec.querySelector('[data-progress-label]');
    var total = steps.length;
    var current = -1;

    var apply = function (idx) {
      if (idx === current) return;
      current = idx;
      // `is-scene` avisa al CSS que la escena está corriendo. Sin esta clase
      // —mobile, reduced-motion, sin JS— los cuatro pasos se ven a contraste
      // pleno en vez de quedar apagados esperando un scroll que no va a pasar.
      sec.classList.add('is-scene');
      steps.forEach(function (s) {
        var i = +s.getAttribute('data-step');
        s.classList.toggle('is-active', i === idx);
        s.classList.toggle('is-past', i < idx);
      });
      blocks.forEach(function (b) {
        b.classList.toggle('is-off', +b.getAttribute('data-b') > idx);
      });
      if (label) label.textContent = '0' + (idx + 1) + ' / 0' + total;
    };

    var reset = function () {
      sec.classList.remove('is-scene');
      steps.forEach(function (s) { s.classList.remove('is-active', 'is-past'); });
      blocks.forEach(function (b) { b.classList.remove('is-off'); });
      current = -1;
    };

    // -1 significa "la escena no corre" (mobile o reduced-motion).
    var leer = function () {
      if (!DESKTOP() || REDUCED) return -1;
      var span = sec.offsetHeight - window.innerHeight;
      var p = Math.min(1, Math.max(0, -sec.getBoundingClientRect().top / Math.max(1, span)));
      return Math.min(total - 1, Math.floor(p * (total + 0.0001)));
    };
    var escribir = function (idx) {
      if (idx < 0) { if (current !== -1) reset(); return; }
      apply(idx);
    };

    onScroll(leer, escribir);
  }

  /* ── Qué incluye: conectores dibujados al núcleo ─────────── */
  function initSystem() {
    var wrap = document.querySelector('[data-system]');
    if (!wrap) return;
    var svg = wrap.querySelector('[data-sys-svg]');
    var core = wrap.querySelector('[data-core]');
    if (!svg || !core) return;
    var mods = Array.prototype.slice.call(wrap.querySelectorAll('[data-mod]'));
    var shown = false;

    var draw = function () {
      // Lecturas primero, todas juntas. Antes los rects de los módulos se leían
      // dos veces y la segunda caía después de escribir el viewBox, que
      // invalida el layout: eso forzaba un recálculo síncrono.
      var wr = wrap.getBoundingClientRect();
      var cr = core.getBoundingClientRect();
      var rects = mods.map(function (m) { return m.getBoundingClientRect(); });
      var ancho = window.innerWidth;
      var coreMid = cr.top + cr.height / 2;

      // Sólo dibujamos si las 3 columnas comparten fila con el núcleo.
      var sameRow = rects.every(function (mr) {
        return mr.bottom > cr.top && mr.top < cr.bottom &&
               Math.abs(mr.top + mr.height / 2 - coreMid) < cr.height;
      });

      // A partir de acá, sólo escrituras.
      if (!sameRow || ancho < 940) { svg.style.opacity = '0'; svg.innerHTML = ''; return; }

      var cxL = cr.left - wr.left, cxR = cr.right - wr.left, cy = coreMid - wr.top;
      var d = '';
      rects.forEach(function (mr, i) {
        var m = mods[i];
        var my = mr.top - wr.top + mr.height / 2;
        var isLeft = m.getAttribute('data-mod').charAt(0) === 'l';
        var sx = isLeft ? mr.right - wr.left : mr.left - wr.left;
        var ex = isLeft ? cxL : cxR;
        var mid = (sx + ex) / 2;
        d += 'M ' + sx + ' ' + my + ' C ' + mid + ' ' + my + ', ' + mid + ' ' + cy + ', ' + ex + ' ' + cy + ' ';
      });

      svg.setAttribute('viewBox', '0 0 ' + wr.width + ' ' + wr.height);
      svg.setAttribute('preserveAspectRatio', 'none');
      svg.innerHTML = '<path d="' + d + '" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="1" stroke-linecap="round"></path>';

      if (shown) {
        var path = svg.firstChild;
        var len = path.getTotalLength();
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = '0';
        svg.style.opacity = '1';
      }
    };

    draw();
    window.addEventListener('resize', draw);
    setTimeout(draw, 700); // por si las fuentes cambian la métrica

    if (!('IntersectionObserver' in window)) { shown = true; draw(); return; }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        shown = true;
        var path = svg.firstChild;
        if (path && !REDUCED) {
          var len = path.getTotalLength();
          path.style.strokeDasharray = len;
          path.style.strokeDashoffset = len;
          svg.style.opacity = '1';
          requestAnimationFrame(function () {
            path.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(.16,1,.3,1)';
            path.style.strokeDashoffset = '0';
          });
        } else {
          svg.style.opacity = '1';
        }
        io.disconnect();
      });
    }, { threshold: 0.25 });
    io.observe(wrap);
  }

  /* ── Botones magnéticos + cards que levantan ─────────────── */
  function initMicro() {
    if (REDUCED || !HOVER) return;

    document.querySelectorAll('[data-mag]').forEach(function (btn) {
      var arrow = btn.querySelector('.btn__arrow');
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - (r.left + r.width / 2)) * 0.14;
        var y = (e.clientY - (r.top + r.height / 2)) * 0.18;
        btn.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
        if (arrow) arrow.style.transform = 'translateX(3px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = 'translate3d(0,0,0)';
        if (arrow) arrow.style.transform = 'none';
      });
    });

    document.querySelectorAll('.case__link').forEach(function (link) {
      var arrow = link.querySelector('.btn__arrow');
      if (!arrow) return;
      link.addEventListener('mouseenter', function () { arrow.style.transform = 'translate(2px, -2px)'; });
      link.addEventListener('mouseleave', function () { arrow.style.transform = 'none'; });
    });

    document.querySelectorAll('[data-lift]').forEach(function (el) {
      el.addEventListener('mouseenter', function () { el.style.transform = 'translateY(-6px)'; });
      el.addEventListener('mouseleave', function () { el.style.transform = 'translateY(0)'; });
    });
  }

  /* ── Botón flotante de WhatsApp (mobile) ─────────────────── */
  function initFab() {
    var fab = document.querySelector('[data-fab]');
    if (!fab) return;
    var cta = document.querySelector('.cta');
    // Se apaga al llegar al cierre: ahí abajo el botón grande dice lo mismo,
    // y el flotante estaba tapando una línea de texto en cada scroll.
    onScroll(
      function () {
        var enElCierre = cta && cta.getBoundingClientRect().top < window.innerHeight * 0.9;
        return window.innerWidth < 860 && window.scrollY > window.innerHeight * 0.9 && !enElCierre;
      },
      function (visible) { fab.classList.toggle('is-visible', visible); }
    );
  }

  /* ── Circulito que sigue al cursor ───────────────────────── */
  function initCursor() {
    if (REDUCED || !HOVER) return;

    var dot = document.createElement('div');
    dot.className = 'cursor-dot';
    dot.setAttribute('aria-hidden', 'true');
    document.body.appendChild(dot);

    var CHICO = 0.4375; // 14px sobre la caja fija de 32px
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null, started = false;
    var ts = CHICO, cs = CHICO;

    var loop = function () {
      cx += (tx - cx) * 0.3;
      cy += (ty - cy) * 0.3;
      cs += (ts - cs) * 0.18;
      dot.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)' +
        ' scale(' + cs.toFixed(3) + ')';
      raf = (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1 || Math.abs(ts - cs) > 0.002)
        ? requestAnimationFrame(loop) : null;
    };

    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX; ty = e.clientY;
      if (!started) { started = true; cx = tx; cy = ty; dot.classList.add('is-on'); }
      var over = e.target.closest && e.target.closest('a, button, summary, [data-mag], [data-lift]');
      ts = over ? 1 : CHICO;
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });

    document.addEventListener('mouseleave', function () { dot.classList.remove('is-on'); });
    document.addEventListener('mouseenter', function () { if (started) dot.classList.add('is-on'); });
  }

  function boot() {
    initReveal();
    initClock();
    initHeader();
    initHero();
    initJourney();
    initSystem();
    initMicro();
    initCursor();
    initFab();
    // Estado inicial de los tres trabajos de scroll, en una sola pasada.
    correrJobs();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
