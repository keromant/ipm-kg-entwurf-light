// Baut die Seiten der ipm-KG-Website aus den Textdateien in content/.
// Aufruf: node tools/build.mjs   (keine Abhängigkeiten nötig)
//
// Aufbau einer Textdatei: siehe README.md, Abschnitt „Texte pflegen“.

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'content');

// Reihenfolge = Reihenfolge im Menü
const SEITEN = [
  { datei: 'start.md',               pfad: '',                     menue: 'Wer wir sind' },
  { datei: 'philosophie.md',         pfad: 'philosophie',          menue: 'Philosophie' },
  { datei: 'manifest.md',            pfad: 'manifest',             menue: 'Manifest' },
  { datei: 'projektentwicklung.md',  pfad: 'projektentwicklung',   menue: 'Projekt­entwicklung' },   // weiches Trennzeichen: in der schmalen Sidebar zweizeilig
  { datei: 'quality-time-living.md', pfad: 'quality-time-living',  menue: 'Quality Time Living' },
  { datei: 'kontakt.md',             pfad: 'kontakt',              menue: 'Kontakt', nurFooter: true },
];

/* ---------------------------------------------------------------- Helfer */

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const slug = s => s.toLowerCase()
  .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const pad2 = n => String(n).padStart(2, '0');

// interne Links (/pfad/) relativ zur aktuellen Seite machen
function href(url, rel) {
  if (/^(https?:|mailto:|tel:|#)/.test(url)) return url;
  if (url.startsWith('/')) return (rel + url.slice(1)) || './';
  return url;
}

// Inline-Auszeichnung: **fett**, *kursiv*, [Text](url) und [Text](url){knopf}
function inline(text, rel) {
  let s = esc(text).replace(/&lt;br&gt;/g, '<br>'); // gezielter Umbruch in Überschriften
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)(\{([a-z-]+)\})?/g, (_, t, u, __, art) => {
    const ext = /^https?:/.test(u);
    const ziel = ext ? ' target="_blank" rel="noopener"' : '';
    if (art) {
      const klasse = { knopf: 'btn btn-gruen', rahmen: 'btn btn-rahmen', hell: 'btn btn-hell' }[art] || 'btn btn-gruen';
      return `<a class="${klasse}" href="${href(u, rel)}"${ziel}>${t}</a>`;
    }
    if (u.startsWith('+')) return t; // reserviert
    return `<a class="text-link" href="${href(u, rel)}"${ziel}><span class="text-link-arrow">+</span>${t}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  // Das kursive Q von Playfair ist stark verschnörkelt – in kursivem Text ersetzt site.css es (Klasse .q)
  s = s.replace(/(<[^>]*>)|Q/g, (m, tag) => tag || '<span class="q">Q</span>');
  return s;
}

// Text eines Blocks: Absätze durch Leerzeilen getrennt, einfacher Zeilenumbruch = <br>
//   # / ## / ### Überschriften, ^ Dachzeile, > Kernsatz, - Liste, {.klasse} am Absatzende
function md(body, rel) {
  const out = [];
  let para = [], liste = [];
  const flushPara = () => {
    if (!para.length) return;
    let klasse = '';
    const last = para[para.length - 1];
    const m = last.match(/\s*\{\.([a-z0-9 .-]+)\}\s*$/);
    if (m) { para[para.length - 1] = last.slice(0, m.index); klasse = m[1].split('.').join(' '); }
    const html = para.map(l => inline(l, rel)).join('<br>');
    // Absatz nur aus einem Knopf -> Knopfzeile
    if (/^<a class="btn[^>]*>[^<]*<\/a>(\s*<a class="btn[^>]*>[^<]*<\/a>)*$/.test(html.replace(/<br>/g, ' ').trim())) klasse = (klasse + ' knopf-zeile').trim();
    out.push(`<p${klasse ? ` class="${klasse}"` : ''}>${html}</p>`);
    para = [];
  };
  const flushListe = () => {
    if (!liste.length) return;
    out.push('<ul>' + liste.map(l => `<li>${inline(l, rel)}</li>`).join('') + '</ul>');
    liste = [];
  };
  for (const raw of body.split('\n')) {
    const line = raw.trim();
    if (!line) { flushPara(); flushListe(); continue; }
    let m;
    if ((m = line.match(/^(#{1,4})\s+(.*)$/))) {
      flushPara(); flushListe();
      const n = m[1].length;
      out.push(`<h${n}>${inline(m[2], rel)}</h${n}>`);
    } else if (line.startsWith('^ ')) {
      flushPara(); flushListe();
      out.push(`<span class="eyebrow">${inline(line.slice(2), rel)}</span>`);
    } else if (line.startsWith('> ')) {
      flushPara(); flushListe();
      out.push(`<blockquote class="kernsatz"><p>${inline(line.slice(2), rel)}</p></blockquote>`);
    } else if (line.startsWith('- ')) {
      flushPara();
      liste.push(line.slice(2));
    } else {
      flushListe();
      para.push(line);
    }
  }
  flushPara(); flushListe();
  return out.join('\n');
}

const teile = body => body.split(/\n\s*---\s*\n/);

function ersteUeberschrift(body) {
  const m = body.match(/^##\s+(.*)$/m);
  return m ? m[1].replace(/\*/g, '') : '';
}

/* ---------------------------------------------------------------- Blöcke */

const BLOCK = {
  hero(a, body) {
    let i = 0;
    const woerter = body.trim().split(/\s+/).map(w => {
      const kursiv = /^\*.*\*$/.test(w);
      const t = esc(w.replace(/\*/g, ''));
      return `<span class="hc-word"><span style="--wd:${(i++ * 0.11).toFixed(2)}s">${kursiv ? `<em>${t}</em>` : t}</span></span>`;
    }).join('\n        ');
    return `<section class="hero" id="hero">
  <video class="hero-video" src="${a.rel}assets/hero-sebastian-henno.mp4" poster="${a.rel}assets/hero-endframe-poster.png" autoplay muted playsinline preload="auto"></video>
  <div class="hero-overlay"></div>
  <div class="hero-claim">
    <h1>${woerter}</h1>
  </div>
  <a class="hero-scroll" href="#inhalt" aria-label="Weiter zum Inhalt"><div class="hero-scroll-arrow">&#8964;</div></a>
</section>`;
  },

  seitenkopf(a, body) {
    return `<header class="seitenkopf" id="inhalt">
  <div class="seitenkopf-inner reveal">${md(body, a.rel)}</div>
</header>`;
  },

  einstieg(a, body) {
    return `<div class="claim" id="inhalt">
  <div class="claim-inner reveal">
    <div class="claim-rule"></div>
    ${md(body, a.rel)}
  </div>
</div>`;
  },

  zitat(a, body) {
    return `<div class="zitat"><blockquote class="reveal">${md(body, a.rel)}</blockquote></div>`;
  },

  zweispaltig(a, body) {
    const [links, rechts = ''] = teile(body);
    return `<div class="statement-section reveal">
  <div class="statement-left">${md(links, a.rel)}</div>
  <div class="statement-right">${md(rechts, a.rel)}</div>
</div>`;
  },

  lesetext(a, body) {
    const stil = a.stil ? ` stil-${a.stil}` : '';
    return `<div class="lesen${stil}"${a.id ? ` id="${a.id}"` : ''}><div class="lesen-inner">${md(body, a.rel)}</div></div>`;
  },

  kopf(a, body) {
    return `<header class="kopf reveal">${md(body, a.rel)}</header>`;
  },

  karten(a, body) {
    const karten = teile(body).map((t, i) => {
      const nr = a.nummern ? `<span class="karte-nr">${pad2(i + 1)}</span>` : '';
      return `<article class="karte reveal" style="--d:${(i * 0.08).toFixed(2)}s">${nr}${md(t, a.rel)}</article>`;
    });
    const sp = a.spalten ? ` style="--spalten:${a.spalten}"` : '';
    return `<div class="karten"${sp}>\n${karten.join('\n')}\n</div>`;
  },

  woerter(a, body) {
    const w = body.trim().split('\n').map(l => l.trim()).filter(Boolean);
    return `<ul class="woerter reveal" aria-label="${esc(a.titel || 'Eigenschaften')}">${w.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
  },

  grundsatz(a, body) {
    const nr = Number(a.nr);
    const titel = ersteUeberschrift(body);
    a.toc.push({ id: `grundsatz-${nr}`, text: `${nr}. ${titel}` });
    return `<article class="grundsatz" id="grundsatz-${nr}">
  <span class="grundsatz-nr" aria-hidden="true">${pad2(nr)}</span>
  <div class="grundsatz-text reveal">${md(body, a.rel)}</div>
</article>`;
  },

  zeilen(a, body) {
    const titel = ersteUeberschrift(body);
    const id = a.id || (titel ? slug(titel) : '');
    if (titel && a.toc && a.inhalt !== 'nein') a.toc.push({ id, text: titel });
    const stil = a.stil ? ` stil-${a.stil}` : '';
    return `<div class="zeilen${stil}"${id ? ` id="${id}"` : ''}><div class="zeilen-inner reveal">${md(body, a.rel)}</div></div>`;
  },

  gegenueber(a, body) {
    const titel = ersteUeberschrift(body);
    const id = a.id || slug(titel);
    if (titel && a.toc) a.toc.push({ id, text: titel });
    const kopf = [], reihen = [];
    for (const l of body.split('\n')) {
      if (l.includes('|')) { const [x, y] = l.split('|').map(s => s.trim()); reihen.push(`<li><span class="nicht">${inline(x, a.rel)}</span><span class="sondern">${inline(y, a.rel)}</span></li>`); }
      else kopf.push(l);
    }
    return `<div class="gegenueber" id="${id}"><div class="gegenueber-inner reveal">${md(kopf.join('\n'), a.rel)}<ul>${reihen.join('')}</ul></div></div>`;
  },

  zeitstrahl(a, body) {
    const schritte = teile(body).map((t, i) =>
      `<li class="reveal" style="--d:${(i * 0.05).toFixed(2)}s"><span class="schritt-nr">${pad2(i + 1)}</span><div>${md(t, a.rel)}</div></li>`);
    return `<ol class="zeitstrahl">\n${schritte.join('\n')}\n</ol>`;
  },

  abschluss(a, body) {
    return `<div class="abschluss"><div class="abschluss-inner reveal">${md(body, a.rel)}</div></div>`;
  },

  drucken(a, body) {
    return `<p class="drucken-zeile"><button type="button" class="btn btn-rahmen" data-drucken>${esc(body.trim() || 'Drucken')}</button></p>`;
  },
};

/* ---------------------------------------------------------------- Seite */

function parseAttr(s) {
  const a = {};
  for (const m of s.matchAll(/([a-z]+)=("([^"]*)"|\S+)/g)) a[m[1]] = m[3] ?? m[2];
  return a;
}

function parse(src) {
  const fm = {};
  let text = src.replace(/\r\n/g, '\n');
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (m) {
    for (const l of m[1].split('\n')) { const i = l.indexOf(':'); if (i > 0) fm[l.slice(0, i).trim()] = l.slice(i + 1).trim(); }
    text = text.slice(m[0].length);
  }
  // Kommentare <!-- … --> in den Textdateien entfernen
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  const teile = [];
  const re = /^==\s+(.+?)\s+==\s*$|^:::\s*([a-z]+)([^\n]*)\n([\s\S]*?)^:::\s*$/gm;
  let t;
  while ((t = re.exec(text))) {
    if (t[1]) teile.push({ art: 'trenner', titel: t[1] });
    else teile.push({ art: t[2], attr: parseAttr(t[3]), body: t[4] });
  }
  return { fm, teile };
}

function render(seite) {
  const { fm, teile } = parse(readFileSync(join(CONTENT, seite.datei), 'utf8'));
  const rel = seite.pfad ? '../' : '';
  const toc = [];
  let html = '', offen = false, start = '';

  for (const t of teile) {
    if (t.art === 'trenner') {
      // "Titel" oder "Titel .klasse"
      const [titel, ...kl] = t.titel.split(/\s+\./);
      if (offen) html += '</section>\n';
      html += `<div class="section-divider"><span>${esc(titel)}</span></div>\n<section id="${slug(titel)}"${kl.length ? ` class="${kl.join(' ')}"` : ''}>\n`;
      offen = true;
      continue;
    }
    const fn = BLOCK[t.art];
    if (!fn) throw new Error(`${seite.datei}: unbekannter Block „${t.art}“`);
    const out = fn({ ...t.attr, rel, toc }, t.body) + '\n';
    if (!offen && (t.art === 'hero' || t.art === 'seitenkopf' || t.art === 'einstieg')) start += out;
    else html += out;
  }
  if (offen) html += '</section>\n';

  if (fm.inhalt === 'ja' && toc.length) {
    const liste = toc.map(e => `<li><a href="#${e.id}">${esc(e.text)}</a></li>`).join('\n        ');
    html = `<div class="mit-inhalt">
  <nav class="inhalt" aria-label="Inhalt">
    <details>
      <summary>Inhalt</summary>
      <ol>
        ${liste}
      </ol>
    </details>
  </nav>
  <div class="inhalt-text">
${html}  </div>
</div>\n`;
  }

  return seitenRahmen({ seite, fm, rel, body: start + html });
}

function menue(rel, aktiv, klasse) {
  return SEITEN.filter(s => !s.nurFooter).map(s =>
    `<li${s === aktiv ? ' class="is-active"' : ''}><a href="${href('/' + (s.pfad ? s.pfad + '/' : ''), rel)}"${s === aktiv ? ' aria-current="page"' : ''}>${esc(s.menue)}</a></li>`
  ).join(`\n${klasse}`);
}

function seitenRahmen({ seite, fm, rel, body }) {
  const h = p => href(p, rel);
  const titel = fm.titel || 'ipm-KG';
  return `<!DOCTYPE html>
<!-- Automatisch erzeugt aus content/${seite.datei} mit tools/build.mjs – Texte bitte dort ändern, nicht hier. -->
<html lang="de" class="no-js">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(titel)}</title>
<meta name="description" content="${esc(fm.beschreibung || '')}">
<link rel="stylesheet" href="${rel}assets/site.css">
</head>
<body class="seite-${seite.pfad || 'start'}">

<div id="cursor"></div>
<div id="cursor-dot"></div>

<div class="topbar" id="topbar">
  <button class="topbar-burger" id="mnavToggle" type="button" aria-label="Menü öffnen" aria-controls="mnav" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
  <a href="${h('/')}" class="topbar-logo"><img src="${rel}assets/ipm-logo.png" alt="ipm-KG – zur Startseite"></a>
  <span class="topbar-label" id="topbarLabel" data-start="${esc(fm.label || seite.menue)}">${esc(fm.label || seite.menue)}</span>
  <a href="${h('/kontakt/')}" class="topbar-cta">Kontakt aufnehmen +</a>
</div>

<nav class="mnav" id="mnav" aria-label="Hauptmenü" hidden>
  <ul class="mnav-list">
    ${menue(rel, seite, '    ')}
    <li class="mnav-sep"><a href="${h('/kontakt/')}">Kontakt</a></li>
  </ul>
</nav>

<aside class="sidebar" id="sidebar">
  <div class="sb-logo">
    <a href="${h('/')}"><img src="${rel}assets/ipm-logo.png" alt="ipm – Immobilien-Projekt-Management"></a>
  </div>
  <div class="sb-sep"></div>
  <nav class="sb-nav" aria-label="Hauptmenü">
    <ul class="sb-list">
      ${menue(rel, seite, '      ')}
    </ul>
  </nav>
  <div class="sb-sep"></div>
  <div class="sb-cta-wrap">
    <a href="${h('/kontakt/')}" class="sb-cta${seite.pfad === 'kontakt' ? ' is-current' : ''}">Kontakt</a>
  </div>
</aside>

<main>
${body}</main>

<footer id="footer">
  <div class="footer-main">
    <div>
      <img src="${rel}assets/ipm-logo.png" alt="ipm" class="footer-logo">
      <p class="footer-tagline">Immobilien-Projekt-Management. Diskret. Individuell. Transparent.</p>
      <div class="footer-address">
        ipm-KG · Immobilien-Projekt-Management<br>
        Feldburgweg 84<br>
        47918 Tönisvorst<br><br>
        Tel. <a href="tel:+4921564889890">+49 (0) 2156 4 88 98 90</a><br>
        <a href="mailto:info@ipm-kg.de">info@ipm-kg.de</a>
      </div>
    </div>
    <div class="footer-col">
      <h2>Übersicht</h2>
      <ul>
        ${SEITEN.map(s => `<li><a href="${h('/' + (s.pfad ? s.pfad + '/' : ''))}">${esc(s.menue)}</a></li>`).join('\n        ')}
      </ul>
    </div>
    <div class="footer-col">
      <h2>Rechtliches</h2>
      <ul>
        <li><a href="${h('/impressum/')}">Impressum</a></li>
        <li><a href="${h('/datenschutz/')}">Datenschutzerklärung</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <span class="footer-copy">© 2026 ipm-KG Immobilien-Projekt-Management · Tönisvorst · Alle Rechte vorbehalten.</span>
    <div class="footer-legal-links">
      <a href="${h('/impressum/')}">Impressum</a>
      <a href="${h('/datenschutz/')}">Datenschutz</a>
    </div>
  </div>
  <div class="footer-disclaimer">
    Die auf dieser Website enthaltenen Angaben und Informationen dienen ausschließlich zu Informationszwecken. Irrtümer vorbehalten.
  </div>
</footer>

<script src="${rel}assets/site.js"></script>
</body>
</html>
`;
}

/* ---------------------------------------------------------------- Los */

const vorhanden = new Set(readdirSync(CONTENT));
for (const s of SEITEN) {
  if (!vorhanden.has(s.datei)) throw new Error(`content/${s.datei} fehlt`);
  const ziel = s.pfad ? join(ROOT, s.pfad, 'index.html') : join(ROOT, 'index.html');
  mkdirSync(dirname(ziel), { recursive: true });
  writeFileSync(ziel, render(s), 'utf8');
  console.log('gebaut:', (s.pfad ? s.pfad + '/' : '') + 'index.html');
}
