# Richwell Portal Backend

This directory hosts the Express API server for the Richwell College portal.

## Available scripts

- `npm run dev` – Start the development server with hot reloading via Nodemon.
- `npm start` – Start the production server.
- `npm run lint` – Placeholder lint command.

## Environment variables

Create a `.env` file based on `.env.example` and make sure the `DATABASE_URL` matches your local MySQL/MariaDB credentials.

## Database toolkit

The project uses **Prisma** as the ORM. Run `npx prisma migrate dev` after defining your models to create the schema in your database.

## Health check

The base Express app exposes `/health` which returns a JSON payload confirming the API is reachable.
