FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY server.mjs ./
ENV BING_API_KEY=""
CMD ["node", "server.mjs"]
