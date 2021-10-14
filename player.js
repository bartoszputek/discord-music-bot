import fs from 'fs';
import {
  joinVoiceChannel,
  getVoiceConnection,
  VoiceConnectionStatus,
  AudioPlayerStatus,
  createAudioResource,
  createAudioPlayer,
} from '@discordjs/voice';
import {
  getStream,
} from './utils.js';
import { DISCONNECT_TIME } from './constants.js';

export default class Player {
  constructor() {
    this.queue = [];
    this.player = createAudioPlayer();
  }

  join(channel) {
    if (this.getChannelId() === channel.id) {
      return;
    }
    this.isPlaying = true;
    this.guildId = channel.guild.id;
    joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });
    this.setupListeners();
  }

  setupListeners() {
    const connection = getVoiceConnection(this.guildId);
    connection.removeAllListeners();
    this.player.removeAllListeners();

    connection.on(VoiceConnectionStatus.Ready, async () => {
      connection.subscribe(this.player);
      await this.playSong();
    });

    this.player.on(AudioPlayerStatus.Idle, async () => {
      this.isPlaying = false;
      await this.playSong();
    });
  }

  async playSong() {
    if (!this.queue.length) {
      this.timeout = setTimeout(() => this.disconnect(), DISCONNECT_TIME);
      return;
    }

    this.isPlaying = true;
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    const song = this.queue.shift();
    const { type, link } = song;

    let stream;
    if (type === 'youtube') {
      stream = await getStream(link);
    }
    if (type === 'bind') {
      stream = fs.createReadStream(link);
    }

    const resource = createAudioResource(stream);
    this.player.play(resource);
  }

  stop() {
    return this.player.stop();
  }

  disconnect() {
    const connection = getVoiceConnection(this.guildId);
    if (!connection) {
      return false;
    }
    const stop = this.player.stop();
    connection.destroy();
    this.isPlaying = false;

    return stop;
  }

  handleIdle() {
    if (getVoiceConnection(this.guildId) && this.player.state?.status === 'idle' && !this.isPlaying) {
      this.playSong();
    }
  }

  getChannelId() {
    return getVoiceConnection(this.guildId)?.joinConfig.channelId;
  }
}
