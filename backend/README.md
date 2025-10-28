# Richwell Portal Backend

This directory hosts the Express API server for the Richwell College portal.

Phase 2 introduces secure authentication with JWT sessions, Prisma-backed role management, and password reset flows.

## Available scripts

- `npm run dev` – Start the development server with hot reloading via Nodemon.
- `npm start` – Start the production server.
- `npm run lint` – Placeholder lint command.
- `npm run prisma:push` – Apply the Prisma schema to your local MySQL instance.
- `npm run prisma:studio` – Launch Prisma Studio for inspecting data.
- `npm run seed` – Populate default users for every portal role.

## Environment variables

Create a `.env` file based on `.env.example` and make sure the `DATABASE_URL` matches your local MySQL/MariaDB credentials. The file also exposes `JWT_SECRET`, `ACCESS_TOKEN_TTL_MINUTES`, and `RESET_TOKEN_TTL_MINUTES` to fine-tune token behavior during development.

## Database toolkit

The project uses **Prisma** as the ORM. After installing dependencies run:

1. `npm run prisma:push` to sync the schema.
2. `npm run seed` to create baseline accounts:
   - `student@example.com`
   - `professor@example.com`
   - `registrar@example.com`
   - `admission@example.com`
   - `dean@example.com`

Every seeded user starts with the password `ChangeMe123!`.

> **Tip:** Update the passwords immediately in non-local environments and store credentials securely.

## Authentication overview

- `POST /auth/login` – Exchange credentials for a JWT and persistent session.
- `POST /auth/logout` – Revoke the active session.
- `GET /auth/me` – Retrieve the authenticated user profile.
- `POST /auth/request-reset` & `POST /auth/reset` – Generate and consume password reset tokens.
- `GET /roles/:role` – Sample routes showcasing role-based access gates for students, professors, registrar, admission, and dean personas.

Each JWT is stored as a hashed session entry so revocations immediately block reuse.

## Health check

The base Express app exposes `/health` which returns a JSON payload confirming the API is reachable.

## Postman collection

Import the files from `../postman` to exercise the authentication workflow quickly. The `Richwell Local` environment holds the `baseUrl` and `accessToken` variables for reuse while testing.
