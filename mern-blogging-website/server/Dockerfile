# Backend Dockerfile
FROM node:18-alpine

# Install Python, build tools, and ca-certificates for native dependencies
RUN apk add --no-cache python3 make g++ ca-certificates

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build, then we'll prune later)
RUN npm install

# Remove dev dependencies
RUN npm prune --production

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads/images

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
