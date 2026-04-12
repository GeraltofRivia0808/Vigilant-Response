export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type AlertStatus = "PENDING" | "SENT" | "DELIVERED" | "FAILED";
export type VolunteerStatus = "Available" | "Assigned" | "Unavailable";

export interface Disaster {
  id: string;
  type: string;
  magnitude: number;
  severity: Severity;
  time: string;
  location: string;
}

export interface Alert {
  id: string;
  message: string;
  status: AlertStatus;
  time: string;
  region: string;
}

export interface Resource {
  id: string;
  shelterName: string;
  resourceType: string;
  quantity: number;
  maxQuantity: number;
}

export interface Volunteer {
  id: string;
  name: string;
  region: string;
  status: VolunteerStatus;
  skills: string;
}

const disasterTypes = ["Earthquake", "Flood", "Hurricane", "Wildfire", "Tsunami", "Tornado", "Volcanic Eruption", "Landslide"];
const severities: Severity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const alertStatuses: AlertStatus[] = ["PENDING", "SENT", "DELIVERED", "FAILED"];
const regions = ["North District", "South Coast", "East Valley", "West Mountain", "Central Metro", "Island Zone"];
const names = ["Alex Rivera", "Jordan Chen", "Sam Patel", "Morgan Kim", "Casey Brooks", "Riley Santos", "Drew Murphy", "Jamie Lee", "Quinn Foster", "Avery Walsh"];
const skills = ["Medical", "Search & Rescue", "Logistics", "Communication", "Engineering", "Transport", "First Aid", "Firefighting"];
const resourceTypes = ["Water Bottles", "Medical Kits", "Blankets", "Food Packs", "Tents", "Batteries", "Flashlights", "Generators"];
const shelterNames = ["Central Relief Hub", "Westside Shelter", "Mountain Base Camp", "Coastal Emergency Center", "Metro Aid Station", "Valley Safe House"];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateId(): string {
  return `EVT-${Math.floor(1000 + Math.random() * 9000)}`;
}

function recentTime(): string {
  const d = new Date(Date.now() - Math.random() * 3600000 * 24);
  return d.toISOString().replace("T", " ").slice(0, 19);
}

export function generateDisasters(count = 8): Disaster[] {
  return Array.from({ length: count }, () => ({
    id: generateId(),
    type: randomFrom(disasterTypes),
    magnitude: +(1 + Math.random() * 8).toFixed(1),
    severity: randomFrom(severities),
    time: recentTime(),
    location: randomFrom(regions),
  }));
}

export function generateAlerts(count = 6): Alert[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `ALT-${1000 + i}`,
    message: `${randomFrom(disasterTypes)} warning issued for ${randomFrom(regions)}. Immediate action required.`,
    status: randomFrom(alertStatuses),
    time: recentTime(),
    region: randomFrom(regions),
  }));
}

export function generateResources(count = 6): Resource[] {
  return Array.from({ length: count }, () => {
    const max = Math.floor(50 + Math.random() * 200);
    return {
      id: `RES-${Math.floor(1000 + Math.random() * 9000)}`,
      shelterName: randomFrom(shelterNames),
      resourceType: randomFrom(resourceTypes),
      quantity: Math.floor(Math.random() * max),
      maxQuantity: max,
    };
  });
}

export function generateVolunteers(count = 8): Volunteer[] {
  const statuses: VolunteerStatus[] = ["Available", "Assigned", "Unavailable"];
  return Array.from({ length: count }, () => ({
    id: `VOL-${Math.floor(1000 + Math.random() * 9000)}`,
    name: randomFrom(names),
    region: randomFrom(regions),
    status: randomFrom(statuses),
    skills: randomFrom(skills),
  }));
}

// Simulate API calls with delay
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function fetchDisasters(): Promise<Disaster[]> {
  await delay(600 + Math.random() * 400);
  return generateDisasters();
}

export async function fetchAlerts(): Promise<Alert[]> {
  await delay(500 + Math.random() * 400);
  return generateAlerts();
}

export async function fetchResources(): Promise<Resource[]> {
  await delay(500 + Math.random() * 300);
  return generateResources();
}

export async function fetchVolunteers(): Promise<Volunteer[]> {
  await delay(400 + Math.random() * 400);
  return generateVolunteers();
}
