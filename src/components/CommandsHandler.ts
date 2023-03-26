import fs from 'fs';

import { Client, GuildTextBasedChannel, VoiceChannel } from 'discord.js';
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
import MessageManager from './MessageManager.js';
import Player from './Player.js';

export default class CommandsHandler {
  constructor(
    private readonly _player: Player,
    public readonly messageManager: MessageManager,
    private readonly _client: Client,
    private readonly _bindsDirectory: string,
  ) {}

  joinChannel(channel: GuildTextBasedChannel): void {
    this.messageManager.setChannel(channel);
  }

  async play(args: string[], voiceChannelId: string): Promise<void> {
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
        return;
      }
      await this.playSong(link);
    }

    this._player.join(this._client.channels.cache.get(voiceChannelId) as VoiceChannel);
  }

  async playPlaylist(link: string): Promise<void> {
    const songs = await getVideosFromPlaylist(link);
    if (!songs) {
      logger.warn(`Cannot get playlist from ${link}`);
      return;
    }
    this.messageManager.sendMessage('playlistAddedToQueue', {
      title: songs[0].title,
    });

    this._player.queue.push(...songs);
    this._player.handleIdle();
  }

  async playSong(link: string): Promise<void> {
    const data = await getData(link);
    if (!data) {
      logger.warn(`Cannot get data from ${link}`);
      this.messageManager.sendMessage('unavailableLink');
      return;
    }
    const song = { ...data, link, type: 'youtube' };

    this.messageManager.sendMessage('songAddedToQueue', { title: data.title });

    this._player.queue.push(song);
    this._player.handleIdle();
  }

  bind(args: string[], voiceChannelId: string): void {
    const { filename, fullPath } = getFilename(args, this._bindsDirectory);
    if (!fs.existsSync(fullPath)) {
      logger.warn(`Cannot get bind ${filename}`);
      this.messageManager.sendMessage('bindNotFound', { filename });
      return;
    }
    this.messageManager.sendMessage('bindAddedToQueue', { filename });

    this._player.queue.push({ link: fullPath, type: 'bind' });
    this._player.handleIdle();
    this._player.join(
      this._client.channels.cache.get(voiceChannelId) as VoiceChannel,
    );
  }

  skipQueue(): void {
    if (!this._player.queue.length) {
      this.messageManager.sendMessage('skipUnavailable');
      return;
    }

    this._player.queue = [];
    this.messageManager.sendMessage('skipQueue');
  }

  skip(): void {
    if (this._player.stop()) {
      this.messageManager.sendMessage('songSkipped');
    } else {
      this.messageManager.sendMessage('skipUnavailable');
    }
  }

  disconnect(): void {
    this._player.disconnect();
    this._player.queue = [];

    this.messageManager.sendMessage('disconnectedFromVoicechat');
  }

  printQueue(): void {
    if (!this._player.queue.length) {
      this.messageManager.sendMessage('queueIsEmpty');
      return;
    }
    const titles = getTitles(this._player.queue as unknown as { title: string, length: string }[]);
    titles.forEach((subset) => {
      this.messageManager.sendMessage('printQueue', { titles: subset });
    });
  }

  async printBinds(): Promise<void> {
    const binds = await getBinds(this._bindsDirectory);
    this.messageManager.sendMessage('printBinds', { binds });
  }
}
