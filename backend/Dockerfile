FROM node:18-alpine

# Create app user (security)
RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

# Copy only package files first (better caching)
COPY package*.json ./

# Install only production deps
ENV NODE_ENV=production
RUN npm install --omit=dev

# Copy source code
COPY . .

# Use non-root user
USER app

EXPOSE 5000

CMD ["npm", "run", "start"]
