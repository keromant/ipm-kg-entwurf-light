# Übergabe für die nächste Sitzung

## 2026-11-18 – Handy-Ansicht, Lesbarkeit, Impressum
**Erledigt:** Hero unter 960 px als ganzes 3:2-Video, Slogan darunter auf dunkler Fläche; Fließtext mobil 16 px/400,
Labels ≥ 12 px, Tap-Ziele ≥ 44 px; --text-2/--muted invers heller, Footer kräftiger; Impressum nach AHZ-Fassung
(Henno + Sebastian Schlootz, Tel. 2151 …); Poster als JPG (2 MB → 160 KB). Live per `npx wrangler deploy`.
**Offene Fäden:** Telefon im Footer und auf /kontakt/ ist noch +49 (0) 2156 4 88 98 90, im Impressum jetzt
+49 (0) 2151 - 3 61 38 85 – mit Henno klären, welche gilt. projekt-*.png (14 MB) sind ungenutzt, werden aber ausgeliefert.
**Fallstricke:** Arbeitskopie hat CRLF (autocrlf), Repo LF – Vergleich mit Live nur ohne CR. Hero-Video beginnt mit leerem
Fenster, die Personen sind erst am Ende ganz drin. Ein lokaler Prüfserver braucht Range-Anfragen, sonst springt das Video nicht.
**Wichtige Dateien:** assets/site.css (Block „Hero Handy“ am Ende von @media 960), impressum/index.html, datenschutz/index.html.
