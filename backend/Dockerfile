# Backend Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Make init script executable
RUN chmod +x scripts/init-docker.sh

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3001

# Create entrypoint script
RUN echo '#!/bin/bash\n\
echo "🚀 Starting NGBilling Backend..."\n\
\n\
# Run database initialization in background\n\
./scripts/init-docker.sh &\n\
\n\
# Wait a bit for initialization\n\
sleep 10\n\
\n\
# Start the main application\n\
exec npm start\n\
' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Start the app with initialization
CMD ["/app/entrypoint.sh"] 