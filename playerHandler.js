import fs from 'fs';
import validUrl from 'valid-url';
import logger from './logger.js';
import Player from './player.js';
import {
  getBinds,
  getData,
  getFilename,
  getLink,
  getTitles,
  getVideosFromPlaylist,
} from './utils.js';

export default class PlayerHandler {
  constructor(player, messageManager, client, bindsDirectory) {
    this.player = player;
    this.messageManager = messageManager;
    this.client = client;
    this.bindsDirectory = bindsDirectory;
  }

  async play(args, message) {
    if (validUrl.isUri(args[0])) {
      if (args[0].includes('list')) {
        this.playPlaylist(args[0]);
      } else {
        await this.playSong(args[0]);
      }
    } else {
      const keywords = args.join(' ');
      const link = await getLink(keywords);
      if (!link) {
        this.messageManager.message('incorrectLink');
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
    this.messageManager.message('playlistAddedToQueue', { title: songs[0].title });

    this.player.queue.push(...songs);
    this.player.handleIdle();
  }

  async playSong(link) {
    const data = await getData(link);
    if (!data) {
      logger.warn(`Cannot get data from ${link}`);
      this.messageManager.message('unavailableLink');
      return;
    }
    const song = { ...data, link, type: 'youtube' };

    this.messageManager.message('songAddedToQueue', { title: data.title });

    this.player.queue.push(song);
    this.player.handleIdle();
  }

  bind(args, message) {
    const { filename, fullPath } = getFilename(args, this.bindsDirectory);
    if (!fs.existsSync(fullPath)) {
      logger.warn(`Cannot get bind ${filename}`);
      this.messageManager.message('bindNotFound', { filename });
      return;
    }
    this.messageManager.message('bindAddedToQueue', { filename });

    this.player.queue.push({ link: fullPath, type: 'bind' });
    this.player.handleIdle();
    this.player.join(this.client.channels.cache.get(message.member.voice.channelId));
  }

  skip() {
    if (this.player.stop()) {
      this.messageManager.message('songSkipped');
    } else {
      this.messageManager.message('skipUnavailable');
    }
  }

  disconnect(message) {
    const connection = Player.getConnection(message.member.voice.guild.id);
    if (!connection) {
      return;
    }
    this.player.stop();
    connection.destroy();
    this.messageManager.message('disconnectedFromVoicechat');

    this.player.queue = [];
  }

  printQueue() {
    if (!this.player.queue.length) {
      this.messageManager.message('queueIsEmpty');
      return;
    }
    const titles = getTitles(this.player.queue);
    titles.forEach((subset) => {
      this.messageManager.message('printQueue', { titles: subset });
    });
  }

  async printBinds() {
    const binds = await getBinds(this.bindsDirectory);
    this.messageManager.message('printBinds', { binds });
  }
}
