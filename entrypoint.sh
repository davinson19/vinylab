#!/bin/sh

# Start Nginx in the background
nginx -g "daemon off;" &

# Resolve DB host and port from DATABASE_URL if present, otherwise default to db:5432
node -e "
const net = require('net');
const url = require('url');

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@db:5432/vinylab';
let host = 'db';
let port = 5432;

try {
  const parsed = new url.URL(dbUrl);
  host = parsed.hostname || host;
  port = parsed.port || port;
} catch (e) {
  const match = dbUrl.match(/@([^:/]+):?(\d+)?/);
  if (match) {
    host = match[1];
    if (match[2]) port = parseInt(match[2]);
  }
}

console.log('Waiting for DB to start at ' + host + ':' + port + '...');
const check = () => {
  const client = new net.Socket();
  client.connect(port, host, () => {
    console.log('DB is ready');
    process.exit(0);
  });
  client.on('error', (err) => {
    console.log('Waiting for DB... (' + err.message + ')');
    setTimeout(check, 1000);
  });
};
check();
"

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Seed database
echo "Seeding database..."
npx prisma db seed

# Start NestJS backend in the foreground
echo "Starting NestJS backend..."
node dist/src/main.js