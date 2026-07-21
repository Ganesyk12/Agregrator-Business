FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY prisma/ ./prisma/
RUN npx prisma generate

COPY . .

RUN mkdir -p public/uploads

EXPOSE 3000

CMD ["npx", "tsx", "server/index.ts"]
