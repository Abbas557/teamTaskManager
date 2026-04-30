# Team Task Manager Backend

NestJS REST API for the Team Task Manager app.

## Setup

```bash
npm install
cp .env.example .env
docker compose up -d
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

## API Prefix

All routes are prefixed with:

```txt
/api
```

## Demo Seed Users

After running `npm run seed`:

```txt
admin@example.com / Admin1234
member@example.com / Member1234
```

## Architecture

Every feature follows:

```txt
Controller -> Service -> DAO -> Database
```

Controllers handle HTTP, services handle business rules, and DAOs handle Prisma calls only.
