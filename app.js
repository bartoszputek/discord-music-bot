import { Client, Intents } from 'discord.js';

import Player from './player.js';
import MessageManager from './messageManager.js';
import PlayerHandler from './playerHandler.js';
import logger from './logger.js';
import EventEmitter from './eventEmitter.js';

export default class App {
  constructor(token, language, prefix, channelName, bindsDirectory) {
    this.TOKEN = token;
    this.PREFIX = prefix;
    this.CHANNEL_NAME = channelName;
    this.language = language;
    this.bindsDirectory = bindsDirectory;
    this.playersHandlers = new Map();
    this.eventEmmiter = new EventEmitter();
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

    this.client.on('messageCreate', async (message) => {
      try {
        await this.handleMessage(message);
      } catch (error) {
        logger.error(error);
        process.exit(1);
      }
    });
  }

  start() {
    this.client.login(this.TOKEN);
  }

  handleMessage(message) {
    const playerHandler = this.getPlayerHandler(message);
    const { messageManager } = playerHandler;

    messageManager.setChannel(message.channel);
    if (!this.validateMessage(message)) return;

    const args = message.content.substring(1).split(' ');

    const eventName = this.eventEmmiter.findEventName(args[0]);
    if (!eventName) return;

    this.eventEmmiter.emit(eventName, playerHandler, message, args);
  }

  getPlayerHandler(message) {
    if (!this.playersHandlers.has(message.guildId)) {
      const messageManager = new MessageManager(this.language);

      const player = new Player();
      const playerHandler = new PlayerHandler(
        player,
        messageManager,
        this.client,
        this.bindsDirectory,
      );
      this.playersHandlers.set(message.guildId, playerHandler);
    }

    return this.playersHandlers.get(message.guildId);
  }

  validateMessage(message) {
    const channelName = this.client.channels.cache.get(message.channelId).name;

    if (channelName !== this.CHANNEL_NAME) return false;

    const hasPrefix = message.content[0] === this.PREFIX;

    if (!hasPrefix) return false;

    return true;
  }
}
