# Strapi (production build) for local review via docker compose and for CI.
# Pinned to the same Node/npm as development so `allowScripts` in package.json is honored.
FROM node:26.11-bookworm-slim AS deps
WORKDIR /opt/app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:26.11-bookworm-slim AS build
WORKDIR /opt/app
ENV NODE_ENV=production
COPY --from=deps /opt/app/node_modules ./node_modules
COPY . .
RUN npm run build && npm prune --omit=dev --no-audit --no-fund

FROM node:26.11-bookworm-slim AS runtime
WORKDIR /opt/app
ENV NODE_ENV=production
COPY --from=build --chown=node:node /opt/app ./
USER node
EXPOSE 1337
HEALTHCHECK --interval=10s --timeout=5s --start-period=60s --retries=12 \
  CMD node -e "fetch('http://127.0.0.1:1337/_health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["npm", "run", "start"]
