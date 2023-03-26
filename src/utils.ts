import fs from 'fs/promises';
import { Readable } from 'stream';

import ytdl from 'ytdl-core';
import ytsr from 'ytsr';
import ytpl from 'ytpl';

import { HIGH_WATER_MARK } from './constants.js';
import logger from './logger.js';

export interface IVideoData {
  title: string;
  length: string;
}

export interface IQueue {
  link: string;
  type: string;
}

export interface IFormattedVideo {
  title: string;
  link: string;
  length: string;
  type: string;
}

interface IFilenameData {
  filename: string;
  fullPath: string;
}

export async function getData(link: string): Promise<IVideoData | undefined> {
  try {
    const info = await ytdl.getBasicInfo(link);
    const { title, lengthSeconds } = info.videoDetails;
    return { title, length: _formatLength(Number(lengthSeconds)) };
  } catch (error) {
    return undefined; // todo: remove undefined
  }
}

export async function getStream(link: string): Promise<Readable> {
  return new Promise((resolve) => {
    const stream = ytdl(link, { filter: 'audioonly', highWaterMark: HIGH_WATER_MARK });

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

export async function getLink(keywords: string): Promise<string | undefined> { // todo: remove undefined
  const searchResults = await ytsr(keywords, { limit: 1 });
  if (!searchResults.results || searchResults.items[0].type !== 'video') {
    return undefined;
  }

  return searchResults.items[0].url;
}

export async function getVideosFromPlaylist(playlist: string): Promise<IFormattedVideo[] | undefined> {
  let searchResults;
  try {
    searchResults = await ytpl(playlist);
  } catch (error) {
    return undefined; // todo: remove undefined
  }

  return _formatVideos(searchResults.items);
}

export function stringTemplateParser(expression: string, valueObj: Record<string, string> = {}): string {
  const templateMatcher = /{{\s?([^{}\s]*)\s?}}/g;
  const text = expression.replace(templateMatcher, (substring, value) => valueObj[value]);
  return text;
}

export function getTitles(queue: { title: string, length: string }[]): string[] {
  // todo: Optimize reduce
  return queue.reduce((acc: string[], song, index) => {
    const subset = acc.pop()!;
    const title = `\n**${index + 1}.**\`${song.title}\` \`${song.length}\``;
    if (subset.length + title.length < 1960) {
      return [...acc, subset + title];
    }
    return [...acc, subset, title];
  }, ['']);
}

export function getFilename(args: string[], bindsDirectory: string): IFilenameData {
  const filename = args.join('-');
  const fullPath = `${bindsDirectory}/${filename}.mp3`;
  return { filename, fullPath };
}

export async function getBinds(bindsDirectory: string): Promise<string> {
  const files = await fs.readdir(bindsDirectory);

  const binds = files.reduce((acc, file, index) => `${acc}\n**${index + 1}.**\`${file.split('.')[0]}\``, '');

  return binds;
}

function _formatLength(length: number): string {
  return `${Math.floor(length / 60)}:${length % 60}`;
}

// todo: fix ! types
function _formatVideos(videos:ytpl.Item[]): IFormattedVideo[] {
  return videos.map((video) => ({
    title: video.title,
    link: video.shortUrl,
    length: video.duration!,
    type: 'youtube',
  }));
}
