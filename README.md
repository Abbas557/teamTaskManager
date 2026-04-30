# Team Task Manager

A full-stack team task management application for creating projects, managing team members, assigning tasks, tracking progress, and enforcing role-based access between admins and members.

The project is built with a modular NestJS backend that follows the DAO pattern and a React frontend designed for a clean project-management workflow.

## Features

- User signup and login with JWT authentication
- Global roles: `ADMIN` and `MEMBER`
- Project creation and project ownership
- Project member management
- Project-specific roles: `ADMIN` and `MEMBER`
- Task creation, assignment, editing, deletion, and status tracking
- Member-safe permissions:
  - Members can view project tasks.
  - Members can update status for tasks assigned to them.
  - Members cannot edit task title, assignee, description, due date, or priority unless they are project admins.
- Dashboard with task totals, progress, overdue count, and project overview
- Admin user management
- PostgreSQL database with Prisma ORM
- Railway-ready deployment setup

## Tech Stack

### Backend

- NestJS
- TypeScript
- PostgreSQL
- Prisma
- JWT authentication
- Passport JWT strategy
- bcrypt password hashing
- class-validator / class-transformer

### Frontend

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- React Hook Form
- Zod
- Lucide icons

### Local Infrastructure

- Docker Compose
- PostgreSQL container
- Prisma Studio for database browsing

## Architecture

The backend strictly follows this flow:

```txt
Controller -> Service -> DAO -> Database
```

Responsibilities are separated as follows:

- Controllers handle HTTP routes, request DTOs, and response flow.
- Services handle business rules, authorization checks, and validation flow.
- DAOs handle Prisma/database access only.
- DAOs do not contain authorization or business logic.
- Controllers do not call DAOs directly.

## Project Structure

```txt
team-task-manager-full-stack-build/
  backend/
    prisma/
      migrations/
      schema.prisma
      seed.ts
    src/
      auth/
      users/
      projects/
      project-members/
      tasks/
      dashboard/
      common/
      database/
  frontend/
    src/
      api/
      components/
      features/
      layouts/
      routes/
      types/
  DEPLOYMENT.md
  IMPLEMENTATION_PLAN.md
  README.md
```

## Database Models

Main models:

- `User`
- `Project`
- `ProjectMember`
- `Task`

Enums:

- `UserRole`: `ADMIN`, `MEMBER`
- `ProjectRole`: `ADMIN`, `MEMBER`
- `TaskStatus`: `TODO`, `IN_PROGRESS`, `DONE`
- `TaskPriority`: `LOW`, `MEDIUM`, `HIGH`

## Backend API Overview

All backend routes are prefixed with:

```txt
/api
```

### Auth

```txt
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
```

### Users

```txt
GET    /api/users
GET    /api/users/:id
PATCH  /api/users/:id/role
DELETE /api/users/:id
```

### Projects

```txt
POST   /api/projects
GET    /api/projects
GET    /api/projects/:id
PATCH  /api/projects/:id
DELETE /api/projects/:id
```

### Project Members

```txt
POST   /api/projects/:projectId/members
GET    /api/projects/:projectId/members
PATCH  /api/projects/:projectId/members/:userId/role
DELETE /api/projects/:projectId/members/:userId
```

### Tasks

```txt
POST   /api/projects/:projectId/tasks
GET    /api/projects/:projectId/tasks
GET    /api/tasks/my
GET    /api/tasks/:id
PATCH  /api/tasks/:id
PATCH  /api/tasks/:id/status
DELETE /api/tasks/:id
```

### Dashboard

```txt
GET /api/dashboard/summary
GET /api/dashboard/projects/:projectId
```

## Local Setup

### 1. Clone Repository

```bash
git clone https://github.com/Abbas557/teamTaskManager.git
cd teamTaskManager
```

### 2. Start Backend

```bash
cd backend
npm install
cp .env.example .env
docker compose up -d
npx prisma migrate deploy
npm run seed
npm run start:dev
```

Backend runs at:

```txt
http://localhost:3000/api
```

Health check:

```txt
http://localhost:3000/api/health
```

### 3. Start Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```txt
http://localhost:5173
```

## Environment Variables

### Backend `.env`

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/team_task_manager?schema=public"
JWT_SECRET="replace-me"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:5173"
PORT=3000
```

### Frontend `.env`

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

The frontend works without a local `.env` because this is the default API URL.

## Demo Credentials

After running:

```bash
npm run seed
```

Use:

```txt
Admin:
admin@example.com / Admin1234

Member:
member@example.com / Member1234
```

## Database Viewer

Use Prisma Studio:

```bash
cd backend
npx prisma studio
```

Open:

```txt
http://localhost:5555
```

You can inspect:

- Users
- Projects
- ProjectMembers
- Tasks

You can also connect with any PostgreSQL client:

```txt
Host: localhost
Port: 5432
Database: team_task_manager
User: postgres
Password: postgres
```

## Docker Database

The local database container is defined in:

```txt
backend/docker-compose.yml
```

Useful commands:

```bash
docker compose up -d
docker compose ps
docker compose logs postgres
docker compose down
```

Open psql inside the container:

```bash
docker exec -it team-task-manager-postgres psql -U postgres -d team_task_manager
```

List tables:

```sql
\dt
```

## Railway Deployment

Deployment details are documented in:

[DEPLOYMENT.md](./DEPLOYMENT.md)

Recommended Railway setup:

- Railway PostgreSQL database
- Railway backend service with root directory `backend`
- Railway frontend service with root directory `frontend`

Backend start command:

```bash
npm run start:railway
```

Frontend start command:

```bash
npm run start
```

## Important Railway Environment Variables

Backend:

```env
DATABASE_URL=<Railway Postgres DATABASE_URL>
JWT_SECRET=<long random secret>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend.up.railway.app
```

Frontend:

```env
VITE_API_BASE_URL=https://your-backend.up.railway.app/api
```

## Validation And Authorization

Backend validation uses DTOs and `class-validator`.

Examples:

- Signup requires valid email and password length.
- Project name has length validation.
- Task status and priority must be valid enums.
- Task assignee must be a member of the project.

Authorization is enforced in service layer:

- Only admins can manage global users.
- Only project admins/owners can manage project members.
- Only project admins/owners can create, edit, or delete tasks.
- Assigned members can update task status.

## Current Status

Completed:

- Backend core
- Frontend core
- Role-based access
- Database schema and migration
- Seed data
- Local Docker Postgres
- UI polish
- Railway deployment preparation

Ready for:

- GitHub push
- Railway deployment
- Final live testing
