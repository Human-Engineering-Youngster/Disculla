FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy frontend package.json
COPY apps/frontend/package.json ./apps/frontend/

# Install dependencies
RUN pnpm install --filter frontend --frozen-lockfile

# Copy source code
COPY . .

# Set working directory to frontend
WORKDIR /app/apps/frontend

EXPOSE 3000

CMD ["pnpm", "dev"]
