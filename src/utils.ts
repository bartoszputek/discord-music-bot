import fs from 'fs/promises';
import { Readable } from 'stream';

import ytdl from 'ytdl-core';
import ytsr from 'ytsr';
import ytpl from 'ytpl';

import { HIGH_WATER_MARK } from './constants';
import logger from './logger';

export interface ISong {
  title: string;
  link: string;
  length: string;
  type: 'bind' | 'youtube';
}

export async function getYoutubeSong(link: string): Promise<ISong> {
  const info = await ytdl.getBasicInfo(link);
  const { title, lengthSeconds } = info.videoDetails;
  return {
    link,
    title,
    length: _formatLength(Number(lengthSeconds)),
    type: 'youtube',
  };
}

export async function getStream(link: string): Promise<Readable> {
  return new Promise((resolve) => {
    const stream = ytdl(link, {
      filter: 'audioonly',
      highWaterMark: HIGH_WATER_MARK,
    });

    let startTime: number;

    stream.once('response', () => {
      startTime = Date.now();
      resolve(stream);
    });

    stream.on('error', (error) => {
      logger.error('Ytdl stream error: ', error);
    });

    stream.on('progress', (chunkLength, downloadedBytes, totalBytes) => {
      const percent = downloadedBytes / totalBytes;
      const downloadTime = (Date.now() - startTime) / 1000;

      if (percent === 1) {
        logger.info(`Time to get ${link} is ${downloadTime} s`);
      }
    });
  });
}

export async function getLink(keywords: string): Promise<string | null> {
  const searchResults = await ytsr(keywords, { limit: 1 });
  if (!searchResults.results || searchResults.items[0].type !== 'video') {
    return null;
  }

  return searchResults.items[0].url;
}

export async function getVideosFromPlaylist(playlist: string): Promise<ISong[]> {
  const searchResults = await ytpl(playlist);

  return _formatVideos(searchResults.items);
}

export function stringTemplateParser(expression: string, valueObj: Record<string, string> = {}): string {
  const templateMatcher = /{{\s?([^{}\s]*)\s?}}/g;
  const text = expression.replace(templateMatcher, (substring, value) => valueObj[value]);
  return text;
}

export function getTitles(queue: ISong[]): string[] {
  const DISCORD_MAX_MESSAGE_LENGTH: number = 1960;

  const messages: string[] = [];
  let currentMessage: string = '';

  queue.forEach((song, index) => {
    const title = `\n**${index + 1}.**\`${song.title}\` \`${song.length}\``;

    if (currentMessage.length + title.length < DISCORD_MAX_MESSAGE_LENGTH) {
      currentMessage += title;
    } else {
      messages.push(currentMessage);

      currentMessage = title;
    }
  });

  messages.push(currentMessage);

  return messages;
}

export async function getBindSong(filename: string, bindsDirectory: string): Promise<ISong> {
  const fullPath = `${bindsDirectory}/${filename}.mp3`;

  await fs.access(fullPath);

  return { link: fullPath, type: 'bind', title: filename, length: '0' };
}

export async function getBinds(bindsDirectory: string): Promise<string> {
  const files = await fs.readdir(bindsDirectory);

  const binds = files.reduce((acc, file, index) => `${acc}\n**${index + 1}.**\`${file.split('.')[0]}\``, '');

  return binds;
}

function _formatLength(length: number): string {
  return `${Math.floor(length / 60)}:${length % 60}`;
}

function _formatVideos(videos: ytpl.Item[]): ISong[] {
  return videos.map((video) => ({
    title: video.title,
    link: video.shortUrl,
    length: videos[0].duration ?? '0',
    type: 'youtube',
  }));
}
