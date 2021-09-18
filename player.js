import validUrl from 'valid-url';
import {
  joinVoiceChannel,
  getVoiceConnection,
  VoiceConnectionStatus,
  AudioPlayerStatus,
  createAudioResource,
  createAudioPlayer,
} from '@discordjs/voice';
import { getStream, getData } from './utils.js';

export default class Player {
  constructor(messageManager) {
    this.messageManager = messageManager;
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
    const { link } = this.queue.shift();
    if (!link) {
      return;
    }
    const stream = getStream(link);
    const resource = createAudioResource(stream);
    this.player.play(resource);
  }

  async addToQueue(link) {
    if (!validUrl.isUri(link)) {
      this.messageManager.message('incorrectLink');
      return;
    }

    const data = await getData(link);
    if (!data) {
      this.messageManager.message('unavailableLink');
      return;
    }

    const song = { ...data, link };

    this.queue.push(song);
    this.messageManager.message('songAddedToQueue', { title: data.title });
  }

  dequeue() {
    if (!this.queue.length) {
      this.messageManager.message('queueIsEmpty');
    }

    const { title } = this.queue.shift();
    this.messageManager.message('songRemovedFromQueue', { title });
  }

  disconnect(message) {
    const connection = getVoiceConnection(message.member.voice.guild.id);
    connection.destroy();
    this.queue = [];
  }

  printQueue() {
    if (!this.queue.length) {
      this.messageManager.message('queueIsEmpty');
    }
    const titles = this.queue.reduce((acc, song, index) => `${acc}\n**${index + 1}.**\`${song.title}\` \`${song.length}\``, '');
    this.messageManager.message('printQueue', { titles });
  }
}
