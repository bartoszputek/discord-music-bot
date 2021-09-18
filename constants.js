export const PREFIX = '!';
export const CHANNEL_NAME = 'test';
export const COMMANDS = {
  play: ['p', 'play'],
  disconnect: ['d', 'dis'],
  skip: ['s', 'skip'],
};

export const LANGUAGES = {
  pl: {
    joinToVoicechat: 'Dołącz na kanał głosowy!',
    incorrectLink: 'Link nie jest poprawny!',
    queueIsEmpty: 'Kolejka jest pusta!',
    songAddedToQueue: 'Dodano do kolejki - {{link}}',
    songRemovedFromQueue: 'Pomyślnie usunięto - {{link}}',
  },
  eng: {
    joinToVoicechat: 'Join to a voice channel!',
    incorrectLink: 'Link is incorrect!',
    queueIsEmpty: 'Queue is empty!',
    songAddedToQueue: 'Added to queue - {{link}}',
    songRemovedFromQueue: 'Successfully removed from queue - {{link}}',
  }
}
