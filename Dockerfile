FROM node:18-slim

# Install Python 3 + pip
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-pip && \
    ln -sf /usr/bin/python3 /usr/bin/python && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY python/requirements.txt ./python/requirements.txt
RUN pip3 install --break-system-packages --no-cache-dir -r python/requirements.txt

# Install Node dependencies
COPY backend/package.json ./backend/package.json
WORKDIR /app/backend
RUN npm install --omit=dev

# Copy source code
WORKDIR /app
COPY python/ ./python/
COPY backend/ ./backend/

# Expose port
EXPOSE 3000

# Start server
WORKDIR /app/backend
CMD ["node", "server.js"]
