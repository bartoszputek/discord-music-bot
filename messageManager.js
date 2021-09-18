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

  message() {
    const message = stringTemplateParser('es');
    this.channel.send(message);
  }
}

function stringTemplateParser(expression, valueObj = {}) {
  const templateMatcher = /{{\s?([^{}\s]*)\s?}}/g;
  const text = expression.replace(templateMatcher, (substring, value) => valueObj[value]);
  return text;
}
