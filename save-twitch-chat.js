const fs = require("fs");
const fetch = require("node-fetch");

async function run() {
  const channel = "keelner2";
  const url = `https://recent-messages.robotty.de/api/v2/recent-messages/${channel}`;

  const response = await fetch(url);
  const data = await response.json();

  console.log("API response:");
  console.log(JSON.stringify(data, null, 2));

  if (!Array.isArray(data.messages)) {
    console.log("Brak poprawnego pola messages");
    return;
  }

  // ZAPISZ SUROWE WIADOMOŚCI BEZ FILTROWANIA
  fs.writeFileSync("chat_log.json", JSON.stringify(data.messages, null, 2));
}

run();
