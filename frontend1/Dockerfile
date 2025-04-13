# Use an official Node.js runtime
FROM node:22

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy .env file explicitly
COPY .env .

# Install crypto-browserify if needed
RUN npm install crypto-browserify

# Copy the rest of your code
COPY . .

# Patch vite to expose host
RUN sed -i 's/"dev": "vite"/"dev": "vite --host"/' package.json

EXPOSE 5173

CMD ["npm", "run", "dev"]
