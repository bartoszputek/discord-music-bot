import ytdl from 'ytdl-core';
import ytsr from 'ytsr';
import ytpl from 'ytpl';
import fs from 'fs/promises';
import { HIGH_WATER_MARK } from './constants.js';
import logger from './logger.js';

function formatLength(length) {
  return `${Math.floor(length / 60)}:${length % 60}`;
}

function formatVideos(videos) {
  return videos.map((video) => ({
    title: video.title,
    link: video.shortUrl,
    length: video.duration,
    type: 'youtube',
  }));
}

export async function getData(link) {
  try {
    const info = await ytdl.getBasicInfo(link);
    const { title, lengthSeconds } = info.videoDetails;
    return { title, length: formatLength(lengthSeconds) };
  } catch (error) {
    return undefined;
  }
}

export async function getStream(link) {
  return new Promise((resolve) => {
    const stream = ytdl(link, { filter: 'audioonly', highWaterMark: HIGH_WATER_MARK });

    let startTime;

    stream.once('response', () => {
      startTime = Date.now();
      resolve(stream);
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

export async function getLink(keywords) {
  const searchResults = await ytsr(keywords, { limit: 1 });
  if (!searchResults.results) {
    return undefined;
  }
  return searchResults.items[0].url;
}

export async function getVideosFromPlaylist(playlist) {
  let searchResults;
  try {
    searchResults = await ytpl(playlist);
  } catch (error) {
    return undefined;
  }

  const items = searchResults.items.filter(async (item) => {
    const data = await getData(item.shortUrl);
    return data;
  });

  return formatVideos(items);
}

export function stringTemplateParser(expression, valueObj = {}) {
  const templateMatcher = /{{\s?([^{}\s]*)\s?}}/g;
  const text = expression.replace(templateMatcher, (substring, value) => valueObj[value]);
  return text;
}

export function getTitles(queue) {
  return queue.reduce((acc, song, index) => {
    const subset = acc.pop();
    const title = `\n**${index + 1}.**\`${song.title}\` \`${song.length}\``;
    if (subset.length + title.length < 1960) {
      return [...acc, subset + title];
    }
    return [...acc, subset, title];
  }, ['']);
}

export function getFilename(args, bindsDirectory) {
  const filename = args.join('-');
  const fullPath = `${bindsDirectory}/${filename}.mp3`;
  return { filename, fullPath };
}

export async function getBinds(bindsDirectory) {
  const files = await fs.readdir(bindsDirectory);

  const binds = files.reduce((acc, file, index) => `${acc}\n**${index + 1}.**\`${file.split('.')[0]}\``, '');

  return binds;
}
