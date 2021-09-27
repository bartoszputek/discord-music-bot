import { Client, Intents } from 'discord.js';

import { COMMANDS } from './constants.js';
import Player from './player.js';
import MessageManager from './messageManager.js';
import PlayerHandler from './playerHandler.js';

export default class App {
  constructor(token, language, prefix, channelName, bindsDirectory, logger) {
    this.TOKEN = token;
    this.PREFIX = prefix;
    this.CHANNEL_NAME = channelName;
    this.language = language;
    this.bindsDirectory = bindsDirectory;
    this.logger = logger;
    this.playersHandlers = new Map();
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
        this.logger.error(error);
        process.exit(1);
      }
    });
  }

  start() {
    this.client.login(this.TOKEN);
  }

  handleMessage(message) {
    if (!this.playersHandlers.has(message.guildId)) {
      const messageManager = new MessageManager(this.language);

      const player = new Player();
      const playerHandler = new PlayerHandler(
        player,
        messageManager,
        this.client,
        this.logger,
        this.bindsDirectory,
      );
      this.playersHandlers.set(message.guildId, playerHandler);
    }

    const playerHandler = this.playersHandlers.get(message.guildId);
    const { messageManager } = playerHandler;

    messageManager.setChannel(message.channel);
    if (!this.validateMessage(message)) return;

    const args = message.content.substring(1).split(' ');

    if (COMMANDS.bindList.includes(args[0])) playerHandler.printBinds();
    if (COMMANDS.help.includes(args[0])) messageManager.message('help');
    if (COMMANDS.queue.includes(args[0])) playerHandler.printQueue();

    if (!App.validateVoiceChannel(message, messageManager)) return;

    if (COMMANDS.play.includes(args[0])) {
      (async () => {
        await playerHandler.play(args.slice(1), message).catch((error) => {
          this.logger.error(error);
          process.exit(1);
        });
      })();
    }

    if (COMMANDS.skip.includes(args[0])) playerHandler.skip();
    if (COMMANDS.disconnect.includes(args[0])) playerHandler.disconnect(message);
    if (COMMANDS.bind.includes(args[0])) playerHandler.bind(args.slice(1), message);
  }

  validateMessage(message) {
    const channelName = this.client.channels.cache.get(message.channelId).name;

    if (channelName !== this.CHANNEL_NAME) return false;

    const hasPrefix = message.content[0] === this.PREFIX;

    if (!hasPrefix) return false;

    return true;
  }

  static validateVoiceChannel(message, messageManager) {
    if (!message.member.voice.channelId) {
      messageManager.message('joinToVoicechat');
      return false;
    }

    return true;
  }
}
