import { Client, GuildTextBasedChannel, VoiceChannel } from 'discord.js';
import validUrl from 'valid-url';

import logger from '../logger';
import { getBinds, getYoutubeSong, getBindSong, getLink, getTitles, getVideosFromPlaylist, ISong } from '../utils';
import MessageManager from './MessageManager';
import Player from './Player';

export default class CommandsHandler {
  public constructor(
    private readonly _player: Player,
    public readonly messageManager: MessageManager,
    private readonly _client: Client,
    private readonly _bindsDirectory: string
  ) {}

  public joinChannel(channel: GuildTextBasedChannel): void {
    this.messageManager.setChannel(channel);
  }

  public async play(args: string[], voiceChannelId: string): Promise<void> {
    if (validUrl.isUri(args[0])) {
      const isPlaylistLink = args[0].includes('list');

      if (isPlaylistLink) {
        this._playPlaylist(args[0]);
      } else {
        await this._playYoutubeSong(args[0]);
      }
    } else {
      const keywords = args.join(' ');
      const link = await getLink(keywords);
      if (!link) {
        this.messageManager.sendMessage('incorrectLink');
        return;
      }
      await this._playYoutubeSong(link);
    }

    this._player.join(this._client.channels.cache.get(voiceChannelId) as VoiceChannel);
  }

  private async _playPlaylist(link: string): Promise<void> {
    let songs;

    try {
      songs = await getVideosFromPlaylist(link);
    } catch (error) {
      logger.warn(`Cannot get playlist from ${link}`, error);
      return;
    }

    this.messageManager.sendMessage('playlistAddedToQueue', {
      title: songs[0].title,
    });

    this._player.queue.push(...songs);
    this._player.handleIdle();
  }

  private async _playYoutubeSong(link: string): Promise<void> {
    let song: ISong;

    try {
      song = await getYoutubeSong(link);
    } catch (error) {
      logger.warn(`Cannot get data from ${link}`, error);
      this.messageManager.sendMessage('unavailableLink');
      return;
    }

    this.messageManager.sendMessage('songAddedToQueue', { title: song.title });

    this._player.queue.push(song);
    this._player.handleIdle();
  }

  public async bind(args: string[], voiceChannelId: string): Promise<void> {
    const filename = args.join('-');

    let song: ISong;

    try {
      song = await getBindSong(filename, this._bindsDirectory);
    } catch (error) {
      logger.warn(`Cannot get bind ${filename}`);
      this.messageManager.sendMessage('bindNotFound', { filename });
      return;
    }

    this._player.queue.push(song);

    this.messageManager.sendMessage('bindAddedToQueue', { filename });

    this._player.handleIdle();
    this._player.join(this._client.channels.cache.get(voiceChannelId) as VoiceChannel);
  }

  public skipQueue(): void {
    if (!this._player.queue.length) {
      this.messageManager.sendMessage('skipUnavailable');
      return;
    }

    this._player.queue = [];
    this.messageManager.sendMessage('skipQueue');
  }

  public skip(): void {
    if (this._player.stop()) {
      this.messageManager.sendMessage('songSkipped');
    } else {
      this.messageManager.sendMessage('skipUnavailable');
    }
  }

  public disconnect(): void {
    this._player.disconnect();
    this._player.queue = [];

    this.messageManager.sendMessage('disconnectedFromVoicechat');
  }

  public printQueue(): void {
    if (!this._player.queue.length) {
      this.messageManager.sendMessage('queueIsEmpty');
      return;
    }
    const titles = getTitles(this._player.queue);
    titles.forEach((subset) => {
      this.messageManager.sendMessage('printQueue', { titles: subset });
    });
  }

  public async printBinds(): Promise<void> {
    const binds = await getBinds(this._bindsDirectory);
    this.messageManager.sendMessage('printBinds', { binds });
  }
}
