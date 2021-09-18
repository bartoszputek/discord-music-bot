import ytdl from 'ytdl-core';
import ytsr from 'ytsr';

function formatLength(length) {
  return `${Math.floor(length / 60)}:${length % 60}`;
}

export async function getData(link) {
  try {
    const info = await ytdl.getBasicInfo(link);
    const { title, lengthSeconds } = info.videoDetails;
    return { title, length: formatLength(lengthSeconds) };
  } catch (error) {
    console.log('error');
    return undefined;
  }
}

export function getStream(link) {
  return ytdl(link, { filter: 'audioonly' });
}

export async function getLink(keywords) {
  const searchResults = await ytsr(keywords, { limit: 1 });
  if (!searchResults.results) {
    return undefined;
  }
  return searchResults.items[0].url;
}

export function stringTemplateParser(expression, valueObj = {}) {
  const templateMatcher = /{{\s?([^{}\s]*)\s?}}/g;
  const text = expression.replace(templateMatcher, (substring, value) => valueObj[value]);
  return text;
}

export function getTitles(queue) {
  return queue.reduce((acc, song, index) => `${acc}\n**${index + 1}.**\`${song.title}\` \`${song.length}\``, '');
}
