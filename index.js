import { Client, Intents } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';

import dotenv from 'dotenv';
import { CHANNEL_NAME, PREFIX, COMMANDS } from './constants.js';
import Player from './player.js';

dotenv.config();

const token = process.env.DISCORD_TOKEN;

const player = new Player();

const client = new Client(
  {
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_VOICE_STATES,
    ],
  },
);

client.login(token);

client.once('ready', () => {
  console.log('Ready!');
});

client.on('messageCreate', (message) => {
  const channelName = client.channels.cache.get(message.channelId).name;

  if (channelName !== CHANNEL_NAME) {
    return;
  }

  const hasPrefix = message.content[0] === PREFIX;

  if (!hasPrefix) {
    return;
  }

  if (!message.member.voice.channelId) {
    message.channel.send('Dołącz na kanał głosowy!');
    return;
  }

  const args = message.content.substring(1).split(' ');

  if (COMMANDS.play.includes(args[0])) {
    message.channel.send(player.addToQueue(args[1]));

    if (player.queue.length === 1) {
      player.join(client.channels.cache.get(message.member.voice.channelId));
    }
  }

  if (COMMANDS.skip.includes(args[0])) {
    message.channel.send(player.dequeue());
  }

  if (COMMANDS.disconnect.includes(args[0])) {
    const connection = getVoiceConnection(message.member.voice.guild.id);
    connection.destroy();
  }
});
