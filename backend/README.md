# Contract Management — Backend

Node.js + Express REST API with PostgreSQL (via Prisma ORM).

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in your values
cp .env.example .env

# 3. Run database migrations
npx prisma migrate deploy

# 4. Start the development server
npm run dev
```

Server runs on `http://localhost:5001` by default.

## Documentation

All API routes are documented in [`docs/`](./docs):

| File | Description |
|---|---|
| [`docs/API.md`](./docs/API.md) | Human-readable reference — routes, request/response shapes, error codes, business rules |
| [`docs/openapi.yaml`](./docs/openapi.yaml) | OpenAPI 3.0.3 spec — import into Postman or open in Swagger UI |

### Import into Postman

1. Open Postman → **Import**
2. Select `backend/docs/openapi.yaml`
3. All 13 routes are generated as a ready-to-use collection

### View in Swagger UI (optional)

```bash
npx @redocly/cli preview-docs docs/openapi.yaml
```

## Database (Prisma)

```bash
# Open visual database browser
npx prisma studio

# Generate Prisma client after schema changes
npx prisma generate

# Create and apply a new migration
npx prisma migrate dev --name <migration-name>
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon (hot reload) |
| `npm start` | Start in production mode |
| `npm test` | Run Jest test suite |
| `npm run lint` | Run ESLint |
