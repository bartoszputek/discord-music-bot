import defaultEventEmitter from 'events';
import { COMMANDS } from '../constants.js';
import logger from '../logger.js';

export default class EventEmitter extends defaultEventEmitter {
  constructor() {
    super();
    this.commands = COMMANDS;
    this.setupListeners();
  }

  findEventName(name) {
    const keys = Object.keys(this.commands);

    const eventName = keys.find((key) => this.commands[key].includes(name));

    return eventName;
  }

  setupListeners() {
    this.on('play', async (commandsHandler, message, args) => {
      if (!EventEmitter.validateVoiceChannel(message, commandsHandler.messageManager)) return;

      await commandsHandler.play(args.slice(1), message).catch((error) => {
        logger.error(error);
        process.exit(1);
      });
    });

    this.on('disconnect', (commandsHandler, message) => {
      if (!EventEmitter.validateVoiceChannel(message, commandsHandler.messageManager)) return;

      commandsHandler.disconnect();
    });

    this.on('skip', (commandsHandler, message) => {
      if (!EventEmitter.validateVoiceChannel(message, commandsHandler.messageManager)) return;

      commandsHandler.skip();
    });

    this.on('clear', (commandsHandler, message) => {
      if (!EventEmitter.validateVoiceChannel(message, commandsHandler.messageManager)) return;

      commandsHandler.skipQueue();
    });

    this.on('queue', (commandsHandler) => {
      commandsHandler.printQueue();
    });

    this.on('bind', (commandsHandler, message, args) => {
      if (!EventEmitter.validateVoiceChannel(message, commandsHandler.messageManager)) return;

      commandsHandler.bind(args.slice(1), message);
    });

    this.on('bindList', (commandsHandler) => {
      commandsHandler.printBinds();
    });

    this.on('help', (commandsHandler) => {
      commandsHandler.messageManager.sendMessage('help');
    });
  }

  static validateVoiceChannel(message, messageManager) {
    if (!message.member.voice.channelId) {
      messageManager.sendMessage('joinToVoicechat');
      return false;
    }

    return true;
  }
}
