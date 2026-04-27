# Vigilant Response

## Backend Setup

1. Create a `.env` file in the project root using `.env.example` as reference.
2. Set your MySQL credentials in `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=DisasterAlertSystem
```

3. Start the backend:

```bash
npm run server
```

If credentials are incorrect, the server now exits with a clear error and prints the connection parameters it attempted.

## Frontend

Run the Vite app:

```bash
npm run dev
```
