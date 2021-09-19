import ytdl from 'ytdl-core';
import ytsr from 'ytsr';
import ytpl from 'ytpl';

function formatLength(length) {
  return `${Math.floor(length / 60)}:${length % 60}`;
}

function formatVideos(videos) {
  return videos.map((video) => ({
    title: video.title,
    link: video.shortUrl,
    length: video.duration,
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

export async function getVideosFromPlaylist(playlist) {
  let searchResults;
  try {
    searchResults = await ytpl(playlist);
  } catch (error) {
    return undefined;
  }

  const items = searchResults.items.filter(async (item) => {
    const data = await getData(item.shortUrl);
    if (!data) {
      this.logger.warn(`Cannot get data from ${item.shortUrl}`);
      this.messageManager.message('unavailableLink');
    }

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
  return queue.reduce((acc, song, index) => `${acc}\n**${index + 1}.**\`${song.title}\` \`${song.length}\``, '');
}
