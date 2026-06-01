# --- Build Stage ---
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy configuration and source files
COPY eslint.config.js ./
COPY index.html ./
COPY vite.config.js ./
COPY src ./src

# Set build argument for backend API URL (Vite compiles this at build-time)
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build the production bundle
RUN npm run build

# --- Production Stage ---
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts to nginx static asset directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
