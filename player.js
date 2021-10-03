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

export default class Player {
  constructor() {
    this.queue = [];
    this.player = createAudioPlayer();
  }

  join(channel) {
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

    connection.on(VoiceConnectionStatus.Ready, () => {
      connection.subscribe(this.player);
      this.playSong();
    });

    this.player.on(AudioPlayerStatus.Idle, () => {
      this.playSong();
    });
  }

  async playSong() {
    if (!this.queue.length) return;

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

  handleIdle() {
    if (getVoiceConnection(this.guildId) && this.player.state?.status === 'idle') {
      this.playSong();
    }
  }

  static getConnection(guildId) {
    return getVoiceConnection(guildId);
  }
}
