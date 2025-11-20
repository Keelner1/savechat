const fs = require('fs');
const fetch = require('node-fetch');

async function run() {
  const channel = "Nimuena_"; // podaj swój kanał Twitch
  const url = `https://recent-messages.robotty.de/api/v2/recent-messages/${channel}`;
  const response = await fetch(url);
  const data = await response.json();

  // Wyciągnij nick, tekst, timestamp dla czytelności
  const messages = data.messages
  .filter(msg => typeof msg.message === 'string') // filtrujemy tylko poprawne
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


  // Zapisz do pliku w repozytorium
  fs.writeFileSync('chat_log.json', JSON.stringify(messages, null, 2));
}

run();


