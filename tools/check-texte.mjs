// Prüft, ob jeder Satz aus Sebastians Word-Dokumenten auf einer der Seiten steht.
// Aufruf: node tools/check-texte.mjs
//
// Die Quelltexte liegen als .txt in quellen/ (nur lokal, nicht im Git – das Repo ist öffentlich).
// Neu erzeugen aus den .docx:  python tools/docx-zu-text.py quellen "<pfad>/*.docx"

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const QUELLEN = join(ROOT, 'quellen');
const SEITEN = ['index.html', 'philosophie', 'manifest', 'leistungen', 'quality-time-living', 'kontakt']
  .map(p => p.endsWith('.html') ? p : p + '/index.html');

// Bewusst korrigierte Tippfehler im Original
const KORREKTUR = [
  ['Seit für sich', 'Zeit für sich'],
  ['enfacher', 'einfacher'],
  ['Grundsäten', 'Grundsätzen'],
  ['Projektentwickler trägt deshalb', 'Projektentwickler tragen deshalb'],
  ['iom-KG', 'ipm-KG'],
];

// Bewusst NICHT wörtlich übernommen (Zeilennummern der .txt-Datei)
const AUSNAHMEN = {
  'ipm-KG-Homepage -Neu-Texte.txt': [
    [4, 4, '„besser“ – auf Kerems Wunsch entfernt (20.10.2026)'],
    [20, 38, 'Fassungen 1–4 von „Qualität statt Größe“ – Kerem hat Fassung 5 gewählt'],
    [50, 75, 'Texte von fremden Websites (Gehalt, Gabriel, RALF SCHMITZ) – in eigenen Worten neu geschrieben'],
  ],
};

const norm = s => ' ' + s.toLowerCase()
  .replace(/&[a-z]+;|&#\d+;/g, ' ')
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .trim() + ' ';

if (!existsSync(QUELLEN)) {
  console.error('Ordner quellen/ fehlt. Die .txt-Fassungen der Word-Dateien dort ablegen (siehe Kopf dieser Datei).');
  process.exit(2);
}

let seitenText = '';
for (const s of SEITEN) {
  const html = readFileSync(join(ROOT, s), 'utf8')
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  seitenText += norm(html);
}

let fehlt = 0, geprueft = 0, ausgelassen = 0;
for (const datei of readdirSync(QUELLEN).filter(f => f.endsWith('.txt'))) {
  const zeilen = readFileSync(join(QUELLEN, datei), 'utf8').split(/\r?\n/);
  const aus = AUSNAHMEN[datei] || [];
  const fehlend = [];
  zeilen.forEach((roh, i) => {
    const nr = i + 1;
    if (!roh.trim()) return;
    if (aus.some(([a, b]) => nr >= a && nr <= b)) { ausgelassen++; return; }
    let z = roh;
    for (const [a, b] of KORREKTUR) z = z.split(a).join(b);
    // in Satzteile zerlegen, damit Sätze auch einzeln (z. B. in Karten) gefunden werden
    for (const teil of z.split(/[.!?:;]/)) {
      const n = norm(teil);
      if (n.trim().length < 2) continue;
      geprueft++;
      const ohneUnd = n.replace(/^ und /, ' ');
      if (!seitenText.includes(n) && !seitenText.includes(ohneUnd)) fehlend.push(`  Zeile ${nr}: ${teil.trim()}`);
    }
  });
  console.log(`\n${datei}: ${fehlend.length ? fehlend.length + ' fehlend' : 'vollständig'}`);
  if (fehlend.length) console.log(fehlend.join('\n'));
  fehlt += fehlend.length;
  for (const [a, b, grund] of aus) console.log(`  (Zeilen ${a}–${b} ausgelassen: ${grund})`);
}

console.log(`\nGeprüft: ${geprueft} Satzteile · fehlend: ${fehlt} · bewusst ausgelassen: ${ausgelassen} Zeilen`);
process.exit(fehlt ? 1 : 0);
