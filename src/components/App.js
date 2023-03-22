import { Client, GatewayIntentBits } from 'discord.js';

import Player from './Player.js';
import MessageManager from './MessageManager.js';
import CommandsHandler from './CommandsHandler.js';
import logger from '../logger.js';
import EventEmitter from './EventEmitter.js';

export default class App {
  constructor(token, language, prefix, channelName, bindsDirectory) {
    this.TOKEN = token;
    this.PREFIX = prefix;
    this.CHANNEL_NAME = channelName;
    this.language = language;
    this.bindsDirectory = bindsDirectory;
    this.guildCommandsHandlers = new Map();
    this.eventEmmiter = new EventEmitter();
    this.client = new Client(
      {
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.GuildVoiceStates,
          GatewayIntentBits.MessageContent,
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
    const commandsHandler = this.getGuildCommandHandler(message);
    commandsHandler.joinChannel(message.channel);

    if (!this.validateMessage(message)) return;

    const args = message.content.substring(1).split(' ');

    const eventName = this.eventEmmiter.findEventName(args[0]);
    if (!eventName) return;

    this.eventEmmiter.emit(eventName, commandsHandler, message, args);
  }

  getGuildCommandHandler(message) {
    if (!this.guildCommandsHandlers.has(message.guildId)) {
      const messageManager = new MessageManager(this.language);

      const player = new Player();
      const commandsHandler = new CommandsHandler(
        player,
        messageManager,
        this.client,
        this.bindsDirectory,
      );
      this.guildCommandsHandlers.set(message.guildId, commandsHandler);
    }

    return this.guildCommandsHandlers.get(message.guildId);
  }

  validateMessage(message) {
    const channelName = this.client.channels.cache.get(message.channelId).name;

    const isSentOnCorrectChannel = channelName === this.CHANNEL_NAME;

    const hasPrefix = message.content[0] === this.PREFIX;

    return isSentOnCorrectChannel && hasPrefix;
  }
}
