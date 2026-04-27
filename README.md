# Vigilant Response

Vigilant Response is a split frontend/backend project for disaster response workflows.

## Repository Layout

- `frontend/` contains the Vite + React + TypeScript app.
- `backend/` contains backend setup notes and database guidance.
- `server.js`, `db.js`, and `routes/` are the backend implementation currently used by the app.
- `.github/workflows/` contains CI workflows.

## Prerequisites

- Node.js 18 or newer
- MySQL 8 or compatible
- MySQL CLI access

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on the Vite default port, usually http://localhost:5173.

## Backend Setup

Create a `.env` file in the repository root using `.env.example` as the reference:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=DisasterAlertSystem
```

Then install dependencies from the repository root and start the backend:

```bash
npm install
npm run server
```

The backend listens on http://localhost:3000.

## Database Setup

Detailed MySQL CLI steps live in [backend/README.md](backend/README.md). In short, create the `DisasterAlertSystem` database, then create the tables used by the API: `Region`, `Disaster_Event`, `Alert`, `Shelter`, `Resource`, `Volunteer`, and `Volunteer_Skills`, plus the supporting tables referenced by the debug routes.

## API Summary

- `GET /api/disasters` returns disaster events from `Disaster_Event`.
- `GET /api/alerts` returns alert rows.
- `GET /api/resources` returns grouped resource totals joined with shelter data.
- `POST /api/resources/update` reduces resource quantity for a shelter and type.
- `GET /api/volunteers` returns volunteers and their skills.
- `POST /api/volunteers/update-status` updates volunteer availability.
- `GET /api/debug/*` exposes raw table snapshots for troubleshooting.

## Troubleshooting

- If MySQL connection fails, verify the values in `.env`.
- If a table is missing, run the schema in [backend/README.md](backend/README.md).
- If the frontend cannot reach the backend, confirm the backend is running on port 3000.

## Notes

- The backend uses environment variables and does not require hard-coded credentials.
- The repository is structured so the frontend and backend can be run independently.
