import { Client, Intents } from 'discord.js';

import { COMMANDS } from './constants.js';
import Player from './player.js';
import MessageManager from './messageManager.js';

export default class App {
  constructor(token, language, prefix, channelName, bindsDirectory, logger) {
    this.TOKEN = token;
    this.PREFIX = prefix;
    this.CHANNEL_NAME = channelName;
    this.logger = logger;
    this.messageManager = new MessageManager(language);
    this.player = new Player(this.messageManager, bindsDirectory, this.logger);
    this.client = new Client(
      {
        intents: [
          Intents.FLAGS.GUILDS,
          Intents.FLAGS.GUILD_MESSAGES,
          Intents.FLAGS.GUILD_VOICE_STATES,
        ],
      },
    );

    this.client.once('ready', () => logger.info('Ready!'));

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
    if (COMMANDS.bind.includes(args[0])) this.handleBind(message, args);
    if (COMMANDS.bindList.includes(args[0])) this.handlePrintBinds();
    if (COMMANDS.help.includes(args[0])) this.handleHelp();
  }

  validateMessage(message) {
    const channelName = this.client.channels.cache.get(message.channelId).name;

    if (channelName !== this.CHANNEL_NAME) return false;

    const hasPrefix = message.content[0] === this.PREFIX;

    if (!hasPrefix) return false;

    if (!message.member.voice.channelId) {
      this.messageManager.message('joinToVoicechat');
      return false;
    }

    return true;
  }

  async handlePlay(message, args) {
    await this.player.play(args.slice(1));

    if (this.player.queue.length === 1) {
      this.player.join(this.client.channels.cache.get(message.member.voice.channelId));
    }
  }

  handleSkip() {
    this.player.skip();
  }

  handleDisconnect(message) {
    this.player.disconnect(message);
  }

  handlePrintQueue() {
    this.player.printQueue();
  }

  handleBind(message, args) {
    this.player.bind(args.slice(1));

    if (this.player.queue.length === 1) {
      this.player.join(this.client.channels.cache.get(message.member.voice.channelId));
    }
  }

  handlePrintBinds() {
    this.player.printBinds();
  }

  handleHelp() {
    this.messageManager.message('help');
  }
}
