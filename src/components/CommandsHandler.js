import fs from 'fs';
import validUrl from 'valid-url';
import logger from '../logger.js';
import {
  getBinds,
  getData,
  getFilename,
  getLink,
  getTitles,
  getVideosFromPlaylist,
} from '../utils.js';

export default class CommandsHandler {
  constructor(player, messageManager, client, bindsDirectory) {
    this.player = player;
    this.messageManager = messageManager;
    this.client = client;
    this.bindsDirectory = bindsDirectory;
  }

  joinChannel(channel) {
    this.messageManager.setChannel(channel);
  }

  async play(args, message) {
    if (validUrl.isUri(args[0])) {
      const isPlaylistLink = args[0].includes('list');

      if (isPlaylistLink) {
        this.playPlaylist(args[0]);
      } else {
        await this.playSong(args[0]);
      }
    } else {
      const keywords = args.join(' ');
      const link = await getLink(keywords);
      if (!link) {
        this.messageManager.sendMessage('incorrectLink');
      }
      await this.playSong(link);
    }

    this.player.join(this.client.channels.cache.get(message.member.voice.channelId));
  }

  async playPlaylist(link) {
    const songs = await getVideosFromPlaylist(link);
    if (!songs) {
      logger.warn(`Cannot get playlist from ${link}`);
      return;
    }
    this.messageManager.sendMessage('playlistAddedToQueue', { title: songs[0].title });

    this.player.queue.push(...songs);
    this.player.handleIdle();
  }

  async playSong(link) {
    const data = await getData(link);
    if (!data) {
      logger.warn(`Cannot get data from ${link}`);
      this.messageManager.sendMessage('unavailableLink');
      return;
    }
    const song = { ...data, link, type: 'youtube' };

    this.messageManager.sendMessage('songAddedToQueue', { title: data.title });

    this.player.queue.push(song);
    this.player.handleIdle();
  }

  bind(args, message) {
    const { filename, fullPath } = getFilename(args, this.bindsDirectory);
    if (!fs.existsSync(fullPath)) {
      logger.warn(`Cannot get bind ${filename}`);
      this.messageManager.sendMessage('bindNotFound', { filename });
      return;
    }
    this.messageManager.sendMessage('bindAddedToQueue', { filename });

    this.player.queue.push({ link: fullPath, type: 'bind' });
    this.player.handleIdle();
    this.player.join(this.client.channels.cache.get(message.member.voice.channelId));
  }

  skipQueue() {
    if (!this.player.queue.length) {
      this.messageManager.sendMessage('skipUnavailable');
      return;
    }

    this.player.queue = [];
    this.messageManager.sendMessage('skipQueue');
  }

  skip() {
    if (this.player.stop()) {
      this.messageManager.sendMessage('songSkipped');
    } else {
      this.messageManager.sendMessage('skipUnavailable');
    }
  }

  disconnect() {
    this.player.disconnect();
    this.player.queue = [];

    this.messageManager.sendMessage('disconnectedFromVoicechat');
  }

  printQueue() {
    if (!this.player.queue.length) {
      this.messageManager.sendMessage('queueIsEmpty');
      return;
    }
    const titles = getTitles(this.player.queue);
    titles.forEach((subset) => {
      this.messageManager.sendMessage('printQueue', { titles: subset });
    });
  }

  async printBinds() {
    const binds = await getBinds(this.bindsDirectory);
    this.messageManager.sendMessage('printBinds', { binds });
  }
}
