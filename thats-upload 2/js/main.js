(function () {
  function init() {
    var self = this;
    var doc = document;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var cleanups = [];
    var root = doc.querySelector('[data-tms-root]');
    if (!root) return;

    // Scroll reveal: content stays visible unless the observer is available.
    if (!reduce && 'IntersectionObserver' in window) {
      root.classList.add('tms-js');
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
      root.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });
      cleanups.push(function () { io.disconnect(); });
    }

    // Gold dust in the hero: small canvas, capped particles, paused off-screen.
    var cv = root.querySelector('[data-tms-dust]');
    if (!cv || reduce || !cv.getContext) return;
    var ctx = cv.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var W = 0, H = 0, parts = [], raf = 0, running = false;
    function size() {
      var r = cv.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = W < 640 ? 22 : 46;
      parts = [];
      for (var i = 0; i < n; i++) parts.push(make(true));
    }
    function make(anyY) {
      return { x: Math.random() * W, y: anyY ? Math.random() * H : H + 10,
        r: 0.6 + Math.random() * 1.8, vy: 0.12 + Math.random() * 0.35,
        sway: Math.random() * Math.PI * 2, a: 0.25 + Math.random() * 0.55 };
    }
    function tick() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.y -= p.vy; p.sway += 0.012; p.x += Math.sin(p.sway) * 0.25;
        if (p.y < -10) parts[i] = p = make(false);
        var fade = Math.min(1, p.y / (H * 0.35));
        ctx.globalAlpha = p.a * fade;
        ctx.fillStyle = '#F2C76E';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    }
    function start() { if (!running) { running = true; raf = requestAnimationFrame(tick); } }
    function stop() { running = false; cancelAnimationFrame(raf); }
    size();
    var t; function onResize() { clearTimeout(t); t = setTimeout(size, 200); }
    window.addEventListener('resize', onResize);
    var vis = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
      es[0].isIntersecting ? start() : stop();
    }) : null;
    if (vis) vis.observe(cv); else start();
    cleanups.push(function () { stop(); window.removeEventListener('resize', onResize); if (vis) vis.disconnect(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
