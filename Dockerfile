FROM node:20-alpine AS build
WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install ALL dependencies (including dev)
RUN npm ci

# Copy rest of the code
COPY . .

# Ensure vite is executable
RUN chmod +x node_modules/.bin/vite

# Run Vite build
RUN npm run build

# --- Production image ---
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
