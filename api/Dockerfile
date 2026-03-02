# Produção: API Express (contexto: pasta api/)
FROM node:20-alpine

WORKDIR /app

# Dependências
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Código
COPY . .

# Usuário não-root
RUN addgroup -g 1001 -S app && adduser -u 1001 -S app -G app
USER app

EXPOSE 3000

ENV NODE_ENV=production
CMD ["node", "index.js"]
