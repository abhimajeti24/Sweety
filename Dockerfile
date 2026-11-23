# Two stages: the first installs everything and builds the React client, the second keeps only
# what the server needs at runtime plus the built client, and runs as the unprivileged node user.
# Debian slim (not Alpine) because bcrypt ships prebuilt binaries for glibc.

FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY server/package.json server/
COPY client/package.json client/
RUN npm ci
COPY shared shared
COPY client client
RUN npm run build -w client

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY server/package.json server/
COPY client/package.json client/
RUN npm ci --omit=dev && npm cache clean --force
COPY shared shared
COPY server server
COPY --from=build /app/client/dist client/dist
USER node
EXPOSE 4000
CMD ["npm", "start"]
