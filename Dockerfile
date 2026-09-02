FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/.output ./

ENV HOST=0.0.0.0
ENV PORT=3000
ENV NUXT_APP_BASE_URL=/
ENV NUXT_PUBLIC_TENANT_CODE=joyshop
ENV NUXT_PUBLIC_TENANT_ID=3

EXPOSE 3000

CMD ["node", "server/index.mjs"]
