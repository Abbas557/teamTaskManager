# Railway Deployment Guide

Deploy this project as three Railway services:

1. PostgreSQL database
2. NestJS backend
3. React frontend

## 1. Push Code To GitHub

Railway deploys most easily from GitHub.

```bash
cd /Users/Abbas/Documents/Codex/2026-05-01/team-task-manager-full-stack-build
git init
git add .
git commit -m "Initial full-stack team task manager"
```

Create a GitHub repository, then push this folder.

## 2. Create Railway Project

In Railway:

1. Create a new project.
2. Add a PostgreSQL database.
3. Copy the generated `DATABASE_URL`.

## 3. Deploy Backend Service

Create a new Railway service from the GitHub repo.

Set the service root directory to:

```txt
backend
```

Set build command:

```bash
npm install && npm run build
```

Set start command:

```bash
npm run start:railway
```

Set backend environment variables:

```env
DATABASE_URL=<Railway Postgres DATABASE_URL>
JWT_SECRET=<a long random secret>
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

After deploy, generate a public domain for the backend.

Your backend health URL should look like:

```txt
https://your-backend.up.railway.app/api/health
```

## 4. Deploy Frontend Service

Create another Railway service from the same GitHub repo.

Set the service root directory to:

```txt
frontend
```

Set build command:

```bash
npm install && npm run build
```

Set start command:

```bash
npm run start
```

Set frontend environment variable:

```env
VITE_API_BASE_URL=https://your-backend.up.railway.app/api
```

After deploy, generate a public domain for the frontend.

## 5. Update Backend CORS

After the frontend has a Railway URL, update the backend `FRONTEND_URL`:

```env
FRONTEND_URL=https://your-frontend.up.railway.app,http://localhost:5173
```

Redeploy the backend service.

## 6. Seed Demo Data

Railway does not automatically run `npm run seed`.

You can seed once from the backend service shell:

```bash
npm run seed
```

Demo accounts:

```txt
admin@example.com / Admin1234
member@example.com / Member1234
```

## 7. Final Checks

Check:

- Backend health endpoint works.
- Frontend opens.
- Admin login works.
- Create project/task works.
- Member login works.
- Member can update assigned task status.
