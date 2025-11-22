# Task Management App

A full-stack task management application with user authentication, task CRUD, and status tracking. Built with a Next.js frontend and a TypeScript/Express backend using Prisma ORM and PostgreSQL.

## Tech Stack
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4, Axios, Lucide icons
- **Backend**: Node.js, Express 5, TypeScript, Prisma, Zod, JWT, Bcrypt, Cookie-based refresh tokens
- **Database**: PostgreSQL (via Prisma)

## Monorepo Structure
- **frontend/** — Next.js app (UI)
- **backend/** — Express + Prisma API

## Features
- **Authentication**: Register, login, refresh token, logout (HTTP-only cookies for refresh token)
- **Tasks**: Create, read, update, delete tasks
- **Status**: Toggle task status between `PENDING`, `IN_PROGRESS`, and `COMPLETED`
- **Health Check**: `/health` endpoint

## Prerequisites
- Node.js 18+
- npm (or pnpm/yarn)
- PostgreSQL 13+

## Environment Variables
Create environment files as shown below. Do not commit secrets.

- Backend: `backend/.env`
```
# Server
PORT=3000
NODE_ENV=development
# CORS (adjust if you run frontend on a different port)
CORS_ORIGIN=http://localhost:3001

# Database (PostgreSQL)
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/task_management?schema=public

# Auth
JWT_ACCESS_SECRET=replace-with-strong-secret
JWT_REFRESH_SECRET=replace-with-strong-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

- Frontend: `frontend/.env.local`
```
# Base URL for the backend API
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Note: The backend CORS currently allows `http://localhost:3001`. If you run the Next.js dev server on a different port, update either the CORS origin (backend) or the dev port (frontend).

## Database Schema (Prisma)
Key models (see `backend/prisma/schema.prisma` for details):
- **User**: `id`, `email`, `password`, `name`, `refreshToken`, timestamps
- **Task**: `id`, `title`, `description?`, `status`, `userId`, timestamps
- **Status enum**: `PENDING | IN_PROGRESS | COMPLETED`

## API Overview
Base URL: `http://localhost:3000`

- **Auth**
  - `POST /auth/register` — body: `{ email, password, name }`
  - `POST /auth/login` — body: `{ email, password }`
  - `POST /auth/refresh` — uses `refreshToken` cookie
  - `POST /auth/logout` — requires auth

- **Tasks** (all require auth with Bearer access token)
  - `GET /tasks` — list tasks
  - `GET /tasks/:id` — get task by id
  - `POST /tasks` — create `{ title, description?, status? }`
  - `PATCH /tasks/:id` — update partial fields
  - `DELETE /tasks/:id`
  - `POST /tasks/:id/toggle` — toggle status

## Getting Started (Local)
1) Install dependencies
```
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

2) Set up environment files
- Create `backend/.env` and `frontend/.env.local` as above.

3) Set up database and Prisma
```
# From backend folder
npm run prisma:generate
npm run prisma:migrate
# Optional visual DB browser
npm run prisma:studio
```

4) Run the apps in development
```
# Backend (http://localhost:3000)
cd backend
npm run dev

# Frontend (run on 3001 to match backend CORS)
cd ../frontend
npm run dev -- -p 3001
# or: npx next dev -p 3001
```

5) Open the app
- Frontend: `http://localhost:3001`
- Backend health: `http://localhost:3000/health`

## Production Build
```
# Backend
cd backend
npm run build
npm start

# Frontend
cd ../frontend
npm run build
npm start
```

## Notes on Auth
- Access token is returned in JSON on login/refresh.
- Refresh token is stored in an HTTP-only cookie.
- Include `Authorization: Bearer <accessToken>` header for protected routes.
- The frontend must send credentials when needed (e.g., Axios `withCredentials: true` for refresh).

## Scripts Reference
- Backend
  - `dev` — ts-node-dev server
  - `build` — TypeScript build to `dist`
  - `start` — run built server
  - `prisma:generate` — generate Prisma client
  - `prisma:migrate` — run dev migrations
  - `prisma:studio` — open Prisma Studio

- Frontend
  - `dev` — Next.js dev server
  - `build` — Next.js production build
  - `start` — Next.js production server
  - `lint` — run ESLint

## Troubleshooting
- **CORS errors**: Ensure frontend runs on `http://localhost:3001` or update backend CORS origin to your actual frontend URL.
- **Database connection**: Verify `DATABASE_URL` and that PostgreSQL is running and accessible.
- **Prisma client not found**: Run `npm run prisma:generate` in `backend`.

## License
Specify your preferred license here.
