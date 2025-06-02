# Restaurant Recruitment Platform Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Base image with Node.js
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
COPY .env .env
RUN npm ci

# Stage 2: Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create data directory and set permissions
RUN mkdir -p data public/uploads/resumes && \
    chmod 755 data public/uploads/resumes

# Initialize empty data files if they don't exist, but preserve jobs.json and config.json
RUN echo '[]' > data/applications.json && \
    echo '[]' > data/candidates.json && \
    echo '[]' > data/screenings.json

# Copy the existing jobs.json and config.json with their actual data
COPY data/jobs.json data/jobs.json
COPY data/config.json data/config.json

# Build the application
RUN npm run build

# Stage 3: Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Create a non-root user to run the application
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the public folder from the project as it contains static assets
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/dist/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/dist/static ./dist/static

# Copy data directory and set proper permissions
COPY --from=builder --chown=nextjs:nodejs /app/data ./data

# Copy environment file
COPY --from=builder --chown=nextjs:nodejs /app/.env ./.env

# Create uploads directory with proper permissions
RUN mkdir -p public/uploads/resumes && \
    chown -R nextjs:nodejs public/uploads && \
    chmod -R 755 public/uploads

USER nextjs

# Expose the port the app runs on
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
