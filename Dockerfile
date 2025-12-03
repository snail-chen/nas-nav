# Stage 1: Build the React application
FROM node:18-alpine as build

WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Setup Node.js Server
FROM node:18-alpine

# Install Nmap for network scanning
RUN apk add --no-cache nmap

WORKDIR /app

# Copy server package.json
COPY server/package.json ./package.json

# Install server dependencies
RUN npm install --production

# Copy server code
COPY server/server.js ./server.js

# Copy React build output to dist (server expects it in ../dist relative to server.js)
# Our server.js is at /app/server.js, so it expects /app/dist
# But in code: path.join(__dirname, '../dist')
# If server.js is at /app/server.js, then ../dist is /dist.
# Let's adjust structure.
# We will put server.js in /app/server/server.js and dist in /app/dist

WORKDIR /app
COPY --from=build /app/dist ./dist
COPY server ./server

# Install server deps
WORKDIR /app/server
RUN npm install --production

# Create data directory
RUN mkdir -p data

# Volume for persistence
VOLUME ["/app/server/data"]

# Expose port
EXPOSE 3000

# Start Server
CMD ["node", "server.js"]
