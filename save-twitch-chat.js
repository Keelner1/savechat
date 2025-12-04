const fs = require("fs");
const fetch = require("node-fetch");

async function run() {
  const channel = "keelner2"; // <-- tu możesz zmienić na swój kanał
  const url = `https://recent-messages.robotty.de/api/v2/recent-messages/${channel}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "savechat-github-action"
    }
  });

  const data = await response.json();

  console.log("API response (skrócone):");
  console.log(`messages: ${Array.isArray(data.messages) ? data.messages.length : "brak"}`);

  if (!Array.isArray(data.messages)) {
    console.log("Brak pola messages albo zły format, nic nie zapisuję.");
    return;
  }

  // parsowanie pojedynczej linii IRC -> { nick, text }
  function parseLine(raw) {
    if (typeof raw !== "string") return null;
    const m = raw.match(/:([^!]+)!.* PRIVMSG #[^ ]+ :(.*)$/);
    if (!m) return null;
    return {
      nick: m[1],
      text: m[2]
    };
  }

  const cleaned = data.messages
    .map(m => parseLine(m.message)) // m.message to ten długi string z Twojego przykładu
    .filter(x => x !== null);

  // zapis do pliku
  fs.writeFileSync("chat_log.json", JSON.stringify(cleaned, null, 2));

  console.log(`Zapisano ${cleaned.length} wiadomości do chat_log.json`);
}

run().catch(err => {
  console.error("Błąd skryptu:", err);
  process.exit(1);
});
