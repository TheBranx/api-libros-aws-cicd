# Builder (Instalación limpia de dependencias de producción)
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY app.js server.js db.js ./

# Runtime ligero
FROM node:20-alpine
WORKDIR /usr/src/app

# Entorno de producción
ENV NODE_ENV=production
ENV PORT=3000

# Copia de artefactos mínimos desde la etapa builder
COPY --from=builder /usr/src/app ./

# Usuario sin privilegios por seguridad
USER node

# Exposición del puerto interno (3000)
EXPOSE 3000

# Comando de inicio del servidor
CMD ["node", "server.js"]
