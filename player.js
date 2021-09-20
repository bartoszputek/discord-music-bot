import validUrl from 'valid-url';
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
  getData,
  getLink,
  getTitles,
  getVideosFromPlaylist,
  getFilename,
  getBinds,
} from './utils.js';

export default class Player {
  constructor(messageManager, bindsDirectory, logger) {
    this.messageManager = messageManager;
    this.bindsDirectory = bindsDirectory;
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

    const song = this.queue.shift();

    const { type, link } = song;

    let stream;
    if (type === 'youtube') {
      stream = getStream(link);
    }
    if (type === 'bind') {
      stream = fs.createReadStream(link);
    }

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

    const song = { ...data, link, type: 'youtube' };

    this.queue.push(song);
    this.messageManager.message('songAddedToQueue', { title: data.title });
    this.handleIdle();
  }

  async addPlaylistToQueue(playlist) {
    const songs = await getVideosFromPlaylist(playlist);
    if (!songs) {
      this.logger.warn(`Cannot get playlist from ${playlist}`);
      return;
    }
    this.queue.push(...songs);
    this.messageManager.message('playlistAddedToQueue', { title: songs[0].title });
    this.handleIdle();
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

  bind(args) {
    const { filename, fullPath } = getFilename(args, this.bindsDirectory);
    if (!fs.existsSync(fullPath)) {
      this.logger.warn(`Cannot get bind ${filename}`);
      this.messageManager.message('bindNotFound', { filename });
      return;
    }
    this.queue.push({ link: fullPath, type: 'bind' });
    this.messageManager.message('bindAddedToQueue', { filename });
    this.handleIdle();
  }

  printQueue() {
    if (!this.queue.length) {
      this.messageManager.message('queueIsEmpty');
      return;
    }
    const titles = getTitles(this.queue);
    this.messageManager.message('printQueue', { titles });
  }

  async printBinds() {
    const binds = await getBinds(this.bindsDirectory);
    this.messageManager.message('printBinds', { binds });
  }

  handleIdle() {
    if (getVoiceConnection(this.guildId) && this.player.state?.status === 'idle') {
      this.playSong();
    }
  }
}
