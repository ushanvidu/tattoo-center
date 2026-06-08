# ── Tattoo Center — Backend API ────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# Install production dependencies only (uses package-lock.json for reproducible builds)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Ensure the uploads directory exists and is owned by the non-root user.
# NOTE: container disk is ephemeral — mount a volume (compose) or use object
# storage (S3 / Supabase Storage) in production so uploads survive redeploys.
RUN mkdir -p public/uploads && chown -R node:node /app

USER node
EXPOSE 5000

CMD ["node", "server.js"]
