import "dotenv/config";
import express from "express";
import cors from "cors";
import pool, { checkDatabaseConnection, dbConfig } from "./db.js";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const createQueryHandler = (query, transformer) => async (_req, res) => {
  try {
    const [rows] = await pool.query(query);
    const data = transformer ? rows.map(transformer) : rows;
    res.json({ success: true, data });
  } catch (error) {
    console.error("Database query failed:", error);
    res.status(500).json({ success: false, message: "Failed to fetch data from database." });
  }
};

const transformDisaster = (row) => ({
  event_id: row.event_id,
  type: row.type,
  magnitude: parseFloat(row.magnitude) || 0,
  severity_level: row.severity_level,
  event_time: row.event_time,
  region_id: row.region_id,
  source_api: row.source_api,
  display_value: row.type?.toLowerCase().includes("earthquake") 
    ? `Magnitude ${parseFloat(row.magnitude) || "N/A"}`
    : `Severity ${row.severity_level}`,
});

const transformAlert = (row) => ({
  alert_id: row.alert_id,
  event_id: row.event_id,
  alert_message: row.alert_message,
  alert_time: row.alert_time,
  alert_status: row.alert_status,
});

const transformResource = (row) => ({
  shelter_id: row.shelter_id,
  shelter_name: row.shelter_name,
  resource_type: row.resource_type,
  quantity: row.quantity,
  max_quantity: row.max_quantity,
  region_id: row.region_id,
});

const transformVolunteer = (row) => ({
  id: row.volunteer_id,
  name: row.name,
  email: row.email,
  region_id: row.region_id,
  availability_status: row.availability_status,
  skills: row.skills,
});

app.get(
  "/api/disasters",
  createQueryHandler(`
    SELECT
      event_id,
      type,
      magnitude,
      severity_level,
      event_time,
      region_id,
      source_api
    FROM Disaster_Event
    ORDER BY event_time DESC
  `, transformDisaster)
);

app.get(
  "/api/alerts",
  createQueryHandler(`
    SELECT
      alert_id,
      event_id,
      alert_message,
      alert_time,
      alert_status
    FROM Alert
    ORDER BY alert_time DESC
  `, transformAlert)
);

app.get(
  "/api/resources",
  createQueryHandler(`
    SELECT
      s.shelter_id,
      shelter_name,
      resource_type,
      quantity,
      MAX(quantity) AS max_quantity,
      MAX(region_id) AS region_id
    FROM (
      SELECT
        s.shelter_id,
        s.shelter_name,
        r.resource_type,
        r.quantity,
        s.region_id
      FROM Resource r
      INNER JOIN Shelter s ON r.shelter_id = s.shelter_id
      ORDER BY s.shelter_name, r.resource_type
    ) grouped
    GROUP BY shelter_name, resource_type
  `, transformResource)
);

app.post("/api/resources/update", async (req, res) => {
  const { shelter_id, shelter_name, resource_type, use_quantity, amount } = req.body ?? {};
  const requested = Number(use_quantity ?? amount);

  if ((!shelter_id && !shelter_name) || !resource_type || !Number.isFinite(requested) || requested <= 0) {
    return res.status(400).json({ success: false, message: "Invalid resource update payload." });
  }

  try {
    const lookupParams = shelter_id
      ? [Number(shelter_id), resource_type]
      : [shelter_name, resource_type];

    const [rows] = await pool.query(
      `
        SELECT r.resource_id, r.quantity
        FROM Resource r
        INNER JOIN Shelter s ON r.shelter_id = s.shelter_id
        WHERE ${shelter_id ? "s.shelter_id = ?" : "s.shelter_name = ?"} AND r.resource_type = ?
        LIMIT 1
      `,
      lookupParams
    );

    const resource = rows?.[0];
    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found." });
    }

    if (Number(resource.quantity) < requested) {
      return res.status(400).json({ success: false, message: "Not enough stock available." });
    }

    const remaining = Number(resource.quantity) - requested;

    await pool.query(
      `UPDATE Resource SET quantity = ? WHERE resource_id = ?`,
      [remaining, resource.resource_id]
    );

    return res.json({
      success: true,
      message: `${requested} ${resource_type} used from ${shelter_name ?? `shelter ${shelter_id}`}.`,
      remaining_quantity: remaining,
    });
  } catch (error) {
    console.error("Resource update failed:", error);
    return res.status(500).json({ success: false, message: "Failed to update resource quantity." });
  }
});

app.get(
  "/api/volunteers",
  createQueryHandler(`
    SELECT
      volunteer_id,
      name,
      email,
      region_id,
      availability_status,
      skills
    FROM Volunteer
    ORDER BY name
  `, transformVolunteer)
);

app.post("/api/volunteers/update-status", async (req, res) => {
  const { volunteer_id, availability_status } = req.body ?? {};
  const id = Number(volunteer_id);
  const allowed = new Set(["Available", "Assigned", "Unavailable"]);

  if (!Number.isFinite(id) || !allowed.has(availability_status)) {
    return res.status(400).json({ success: false, message: "Invalid volunteer status payload." });
  }

  try {
    const [result] = await pool.query(
      `UPDATE Volunteer SET availability_status = ? WHERE volunteer_id = ?`,
      [availability_status, id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Volunteer not found." });
    }

    return res.json({ success: true, message: "Volunteer status updated." });
  } catch (error) {
    console.error("Volunteer status update failed:", error);
    return res.status(500).json({ success: false, message: "Failed to update volunteer status." });
  }
});

const startServer = async () => {
  try {
    await checkDatabaseConnection();
    app.listen(port, () => {
      console.log(`DisasterAlertSystem backend running on http://localhost:${port}`);
      console.log(`Connected to MySQL at ${dbConfig.host}:${dbConfig.port} as ${dbConfig.user} using DB ${dbConfig.database}`);
    });
  } catch (error) {
    console.error("Unable to connect to MySQL. Check your .env database credentials.");
    console.error(`Tried host=${dbConfig.host} port=${dbConfig.port} user=${dbConfig.user} database=${dbConfig.database}`);
    console.error(error);
    process.exit(1);
  }
};

startServer();