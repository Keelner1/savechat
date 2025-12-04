const fs = require("fs");
const fetch = require("node-fetch");

async function run() {
  const channel = "keelner2"; // <- tu Twój kanał
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

  // funkcja: jeden surowy string IRC -> { nick, text }
  function parseLine(raw) {
    if (typeof raw !== "string") return null;
    const m = raw.match(/:([^!]+)!.* PRIVMSG #[^ ]+ :(.*)$/);
    if (!m) return null;
    return {
      nick: m[1],
      text: m[2]
    };
  }

  // TU jest najważniejsza zmiana: parsujemy bezpośrednio data.messages (stringi),
  // NIE m.message
  const cleaned = data.messages
    .map(parseLine)
    .filter(x => x !== null);

  fs.writeFileSync("chat_log.json", JSON.stringify(cleaned, null, 2));
  console.log(`Zapisano ${cleaned.length} wiadomości do chat_log.json`);
}

run().catch(err => {
  console.error("Błąd skryptu:", err);
  process.exit(1);
});
