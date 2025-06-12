# Dockerfile for Expo Web (React Native for Web)
FROM node:20-alpine

# Avoid issues with OpenSSL used in some expo modules
ENV NODE_OPTIONS=--openssl-legacy-provider

WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy app source code
COPY . .

# Expo Web runs on port 19006
EXPOSE 19006

# Run Expo Web in non-interactive mode (CI/CD friendly)
CMD ["npx", "expo", "start", "--web", "--non-interactive"]
