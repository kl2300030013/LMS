FROM node:20-alpine

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy backend source code
COPY . .

# Set environment
ENV NODE_ENV=production
EXPOSE 3001

# Start backend server
CMD ["node", "server.js"]
