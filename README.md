# ipm-KG – Website (Entwurf Light)

Statische Website der ipm-KG, ausgeliefert als Cloudflare Worker (`ipm-kg-entwurf-light`).

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
