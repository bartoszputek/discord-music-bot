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
  getVideosFromPlaylist,
} from './utils.js';

export default class Player {
  constructor(messageManager, logger) {
    this.messageManager = messageManager;
    this.logger = logger;
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
    if (!this.queue.length) return;

    const { link } = this.queue.shift();
    if (!link) return;

    const stream = getStream(link);
    const resource = createAudioResource(stream);
    this.player.play(resource);
  }

  async play(args) {
    if (validUrl.isUri(args[0])) {
      if (args[0].includes('list')) {
        this.addPlaylistToQueue(args[0]);
        return;
      }

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
      this.logger.warn(`Cannot get data from ${link}`);
      this.messageManager.message('unavailableLink');
      return;
    }

    const song = { ...data, link };

    this.queue.push(song);
    this.messageManager.message('songAddedToQueue', { title: data.title });
  }

  async addPlaylistToQueue(playlist) {
    const songs = await getVideosFromPlaylist(playlist);
    if (!songs) {
      this.logger.warn(`Cannot get playlist from ${playlist}`);
      return;
    }
    this.queue.push(...songs);
    this.messageManager.message('playlistAddedToQueue', { title: songs[0].title });
  }

  skip() {
    if (this.player.stop()) {
      this.messageManager.message('songSkipped');
    }
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
      return;
    }
    const titles = getTitles(this.queue);
    this.messageManager.message('printQueue', { titles });
  }
}
