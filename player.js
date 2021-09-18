import validUrl from 'valid-url';
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
  getData,
  getLink,
  getTitles,
} from './utils.js';

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
    if (!this.queue.length) {
      return;
    }

    const { link } = this.queue.shift();
    if (!link) {
      return;
    }
    const stream = getStream(link);
    const resource = createAudioResource(stream);
    this.player.play(resource);
  }

  async play(args) {
    if (validUrl.isUri(args[0])) {
      await this.addToQueue(args[0]);
      return;
    }

    const keywords = args.join(' ');
    const link = await getLink(keywords);
    if (!link) {
      this.messageManager.message('incorrectLink');
    }
    await this.addToQueue(link);
  }

  async addToQueue(link) {
    const data = await getData(link);
    if (!data) {
      this.messageManager.message('unavailableLink');
      return;
    }

    const song = { ...data, link };

    this.queue.push(song);
    this.messageManager.message('songAddedToQueue', { title: data.title });
  }

  skip() {
    this.player.stop();
    this.messageManager.message('songSkipped');
  }

  disconnect(message) {
    const connection = getVoiceConnection(message.member.voice.guild.id);
    if (!connection) {
      return;
    }
    connection.destroy();
    this.queue = [];
    this.messageManager.message('disconnectedFromVoicechat');
  }

  printQueue() {
    if (!this.queue.length) {
      this.messageManager.message('queueIsEmpty');
    }
    const titles = getTitles(this.queue);
    this.messageManager.message('printQueue', { titles });
  }
}
