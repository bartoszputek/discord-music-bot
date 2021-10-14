import defaultEventEmitter from 'events';
import { COMMANDS } from './constants.js';
import logger from './logger.js';

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
    this.on('play', (playerHandler, message, args) => {
      if (!EventEmitter.validateVoiceChannel(message, playerHandler.messageManager)) return;

      (async () => {
        await playerHandler.play(args.slice(1), message).catch((error) => {
          logger.error(error);
          process.exit(1);
        });
      })();
    });

    this.on('disconnect', (playerHandler, message) => {
      if (!EventEmitter.validateVoiceChannel(message, playerHandler.messageManager)) return;

      playerHandler.disconnect();
    });

    this.on('skip', (playerHandler, message) => {
      if (!EventEmitter.validateVoiceChannel(message, playerHandler.messageManager)) return;

      playerHandler.skip();
    });

    this.on('clear', (playerHandler, message) => {
      if (!EventEmitter.validateVoiceChannel(message, playerHandler.messageManager)) return;

      playerHandler.skipQueue();
    });

    this.on('queue', (playerHandler) => {
      playerHandler.printQueue();
    });

    this.on('bind', (playerHandler, message, args) => {
      if (!EventEmitter.validateVoiceChannel(message, playerHandler.messageManager)) return;

      playerHandler.bind(args.slice(1), message);
    });

    this.on('bindList', (playerHandler) => {
      playerHandler.printBinds();
    });

    this.on('help', (playerHandler) => {
      playerHandler.messageManager.message('help');
    });
  }

  static validateVoiceChannel(message, messageManager) {
    if (!message.member.voice.channelId) {
      messageManager.message('joinToVoicechat');
      return false;
    }

    return true;
  }
}
