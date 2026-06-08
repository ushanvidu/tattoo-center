# ── Tattoo Center — Frontend (React + Vite) ────────────────────────────────
# Stage 1: build the static site
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

# Vite inlines VITE_* variables at BUILD time, so they must be passed as build args.
# Leave VITE_API_URL empty to use the relative "/api" path proxied by Nginx (compose).
# Set it to an absolute URL (e.g. https://api.yourshop.com) for a split deployment.
ARG VITE_API_URL=""
ARG VITE_SUPABASE_URL=""
ARG VITE_SUPABASE_ANON_KEY=""
ARG VITE_ADMIN_KEY=""
ENV VITE_API_URL=$VITE_API_URL \
    VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_ADMIN_KEY=$VITE_ADMIN_KEY

RUN npm run build

# Stage 2: serve with Nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
