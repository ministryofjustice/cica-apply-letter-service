FROM node:22.8.0-bookworm-slim AS base
WORKDIR /app
ENV NODE_ENV=production

# Install tini for better signal handling
RUN apt-get update && apt-get install -y --no-install-recommends tini \
    && rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["/usr/bin/tini", "--"]

############################
# Development image
############################
FROM base AS dev
ENV NODE_ENV=development

# Install all dependencies (including dev)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]

############################
# Test image
############################
FROM dev AS test
ENV NODE_ENV=test CI=true
# Run Jest tests (fail build if tests fail)
RUN npm test

############################
# Production image
############################
FROM base AS prod
WORKDIR /app
ENV NODE_ENV=production

# Copy package files and install only prod dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built app code (from dev stage)
COPY --from=dev /app ./

# Drop privileges
RUN useradd --create-home --shell /bin/bash appuser && chown -R appuser /app
USER appuser

EXPOSE 3000

# Simple healthcheck for /health
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health',r=>{if(r.statusCode!==200)process.exit(1)}).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
