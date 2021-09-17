import dotenv from 'dotenv';
import App from './app.js';

dotenv.config();

const token = process.env.DISCORD_TOKEN;

const app = new App(token);

app.start();
