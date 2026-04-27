# Frontend — DRCC - Disaster Response Control Center

This folder contains the frontend (Vite + React + TypeScript) for the DRCC - Disaster Response Control Center project.

## Prerequisites
- Node.js (recommended: 16+ / 18+)
- npm (or `pnpm`/`yarn` if you prefer)

## Quick start
1. Open a terminal inside the `frontend/` folder:

```bash
cd frontend
npm install
```

2. Start the dev server:

```bash
npm run dev
# open http://localhost:5173 (Vite default)
```

3. Build for production:

```bash
npm run build
npm run preview    # preview the production build locally
```

## Environment variables
- The frontend uses Vite; any runtime API base URL should be prefixed with `VITE_`.
- Example `.env` in `frontend/`:

```env
VITE_API_URL=http://localhost:4000
```

Read the code for exact variable names (search for `import.meta.env.VITE_API_URL`).

## Running with the backend
- The backend is run separately. Point `VITE_API_URL` at your backend dev server (example above).
- Typical backend dev command:

```bash
# from your backend folder
npm install
npm run dev
```

## Tests & linting
- Run tests (if available):

```bash
npm run test
```

- Lint (if project includes linters):

```bash
npm run lint
```

## Notes
- This README assumes you're in the `frontend/` directory. If the repository is set up as a monorepo, adjust commands to your workspace manager.
- If anything fails, paste the terminal output and I can help debug.
