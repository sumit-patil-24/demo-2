# ---- stage 1: build the React app ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Baked in at build time. /api is routed to the backend by Nginx, so no CORS and no hard-coded host.
ARG VITE_API_BASE_URL=/api
ARG VITE_DEMO_MODE=false
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL VITE_DEMO_MODE=$VITE_DEMO_MODE
RUN npm run build

# ---- stage 2: Nginx (non-root image) serves the SPA and reverse-proxies the API ----
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/nginx-health || exit 1
