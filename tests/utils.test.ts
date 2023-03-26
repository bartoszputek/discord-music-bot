import test from 'ava';
import { getTitles, ISong } from '@src/utils';

test('getTitles(): should return a message with title and length of the song', (t) => {
  const songs: ISong[] = [
    _createSong({ title: 'My Title', length: '3:20' }),
  ];

  const messages: string[] = getTitles(songs);

  t.is(messages.length, 1);
  t.assert(messages[0].includes('My Title'));
  t.assert(messages[0].includes('3:20'));
});

test('getTitles(): should split too long songs to two messages', (t) => {
  const songs: ISong[] = [
    _createSong({ title: 'a'.repeat(1500) }),
    _createSong({ title: 'a'.repeat(1500) }),

  ];

  const messages: string[] = getTitles(songs);

  t.is(messages.length, 2);
});

function _createSong(song: Partial<ISong>): ISong {
  return {
    title: song.title ?? 'Title',
    link: song.link ?? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    length: song.length ?? '3:40',
    type: song.type ?? 'youtube',
  };
}
