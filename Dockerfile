# Build stage
FROM node:20.11-alpine AS builder

WORKDIR /app

# Install dependencies for build
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json ./

# Show Node.js version for debugging
RUN node --version && npm --version

# Install ALL dependencies (including dev dependencies for build)
RUN npm ci --verbose

# Copy source code
COPY . .

# Set NODE_ENV for build
ENV NODE_ENV=production

# Build the app and verify the output
RUN npm run build && ls -la dist/

# Production stage
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create a simple health check
RUN echo "healthy" > /usr/share/nginx/html/health

# Expose port
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 