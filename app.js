import { Client, Intents } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';

import Player from './player.js';
import { CHANNEL_NAME, PREFIX, COMMANDS } from './constants.js';

export default class App {
  constructor(token) {
    this.TOKEN = token;
    this.player = new Player();
    this.client = new Client(
      {
        intents: [
          Intents.FLAGS.GUILDS,
          Intents.FLAGS.GUILD_MESSAGES,
          Intents.FLAGS.GUILD_VOICE_STATES,
        ],
      },
    );

    this.client.once('ready', () => console.log('Ready!'));

    this.client.on('messageCreate', (message) => this.handleMessage(message));
  }

  start() {
    this.client.login(this.TOKEN);
  }

  handleMessage(message) {
    if (!this.validateMessage(message)) {
      return;
    }

    const args = message.content.substring(1).split(' ');

    if (COMMANDS.play.includes(args[0])) this.handlePlay(message, args);
    if (COMMANDS.skip.includes(args[0])) this.handleSkip(message);
    if (COMMANDS.disconnect.includes(args[0])) this.handleDisconnect(message);
  }

  validateMessage(message) {
    const channelName = this.client.channels.cache.get(message.channelId).name;

    if (channelName !== CHANNEL_NAME) {
      return false;
    }

    const hasPrefix = message.content[0] === PREFIX;

    if (!hasPrefix) {
      return false;
    }

    if (!message.member.voice.channelId) {
      message.channel.send('Dołącz na kanał głosowy!');
      return false;
    }

    return true;
  }

  handlePlay(message, args) {
    message.channel.send(this.player.addToQueue(args[1]));

    if (this.player.queue.length === 1) {
      this.player.join(this.client.channels.cache.get(message.member.voice.channelId));
    }
  }

  handleSkip(message) {
    message.channel.send(this.player.dequeue());
  }

  handleDisconnect(message) {
    const connection = getVoiceConnection(message.member.voice.guild.id);
    connection.destroy();
    this.player.clearQueue();
  }
}
