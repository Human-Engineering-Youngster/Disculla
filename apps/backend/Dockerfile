FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy backend package.json
COPY apps/backend/package.json ./apps/backend/

# Copy source code (needed for proper workspace setup)
COPY . .

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Set working directory to backend
WORKDIR /app/apps/backend

EXPOSE 8080

CMD ["pnpm", "start:dev"]
