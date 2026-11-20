FROM node:20-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY app.js server.js db.js ./

FROM node:20-alpine
WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /usr/src/app ./

USER node

EXPOSE 3000

CMD ["node", "server.js"]
