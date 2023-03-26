import { GuildTextBasedChannel } from 'discord.js';

import { ILanguages, LANGUAGES } from '../constants';
import { stringTemplateParser } from '../utils';

export default class MessageManager {
  private _messages: Record<string, string>;

  private _channel?: GuildTextBasedChannel;

  public constructor(language: string) {
    const messages: Record<string, string> | undefined = LANGUAGES[language as keyof ILanguages];

    if (!messages) throw new Error('Choosen language is incorrect! - Pick language from constants.js file');
    this._messages = messages;
  }

  public setChannel(channel: GuildTextBasedChannel): void {
    this._channel = channel;
  }

  public sendMessage(messageType:string, valueObj: Record<string, string> = {}): void {
    let message = this._messages[messageType];
    if (!message) {
      throw new Error('Unknown message!');
    }
    message = stringTemplateParser(message, valueObj);
    this._channel!.send(message);
  }
}
