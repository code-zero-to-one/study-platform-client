# 운영환경(main branch)에서 사용하는 Dockerfile

# 1단계: build
FROM node:18-alpine AS builder
WORKDIR /app

COPY . .

RUN yarn install && yarn build

# 2단계: production
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock

# devDependencies는 설치하지 않고 dependencies만 설치
RUN yarn install --production 

EXPOSE 3000

CMD ["yarn", "start"]