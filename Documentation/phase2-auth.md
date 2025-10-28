# Phase 2 – Authentication & Role Management

Phase 2 brings secure login flows to the Richwell College Portal. This document summarizes the delivered capabilities and how to exercise them locally.

## Backend highlights

- **Prisma schema** now models `User`, `Session`, and `PasswordResetToken` entities with a `Role` enum covering student, professor, registrar, admission, and dean personas.
- **JWT authentication** issues signed tokens for each login and persists a hashed session row so logout invalidates the credential immediately.
- **Role-based middleware** protects `/roles/*` endpoints, returning contextual payloads that mirror each dashboard’s permissions.
- **Password reset workflow** generates time-bound tokens and enforces an eight-character minimum when updating credentials.
- **Seed script** provisions five demo users (one per role) with the password `ChangeMe123!` for quick validation.

## Frontend highlights

- **Login experience** built with the reusable `LoginForm`, `InputField`, `Alert`, and `Button` components.
- **Role-aware welcome screen** surfaces guidance for the authenticated user and links back to the backend guards.
- **Password reset helper** surfaces generated tokens directly in the UI while email delivery is pending.
- **API client** centralizes authentication requests and honors the `VITE_API_URL` environment variable.

## Testing toolkit

- Import the Postman assets from `postman/` (`richwell-phase2-auth.postman_collection.json` and `local.postman_environment.json`).
- Update the `accessToken` environment variable after logging in to exercise the role-guarded routes quickly.

## Next steps

- Wire the authentication context into upcoming dashboards and enrollment workflows.
- Replace the prompt-based reset helper with a dedicated UI screen that accepts the emailed token.
- Expand analytics caching (see Phase 6 backlog) once protected endpoints are consumed by role dashboards.
