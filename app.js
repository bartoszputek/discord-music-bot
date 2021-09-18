import { Client, Intents } from 'discord.js';

import { CHANNEL_NAME, PREFIX, COMMANDS } from './constants.js';
import Player from './player.js';
import MessageManager from './messageManager.js';

export default class App {
  constructor(token, language) {
    this.TOKEN = token;
    this.messageManager = new MessageManager(language);
    this.player = new Player(this.messageManager);
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
    this.messageManager.setChannel(message.channel);
    if (!this.validateMessage(message)) return;

    const args = message.content.substring(1).split(' ');

    if (COMMANDS.play.includes(args[0])) this.handlePlay(message, args);
    if (COMMANDS.skip.includes(args[0])) this.handleSkip();
    if (COMMANDS.disconnect.includes(args[0])) this.handleDisconnect(message);
    if (COMMANDS.queue.includes(args[0])) this.handlePrintQueue();
  }

  validateMessage(message) {
    const channelName = this.client.channels.cache.get(message.channelId).name;

    if (channelName !== CHANNEL_NAME) return false;

    const hasPrefix = message.content[0] === PREFIX;

    if (!hasPrefix) return false;

    if (!message.member.voice.channelId) {
      this.messageManager.message('joinToVoicechat');
      return false;
    }

    return true;
  }

  async handlePlay(message, args) {
    await this.player.addToQueue(args[1]);

    if (this.player.queue.length === 1) {
      this.player.join(this.client.channels.cache.get(message.member.voice.channelId));
    }
  }

  handleSkip() {
    this.player.dequeue();
  }

  handleDisconnect(message) {
    this.player.disconnect(message);
  }

  handlePrintQueue() {
    this.player.printQueue();
  }
}
