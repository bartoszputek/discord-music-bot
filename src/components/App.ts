import { Client, GatewayIntentBits, Message } from 'discord.js';

import Player from './Player';
import MessageManager from './MessageManager';
import CommandsHandler from './CommandsHandler';
import logger from '../logger';
import EventEmitter from './EventEmitter';

export default class App {
  private readonly _guildCommandsHandlers: Map<string, CommandsHandler>;

  private readonly _eventEmitter: EventEmitter;

  private readonly _client: Client;

  public constructor(
    private readonly _token: string,
    private readonly _language: string,
    private readonly _prefix: string,
    private readonly _channelName: string,
    private readonly _bindsDirectory: string
  ) {
    this._guildCommandsHandlers = new Map();
    this._eventEmitter = new EventEmitter();
    this._client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
      ],
    });

    this._client.once('ready', () => {
      logger.info('Ready!');
    });

    this._client.on('messageCreate', async (message: Message) => {
      if (message.inGuild()) {
        this._handleMessage(message);
      }
    });
  }

  public start(): void {
    this._client.login(this._token);
  }

  private _handleMessage(message: Message<true>): void {
    const commandsHandler = this._getGuildCommandHandler(message.guildId);
    commandsHandler.joinChannel(message.channel);

    if (!this._validateMessage(message)) return;

    const args = message.content.substring(1).split(' ');

    const eventName = this._eventEmitter.findEventName(args[0]);
    if (!eventName) return;

    this._eventEmitter.emit(eventName, commandsHandler, message, args);
  }

  private _getGuildCommandHandler(guildId: string): CommandsHandler {
    if (!this._guildCommandsHandlers.has(guildId)) {
      const messageManager = new MessageManager(this._language);

      const player = new Player();
      const commandsHandler = new CommandsHandler(player, messageManager, this._client, this._bindsDirectory);
      this._guildCommandsHandlers.set(guildId, commandsHandler);
    }

    return this._guildCommandsHandlers.get(guildId)!;
  }

  private _validateMessage(message: Message): boolean {
    const channel = this._client.channels.cache.get(message.channelId);

    if (!channel) {
      return false;
    }

    if (!channel.isTextBased() || channel.isDMBased()) {
      return false;
    }

    const isSentOnCorrectChannel = channel.name === this._channelName;

    const hasPrefix = message.content[0] === this._prefix;

    return isSentOnCorrectChannel && hasPrefix;
  }
}
