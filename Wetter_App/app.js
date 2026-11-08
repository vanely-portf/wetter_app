// =====================================================
//  Wetter-Männli – app.js
//  Holt Wetterdaten von Open-Meteo (gratis, kein API-Key)
//  und zieht dem Männli passende Kleider an.
// =====================================================

// Standard-Ort, falls GPS nicht erlaubt wird
const STANDARD_ORT = { name: "Zürich", lat: 47.3769, lon: 8.5417 };

// ---------- Wettercodes (WMO) → Text + Emoji ----------
const WETTERCODES = {
  0:  ["Klar", "☀️"],
  1:  ["Überwiegend klar", "🌤️"],
  2:  ["Teilweise bewölkt", "⛅"],
  3:  ["Bewölkt", "☁️"],
  45: ["Nebel", "🌫️"],
  48: ["Nebel mit Reif", "🌫️"],
  51: ["Leichter Nieselregen", "🌦️"],
  53: ["Nieselregen", "🌦️"],
  55: ["Starker Nieselregen", "🌧️"],
  56: ["Gefrierender Niesel", "🌧️"],
  57: ["Gefrierender Niesel", "🌧️"],
  61: ["Leichter Regen", "🌦️"],
  63: ["Regen", "🌧️"],
  65: ["Starker Regen", "🌧️"],
  66: ["Gefrierender Regen", "🌧️"],
  67: ["Gefrierender Regen", "🌧️"],
  71: ["Leichter Schneefall", "🌨️"],
  73: ["Schneefall", "🌨️"],
  75: ["Starker Schneefall", "❄️"],
  77: ["Schneegriesel", "🌨️"],
  80: ["Regenschauer", "🌦️"],
  81: ["Regenschauer", "🌧️"],
  82: ["Heftige Schauer", "⛈️"],
  85: ["Schneeschauer", "🌨️"],
  86: ["Starke Schneeschauer", "❄️"],
  95: ["Gewitter", "⛈️"],
  96: ["Gewitter mit Hagel", "⛈️"],
  99: ["Gewitter mit Hagel", "⛈️"],
};

function codeText(code)  { return (WETTERCODES[code] || ["Unbekannt", "❓"])[0]; }
function codeEmoji(code) { return (WETTERCODES[code] || ["Unbekannt", "❓"])[1]; }

// Wetter-Kategorien
function istRegen(code)    { return (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95; }
function istSchnee(code)   { return (code >= 71 && code <= 77) || code === 85 || code === 86; }
function istGewitter(code) { return code >= 95; }
function istSonnig(code)   { return code <= 1; }
function istNebel(code)    { return code === 45 || code === 48; }

// =====================================================
//  DAS HERZSTÜCK: Welche Kleider passen zum Wetter?
//  Hier kannst du die Regeln selbst anpassen!
// =====================================================
function waehleKleidung(w) {
  // w = { temp, gefuehlt, code, wind, istTag }
  const t = w.gefuehlt;          // gefühlte Temperatur ist ehrlicher
  const k = new Set();           // Set = Liste ohne Doppelte
  const tipps = [];

  // 1) Grundkleidung nach Temperatur
  if (t >= 22) {
    k.add("tshirt").add("shorts").add("schuhe");
    tipps.push("Schön warm – T-Shirt und kurze Hosen reichen.");
  } else if (t >= 15) {
    k.add("tshirt").add("hose").add("schuhe");
    tipps.push("Angenehm – T-Shirt und lange Hosen.");
  } else if (t >= 8) {
    k.add("pulli").add("hose").add("schuhe");
    tipps.push("Etwas frisch – nimm einen Pullover.");
  } else {
    k.add("pulli").add("jacke").add("hose").add("schuhe");
    tipps.push("Kalt – Winterjacke anziehen!");
    if (t < 3) { k.add("muetze").add("schal"); }
    if (t < 0) { k.add("handschuhe"); tipps.push("Unter 0 °C: Handschuhe nicht vergessen."); }
  }

  // 2) Schnee
  if (istSchnee(w.code)) {
    k.delete("tshirt"); k.delete("shorts"); k.delete("schuhe");
    k.add("pulli").add("jacke").add("hose").add("muetze").add("schal").add("handschuhe").add("stiefel");
    tipps.push("Es schneit ❄️ – Mütze, Handschuhe und Stiefel!");
  }

  // 3) Regen
  if (istRegen(w.code)) {
    k.delete("jacke");            // Regenjacke kommt drüber
    k.add("regenjacke");
    if (w.wind < 30) {
      k.add("schirm");
      tipps.push("Es regnet – Regenjacke und Schirm mitnehmen ☔");
    } else {
      k.add("kapuze");
      tipps.push("Regen und viel Wind – Schirm bleibt zu Hause, Kapuze auf!");
    }
    if (k.has("muetze")) k.delete("kapuze");
  }

  // 4) Sonne
  if (istSonnig(w.code) && w.istTag && t >= 18) {
    k.add("brille");
    if (t >= 24) { k.add("cap"); tipps.push("Sonnencreme nicht vergessen! 🧴"); }
  }

  // 5) Wind
  if (w.wind >= 40 && !istRegen(w.code)) {
    tipps.push("Es ist sehr windig – lieber eine Jacke mehr. 💨");
  }

  if (istGewitter(w.code)) tipps.push("⚡ Gewitter – wenn möglich drinnen bleiben.");

  return { kleider: k, tipp: tipps.join(" ") };
}

// Namen + Emojis der Kleider (für "Morgen früh" und die 5-Tage-Liste)
const KLEIDER_NAMEN = {
  tshirt: "T-Shirt", shorts: "kurze Hose", hose: "lange Hose", pulli: "Pullover",
  jacke: "Winterjacke", regenjacke: "Regenjacke", schirm: "Schirm", kapuze: "Kapuze",
  muetze: "Mütze", schal: "Schal", handschuhe: "Handschuhe", stiefel: "Stiefel",
  schuhe: "Schuhe", brille: "Sonnenbrille", cap: "Cap",
};
const KLEIDER_EMOJI = {
  tshirt: "👕", shorts: "🩳", pulli: "🧶", jacke: "🧥", regenjacke: "🧥",
  schirm: "☂️", schal: "🧣", handschuhe: "🧤", stiefel: "🥾", brille: "🕶️", cap: "🧢",
};

// =====================================================
//  PERSONALISIERUNG
//  Hier kannst du neue Farben oder Frisuren hinzufügen.
// =====================================================
const OPTIONEN = [
  { schluessel: "haut",   titel: "Hautfarbe",  typ: "farbe",
    werte: ["#ffe3c9", "#f5c9a0", "#e3ab7a", "#c68650", "#8d5a34", "#5c3a21"] },
  { schluessel: "frisur", titel: "Frisur",     typ: "text",
    werte: [["kurz", "Kurz"], ["igel", "Igel"], ["locken", "Locken"], ["lang", "Lang"], ["zopf", "Zopf"], ["glatze", "Glatze"]] },
  { schluessel: "haar",   titel: "Haarfarbe",  typ: "farbe",
    werte: ["#2b1d14", "#6b4226", "#a0522d", "#d9a441", "#f0d58c", "#9a9a9a", "#e05a9a", "#3e7bd6"] },
  { schluessel: "auge",   titel: "Augenfarbe", typ: "farbe",
    werte: ["#6b3e1f", "#3a7bd5", "#3e9b5a", "#7d8b99", "#9b6bd1"] },
  { schluessel: "farbe",  titel: "Lieblingsfarbe (T-Shirt & Pulli)", typ: "farbe",
    werte: ["#e85d5d", "#8a6bbf", "#3aa17e", "#f08a24", "#2b7bd6", "#e86fae", "#444444"] },
  { schluessel: "extras", titel: "Extras",     typ: "mehrfach",
    werte: [["brille", "👓 Brille"], ["bart", "🧔 Bart"], ["sommersprossen", "✨ Sommersprossen"]] },
];

const STANDARD_AUSSEHEN = {
  name: "", haut: "#f5c9a0", frisur: "kurz", haar: "#6b4226",
  auge: "#6b3e1f", farbe: "#e85d5d", extras: [],
};

// Gespeichertes Aussehen laden (oder Standard nehmen)
let aussehen = { ...STANDARD_AUSSEHEN, ...JSON.parse(localStorage.getItem("aussehen") || "{}") };

// Farbe dunkler machen (für Schatten, Nähte, Augenbrauen)
function dunkler(hex, faktor = 0.78) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * faktor);
  const g = Math.round(((n >> 8) & 255) * faktor);
  const b = Math.round((n & 255) * faktor);
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

function aussehenAnwenden() {
  const svg = document.getElementById("maennli");
  svg.style.setProperty("--haut", aussehen.haut);
  svg.style.setProperty("--haut-dunkel", dunkler(aussehen.haut));
  svg.style.setProperty("--haar", aussehen.haar);
  svg.style.setProperty("--haar-dunkel", dunkler(aussehen.haar, 0.7));
  svg.style.setProperty("--auge", aussehen.auge);
  svg.style.setProperty("--farbe", aussehen.farbe);
  svg.style.setProperty("--farbe-dunkel", dunkler(aussehen.farbe));

  // Frisur: vordere Haare + evtl. hintere Haare (lang, zopf)
  document.querySelectorAll(".frisur").forEach((el) => {
    const id = el.id.replace("h-", "");
    el.classList.toggle("an", id === aussehen.frisur || id === aussehen.frisur + "-hinten");
  });
  // Extras (Brille, Bart, Sommersprossen)
  document.querySelectorAll(".extra").forEach((el) => {
    el.classList.toggle("an", aussehen.extras.includes(el.id.replace("e-", "")));
  });
  brilleKorrigieren();
}

// Normale Brille ausblenden, wenn die Sonnenbrille an ist
function brilleKorrigieren() {
  const sonnenbrilleAn = document.getElementById("k-brille").classList.contains("an");
  document.getElementById("e-brille").classList.toggle("an", aussehen.extras.includes("brille") && !sonnenbrilleAn);
}

function speichereAussehen() {
  localStorage.setItem("aussehen", JSON.stringify(aussehen));
}

// ---------- Editor bauen ----------
function baueEditor() {
  const box = document.getElementById("editor-optionen");
  box.innerHTML = "";

  OPTIONEN.forEach((opt) => {
    const zeile = document.createElement("div");
    zeile.className = "zeile";
    zeile.innerHTML = `<span class="titel">${opt.titel}</span>`;
    const auswahl = document.createElement("div");
    auswahl.className = "auswahl";

    opt.werte.forEach((wert) => {
      const knopf = document.createElement("button");
      knopf.type = "button";

      if (opt.typ === "farbe") {
        knopf.className = "farbpunkt";
        knopf.style.background = wert;
        knopf.setAttribute("aria-label", opt.titel + " " + wert);
        knopf.classList.toggle("gewaehlt", aussehen[opt.schluessel] === wert);
        knopf.onclick = () => { aussehen[opt.schluessel] = wert; aenderung(); };
      } else {
        const [id, text] = wert;
        knopf.className = "chip";
        knopf.textContent = text;
        const gewaehlt = opt.typ === "mehrfach" ? aussehen.extras.includes(id) : aussehen[opt.schluessel] === id;
        knopf.classList.toggle("gewaehlt", gewaehlt);
        knopf.onclick = () => {
          if (opt.typ === "mehrfach") {
            aussehen.extras = aussehen.extras.includes(id)
              ? aussehen.extras.filter((e) => e !== id)
              : [...aussehen.extras, id];
          } else {
            aussehen[opt.schluessel] = id;
          }
          aenderung();
        };
      }
      auswahl.appendChild(knopf);
    });

    zeile.appendChild(auswahl);
    box.appendChild(zeile);
  });
}

function aenderung() {
  aussehenAnwenden();
  speichereAussehen();
  baueEditor();           // Markierungen aktualisieren
}

function zufaellig() {
  const zufall = (liste) => liste[Math.floor(Math.random() * liste.length)];
  OPTIONEN.forEach((opt) => {
    if (opt.typ === "farbe") aussehen[opt.schluessel] = zufall(opt.werte);
    if (opt.typ === "text") aussehen[opt.schluessel] = zufall(opt.werte)[0];
    if (opt.typ === "mehrfach") aussehen.extras = opt.werte.map((w) => w[0]).filter(() => Math.random() < 0.3);
  });
  aenderung();
}

function editorOeffnen() {
  document.body.classList.add("bearbeiten");
  document.getElementById("editor").hidden = false;
  document.getElementById("name-feld").value = aussehen.name;
  // Im Editor trägt das Männli Basiskleidung, damit man die Haare sieht
  maennliAnziehen(new Set(["tshirt", "hose", "schuhe"]), { code: 0, gefuehlt: 20 });
  baueEditor();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function editorSchliessen() {
  aussehen.name = document.getElementById("name-feld").value.trim();
  speichereAussehen();
  document.body.classList.remove("bearbeiten");
  document.getElementById("editor").hidden = true;
  if (letzteDaten) zeigeWetter(letzteDaten, letzterOrt);
}

// ---------- Männli anziehen ----------
function maennliAnziehen(kleider, w) {
  document.querySelectorAll(".kleid").forEach((el) => {
    const name = el.id.replace("k-", "");
    el.classList.toggle("an", kleider.has(name));
  });
  brilleKorrigieren();

  // Gesicht: lacht bei schönem Wetter, sonst eher neutral
  const mund = document.getElementById("mund");
  const gutesWetter = !istRegen(w.code) && !istSchnee(w.code) && w.gefuehlt > 5;
  mund.setAttribute("d", gutesWetter ? "M90 84 Q100 92 110 84" : "M91 87 Q100 83 109 87");
}

// ---------- Hintergrund + Effekte ----------
function setzeHintergrund(w) {
  let klasse = "wetter-wolken";
  if (istSonnig(w.code)) klasse = "wetter-sonne";
  if (istNebel(w.code)) klasse = "wetter-nebel";
  if (istRegen(w.code)) klasse = "wetter-regen";
  if (istGewitter(w.code)) klasse = "wetter-gewitter";
  if (istSchnee(w.code)) klasse = "wetter-schnee";
  const bearbeiten = document.body.classList.contains("bearbeiten");
  document.body.className = klasse + (w.istTag ? "" : " nacht") + (bearbeiten ? " bearbeiten" : "");

  const box = document.getElementById("effekte");
  box.innerHTML = "";
  let art = null;
  if (istRegen(w.code)) art = "tropfen";
  if (istSchnee(w.code)) art = "flocke";
  if (!art) return;

  const anzahl = art === "tropfen" ? 60 : 40;
  for (let i = 0; i < anzahl; i++) {
    const el = document.createElement("span");
    el.className = art;
    el.style.left = Math.random() * 100 + "vw";
    const dauer = art === "tropfen" ? 0.6 + Math.random() * 0.6 : 4 + Math.random() * 5;
    el.style.animationDuration = dauer + "s";
    el.style.animationDelay = -Math.random() * dauer + "s";
    box.appendChild(el);
  }
}

// ---------- Daten holen ----------
async function holeWetter(lat, lon) {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${lat}&longitude=${lon}` +
    "&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation,is_day" +
    "&hourly=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation_probability,is_day" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min," +
    "precipitation_probability_max,wind_speed_10m_max" +
    "&timezone=auto&forecast_days=6";
  const antwort = await fetch(url);
  if (!antwort.ok) throw new Error("Wetter konnte nicht geladen werden");
  return antwort.json();
}

async function sucheOrt(name) {
  const url = "https://geocoding-api.open-meteo.com/v1/search?count=1&language=de&name=" + encodeURIComponent(name);
  const antwort = await fetch(url);
  const daten = await antwort.json();
  if (!daten.results || daten.results.length === 0) throw new Error("Ort nicht gefunden");
  const r = daten.results[0];
  return { name: r.name, lat: r.latitude, lon: r.longitude };
}

// ---------- Anzeige ----------
let letzteDaten = null;
let letzterOrt = null;

function zeigeWetter(daten, ort) {
  letzteDaten = daten;
  letzterOrt = ort;
  const c = daten.current;
  const w = {
    temp: c.temperature_2m,
    gefuehlt: c.apparent_temperature,
    code: c.weather_code,
    wind: c.wind_speed_10m,
    istTag: c.is_day === 1,
  };

  document.getElementById("ort").textContent = ort.name;
  document.getElementById("vorschau-banner").hidden = true;
  zeigeMaennli(w);

  zeigeStunden(daten);
  zeigeMorgen(daten);
  zeigeTage(daten);

  const zeit = new Date().toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" });
  document.getElementById("stand").textContent = "Stand: " + zeit + (navigator.onLine ? "" : " (offline)");
}

// Männli, Temperatur und Tipp für ein bestimmtes Wetter anzeigen
function zeigeMaennli(w, tempText) {
  document.getElementById("temp").textContent = tempText || Math.round(w.temp) + "°";
  document.getElementById("beschreibung").textContent = codeEmoji(w.code) + " " + codeText(w.code);
  document.getElementById("details").textContent =
    `Gefühlt ${Math.round(w.gefuehlt)}° · Wind ${Math.round(w.wind)} km/h`;

  const { kleider, tipp } = waehleKleidung(w);
  maennliAnziehen(kleider, w);
  document.getElementById("tipp").textContent = (aussehen.name ? aussehen.name + " sagt: " : "") + tipp;
  setzeHintergrund(w);
}

function zeigeStunden(daten) {
  const h = daten.hourly;
  const jetzt = daten.current.time.slice(0, 13); // z.B. "2026-11-05T15"
  let start = h.time.findIndex((t) => t.startsWith(jetzt));
  if (start < 0) start = 0;

  const box = document.getElementById("stunden");
  box.innerHTML = "";
  for (let i = start; i < Math.min(start + 12, h.time.length); i++) {
    const div = document.createElement("div");
    div.className = "stunde";
    div.innerHTML = `
      <div class="zeit">${i === start ? "Jetzt" : h.time[i].slice(11, 16)}</div>
      <div class="icon">${codeEmoji(h.weather_code[i])}</div>
      <div class="grad">${Math.round(h.temperature_2m[i])}°</div>`;
    box.appendChild(div);
  }
}

function zeigeMorgen(daten) {
  const h = daten.hourly;
  const i = h.time.findIndex((t, idx) => idx >= 24 && t.endsWith("T07:00"));
  const el = document.getElementById("morgen");
  if (i < 0) { el.textContent = "–"; return; }

  const w = {
    temp: h.temperature_2m[i],
    gefuehlt: h.apparent_temperature[i],
    code: h.weather_code[i],
    wind: h.wind_speed_10m[i],
    istTag: h.is_day[i] === 1,
  };
  const { kleider } = waehleKleidung(w);
  const liste = [...kleider].filter((k) => k !== "schuhe").map((k) => KLEIDER_NAMEN[k]);
  el.textContent =
    `${codeEmoji(w.code)} ${Math.round(w.temp)}°, ${codeText(w.code)} – ` +
    `zieh an: ${liste.join(", ")}.`;
}

// ---------- 5-Tage-Vorhersage ----------
const WOCHENTAGE = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const WOCHENTAGE_LANG = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

// Wetter eines Tages so umrechnen, dass waehleKleidung() es versteht.
// Als "gefühlte Temperatur" nehmen wir den Mittelwert aus Tiefst- und Höchstwert.
function tagesWetter(d, i) {
  return {
    temp: d.temperature_2m_max[i],
    gefuehlt: (d.apparent_temperature_max[i] + d.apparent_temperature_min[i]) / 2,
    code: d.weather_code[i],
    wind: d.wind_speed_10m_max[i],
    istTag: true,
  };
}

function zeigeTage(daten) {
  const d = daten.daily;
  const box = document.getElementById("tage");
  box.innerHTML = "";

  // Tag 0 = heute, also nehmen wir Tag 1 bis 5
  const tage = [1, 2, 3, 4, 5].filter((i) => i < d.time.length);
  const alleMin = Math.min(...tage.map((i) => d.temperature_2m_min[i]));
  const alleMax = Math.max(...tage.map((i) => d.temperature_2m_max[i]));
  const spanne = Math.max(alleMax - alleMin, 1);

  tage.forEach((i) => {
    const datum = new Date(d.time[i] + "T12:00");
    const name = i === 1 ? "Morgen" : WOCHENTAGE[datum.getDay()];
    const min = d.temperature_2m_min[i];
    const max = d.temperature_2m_max[i];
    const regen = d.precipitation_probability_max[i];
    const { kleider } = waehleKleidung(tagesWetter(d, i));
    const emojis = [...new Set([...kleider].map((k) => KLEIDER_EMOJI[k]).filter(Boolean))].join("");

    const links = ((min - alleMin) / spanne) * 100;
    const breite = ((max - min) / spanne) * 100;

    const knopf = document.createElement("button");
    knopf.type = "button";
    knopf.className = "tag";
    knopf.innerHTML = `
      <span class="name">${name}<span class="regen">💧 ${regen ?? 0}%</span></span>
      <span class="icon">${codeEmoji(d.weather_code[i])}</span>
      <span>
        <span class="balken-zeile">
          <span class="min">${Math.round(min)}°</span>
          <span class="balken"><span style="left:${links}%;width:${Math.max(breite, 4)}%"></span></span>
          <span class="max">${Math.round(max)}°</span>
        </span>
      </span>
      <span class="kleider" title="Kleidung">${emojis}</span>`;
    knopf.onclick = () => zeigeTagVorschau(d, i, knopf);
    box.appendChild(knopf);
  });
}

// Tippt man auf einen Tag, zieht sich das Männli für diesen Tag an
function zeigeTagVorschau(d, i, knopf) {
  const datum = new Date(d.time[i] + "T12:00");
  const w = tagesWetter(d, i);
  zeigeMaennli(w, `${Math.round(d.temperature_2m_min[i])}° / ${Math.round(d.temperature_2m_max[i])}°`);

  document.querySelectorAll(".tag").forEach((t) => t.classList.remove("aktiv"));
  knopf.classList.add("aktiv");
  document.getElementById("vorschau-text").textContent =
    "Vorschau: " + (i === 1 ? "Morgen" : WOCHENTAGE_LANG[datum.getDay()]);
  document.getElementById("vorschau-banner").hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.getElementById("vorschau-zurueck").addEventListener("click", () => {
  if (letzteDaten) zeigeWetter(letzteDaten, letzterOrt);
});

// ---------- Ablauf ----------
async function lade(ort) {
  try {
    const daten = await holeWetter(ort.lat, ort.lon);
    localStorage.setItem("letzterOrt", JSON.stringify(ort));
    localStorage.setItem("letzteDaten", JSON.stringify(daten));
    zeigeWetter(daten, ort);
  } catch (fehler) {
    // Offline? Dann die letzten gespeicherten Daten zeigen
    const alt = localStorage.getItem("letzteDaten");
    if (alt) {
      zeigeWetter(JSON.parse(alt), JSON.parse(localStorage.getItem("letzterOrt")));
      document.getElementById("stand").textContent += " – keine Verbindung, alte Daten";
    } else {
      document.getElementById("beschreibung").textContent = "⚠️ " + fehler.message;
    }
  }
}

function ladeMitGPS() {
  if (!navigator.geolocation) return lade(STANDARD_ORT);
  navigator.geolocation.getCurrentPosition(
    (pos) => lade({ name: "Mein Standort", lat: pos.coords.latitude, lon: pos.coords.longitude }),
    () => lade(STANDARD_ORT),
    { timeout: 8000 }
  );
}

document.getElementById("suche").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("suchfeld").value.trim();
  if (!name) return;
  try {
    lade(await sucheOrt(name));
    document.getElementById("suchfeld").value = "";
    document.getElementById("suchfeld").blur();
  } catch (fehler) {
    alert(fehler.message);
  }
});

document.getElementById("gps").addEventListener("click", ladeMitGPS);
document.getElementById("anpassen-knopf").addEventListener("click", editorOeffnen);
document.getElementById("fertig-knopf").addEventListener("click", editorSchliessen);
document.getElementById("zufall-knopf").addEventListener("click", zufaellig);

// Start: Aussehen anwenden, dann Wetter laden (letzter Ort oder GPS)
aussehenAnwenden();
const gespeichert = localStorage.getItem("letzterOrt");
if (gespeichert) lade(JSON.parse(gespeichert));
else ladeMitGPS();

// Service Worker registrieren (macht die App installierbar + offline-fähig)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js"));
}
