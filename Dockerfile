# syntax=docker/dockerfile:1.6

FROM node:22.8.0-bookworm-slim AS deps
WORKDIR /usr/src/app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev


FROM node:22.8.0-bookworm-slim AS runtime
WORKDIR /usr/src/app

ENV NODE_ENV=production

# Create non-root user
RUN groupadd -g 1014 dc_user \
  && useradd -m -u 1015 -g 1014 -s /usr/sbin/nologin dc_user

# Copy node_modules from deps stage
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Copy app source
COPY . .

RUN chown -R 1015:1014 /usr/src/app

USER 1015

EXPOSE 3300

# No CMD: Kubernetes supplies the command for API vs Worker
