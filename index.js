import dotenv from 'dotenv';
import App from './app.js';

dotenv.config();

const token = process.env.DISCORD_TOKEN;
const language = process.env.LANGUAGE;

const app = new App(token, language);

app.start();
