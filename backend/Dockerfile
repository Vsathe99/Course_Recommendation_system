FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# ✅ Install ALL deps (including nodemon)
RUN npm install

# Copy source
COPY . .

EXPOSE 5000

# ✅ Run dev server
CMD ["npm", "run", "dev"]
