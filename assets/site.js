/* ipm-KG — gemeinsames Skript aller Seiten */
(function () {
  document.documentElement.classList.remove('no-js');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var feineMaus = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---- Eigener Cursor (nur mit Maus) ---- */
  var cur = document.getElementById('cursor');
  var dot = document.getElementById('cursor-dot');
  if (cur && dot && feineMaus) {
    var mx = 0, my = 0, cx = 0, cy = 0;
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    });
    (function loop() {
      cx += (mx - cx) * 0.1; cy += (my - cy) * 0.1;
      cur.style.left = cx + 'px'; cur.style.top = cy + 'px';
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a, button, summary').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cur.classList.add('is-hover'); });
      el.addEventListener('mouseleave', function () { cur.classList.remove('is-hover'); });
    });
  }

  /* ---- Hero-Video: Slogan ploppt auf, wenn die beiden die Arme verschränken (≈ 2,15 s) ---- */
  var vid = document.querySelector('.hero-video');
  var hero = document.querySelector('.hero');
  if (vid && hero) {
    var CLAIM_AT = 2.15;
    var showClaim = function () { hero.classList.add('is-claim'); };
    var fallback = setTimeout(showClaim, reduced ? 300 : 2600);   // Autoplay blockiert → Slogan trotzdem zeigen
    if (reduced) showClaim();
    else vid.addEventListener('timeupdate', function () {
      if (vid.currentTime >= CLAIM_AT) { clearTimeout(fallback); showClaim(); }
    });
    vid.addEventListener('ended', function () { vid.pause(); });
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && vid.ended && !reduced) {
          hero.classList.remove('is-claim');
          vid.currentTime = 0; vid.play();
        }
      });
    }, { threshold: 0.3 }).observe(hero);
  }

  /* ---- Buttons: Aktion erst nach dem Sweep (cards-and-buttons.md §3a) ---- */
  document.querySelectorAll('a.btn, a.sb-cta, a.topbar-cta').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1 || btn.target === '_blank') return;
      var href = btn.getAttribute('href') || '';
      if (/^(tel:|mailto:)/.test(href)) return;   // Telefon/Mail sofort öffnen
      if (btn._acting) return;
      e.preventDefault(); btn._acting = true;
      var finish = function () {
        if (href.charAt(0) === '#') {
          var t = null; try { t = document.querySelector(href); } catch (x) {}
          if (t) t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
          btn._acting = false; btn.classList.remove('is-activating');
        } else if (href) { window.location.href = href; }
        else { btn._acting = false; btn.classList.remove('is-activating'); }
      };
      var done = false, once = function () { if (!done) { done = true; finish(); } };
      if (reduced) return once();
      btn.classList.add('is-activating');
      btn.addEventListener('animationend', once, { once: true });
      setTimeout(once, 600);
    });
  });
  // Zurück-Taste (bfcache): Sweep-Zustand zurücksetzen
  window.addEventListener('pageshow', function () {
    document.querySelectorAll('.is-activating').forEach(function (b) { b.classList.remove('is-activating'); b._acting = false; });
  });

  /* ---- Drucken ---- */
  document.querySelectorAll('[data-drucken]').forEach(function (b) {
    b.addEventListener('click', function () { window.print(); });
  });

  /* ---- Einblenden beim Scrollen ---- */
  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { revealObs.observe(el); });
  // Druck: alles sichtbar machen
  window.addEventListener('beforeprint', function () {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  });

  /* ---- Topbar: Name des Abschnitts, dessen Trennstreifen oben angekommen ist ---- */
  var label = document.getElementById('topbarLabel');
  var dividers = Array.prototype.slice.call(document.querySelectorAll('.section-divider'));
  if (label) {
    var startLabel = label.getAttribute('data-start') || label.textContent;
    var update = function () {
      var text = startLabel;
      for (var i = 0; i < dividers.length; i++) {
        if (dividers[i].getBoundingClientRect().top <= 52) text = dividers[i].textContent.trim();
      }
      if (label.textContent !== text) label.textContent = text;
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ---- Manifest: Inhaltsverzeichnis ---- */
  var inhalt = document.querySelector('.inhalt details');
  if (inhalt) {
    var desktop = window.matchMedia('(min-width: 961px)');
    var setze = function () { inhalt.open = desktop.matches; };
    setze();
    desktop.addEventListener('change', setze);
    // Am Desktop bleibt die Liste offen
    inhalt.querySelector('summary').addEventListener('click', function (e) { if (desktop.matches) e.preventDefault(); });
    // Am Handy nach dem Sprung wieder zuklappen
    inhalt.addEventListener('click', function (e) { if (e.target.closest('a') && !desktop.matches) inhalt.open = false; });

    var links = Array.prototype.slice.call(inhalt.querySelectorAll('a'));
    var ziele = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
    var markiere = function () {
      var aktiv = -1;
      for (var i = 0; i < ziele.length; i++) {
        if (ziele[i] && ziele[i].getBoundingClientRect().top <= window.innerHeight * 0.4) aktiv = i;
      }
      links.forEach(function (a, i) { a.classList.toggle('is-active', i === aktiv); });
    };
    window.addEventListener('scroll', markiere, { passive: true });
    markiere();
  }

  /* ---- Handy-Menü ---- */
  var mbtn = document.getElementById('mnavToggle');
  var mnav = document.getElementById('mnav');
  if (mbtn && mnav) {
    var setOpen = function (open) {
      mnav.hidden = !open;
      mbtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      mbtn.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
      document.body.classList.toggle('mnav-open', open);
    };
    mbtn.addEventListener('click', function () { setOpen(mnav.hidden); });
    mnav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !mnav.hidden) { setOpen(false); mbtn.focus(); } });
    window.matchMedia('(min-width: 961px)').addEventListener('change', function (m) { if (m.matches) setOpen(false); });
  }
})();
