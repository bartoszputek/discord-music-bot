FROM node:16-alpine

WORKDIR /usr/src/app

RUN apk add g++ make py3-pip

COPY package*.json ./

RUN npm ci --only=production

COPY . .

CMD [ "npm", "run", "start"]