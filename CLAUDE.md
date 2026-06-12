# ttools – Unterrichts-Tools

Statische Website mit kleinen Tools für den Unterricht. Läuft auf GitHub Pages:
https://unsfragen.github.io/ttools/

## Grundregeln

- **Kein Build-Step.** Reines HTML/CSS/JS, keine Frameworks, kein npm.
- **Alle Pfade relativ**, damit die Seite unter `https://<user>.github.io/ttools/`
  (Unterpfad!) genauso funktioniert wie lokal.
- UI-Sprache: Deutsch.

## Struktur

```
ttools/
├── index.html          # Startseite: rendert Kacheln aus window.TOOLS
├── tools.js            # zentrale Tool-Liste (window.TOOLS)
├── shared/
│   ├── styles.css      # Design-Tokens (CSS Custom Properties) + Bausteine
│   ├── classes.js      # window.ClassStore: geteilte Klassenlisten (localStorage)
│   └── nav.js          # fügt die gemeinsame Kopfzeile ein
└── tools/<id>/         # ein Ordner pro Tool, jeweils mit index.html
```

## Einbinde-Reihenfolge auf jeder Seite

1. `shared/styles.css` (im `<head>`)
2. `tools.js` (vor `nav.js`, liefert `window.TOOLS`)
3. `shared/nav.js` (baut die Kopfzeile; leitet die Repo-Wurzel aus seiner
   eigenen Script-URL ab, funktioniert daher in jeder Ordnertiefe)
4. optional `shared/classes.js`, wenn das Tool Klassenlisten braucht

## ClassStore-API (`shared/classes.js`)

Daten liegen unter dem localStorage-Key `ttools.classes`; alle Zugriffe sind
mit try/catch abgesichert (Fallback: In-Memory). Mehrere Tabs synchronisieren
sich über das `storage`-Event.

```js
ClassStore.getClasses()              // [{ id, name, students: [] }, …]
ClassStore.getClass(id)
ClassStore.createClass("5a")
ClassStore.renameClass(id, "5b")
ClassStore.deleteClass(id)
ClassStore.getActiveClass()          // tool-übergreifend dieselbe aktive Klasse
ClassStore.setActiveClass(id)
ClassStore.setStudents(id, ["Anna", "Ben"])
ClassStore.addStudent(id, "Cem")
ClassStore.removeStudent(id, "Anna")
ClassStore.subscribe(cb)             // cb läuft bei jeder Änderung; gibt unsubscribe() zurück
```

## So füge ich ein neues Tool hinzu

1. **Ordner anlegen:** `tools/<id>/` (z. B. `tools/zufall/`).

2. **`tools/<id>/index.html` erstellen** – Vorlage (Pfade beachten: zwei
   Ebenen hoch zu den shared-Dateien):

   ```html
   <!DOCTYPE html>
   <html lang="de">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Tool-Titel – ttools</title>
     <link rel="stylesheet" href="../../shared/styles.css">
   </head>
   <body>
     <main>
       <h1>Tool-Titel</h1>
       <!-- Tool-UI hier -->
     </main>
     <script src="../../tools.js"></script>
     <script src="../../shared/nav.js"></script>
     <script src="../../shared/classes.js"></script> <!-- nur falls Klassen nötig -->
     <script>
       // Tool-Logik hier (oder in eigener Datei tools/<id>/app.js)
     </script>
   </body>
   </html>
   ```

3. **Eintrag in `tools.js` ergänzen** (href relativ zur Repo-Wurzel):

   ```js
   {
     id: "zufall",
     title: "Zufallsschüler",
     desc: "Lost eine Schülerin oder einen Schüler aus.",
     href: "tools/zufall/index.html",
     icon: "🎲",
   },
   ```

4. **Lokal testen:** `python3 -m http.server` im Repo-Ordner, dann
   http://localhost:8000 öffnen. Startseiten-Kachel und Nav-Link erscheinen
   automatisch.

5. **Committen und pushen** – GitHub Pages deployt den `main`-Branch
   automatisch.

## Design

Farben, Typografie und Abstände sind als CSS Custom Properties in
`shared/styles.css` definiert (`--color-*`, `--font-size-*`, `--space-*`).
Tools nutzen die vorhandenen Bausteine (`.btn`, `.btn-primary`, `.card`,
`.card-grid`, `.site-header`) statt eigene Styles zu erfinden; tool-eigenes
CSS nur für Spezialfälle, dann mit den Tokens.
