import { Readable } from 'stream';

import test from 'ava';
import { getLink, getStream, getTitles, getVideosFromPlaylist, getYoutubeSong, ISong } from '@src/utils';

test('getYoutubeSong(): should return title, length and type for the youtube link', async (t) => {
  const link: string = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

  const song: ISong = await getYoutubeSong(link);

  t.deepEqual(song, {
    link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
    length: '3:33',
    type: 'youtube',
  });
});

test('getStream(): should return readable stream the youtube link', async (t) => {
  const link: string = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

  const stream: unknown = await getStream(link);

  t.assert(stream instanceof Readable);
});

test('getLink(): should return youtube link for the keywords', async (t) => {
  const keywords: string = 'Rick Astley Never Gonna Give You Up';

  const link: string | null = await getLink(keywords);

  t.is(link, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
});

test('getVideosFromPlaylist(): should return videos from the youtube playlist', async (t) => {
  const playlistLink: string = 'https://www.youtube.com/watch?v=etAIpkdhU9Q&list=PL8qme4y2QvF8hkucNTlM-sfePkSigFDD3';

  const songs: ISong[] = await getVideosFromPlaylist(playlistLink);

  t.plan(songs.length * 2 + 1);

  t.assert(songs.length > 2, `The length of the songs (${songs.length}) is lower than 2.`);

  for (const song of songs) {
    t.assert(song.link.includes('youtube.com'), `The song's link doesn't include youtube.com (${song.link})`);
    t.is(song.type, 'youtube');
  }
});

test('getTitles(): should return a message with title and length of the song', (t) => {
  const songs: ISong[] = [_createSong({ title: 'My Title', length: '3:20' })];

  const messages: string[] = getTitles(songs);

  t.is(messages.length, 1);
  t.assert(messages[0].includes('My Title'));
  t.assert(messages[0].includes('3:20'));
});

test('getTitles(): should split too long songs to two messages', (t) => {
  const songs: ISong[] = [_createSong({ title: 'a'.repeat(1500) }), _createSong({ title: 'a'.repeat(1500) })];

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
