FROM node:18-alpine

WORKDIR /usr/src/app

RUN npm install -g pnpm

RUN apk add g++ make py3-pip

COPY package.json ./

COPY pnpm-lock.yaml ./

ENV NODE_ENV=production

RUN pnpm i --prod

COPY . .

CMD [ "pnpm", "start"]