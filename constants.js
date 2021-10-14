export const MIN_BANDWIDTH = 100000;
export const HIGH_WATER_MARK = 2 ** 27;
export const DISCONNECT_TIME = 10 * 60 * 1000;

export const COMMANDS = {
  play: ['p', 'play'],
  disconnect: ['d', 'dis'],
  skip: ['s', 'skip'],
  queue: ['q', 'queue'],
  clear: ['c', 'clear'],
  bind: ['b', 'bind'],
  bindList: ['bl', 'binds', 'bindlist'],
  help: ['h', 'help'],
};

export const LANGUAGES = {
  pl: {
    joinToVoicechat: '**Dołącz na kanał głosowy!** 🎤',
    disconnectedFromVoicechat: '**Rozłączono z kanału głosowego 📭**',
    incorrectLink: '**Link nie jest poprawny!** ❌',
    unavailableLink: '**Link jest niedostępny (prywatny/+18 etc.)** ❌',
    queueIsEmpty: '**Kolejka jest pusta!** ⌛',
    songAddedToQueue: '**Dodano do kolejki** 🎶 `{{title}}` 🔊',
    playlistAddedToQueue: '**Dodano playlistę do kolejki** 🎶 `{{title}}` 🔊',
    skipQueue: '**Pomyślnie cała kolejka została pominięta** ⏭️',
    songSkipped: '**Pomyślnie pominięto** ⏭️',
    skipUnavailable: '**Nie ma nic do pominięcia! ❌**',
    songSearch: '🔎 **Wyszukiwanie** 🎵 - `{{keywords}}`',
    printQueue: '🎵 **Obecnie w kolejce** 🎶 {{titles}}',
    bindAddedToQueue: '**Dodano bind do kolejki** 🎶 `{{filename}}` 🔊',
    bindNotFound: '**Bind nieznaleziony!** ❌ `{{filename}}`',
    printBinds: '🎵 **Lista bindów** 🎶 {{binds}}',
    help: `📔 **Dostępne komendy**
    \`!p/!play [link/keywords]\`
    \`!d/!dis \`
    \`!s/!skip \`
    \`!q/!queue \`
    \`!c/!clear \`
    \`!b/!bind [name]\`
    \`!bl/!binds/!bindlist\`   
    \`!h/!help \``,
  },
  eng: {
    joinToVoicechat: '**Join to a voice channel!** 🎤',
    disconnectedFromVoicechat: '**Disconnected from a voice chat** 📭',
    incorrectLink: '**Link is incorrect!** ❌',
    unavailableLink: '**Link is unavailable (private/+18 etc.)** ❌',
    queueIsEmpty: '**Queue is empty!** ⌛',
    songAddedToQueue: '**Added to queue** 🎶 `{{title}}` 🔊',
    playlistAddedToQueue: '**Added playlist to queue** 🎶 `{{title}}` 🔊',
    skipQueue: '**Successfully queue has been skipped** ⏭️',
    songSkipped: '**Successfully skipped** ⏭️',
    skipUnavailable: '**There is nothing to skip ❌**',
    songSearch: '🔎 **Searching** 🎵 - `{{keywords}}`',
    printQueue: '🎵 **Currently in queue** 🎶 {{titles}}',
    bindAddedToQueue: '**Added bind to queue** 🎶 `{{filename}}` 🔊',
    bindNotFound: '**Bind not found! ❌**',
    printBinds: '🎵 **Binds list** 🎶 {{binds}}',
    help: `📔 **Available commands**
    \`!p/!play [link/keywords]\`
    \`!d/!dis \`
    \`!s/!skip \`
    \`!q/!queue \`
    \`!c/!clear \`    
    \`!b/!bind [name]\`
    \`!bl/!binds/!bindlist\`    
    \`!h/!help \``,
  },
};
