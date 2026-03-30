# ── Stage 1: Build React app with Vite ───────────────────────────────────────
FROM node:18-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# BASE_PATH controls both:
#   1. Vite's `base` option → correct asset URLs in the built HTML (e.g. /sqlbloques/assets/...)
#   2. The nginx location prefix (set at runtime via docker-entrypoint.sh)
# Default is / (app served at the domain root).
ARG BASE_PATH=/
RUN VITE_BASE_PATH=${BASE_PATH} npm run build

# ── Stage 2: Serve with Nginx ─────────────────────────────────────────────────
FROM nginx:alpine

# Copy built static files
COPY --from=build /app/build /usr/share/nginx/html

# nginx config template — BASE_PATH is substituted at container startup
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template

# Entrypoint: normalises BASE_PATH and runs envsubst before starting nginx
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
