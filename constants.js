export const COMMANDS = {
  play: ['p', 'play'],
  disconnect: ['d', 'dis'],
  skip: ['s', 'skip'],
  queue: ['q', 'queue'],
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
    songSkipped: '**Pomyślnie pominięto** ⏭️',
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
    songSkipped: '**Successfully skipped** ⏭️',
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
    \`!b/!bind [name]\`
    \`!bl/!binds/!bindlist\`    
    \`!h/!help \``,
  },
};
