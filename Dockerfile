# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY vinylab_frontend/package*.json ./
RUN npm install
COPY vinylab_frontend/ ./
ENV VITE_API_URL=""
RUN npm run build

# --- Stage 2: Build Backend ---
FROM node:20-alpine AS backend-build
WORKDIR /app
COPY vinylab_backend/package*.json ./
RUN npm install
COPY vinylab_backend/prisma ./prisma/
COPY vinylab_backend/prisma.config.ts ./
RUN npx prisma generate
COPY vinylab_backend/tsconfig*.json ./
COPY vinylab_backend/nest-cli.json ./
COPY vinylab_backend/src ./src
RUN npm run build

# --- Stage 3: Production ---
FROM node:20-alpine
RUN apk add --no-cache nginx openssl

WORKDIR /app

# Copy backend dependency configuration
COPY vinylab_backend/package*.json ./
RUN npm install --omit=dev

# Copy Prisma files and generate client for production
COPY vinylab_backend/prisma ./prisma/
COPY vinylab_backend/prisma.config.ts ./
RUN npx prisma generate

# Copy compiled backend application
COPY --from=backend-build /app/dist ./dist

# Copy compiled frontend static files to Nginx web root
COPY --from=frontend-build /app/dist /var/www/html

# Copy configuration files
COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh /entrypoint.sh
RUN apk add --no-cache dos2unix && dos2unix /entrypoint.sh && chmod +x /entrypoint.sh

# Expose port 80 (Nginx port)
EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
