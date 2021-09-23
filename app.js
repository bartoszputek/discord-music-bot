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
    this.logger = logger;
    this.messageManager = new MessageManager(language);
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
    this.playerHandler = new PlayerHandler(
      this.player,
      this.messageManager,
      this.client,
      this.logger,
      bindsDirectory,
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
    this.messageManager.setChannel(message.channel);
    if (!this.validateMessage(message)) return;

    const args = message.content.substring(1).split(' ');

    if (COMMANDS.play.includes(args[0])) {
      (async () => {
        await this.playerHandler.play(args.slice(1), message).catch((error) => {
          this.logger.error(error);
          process.exit(1);
        });
      })();
    }
    if (COMMANDS.skip.includes(args[0])) this.playerHandler.skip();
    if (COMMANDS.disconnect.includes(args[0])) this.playerHandler.disconnect(message);
    if (COMMANDS.queue.includes(args[0])) this.playerHandler.printQueue();
    if (COMMANDS.bind.includes(args[0])) this.playerHandler.bind(args.slice(1), message);
    if (COMMANDS.bindList.includes(args[0])) this.playerHandler.printBinds();
    if (COMMANDS.help.includes(args[0])) this.messageManager.message('help');
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
}
