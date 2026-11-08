# Wetter-Männli 🧍‍♂️☔

Eine PWA (Progressive Web App), die das aktuelle Wetter anzeigt. In der Mitte steht ein Männli, das passend zum Wetter angezogen ist.

- **Wetterdaten:** [Open-Meteo](https://open-meteo.com) (gratis, ohne API-Key)
- **Hosting:** Vercel
- **Männli personalisieren:** Name, Hautfarbe, Frisur, Haarfarbe, Augenfarbe, Lieblingsfarbe, Brille, Bart, Sommersprossen (wird auf dem Handy gespeichert)
- **5-Tage-Vorhersage:** Tippt man auf einen Tag, zieht sich das Männli für diesen Tag an
- **Installierbar** auf iPhone und Android, funktioniert auch offline

## Dateien

| Datei | Wofür |
|---|---|
| `index.html` | Aufbau der Seite + das Männli als SVG (Kleider `k-…`, Frisuren `h-…`, Extras `e-…`) |
| `style.css` | Aussehen, Hintergründe je nach Wetter, Regen-/Schnee-Animation |
| `app.js` | Wetter holen, Kleider auswählen (`waehleKleidung`), Editor (`OPTIONEN`), 5-Tage-Liste |
| `manifest.json` | Name, Icon und Farben der installierten App |
| `sw.js` | Service Worker: speichert die App für den Offline-Modus |
| `vercel.json` | Sorgt dafür, dass Updates am Service Worker sofort ankommen |
| `icons/` | App-Icons |

## Lokal testen in VS Code

1. Ordner in VS Code öffnen.
2. Erweiterung **Live Server** installieren (von Ritwick Dey).
3. Rechtsklick auf `index.html` → **Open with Live Server**.

> Wenn du die Datei einfach per Doppelklick öffnest, funktioniert der Service Worker nicht. Er braucht einen Server, Live Server reicht dafür.

## Auf GitHub hochladen (mit VS Code)

1. Links auf das Symbol **Source Control** klicken (Verzweigungs-Symbol, oder `Ctrl+Shift+G`).
2. **Publish to GitHub** klicken und mit GitHub anmelden.
3. **Public repository** wählen. Alle Dateien sind ausgewählt → OK.
4. Später bei Änderungen: Nachricht eintippen → **Commit** → **Sync Changes**.

## Auf Vercel veröffentlichen

1. Auf [vercel.com](https://vercel.com) mit dem GitHub-Konto anmelden.
2. **Add New… → Project** → dein Repository `wetter-maennli` → **Import**.
3. Framework Preset: **Other**. Alles andere so lassen → **Deploy**.
4. Du bekommst eine Adresse wie `wetter-maennli.vercel.app`.

Jedes Mal, wenn du in VS Code auf **Sync Changes** klickst, aktualisiert Vercel die Seite automatisch.

## Auf dem Handy installieren

- **iPhone (Safari):** Teilen-Knopf → **Zum Home-Bildschirm**
- **Android (Chrome):** Menü ⋮ → **App installieren** / **Zum Startbildschirm hinzufügen**

## Selbst anpassen – Ideen

- Die Regeln in `waehleKleidung()` in `app.js` ändern (z.B. andere Temperaturgrenzen).
- Neue Kleider im SVG hinzufügen: eine neue `<g id="k-NAME" class="kleid">` in `index.html` einfügen, dann in `waehleKleidung()` mit `k.add("NAME")` anziehen.
- Neue Farben oder Frisuren für den Editor: in `app.js` bei `OPTIONEN` eintragen. Für eine neue Frisur zusätzlich eine `<g id="h-NAME" class="frisur">` im SVG zeichnen.
- Hautfarbe, Haarfarbe usw. funktionieren über CSS-Klassen (`class="haut"`, `class="haar"`, `class="farbe"`). Wenn du etwas Neues zeichnest, das die Hautfarbe haben soll, gib ihm einfach `class="haut"`.
- Pollen oder Luftqualität dazunehmen (Open-Meteo Air Quality API).

> ⚠️ Wenn du `index.html`, `style.css` oder `app.js` änderst, erhöhe in `sw.js` die `VERSION` (z.B. `maennli-v2`). Sonst zeigt das Handy noch die alte Version aus dem Cache.
