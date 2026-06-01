# --- Build Stage ---
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dev dependencies
RUN npm install

# Copy Prisma schema and config
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Generate Prisma Client
RUN npx prisma generate

# Copy configuration and source files
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src

# Build the application
RUN npm run build

# --- Production Stage ---
FROM node:20-alpine

# Install openssl for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy Prisma schema and config
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Generate Prisma Client for the production environment
RUN npx prisma generate

# Copy compiled application from build stage
COPY --from=build /app/dist ./dist

# Expose the default NestJS port
EXPOSE 3000

# Run migrations and seed data, then start the server
CMD ["sh", "-c", "node -e \"const net = require('net'); const check = () => { const client = new net.Socket(); client.connect(5432, 'db', () => { console.log('DB is ready'); process.exit(0); }); client.on('error', () => { console.log('Waiting for DB...'); setTimeout(check, 1000); }); }; check();\" && npx prisma migrate deploy && npx prisma db seed && node dist/src/main.js"]
