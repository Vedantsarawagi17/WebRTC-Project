# Use the official Node.js image (predictable environment)
FROM node:20

# Create the folder where your code will live inside the container
WORKDIR /usr/src/app

# Copy package files first to cache the 'npm install' step (faster builds)
COPY package*.json ./

# Install all dependencies (including React 19 fix if needed)
RUN npm install --legacy-peer-deps

# Copy the rest of your backend code
COPY . .

# WebRTC/Socket.io servers usually need a consistent port. 
# Render uses 10000 by default.
EXPOSE 10000

# The command to start your server
CMD ["node", "server.js"]