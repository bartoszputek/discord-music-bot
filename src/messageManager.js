import { LANGUAGES } from './constants.js';
import { stringTemplateParser } from './utils.js';

export default class MessageManager {
  constructor(language) {
    const messages = LANGUAGES[language];
    if (!messages) throw new Error('Choosen language is incorrect! - Pick language from constants.js file');
    this.messages = messages;
  }

  setChannel(channel) {
    this.channel = channel;
  }

  message(messageType, valueObj) {
    let message = this.messages[messageType];
    if (!message) {
      throw new Error('Unknown message!');
    }
    message = stringTemplateParser(message, valueObj);
    this.channel.send(message);
  }
}
