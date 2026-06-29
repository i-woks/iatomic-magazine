# iAtomic full-stack PandaStack container
# Frontend: React/Vite. Backend: Node.js/TypeScript. AI worker: Python. Text processor: Go.

FROM golang:1.22-bookworm AS go-build
WORKDIR /src/server/go
COPY server/go/go.mod ./
COPY server/go/cmd ./cmd
RUN go build -o /out/processor ./cmd/processor

FROM node:20-bookworm AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/package.json
COPY api/package.json ./api/package.json
COPY server/package.json ./server/package.json
RUN npm ci
COPY frontend ./frontend
COPY server ./server
COPY package.json package-lock.json ./
ENV VITE_API_URL=
ENV VITE_ADMIN_BASE_PATH=/control/iatomic-panel
RUN npm run build -w frontend && npm run build -w server

FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=9999
ENV PUBLIC_DIR=/app/public
ENV PYTHON_BIN=python3
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY server/package.json ./package.json
RUN npm install --omit=dev
COPY --from=build /app/server/dist ./dist
COPY --from=build /app/server/python ./python
COPY --from=build /app/frontend/dist ./public
COPY --from=go-build /out/processor ./go/processor
EXPOSE 9999
CMD ["node", "dist/index.js"]
