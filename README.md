# Discord Music Bot
Open-source music bot designed for Discord
## Table of contents
* [General info](#general-info)
* [Technologies](#technologies)
* [Features](#features)
* [Commands List](#commands-list)
* [TODO](#todo)
* [Preparation](#preparation)
* [Setup](#setup)
* [License](#license)

## General info
This project has been written to develop substitute for Groovy and Rythm bots which were closed due to YouTube ToS. The idea is that you can easily create and deploy music bot for your server.
	
## Technologies
Project is created with:
* Node version: 16.9.1
* Discord.js: 14.8.0
	
## Features
* Simple play/skip/disconnect interface with implementent songs queue
* Searching video by keywords
* Playing youtube playlist
* Playing binds uploaded on a server
* Multilanguage support, eng/pl builded in

## Commands List

| Command  | Arguments | Description |
| ------------- | ------------- | ------------- |
| play  | youtube link/keywords  | play song |
| bind | bind name | play bind (local file) |
| disconnect  | -  | disconnect from voice channel |
| skip | - | skip current song in player |
| clear | - | skip entire queue |
| queue | - | prints queue without current song |
| bind list | - | prints avaiable binds |
| help | - | print all commands with description |

## TODO
- [ ] Add seek, repeat commands
- [ ] Log programmer errors
- [ ] Refactor to TypeScript

## Preparation

- Create application on [Discord Developer portal](https://discord.com/developers/applications)
- Go to Bot section and create bot. Token is `DISCORD_TOKEN` in `.env` file. 
- Go to OAuth2 section and generate invitation link. Select `bot` and `applications.commands` from scopes list. 
- Add bot to your server using link generated in previous step. Remember, that your bot has to have permissions for reading and writing text messages on channel defined as `CHANNEL_NAME` in `.env` file.

**Read more about creating a bot application** - [[1]](https://discordjs.guide/preparations/setting-up-a-bot-application.html), [[2]](https://discordjs.guide/preparations/adding-your-bot-to-servers.html)

## Setup
To run application:
- Create `.env` file simillary to `.env-example`
- Add `.mp3` binds to selected folder, if you want to use spaces for playing use `-` sign as a separator
- Run `$ pnpm install`
- Run `$ pnpm run start`

## License
You can check out the full license [here](./LICENSE)

This project is licensed under the terms of **the MIT license**.
