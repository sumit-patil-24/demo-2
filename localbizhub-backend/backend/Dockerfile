FROM node:20-bookworm-slim
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh && chown -R node:node /app
USER node
EXPOSE 5000
CMD ["./docker-entrypoint.sh"]
