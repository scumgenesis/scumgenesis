# Frontend (Vite dev server) para desenvolvimento com proxy para a API
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
# Proxy target será definido em runtime via VITE_PROXY_TARGET (ex: http://api:3000)
EXPOSE 5173

CMD ["npm", "run", "dev"]
