# Backend Setup Guide

This folder documents the backend service used by DRCC - Disaster Response Control Center. The backend currently runs from the repository root through `server.js`, but this guide collects the MySQL and API setup in one place for local development.

## Creators

- Arjun Jha
- Avinash Nair

## Backend Project Details

The DRCC - Disaster Response Control Center backend provides the data layer and operational API for disaster response workflows. It serves read endpoints for dashboard visibility and write endpoints for action-taking operations such as resource consumption and volunteer assignment status updates.

Backend responsibilities:

- Query and transform disaster, alert, resource, and volunteer datasets.
- Enforce lightweight request validation for update endpoints.
- Return consistent JSON responses for frontend integration.
- Surface debug routes for direct table-level inspection during development.

Design principles:

- Keep the API simple and predictable for frontend consumption.
- Use SQL joins and grouping for efficient server-side aggregation.
- Keep credentials externalized through environment variables.
- Keep local setup reproducible via explicit schema and seed commands.

## Backend Architecture

- Runtime: Node.js + Express.
- Data access: MySQL (`mysql2`) connection pool in `db.js`.
- Startup validation: database connectivity check before serving traffic.
- Endpoint families:
  - `/api/disasters`, `/api/alerts`, `/api/resources`, `/api/volunteers`
  - mutation endpoints for resource quantity and volunteer status
  - `/api/debug/*` raw table endpoints for diagnostics

Request lifecycle:

1. Client sends request to an API route.
2. Route handler validates payload when needed.
3. Handler executes SQL query or update through pooled connection.
4. Handler maps results into API response shape.
5. Response is returned with success/error metadata.

## Requirements

- Node.js 18 or newer
- MySQL 8 or compatible
- MySQL CLI

## Install Dependencies

From the repository root:

```bash
npm install
```

## Configure Environment Variables

Create a `.env` file in the repository root using `.env.example` as a template:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=DisasterAlertSystem
```

The backend reads these values through `db.js`.

## Start The Backend

From the repository root:

```bash
npm run server
```

The API runs on `http://localhost:3000`.

## Complete MySQL CLI Commands (Run In Order)

Run the command below in your terminal to open MySQL CLI:

```bash
mysql -u root -p
```

After login, run this entire SQL block in order. This includes all required database, table, seed, and verification commands for the backend.

```sql
CREATE DATABASE IF NOT EXISTS DisasterAlertSystem;
USE DisasterAlertSystem;

CREATE TABLE IF NOT EXISTS Region (
  region_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS Disaster_Event (
  event_id INT AUTO_INCREMENT PRIMARY KEY,
  region_id INT NOT NULL,
  type VARCHAR(100) NOT NULL,
  magnitude DECIMAL(10,2) DEFAULT NULL,
  severity_level VARCHAR(50) NOT NULL,
  event_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  source_api VARCHAR(100) NOT NULL DEFAULT 'Manual',
  FOREIGN KEY (region_id) REFERENCES Region(region_id)
);

CREATE TABLE IF NOT EXISTS Alert (
  alert_id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  alert_message TEXT,
  alert_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  alert_status VARCHAR(50) DEFAULT 'Pending',
  FOREIGN KEY (event_id) REFERENCES Disaster_Event(event_id)
);

CREATE TABLE IF NOT EXISTS Shelter (
  shelter_id INT AUTO_INCREMENT PRIMARY KEY,
  shelter_name VARCHAR(150) NOT NULL,
  region_id INT DEFAULT NULL,
  FOREIGN KEY (region_id) REFERENCES Region(region_id)
);

CREATE TABLE IF NOT EXISTS Resource (
  resource_id INT AUTO_INCREMENT PRIMARY KEY,
  shelter_id INT NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  FOREIGN KEY (shelter_id) REFERENCES Shelter(shelter_id)
);

CREATE TABLE IF NOT EXISTS Volunteer (
  volunteer_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  region_id INT DEFAULT NULL,
  availability_status VARCHAR(50) NOT NULL DEFAULT 'Available'
);

CREATE TABLE IF NOT EXISTS Volunteer_Skills (
  skill_id INT AUTO_INCREMENT PRIMARY KEY,
  volunteer_id INT NOT NULL,
  skill VARCHAR(100) NOT NULL,
  FOREIGN KEY (volunteer_id) REFERENCES Volunteer(volunteer_id)
);

CREATE TABLE IF NOT EXISTS Alert_Delivery_Channels (
  channel_id INT AUTO_INCREMENT PRIMARY KEY,
  alert_id INT DEFAULT NULL,
  channel_name VARCHAR(100) NOT NULL,
  delivery_status VARCHAR(50) DEFAULT 'Pending'
);

CREATE TABLE IF NOT EXISTS API_Log (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  request_path VARCHAR(255) NOT NULL,
  request_method VARCHAR(20) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Evacuation_Request (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  region_id INT DEFAULT NULL,
  requester_name VARCHAR(150) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (region_id) REFERENCES Region(region_id)
);

CREATE TABLE IF NOT EXISTS Damage_Report (
  report_id INT AUTO_INCREMENT PRIMARY KEY,
  region_id INT DEFAULT NULL,
  description TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (region_id) REFERENCES Region(region_id)
);

INSERT INTO Region (name) VALUES ('North Zone');

INSERT INTO Disaster_Event (region_id, type, magnitude, severity_level, source_api)
VALUES (1, 'Earthquake', 6.8, 'Critical', 'Manual');

INSERT INTO Alert (event_id, alert_message, alert_status)
VALUES (1, 'Evacuate immediately and follow emergency instructions', 'Sent');

INSERT INTO Shelter (shelter_name, region_id)
VALUES ('Central Shelter', 1);

INSERT INTO Resource (shelter_id, resource_type, quantity)
VALUES (1, 'Water Bottles', 250);

INSERT INTO Volunteer (name, email, region_id, availability_status)
VALUES ('Asha Patel', 'asha@example.com', 1, 'Available');

INSERT INTO Volunteer_Skills (volunteer_id, skill)
VALUES (1, 'First Aid');

SHOW TABLES;

SELECT * FROM Region;
SELECT * FROM Disaster_Event;
SELECT * FROM Alert;
SELECT * FROM Shelter;
SELECT * FROM Resource;
SELECT * FROM Volunteer;
SELECT * FROM Volunteer_Skills;
```

If all commands run successfully, you can type `exit` to leave MySQL CLI and then start the backend with `npm run server`.

## API Endpoints

### `GET /api/disasters`

Returns disaster events from `Disaster_Event` and adds a `display_value` field for the UI.

### `GET /api/alerts`

Returns alert rows from `Alert`.

### `GET /api/resources`

Returns grouped resource totals by shelter and resource type.

### `POST /api/resources/update`

Reduces resource quantity for a given shelter and resource type.

Example body:

```json
{
  "shelter_id": 1,
  "resource_type": "Water Bottles",
  "amount": 20
}
```

### `GET /api/volunteers`

Returns volunteers and their joined skills.

### `POST /api/volunteers/update-status`

Updates a volunteer's availability.

Example body:

```json
{
  "volunteer_id": 1,
  "availability_status": "Busy"
}
```

## Debug Routes

The repository also exposes raw table endpoints under `/api/debug` for inspection:

- `GET /api/debug/disaster_raw`
- `GET /api/debug/resource_raw`
- `GET /api/debug/region_raw`
- `GET /api/debug/volunteer_skills_raw`
- `GET /api/debug/evacuation_request_raw`
- `GET /api/debug/api_log_raw`
- `GET /api/debug/damage_report_raw`

## Common Issues

- If the app cannot connect to MySQL, confirm the `.env` values and that MySQL is running.
- If a query fails because of a missing column, compare your schema to the tables above.
- If the backend starts but returns empty arrays, insert sample rows and verify the foreign keys match.
