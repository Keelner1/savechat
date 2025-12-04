function parseLine(raw) {
  if (typeof raw !== "string") return null;

  // 1) wyciągamy timestamp z tmi-sent-ts
  let timeFormatted = null;
  const tsMatch = raw.match(/tmi-sent-ts=(\d+)/);
  if (tsMatch) {
    const ms = Number(tsMatch[1]);
    timeFormatted = formatLocalPlus1(ms);   // korzysta z Twojej funkcji formatLocalPlus1
  } else {
    timeFormatted = formatLocalPlus1(Date.now());
  }

  // 2) odcinamy początkowe tagi "@" aż do pierwszego " :"
  //    (czyli zostawiamy czyste "nick!nick@.. PRIVMSG #kanał :tekst")
  const idx = raw.indexOf(" :");
  const ircPart = idx >= 0 ? raw.slice(idx + 1) : raw;

  // 3) parsujemy nick + tekst z już oczyszczonej części
  const m = ircPart.match(/:([^!]+)!.* PRIVMSG #[^ ]+ :(.*)$/);
  if (!m) return null;

  return {
    nick: m[1],
    text: m[2],
    time: timeFormatted
  };
}
