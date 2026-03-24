FROM node:22-alpine AS builder

WORKDIR /app

# 1. 프론트엔드 종속성 설치 및 빌드
COPY src/client/package*.json ./src/client/
RUN cd src/client && npm install

COPY src/client/ ./src/client/
RUN cd src/client && npm run build

# 2. 백엔드 구성 (production 환경)
FROM node:22-alpine

WORKDIR /app

# 프론트엔드 빌드 결과물(dist) 복사
COPY --from=builder /app/src/client/dist ./src/client/dist

# 백엔드 종속성 설치 (devDependency 제외)
COPY src/server/package*.json ./src/server/
RUN cd src/server && npm install --production

# 백엔드 소스코드 복사
COPY src/server/ ./src/server/

ENV NODE_ENV=production
# Google Cloud Run은 기본적으로 8080 포트를 사용합니다.
ENV PORT=8080
EXPOSE 8080

CMD ["node", "src/server/index.js"]
