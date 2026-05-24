FROM oven/bun:1

WORKDIR /app

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

COPY package.json bun.lock ./

RUN bun install

COPY prisma ./prisma
COPY prisma.config.ts ./

RUN bunx prisma generate

COPY . .

EXPOSE 5000

CMD ["bun", "run", "start"]
