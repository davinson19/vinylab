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

# Copy compiled frontend static files to backend public folder
COPY --from=frontend-build /app/dist ./public

# Expose port 3000 (NestJS port)
EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/src/main.js"]

