# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependency files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the project
COPY . .

# Ensure vite has execute permission (sometimes needed on Windows/WSL)
RUN chmod +x node_modules/.bin/vite

# Run build
RUN npm run build

# --- Production stage ---
FROM nginx:alpine

# Copy built files to nginx html folder
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 for container
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
