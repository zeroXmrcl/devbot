# Use an LTS Node image
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install deps first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy app source
COPY . .
ENV NODE_ENV=production
# Set environment (configure at runtime via env vars or Docker secrets)
# Example:
# ENV NODE_ENV=production

# If your bot needs timezone/CA certs, uncomment:
# RUN apk add --no-cache tzdata ca-certificates

# Default command
CMD ["npm", "start"]