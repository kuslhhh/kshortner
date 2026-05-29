# KShortner

A URL shortener service built from scratch to learn system design concepts.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | [Bun](https://bun.sh) |
| Language | TypeScript |
| Framework | [Express](https://expressjs.com/) |
| Database | PostgreSQL 16 |
| ORM | [Prisma](https://www.prisma.io/) |
| API Docs | [Scalar](https://scalar.com/) |
| Proxy | Nginx |

## Architecture

```
                        +----------+
                        |  Client  |
                        +-----+----+
                              |
                              | :80
                              v
                      +-------+--------+
                      |    Nginx       |
                      | (reverse proxy)|
                      +-------+--------+
                              |
                              | :5000
                              v
                      +-------+--------+
                      |   Express App  |
                      |  (Bun runtime) |
                      +-------+--------+
                              |
                              | :5432
                              v
                      +-------+--------+
                      |   PostgreSQL   |
                      +----------------+
```

- Short codes are deterministic: the auto-increment database `id` is encoded into a base-26 lowercase alphabetic string (`1 → a`, `2 → b`, `27 → aa`).
- Custom short codes are supported. If the code is already taken, the API returns `409 Conflict`.
- Click tracking: each redirect increments a visit counter.

## Project Structure

```
├── docker-compose.yml        # Orchestrates postgres, backend, nginx
├── nginx/
│   └── nginx.conf            # Reverse proxy configuration
├── server/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── openapi.yaml          # OpenAPI 3.0.3 specification
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── migrations/       # Database migrations
│   └── src/
│       ├── index.ts          # App entry point
│       ├── lib/prisma.ts     # Prisma client singleton
│       ├── middleware/       # Request logging
│       ├── controllers/      # Route handlers
│       ├── services/         # Business logic
│       ├── routes/           # Express routers
│       └── utils/            # Short code encoder
└── client/                   # Future frontend
```

## Quick Start

### Docker Compose (recommended)

```bash
docker compose up --build
```

This starts three services:
- **PostgreSQL** on `:5432`
- **Backend** on `:5000`
- **Nginx** on `:80`

### Local Development

```bash
cd server
bun install
cp .env.example .env   # Configure DATABASE_URL
bunx prisma generate
bunx prisma migrate deploy
bun run dev
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | — | PostgreSQL connection string |
| `PORT` | `5000` | Server port |
| `BASE_URL` | `http://localhost:5000` | Public base URL for short links |

## API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/url/shorten` | Create a short URL |
| `GET` | `/:shortCode` | Redirect to original URL |
| `GET` | `/docs` | Interactive API docs (Scalar) |
| `GET` | `/openapi.yaml` | Raw OpenAPI spec |

### Create a short URL

```bash
curl -X POST http://localhost:5000/api/url/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

Response:

```json
{
  "success": true,
  "data": {
    "shortCode": "a",
    "originalUrl": "https://example.com",
    "shortUrl": "http://localhost:5000/a"
  }
}
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start with hot-reload |
| `bun run start` | Start in production mode |
| `bunx prisma studio` | Open Prisma Studio (DB GUI) |
