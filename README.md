# DRCC - Disaster Response Control Center

DRCC - Disaster Response Control Center is a split frontend/backend project for disaster response workflows.

## Creators

- Arjun Jha
- Avinash Nair

## Project Details

DRCC - Disaster Response Control Center is designed to support operational awareness and coordination during emergency events. The project combines a responsive web interface with a MySQL-backed API so teams can monitor disaster events, review active alerts, track resource availability, and manage volunteer status in one system.

Core goals:

- Provide a live view of disaster-related records from a central database.
- Make resource usage and volunteer status updates fast and reliable.
- Keep integration simple for local development and team demos.

Main capabilities:

- Disaster feed with normalized display values for severity and magnitude.
- Alert listing for event communication tracking.
- Shelter resource tracking with quantity updates.
- Volunteer directory with status management.
- Debug endpoints for raw-table diagnostics.

## Technical Architecture

- Frontend: React + TypeScript + Vite (`frontend/`) for the operational dashboard and UI workflows.
- Backend API: Express server (`server.js`) with route handlers that query and transform MySQL data.
- Database: MySQL schema centered around `Disaster_Event`, `Alert`, `Resource`, and `Volunteer`.
- Configuration: Environment-based database settings through `.env` and `db.js`.

System flow (high level):

1. Frontend calls backend API endpoints under `/api`.
2. Backend validates input and executes SQL through a pooled MySQL connection.
3. Backend returns normalized JSON payloads used directly by the UI.
4. Status updates (resource usage and volunteer availability) are persisted in MySQL.

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

## Data Model Summary

- `Region`: geographical grouping for operations.
- `Disaster_Event`: event type, magnitude/severity, source, and timestamp.
- `Alert`: event-linked warning or communication records.
- `Shelter` and `Resource`: shelter inventory and supply quantities.
- `Volunteer` and `Volunteer_Skills`: volunteer identity, status, and skill metadata.

See [backend/README.md](backend/README.md) for the SQL setup script and sample seed data.

## Troubleshooting

- If MySQL connection fails, verify the values in `.env`.
- If a table is missing, run the schema in [backend/README.md](backend/README.md).
- If the frontend cannot reach the backend, confirm the backend is running on port 3000.

## Notes

- The backend uses environment variables and does not require hard-coded credentials.
- The repository is structured so the frontend and backend can be run independently.
