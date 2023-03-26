import defaultEventEmitter from 'events';

import { Message } from 'discord.js';

import { COMMANDS } from '../constants.js';
import logger from '../logger.js';
import MessageManager from './MessageManager.js';
import CommandsHandler from './CommandsHandler.js';

export default class EventEmitter extends defaultEventEmitter {
  private _commands: Record<string, string[]>;

  constructor() {
    super();
    this._commands = COMMANDS;
    this.setupListeners();
  }

  findEventName(name: string): string | undefined {
    const keys = Object.keys(this._commands);

    const eventName = keys.find((key) => this._commands[key].includes(name));

    return eventName;
  }

  setupListeners(): void {
    this.on('play', async (commandsHandler: CommandsHandler, message: Message, args) => {
      const voiceChannelId = EventEmitter.getVoiceChannelId(message, commandsHandler.messageManager);
      if (!voiceChannelId) return;

      await commandsHandler.play(args.slice(1), voiceChannelId).catch((error: unknown) => {
        logger.error(error);
        process.exit(1);
      });
    });

    this.on('disconnect', (commandsHandler: CommandsHandler, message: Message) => {
      const voiceChannelId = EventEmitter.getVoiceChannelId(message, commandsHandler.messageManager);
      if (!voiceChannelId) return;

      commandsHandler.disconnect();
    });

    this.on('skip', (commandsHandler: CommandsHandler, message: Message) => {
      const voiceChannelId = EventEmitter.getVoiceChannelId(message, commandsHandler.messageManager);
      if (!voiceChannelId) return;

      commandsHandler.skip();
    });

    this.on('clear', (commandsHandler: CommandsHandler, message: Message) => {
      const voiceChannelId = EventEmitter.getVoiceChannelId(message, commandsHandler.messageManager);
      if (!voiceChannelId) return;

      commandsHandler.skipQueue();
    });

    this.on('queue', (commandsHandler: CommandsHandler) => {
      commandsHandler.printQueue();
    });

    this.on('bind', (commandsHandler: CommandsHandler, message: Message, args) => {
      const voiceChannelId = EventEmitter.getVoiceChannelId(message, commandsHandler.messageManager);
      if (!voiceChannelId) return;

      commandsHandler.bind(args.slice(1), voiceChannelId);
    });

    this.on('bindList', (commandsHandler: CommandsHandler) => {
      commandsHandler.printBinds();
    });

    this.on('help', (commandsHandler: CommandsHandler) => {
      commandsHandler.messageManager.sendMessage('help');
    });
  }

  static getVoiceChannelId(message: Message, messageManager: MessageManager): string | null {
    if (!message.member || !message.member.voice.channelId) {
      messageManager.sendMessage('joinToVoicechat');
      return null;
    }

    const { channelId } = message.member.voice;

    return channelId;
  }
}
