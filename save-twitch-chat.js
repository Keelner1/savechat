const fs = require('fs');
const fetch = require('node-fetch');

async function run() {
  const channel = "keelner2";
  const url = `https://recent-messages.robotty.de/api/v2/recent-messages/${channel}`;

  const response = await fetch(url);
  const data = await response.json();

  // 1. Wypisz całą odpowiedź w logach GitHub Actions
  console.log("API response:");
  console.log(JSON.stringify(data, null, 2));

  // 2. Jeśli nie ma poprawnej tablicy messages – kończymy
  if (!Array.isArray(data.messages)) {
    console.log("Brak pola messages albo zły format, nic nie zapisuję.");
    return;
  }

  const messages = data.messages
    .filter(msg => typeof msg.message === "string")
    .map(msg => {
      const match = msg.message.match(/^:([^!]+)!.* PRIVMSG #[^ ]+ :(.*)$/);
      return {
        id: msg.id,
        nick: match ? match[1] : "",
        text: match ? match[2] : "",
        raw: msg.message,
        timestamp: new Date().toISOString()
      };
    });

  fs.writeFileSync("chat_log.json", JSON.stringify(messages, null, 2));
}

run();
