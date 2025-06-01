FROM node:24 AS build-stage
WORKDIR /build
COPY frontend frontend
COPY backend backend

RUN npm --prefix backend run build:ui

FROM node:24
USER node
WORKDIR /app
COPY --from=build-stage /build/backend/build build
COPY --from=build-stage /build/backend/node_modules node_modules
COPY --from=build-stage /build/backend/dist dist
ENV NODE_ENV=production
CMD ["node", "build/index.js"]
