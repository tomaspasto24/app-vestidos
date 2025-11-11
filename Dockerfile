# --- Development Dockerfile ---
FROM node:18-alpine

WORKDIR /app

# Install dependencies first (cached layer)
COPY package.json package-lock.json* yarn.lock* ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Run in dev mode (hot reload)
CMD ["npm", "run", "dev"]
