# Übergabe für die nächste Sitzung

## 2026-11-19 – Sebastians Wünsche: Fußzeile + Hero Handy
**Erledigt:** Fußzeile (build.mjs): Firmenname nur einmal als Text (laut Impressum), darunter Liste mit gleichen
Beschriftungen Anschrift / Telefon / E-Mail (`.footer-kontakt`); Unterzeile ohne Firmennamen, Copyright nur „ipm.“.
Hero Handy (< 960 px): randlos, Höhe min(Schirm, 110 vw), Ausschnitt 58 %, beide Personen im Bild.
„Wir sind anders.“ steht nur noch im Hero, nicht mehr im Einstieg darunter.
**Fallstricke:** `master` war hinter dem Live-Stand (live war `marke-2026-11`); master wurde vorgespult, live ist jetzt master.

## 2026-11-18 – Marke statt „ipm-KG“, eine Telefonnummer
**Erledigt:** „ipm.“ jetzt überall als Wortmarke (build.mjs: `inline()` ruft `marke()`, also auch Fließtext, Listen,
Karten; Fußzeile Adresse + Copyright). Impressum/Datenschutz: Wortmarke im Kopf (Unterzeile), im Bildnachweis und in der
Fußzeile, eigene `.ipm-marke`-Regeln im Inline-CSS. Telefon überall +49 (0) 2151 – 3 61 38 85 (tel:+4921513613885);
alte 2156-Nummer und die Handynummer im Datenschutz-Abschnitt „Verantwortliche Stelle“ ersetzt.
**Erledigt 19.11.:** Rechtlicher Name im Datenschutz jetzt wie im Impressum
(„ipm Immobilien-Projekt-Management – Kooperations-Gesellschaft bR“).

## 2026-11-18 – Handy-Ansicht, Lesbarkeit, Impressum
**Erledigt:** Hero unter 960 px als ganzes 3:2-Video, Slogan darunter auf dunkler Fläche; Fließtext mobil 16 px/400,
Labels ≥ 12 px, Tap-Ziele ≥ 44 px; --text-2/--muted invers heller, Footer kräftiger; Impressum nach AHZ-Fassung
(Henno + Sebastian Schlootz, Tel. 2151 …); Poster als JPG (2 MB → 160 KB). Live per `npx wrangler deploy`.
**Offene Fäden:** Telefon im Footer und auf /kontakt/ ist noch +49 (0) 2156 4 88 98 90, im Impressum jetzt
+49 (0) 2151 - 3 61 38 85 – mit Henno klären, welche gilt. projekt-*.png (14 MB) sind ungenutzt, werden aber ausgeliefert.
**Fallstricke:** Arbeitskopie hat CRLF (autocrlf), Repo LF – Vergleich mit Live nur ohne CR. Hero-Video beginnt mit leerem
Fenster, die Personen sind erst am Ende ganz drin. Ein lokaler Prüfserver braucht Range-Anfragen, sonst springt das Video nicht.
**Wichtige Dateien:** assets/site.css (Block „Hero Handy“ am Ende von @media 960), impressum/index.html, datenschutz/index.html.
