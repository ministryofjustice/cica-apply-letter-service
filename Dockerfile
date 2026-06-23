# syntax=docker/dockerfile:1.6

FROM node:22-bookworm-slim@sha256:d9f850096136edbc402debdd8729579a288aac64574ada0ff4db26b6ae58b0b2 AS deps
WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts \
  && npm cache clean --force


FROM node:22-bookworm-slim@sha256:d9f850096136edbc402debdd8729579a288aac64574ada0ff4db26b6ae58b0b2 AS runtime
WORKDIR /usr/src/app

ENV NODE_ENV=production

# Create non-root user && remove npm from the runtime package
RUN groupadd -g 1014 dc_user \
  && useradd -m -u 1015 -g 1014 -s /usr/sbin/nologin dc_user \
  && rm -rf /usr/local/lib/node_modules/npm \
  && rm -f /usr/local/bin/npm /usr/local/bin/npx

# Copy node_modules from deps stage
COPY --from=deps /usr/src/app/node_modules ./node_modules

COPY package.json ./
COPY main ./main
COPY worker ./worker

RUN chown -R 1015:1014 /usr/src/app

USER 1015

EXPOSE 3300

# No CMD: Kubernetes supplies the command for API vs Worker
