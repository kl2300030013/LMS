# --- Build Stage ---
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files for caching
COPY package*.json ./

# Install all dependencies (including dev for Vite)
RUN npm ci

# Copy source code
COPY . .

# Ensure vite is executable (fix permission issues)
RUN chmod +x node_modules/.bin/vite

# Build frontend
RUN npm run build

# --- Production Stage ---
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
