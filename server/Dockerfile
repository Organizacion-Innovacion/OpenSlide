FROM node:20-alpine

WORKDIR /app

# Instalar dependencias primero (cache layer)
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar código fuente
COPY . .

# Crear directorios persistentes
RUN mkdir -p /app/slides /app/config

EXPOSE 3001

CMD ["node", "index.js"]
