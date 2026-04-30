# Team Task Manager Full-Stack Implementation Plan

## 1. Project Overview

Build a production-style Team Task Manager where users can create projects, manage teams, assign tasks, and track progress with role-based access control.

Core requirements:

- Authentication with signup and login
- Project and team management
- Task creation, assignment, and status tracking
- Dashboard for tasks, statuses, and overdue work
- REST APIs with a database
- Proper validations and relationships
- Role-based access control
- Railway deployment
- Backend in NestJS
- Frontend in React
- Strict modular structure following the DAO pattern

Recommended stack:

- Backend: NestJS, TypeScript, PostgreSQL, Prisma, JWT, bcrypt, class-validator
- Frontend: React, TypeScript, Vite, React Router, Axios, TanStack Query, React Hook Form, Zod
- Deployment: Railway for backend, database, and preferably frontend

## 2. High-Level Architecture

```txt
React Frontend
  -> Axios API Layer
    -> NestJS Controllers
      -> Services
        -> DAO Classes
          -> PostgreSQL Database
```

Rules:

- Controllers handle HTTP requests and responses.
- Services handle business logic, validation flow, and authorization decisions.
- DAOs handle database access only.
- Controllers must not call DAOs directly.
- DAOs must not contain business authorization logic.

## 3. Repository Structure

```txt
team-task-manager/
  backend/
  frontend/
  README.md
  IMPLEMENTATION_PLAN.md
```

## 4. Backend Module Structure

```txt
backend/
  src/
    main.ts
    app.module.ts

    common/
      decorators/
        roles.decorator.ts
        current-user.decorator.ts
      guards/
        jwt-auth.guard.ts
        roles.guard.ts
        project-member.guard.ts
      enums/
        user-role.enum.ts
        project-role.enum.ts
        task-status.enum.ts
        task-priority.enum.ts
      filters/
      interceptors/
      utils/

    database/
      database.module.ts
      prisma.service.ts

    auth/
      auth.module.ts
      controllers/
      services/
      dto/
      strategies/

    users/
      users.module.ts
      controllers/
      services/
      dao/
      dto/

    projects/
      projects.module.ts
      controllers/
      services/
      dao/
      dto/

    project-members/
      project-members.module.ts
      controllers/
      services/
      dao/
      dto/

    tasks/
      tasks.module.ts
      controllers/
      services/
      dao/
      dto/

    dashboard/
      dashboard.module.ts
      controllers/
      services/
      dao/
```

Each domain module should follow this shape:

```txt
tasks/
  controllers/
    tasks.controller.ts
  services/
    tasks.service.ts
  dao/
    tasks.dao.ts
  dto/
    create-task.dto.ts
    update-task.dto.ts
  tasks.module.ts
```

## 5. Database Design

Use PostgreSQL with Prisma.

### Users

```txt
users
- id
- name
- email
- passwordHash
- role: ADMIN | MEMBER
- createdAt
- updatedAt
```

### Projects

```txt
projects
- id
- name
- description
- ownerId
- createdAt
- updatedAt
```

Relationships:

- One user can own many projects.
- One project has many members.
- One project has many tasks.

### Project Members

```txt
project_members
- id
- projectId
- userId
- role: ADMIN | MEMBER
- createdAt
```

This allows project-specific roles. A user can be an admin in one project and a member in another.

### Tasks

```txt
tasks
- id
- title
- description
- status: TODO | IN_PROGRESS | DONE
- priority: LOW | MEDIUM | HIGH
- dueDate
- projectId
- assignedToId
- createdById
- createdAt
- updatedAt
```

Relationships:

- Task belongs to one project.
- Task can be assigned to one user.
- Task is created by one user.

## 6. Backend API Plan

### Auth APIs

```txt
POST /auth/signup
POST /auth/login
GET  /auth/me
```

Signup payload:

```json
{
  "name": "Abbas",
  "email": "abbas@example.com",
  "password": "Password123"
}
```

Login response:

```json
{
  "accessToken": "...",
  "user": {
    "id": "...",
    "name": "Abbas",
    "email": "abbas@example.com",
    "role": "ADMIN"
  }
}
```

### User APIs

```txt
GET    /users
GET    /users/:id
PATCH  /users/:id/role
DELETE /users/:id
```

Access:

- Admin only for listing users, changing roles, and deleting users.
- Authenticated user can view their own profile.

### Project APIs

```txt
POST   /projects
GET    /projects
GET    /projects/:id
PATCH  /projects/:id
DELETE /projects/:id
```

Access:

- Admin can create projects.
- Project members can view projects they belong to.
- Project admin or owner can update/delete projects.

### Project Member APIs

```txt
POST   /projects/:projectId/members
GET    /projects/:projectId/members
DELETE /projects/:projectId/members/:userId
PATCH  /projects/:projectId/members/:userId/role
```

Access:

- Project admin can add/remove members.
- Project admin can update member roles.
- Members can view the team list.

### Task APIs

```txt
POST   /projects/:projectId/tasks
GET    /projects/:projectId/tasks
GET    /tasks/my
GET    /tasks/:id
PATCH  /tasks/:id
DELETE /tasks/:id
PATCH  /tasks/:id/status
```

Access:

- Project admin can create, assign, update, and delete tasks.
- Assigned member can update task status.
- Project members can view tasks in their project.

### Dashboard APIs

```txt
GET /dashboard/summary
GET /dashboard/projects/:projectId
```

Dashboard summary response:

```json
{
  "totalTasks": 20,
  "todo": 8,
  "inProgress": 7,
  "done": 5,
  "overdue": 3,
  "myTasks": 6,
  "projectsCount": 4
}
```

## 7. Role-Based Access Control

Use multiple protection layers:

- JWT auth guard for authenticated routes.
- Global role guard for ADMIN/MEMBER access.
- Project role checks for project-scoped permissions.

Examples:

```ts
@UseGuards(JwtAuthGuard)
```

```ts
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
```

Project-level checks should answer:

- Is this user a project member?
- Is this user a project admin?
- Is this user the project owner?

## 8. Frontend Structure

```txt
frontend/
  src/
    app/
    api/
    components/
    features/
      auth/
      dashboard/
      projects/
      tasks/
      users/
    layouts/
    routes/
    hooks/
    types/
```

## 9. Frontend Pages

```txt
/login
/signup
/dashboard
/projects
/projects/:projectId
/projects/:projectId/tasks
/tasks/my
/admin/users
```

## 10. Frontend Features

### Authentication

- Signup page
- Login page
- JWT storage
- Axios interceptor with Authorization header
- Protected routes
- Role-based route access

### Dashboard

Show:

- Total tasks
- My tasks
- Overdue tasks
- Status distribution
- Recent projects
- Upcoming deadlines

### Projects

Project list page:

- Project name
- Description
- Member count
- Task count
- Progress percentage

Project detail page:

- Project overview
- Team members
- Task table or board
- Add member modal
- Create task modal

### Tasks

Task views:

- Table view
- Status filter
- Priority filter
- Assignee filter
- Due date filter

Task statuses:

```txt
TODO
IN_PROGRESS
DONE
```

Optional enhancement:

- Kanban board grouped by status

## 11. Validation Rules

### Signup

- Name is required.
- Email must be valid.
- Password must be at least 8 characters.

### Project

- Name is required.
- Description is optional with a max length.

### Task

- Title is required.
- Due date must be a valid date.
- Assigned user must belong to the project.
- Status must be a valid enum.
- Priority must be a valid enum.

## 12. Error Handling

Use consistent API errors:

```json
{
  "statusCode": 400,
  "message": "Task assignee must be a project member",
  "error": "Bad Request"
}
```

Common cases:

- Invalid credentials
- Duplicate email
- Unauthorized
- Forbidden role access
- Project not found
- Task not found
- User not part of project
- Cannot assign task to non-member

## 13. Implementation Phases

### Phase 1: Project Setup

- Create monorepo structure.
- Set up NestJS backend.
- Set up React frontend.
- Set up PostgreSQL connection.
- Configure environment variables.
- Add linting and formatting.

### Phase 2: Backend Foundation

- Configure database.
- Create Prisma schema.
- Add migrations.
- Add common enums.
- Add global validation pipe.
- Add config service.
- Add consistent error handling.

### Phase 3: Authentication

- Signup.
- Login.
- JWT strategy.
- Current user endpoint.
- Password hashing.
- Auth guards.
- Frontend auth pages.

### Phase 4: Users and Roles

- User DAO.
- User service.
- User controller.
- Admin-only user listing.
- Role update endpoint.
- Frontend admin user page.

### Phase 5: Projects

- Project DAO.
- Project service.
- Project controller.
- Create/update/delete projects.
- Project list scoped by membership.
- Project detail page.

### Phase 6: Project Members

- Add/remove members.
- Update member role.
- Validate membership rules.
- Team management UI.

### Phase 7: Tasks

- Task CRUD.
- Assignment logic.
- Status update logic.
- Due date tracking.
- My tasks endpoint.
- Task table/board UI.

### Phase 8: Dashboard

- Backend dashboard aggregate APIs.
- Frontend summary cards and charts.
- Overdue tasks.
- Status counts.
- Project progress.

### Phase 9: Testing

Minimum tests:

- Auth service tests.
- Role guard tests.
- Project permission tests.
- Task assignment tests.
- Dashboard aggregation tests.

Manual flow tests:

- Admin creates project.
- Admin adds member.
- Admin assigns task.
- Member logs in.
- Member updates status.
- Dashboard updates correctly.

### Phase 10: Deployment

Railway deployment plan:

- Create Railway project.
- Add PostgreSQL database.
- Deploy backend service.
- Set backend environment variables.
- Run migrations.
- Deploy frontend service.
- Set frontend API URL.
- Test live auth, project, task, and dashboard flows.

Backend environment variables:

```env
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=7d
FRONTEND_URL=
PORT=
```

Frontend environment variables:

```env
VITE_API_BASE_URL=
```

## 14. Recommended MVP Scope

Build these first:

1. Signup/login
2. Admin/member roles
3. Project creation
4. Add members to projects
5. Task creation and assignment
6. Task status tracking
7. Dashboard summary
8. Railway deployment

Then polish:

1. Kanban board
2. Filters/search
3. Charts
4. Better project progress display
5. Seed demo data

## 15. Suggested Build Order

```txt
1. Backend setup
2. Database schema
3. Auth module
4. Users module
5. Projects module
6. Project members module
7. Tasks module
8. Dashboard module
9. Frontend setup
10. Auth UI
11. Dashboard UI
12. Project/task UI
13. Admin/team UI
14. Validation polish
15. Railway deployment
```
