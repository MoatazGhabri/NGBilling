# Frontend Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Start the app in development mode
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 