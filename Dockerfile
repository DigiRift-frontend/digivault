FROM node:20-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

COPY . .

RUN mkdir -p data uploads

VOLUME ["/app/data", "/app/uploads"]

ENV NODE_ENV=production
ENV PORT=3000
# ADMIN_PASSWORD and SESSION_SECRET must be provided at runtime
# e.g. docker run -e ADMIN_PASSWORD=... -e SESSION_SECRET=...

EXPOSE 3000

CMD ["node", "server.js"]
