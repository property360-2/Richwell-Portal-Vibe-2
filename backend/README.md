# Richwell Portal Backend

This directory hosts the Express API server for the Richwell College portal.

## Available scripts

- `npm run dev` – Start the development server with hot reloading via Nodemon.
- `npm start` – Start the production server.
- `npm run lint` – Placeholder lint command.

## Environment variables

Create a `.env` file based on `.env.example` and make sure the `DATABASE_URL` matches your local MySQL/MariaDB credentials.

## Database toolkit

The project uses **Prisma** as the ORM.

1) Copy `.env.example` to `.env` and set a valid MySQL `DATABASE_URL`.
2) Install deps: `npm install`
3) Apply schema: `npx prisma migrate dev --name init`
4) Seed sample users: `node prisma/seed.js`

## Health check

The base Express app exposes `/health` which returns a JSON payload confirming the API is reachable.

## API overview

- `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/request-reset`, `POST /auth/reset`
- `GET /roles/{student|professor|registrar|admission|dean}` role-guard samples
- Registrar
  - `GET/POST/PUT/DELETE /registrar/programs`
  - `GET/POST/PUT/DELETE /registrar/subjects`
  - `POST/DELETE /registrar/programs/:programId/subjects/:subjectId` (mapping)
  - `GET/POST/PUT/DELETE /registrar/sections`
  - `GET/POST /registrar/terms`, `PATCH /registrar/terms/:id/activate`
- Admission
  - `POST /admission/students`, `GET /admission/students?q=...`
  - `GET /admission/recommendations/:studentId`
  - `POST /admission/enroll`
- Professor
  - `GET /professor/sections`
  - `POST /professor/sections/:sectionId/grades`
- Grades
  - `GET /grades/registrar/pending`
  - `POST /grades/registrar/:gradeId/approve`
  - `GET /grades/student/me`
- Analytics
  - `GET /analytics/dean`, `GET /analytics/registrar`, `GET /analytics/admission`
