FROM node:20-alpine

RUN apk add --no-cache curl
WORKDIR /app

# Copy manifests first (for layer caching)
COPY package*.json ./

# If this folder has a package-lock.json, use npm ci; otherwise fall back to npm install
# (Render logs will show which one runs)
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# Copy the rest of the app (NOT just server.mjs)
COPY . .

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Your server should serve GET /healthz with 200
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -fsS http://localhost:${PORT}/healthz || exit 1

# IMPORTANT in your server code:
# app.listen(process.env.PORT || 8080, '0.0.0.0', () => console.log('up'));

CMD ["node", "server-render.mjs"]

