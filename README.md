# ipm. – Website (Entwurf Light)

Statische Website der ipm. (früher „ipm-KG“), ausgeliefert als Cloudflare Worker (`ipm-kg-entwurf-light`).

## Marke (seit 2026-11)

Logos, Favicons und Social-Bild liegen in `assets/marke-2026-11/` (erzeugt aus der Logo-Datei `ipm-LOGO - X.tif`,
Mail „Neues Auftreten der ipm.“, 13.11.2026). Die Originale liegen nur lokal in `assets/marke-2026-11/original/`
(gitignored, nicht ausgeliefert).

| Datei | Wofür |
|---|---|
| `ipm-logo-kompakt-auf-hell.png` / `-auf-dunkel.png` | Sidebar, Kopfzeile Handy, Kopf von Impressum/Datenschutz (je nach Farbsatz) |
| `ipm-logo-auf-hell.png` / `-auf-dunkel.png` | Fußbereich (je nach Farbsatz) |
| `ipm-logo-*-hell.png`, `ipm-logo-*-dunkel.png` (ohne „auf“) | alte Fassung in Schwarz/#548056, Reserve |
| `favicon.ico`, `favicon-32.png`, `apple-touch-icon.png`, `icon-512.png`, `og-bild.png` | Symbole, Social-Bild |

Farben laut Marken-Blatt (`original/image0-mockup.png`, Abschnitt 08): Anthrazit Dunkel `#2D3436`, Grün `#5E7F5A`,
Warmweiß `#F7F6F2`. Die „auf“-Logos sind aus der Logo-Datei in genau diese Farben umgefärbt.
Kleine grüne Schrift: hell `#4E6B4A`, invers `#93B48E` (WCAG AA). Grüne Knöpfe: Fläche `#5E7F5A`, Schrift weiß (4,5:1).
Kurzschreibung: „ipm.“ (ohne „-KG“).
Schrift: Avenir Next (kommerziell) – solange keine Web-Lizenz da ist, Ersatz Nunito Sans (SIL OFL, `assets/fonts/`).

### Zwei Farbsätze: hell und invers

- **Hell (Standard):** Warmweiß-Seite, weiße Seitenleiste und Kopfzeile, Anthrazit-Schrift, Trennstreifen in Anthrazit.
- **Invers:** alles umgekehrt wie im Marken-Blatt Abschnitt 05: Anthrazit-Seite, Warmweiß-Schrift, Trennstreifen in Warmweiß.
- Schalter „Farben umkehren“ oben rechts in der Kopfzeile (`#farbenKnopf`, `assets/site.js`). Die Wahl steht in
  `localStorage` unter `ipm.farben` (`hell` | `invers`), ein Inline-Script im `<head>` setzt `html[data-farben="invers"]`
  vor dem Malen. Impressum und Datenschutz folgen der Wahl, haben aber keinen eigenen Schalter.
- Alle Farben laufen über Tokens in `assets/site.css` (`:root` = hell, `html[data-farben="invers"]` = invers). Keine festen
  Farben außerhalb der Tokens, außer im Hero über dem Video (immer weiß).

## Seiten

| Seite | Textdatei | Quelle |
|---|---|---|
| `/` Startseite | `content/start.md` | Manifest „FINAL V20“ (vollständig) + Homepage-Texte (Einstieg) |
| `/philosophie/` | `content/philosophie.md` | Manifest „Premium V“ (vollständig, 9 Absätze) |
| `/manifest/` | `content/manifest.md` | Manifest lange Fassung (vollständig) |
| `/projektentwicklung/` | `content/projektentwicklung.md` | Homepage-Texte (Projektentwicklung) |
| `/quality-time-living/` | `content/quality-time-living.md` | Einleitung, Weiterleitung zu mein-qtl.de |
| `/kontakt/` | `content/kontakt.md` | Kontaktdaten |

`impressum/` und `datenschutz/` sind eigenständige HTML-Dateien und werden nicht gebaut.

## Texte pflegen

1. Text in `content/<seite>.md` ändern.
2. `node tools/build.mjs` – erzeugt die `index.html`-Dateien neu (nie die HTML-Dateien direkt bearbeiten).
3. `node tools/check-texte.mjs` – prüft, dass jeder Satz aus den Word-Dokumenten noch auf der Seite steht.
4. Deploy: `npx wrangler deploy`.

### Aufbau einer Textdatei

```
== Abschnittsname ==            dunkler Trennstreifen + neuer Abschnitt
== Abschnittsname .grau ==      … mit grauem (.grau) oder weißem (.weiss) Hintergrund

::: blocktyp option=wert        Block-Anfang
…Text…
:::                             Block-Ende
```

Im Text: Leerzeile = neuer Absatz, einfacher Zeilenumbruch = Umbruch in der Zeile.
`# / ## / ###` Überschriften · `^ Text` kleine grüne Dachzeile · `> Text` hervorgehobener Kernsatz ·
`- Text` Liste · `*kursiv*` (in Überschriften grün) · `**fett**` · `[Text](/seite/)` Textlink ·
`[Text](/seite/){knopf}` grüner Knopf (`{rahmen}`, `{hell}` für Varianten) · `{.klasse}` am Absatzende.

| Block | Wofür |
|---|---|
| `hero` | Video oben auf der Startseite, Text = Slogan |
| `seitenkopf` | Kopf der Unterseiten |
| `einstieg` | zentrierter Block unter dem Video |
| `zweispaltig` | links Überschrift, `---`, rechts Text |
| `lesetext` | ruhige Lesespalte (`stil=mitte`, `stil=philosophie`) |
| `kopf` | zentrierte Überschrift über Karten |
| `karten` | Karten, getrennt durch `---` (`nummern=ja`, `spalten=3`) |
| `woerter` | Wortband, ein Wort je Zeile |
| `grundsatz nr=1` | Kapitel im Manifest (große Nummer) |
| `zeilen` | Text in kurzen Zeilen (`stil=mitte`, `stil=glauben`, `stil=versprechen`) |
| `gegenueber` | „Nicht … \| Sondern …“ je Zeile |
| `zeitstrahl` | Schritte, getrennt durch `---` |
| `abschluss` | dunkles Band mit Zitat und Knopf |
| `drucken` | Knopf „Drucken / als PDF sichern“ |

Mit `inhalt: ja` im Kopf der Datei bekommt die Seite ein Inhaltsverzeichnis (Manifest).

### Quelltexte

Die Word-Dokumente von Sebastian Schlootz (Mail „Website ipm“, 14.10.2026) liegen als Text nur lokal in `quellen/`
(steht in `.gitignore`, weil das Repo öffentlich ist). Neu erzeugen:
`python tools/docx-zu-text.py quellen "<Pfad>/Datei.docx" …`
