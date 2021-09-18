import ytdl from 'ytdl-core';

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
