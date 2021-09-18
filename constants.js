export const PREFIX = '!';
export const CHANNEL_NAME = 'test';
export const COMMANDS = {
  play: ['p', 'play'],
  disconnect: ['d', 'dis'],
  skip: ['s', 'skip'],
  queue: ['q', 'queue'],
};

export const LANGUAGES = {
  pl: {
    joinToVoicechat: '**Dołącz na kanał głosowy!** 🎤',
    incorrectLink: '**Link nie jest poprawny!** ❌',
    unavailableLink: '**Link jest niedostępny (prywatny/+18 etc.)** ❌',
    queueIsEmpty: '**Kolejka jest pusta!** ⌛',
    songAddedToQueue: '**Dodano do kolejki** 🎶 `{{title}}` 🔊',
    songRemovedFromQueue: '**Pomyślnie usunięto** ❌ `{{title}}`',
    songSearch: '🔎 **Wyszukiwanie** 🎵 - `{{keywords}}`',
    printQueue: '🎵 **Obecnie w kolejce** 🎶 {{titles}}',
  },
  eng: {
    joinToVoicechat: '**Join to a voice channel!** 🎤',
    incorrectLink: '**Link is incorrect!** ❌',
    unavailableLink: '**Link is unavailable (private/+18 etc.)** ❌',
    queueIsEmpty: '**Queue is empty!** ⌛',
    songAddedToQueue: '**Added to queue** 🎶 `{{title}}` 🔊',
    songRemovedFromQueue: '**Successfully removed from queue** ❌ `{{title}}`',
    songSearch: '🔎 **Searching** 🎵 - `{{keywords}}`',
  },
};
