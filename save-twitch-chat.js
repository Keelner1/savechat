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

  // helper: formatowanie daty do "YYYY-MM-DD HH:mm:ss" w strefie UTC+1
  function formatLocalPlus1(ms) {
    const date = new Date(ms + 60 * 60 * 1000); // +1 godzina
    const pad = n => String(n).padStart(2, "0");

    const year = date.getUTCFullYear();
    const month = pad(date.getUTCMonth() + 1);
    const day = pad(date.getUTCDate());
    const hour = pad(date.getUTCHours());
    const minute = pad(date.getUTCMinutes());
    const second = pad(date.getUTCSeconds());

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }

  // parsowanie jednej linii IRC -> { nick, text, time }
  function parseLine(raw) {
    if (typeof raw !== "string") return null;

    // timestamp z taga tmi-sent-ts=...
    let timeFormatted = null;
    const tsMatch = raw.match(/tmi-sent-ts=(\d+)/);
    if (tsMatch) {
      const ms = Number(tsMatch[1]);       // ms od epoki (UTC)
      timeFormatted = formatLocalPlus1(ms);
    } else {
      timeFormatted = formatLocalPlus1(Date.now());
    }

    // nick + tekst
    const m = raw.match(/:([^!]+)!.* PRIVMSG #[^ ]+ :(.*)$/);
    if (!m) return null;

    return {
      nick: m[1],
      text: m[2],
      time: timeFormatted   // np. "2025-12-04 20:15:32"
    };
  }

  const cleaned = data.messages
    .map(parseLine)
    .filter(x => x !== null);

  console.log(`Nowe wiadomości w tym runie: ${cleaned.length}`);

  // wczytaj dotychczasowy plik, żeby dopisywać
  let previous = [];
  try {
    const raw = fs.readFileSync("chat_log.json", "utf8");
    previous = JSON.parse(raw);
    if (!Array.isArray(previous)) previous = [];
  } catch (e) {
    previous = [];
  }

  const merged = [...previous, ...cleaned];

  fs.writeFileSync("chat_log.json", JSON.stringify(merged, null, 2));
  console.log(`Łącznie zapisano ${merged.length} wiadomości do chat_log.json`);
}

run().catch(err => {
  console.error("Błąd skryptu:", err);
  process.exit(1);
});
