const fs = require("fs");
const fetch = require("node-fetch");

async function run() {
  const channel = "keelner2"; // upewnij się, że to ten sam kanał co w przeglądarce
  const url = `https://recent-messages.robotty.de/api/v2/recent-messages/${channel}`;

  const response = await fetch(url, {
    headers: { "User-Agent": "savechat-github-action" }
  });

  const data = await response.json();

  console.log("PEŁNA odpowiedź z API:");
  console.log(JSON.stringify(data, null, 2));

  if (!Array.isArray(data.messages)) {
    console.log("Brak poprawnego data.messages – nic nie zapisuję.");
    return;
  }

  // UWAGA: na razie zapisujemy surowe data.messages BEZ parsowania
  fs.writeFileSync("chat_log.json", JSON.stringify(data.messages, null, 2));
  console.log(`Zapisano raw messages: ${data.messages.length}`);
}

run().catch(err => {
  console.error("Błąd skryptu:", err);
  process.exit(1);
});
