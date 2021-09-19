import dotenv from 'dotenv';

import App from './app.js';
import logger from './logger.js';

dotenv.config();

const token = process.env.DISCORD_TOKEN;
const language = process.env.LANGUAGE;
const prefix = process.env.PREFIX;
const channelName = process.env.CHANNEL_NAME;

const app = new App(token, language, prefix, channelName, logger);

app.start();
