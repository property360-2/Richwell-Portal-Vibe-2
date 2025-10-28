# Richwell Portal Frontend

This directory contains the React + Vite + Tailwind scaffold for the Richwell College portal.

Phase 2 layers in the authentication experience that interfaces with the Express API.

## Key features

- Vite-based dev server configured on port 5173.
- Tailwind CSS ready with PostCSS + autoprefixer.
- Shared UI components for buttons, modals, tables, form inputs, dropdowns, charts, dashboard cards, alerts, and the login form.
- API client that targets the backend authentication endpoints with graceful error handling.

## Available scripts

- `npm run dev` – Start the local development server.
- `npm run build` – Generate a production build.
- `npm run preview` – Preview the production build locally.

## Getting started

1. Install dependencies: `npm install`.
2. Start the dev server: `npm run dev`.
3. Visit `http://localhost:5173` to load the app.

## Environment variables

Copy `.env.example` to `.env` and adjust `VITE_API_URL` if your backend runs on a different host/port. Avoid committing sensitive values.

## Authentication walkthrough

1. Seed the backend using `npm run seed` (see backend README).
2. Start both servers (`npm run dev` in `backend` and `frontend`).
3. Sign in with one of the seeded accounts (e.g., `student@example.com / ChangeMe123!`).
4. Explore the role-aware dashboard copy or generate a password reset token to test the full flow.

## Component library

Reusable components live under `src/components`. They are designed to match the UX guidelines documented in the planning materials. The new `LoginForm` reuses `InputField`, `Button`, and `Alert` to keep styling consistent.
