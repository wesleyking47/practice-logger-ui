# Build stage using Bun for fast installs and builds
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies using Bun
FROM base AS install
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Build the application using Bun
FROM base AS build
COPY --from=install /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Production stage using Node.js 24 for React Router compatibility
FROM node:24-slim AS production

WORKDIR /app

# Copy built application and node_modules from build stage
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

# Expose the port the app runs on
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "run", "start"]
