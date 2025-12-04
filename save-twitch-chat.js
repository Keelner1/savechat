const fs = require("fs");
const fetch = require("node-fetch");

async function run() {
  const channel = "keelner2"; // <-- Twój kanał
  const url = `https://recent-messages.robotty.de/api/v2/recent-messages/${channel}`;

  const response = await fetch(url, {
    headers: { "User-Agent": "savechat-github-action" }
  });

  const data = await response.json();

  console.log("messages length:", Array.isArray(data.messages) ? data.messages.length : "brak");

  if (!Array.isArray(data.messages)) {
    console.log("Brak poprawnego data.messages – nic nie zapisuję.");
    return;
  }

  // 1. parsowanie jednej linii IRC -> { nick, text, time }
  function parseLine(raw) {
    if (typeof raw !== "string") return null;

    // timestamp z taga tmi-sent-ts=...
    let time = null;
    const tsMatch = raw.match(/tmi-sent-ts=(\d+)/);
    if (tsMatch) {
      const ms = Number(tsMatch[1]);      // ms od epoki
      time = new Date(ms).toISOString(); // prawdziwy czas wysłania
    } else {
      time = new Date().toISOString();   // awaryjnie: czas zapisu
    }

    // nick + tekst wiadomości
    const m = raw.match(/:([^!]+)!.* PRIVMSG #[^ ]+ :(.*)$/);
    if (!m) return null;

    return {
      nick: m[1],
      text: m[2],
      time: time
    };
  }

  const cleaned = data.messages
    .map(parseLine)     // data.messages to tablica STRINGÓW
    .filter(x => x !== null);

  console.log(`Nowe wiadomości w tym runie: ${cleaned.length}`);

  // 2. wczytaj dotychczasowy plik (jeśli istnieje) – żeby dopisywać historię
  let previous = [];
  try {
    const raw = fs.readFileSync("chat_log.json", "utf8");
    previous = JSON.parse(raw);
    if (!Array.isArray(previous)) previous = [];
  } catch (e) {
    previous = [];
  }

  // 3. połącz stare + nowe
  const merged = [...previous, ...cleaned];

  fs.writeFileSync("chat_log.json", JSON.stringify(merged, null, 2));
  console.log(`Łącznie zapisano ${merged.length} wiadomości do chat_log.json`);
}

run().catch(err => {
  console.error("Błąd skryptu:", err);
  process.exit(1);
});
