import validUrl from 'valid-url';
import ytdl from 'ytdl-core';
import {
  joinVoiceChannel,
  getVoiceConnection,
  VoiceConnectionStatus,
  AudioPlayerStatus,
  createAudioResource,
  createAudioPlayer,
} from '@discordjs/voice';

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

  playSong() {
    const link = this.queue.shift();
    if (!link) {
      return;
    }
    const stream = ytdl(link, { filter: 'audioonly' });
    const resource = createAudioResource(stream);
    this.player.play(resource);
  }

  addToQueue(link) {
    if (!validUrl.isUri(link)) {
      return 'Link nie jest poprawny!';
    }
    this.queue.push(link);
    return `Dodano do kolejki - ${link}`;
  }

  dequeue() {
    if (!this.queue.length) {
      return 'Kolejka jest pusta!';
    }

    const link = this.queue.shift();
    return `Pomyślnie usunięto - ${link}`;
  }
}
