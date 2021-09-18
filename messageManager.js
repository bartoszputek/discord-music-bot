import { LANGUAGES } from './constants.js';

export default class MessageManager {
  constructor(language) {
    const messages = LANGUAGES[language];
    if (!messages) throw new Error('Choosen language is incorrect!');
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
    message = MessageManager.stringTemplateParser(message, valueObj);
    this.channel.send(message);
  }

  static stringTemplateParser(expression, valueObj = {}) {
    const templateMatcher = /{{\s?([^{}\s]*)\s?}}/g;
    const text = expression.replace(templateMatcher, (substring, value) => valueObj[value]);
    return text;
  }
}
