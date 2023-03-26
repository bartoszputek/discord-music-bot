FROM node:18-alpine AS builder
WORKDIR /usr/src/app
RUN npm install -g pnpm
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig*.json ./
COPY src src
RUN pnpm i
RUN pnpm build

FROM node:18-alpine
WORKDIR /usr/src/app
RUN npm install -g pnpm
RUN apk add --no-cache g++ make py3-pip
COPY package.json ./
COPY pnpm-lock.yaml ./
ENV NODE_ENV=production
COPY --from=builder /usr/src/app/dist /dist
RUN pnpm i --prod
COPY . .
CMD [ "pnpm", "start"]