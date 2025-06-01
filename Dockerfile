FROM node:24 AS build-stage
WORKDIR /build
COPY frontend frontend
COPY backend backend
RUN npm --prefix backend run build:ui

FROM node:24-alpine
USER node
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build-stage /build/backend/build build
COPY --from=build-stage /build/backend/package*.json .
COPY --from=build-stage /build/backend/dist dist
RUN npm ci
CMD ["node", "build/index.js"]
