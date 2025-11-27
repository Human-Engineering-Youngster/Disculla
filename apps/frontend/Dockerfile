FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy frontend package.json
COPY apps/frontend/package.json ./apps/frontend/

# Copy source code (needed for proper workspace setup)
COPY . .

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Set working directory to frontend
WORKDIR /app/apps/frontend

EXPOSE 3000

CMD ["pnpm", "dev"]
