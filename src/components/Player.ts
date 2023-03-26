import fs from 'fs';
import { Readable } from 'stream';

import {
  joinVoiceChannel,
  getVoiceConnection,
  VoiceConnectionStatus,
  AudioPlayerStatus,
  createAudioResource,
  createAudioPlayer,
} from '@discordjs/voice';
import { VoiceChannel } from 'discord.js';

import logger from '../logger';
import { getStream, ISong } from '../utils';
import { DISCONNECT_TIME } from '../constants';

export default class Player {
  public queue: ISong[] = [];

  private readonly _player = createAudioPlayer();

  private _isPlaying: boolean = false;

  private _guildId: string | undefined;

  private _timeout: NodeJS.Timeout | undefined;

  private _stream: Readable | undefined;

  public join(channel: VoiceChannel): void {
    if (this._getChannelId() === channel.id) {
      return;
    }
    this._isPlaying = true;
    this._guildId = channel.guild.id;
    joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });
    this.setupListeners(this._guildId);
  }

  public setupListeners(guildId: string): void {
    const connection = getVoiceConnection(guildId);

    if (connection) {
      connection.removeAllListeners();
      this._player.removeAllListeners();

      connection.on(VoiceConnectionStatus.Ready, async () => {
        connection.subscribe(this._player);
        this.playSong();
      });
    }

    this._player.on(AudioPlayerStatus.Idle, async () => {
      this._isPlaying = false;
      this.playSong();
    });
  }

  public playSong(): void {
    if (!this.queue.length) {
      this._timeout = setTimeout(() => {
        logger.info('Disconnect by timeout');
        this.disconnect();
      }, DISCONNECT_TIME);
      return;
    }

    this._isPlaying = true;
    if (this._timeout) {
      logger.info('Timeout is cleared');
      clearTimeout(this._timeout);
    }

    const song = this.queue.shift()!;
    const { type, link } = song;

    if (type === 'youtube') {
      (async () => {
        this._stream = await getStream(link);
        const resource = createAudioResource(this._stream);
        this._player.play(resource);
      })();
    }
    if (type === 'bind') {
      this._stream = fs.createReadStream(link);
      const resource = createAudioResource(this._stream);
      this._player.play(resource);
    }
  }

  public stop(): boolean {
    if (this._stream) {
      this._stream.destroy();
    }

    return this._player.stop();
  }

  public disconnect(): boolean {
    if (!this._guildId) {
      return false;
    }

    const connection = getVoiceConnection(this._guildId);
    if (!connection) {
      return false;
    }

    if (!this._stream) {
      return false;
    }

    this._stream.destroy();
    const stop = this._player.stop();
    connection.destroy();
    this._isPlaying = false;

    return stop;
  }

  public handleIdle(): void {
    if (this._guildId) {
      if (getVoiceConnection(this._guildId) && this._player.state?.status === 'idle' && !this._isPlaying) {
        this.playSong();
      }
    }
  }

  private _getChannelId(): string | null | undefined {
    return getVoiceConnection(this._guildId!)?.joinConfig.channelId;
  }
}
