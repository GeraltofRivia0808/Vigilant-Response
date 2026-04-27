import type { Alert, Disaster, Resource, Volunteer } from "@/lib/types";

const BASE_URL = "http://localhost:3000/api";

type RawDisaster = {
  event_id?: string | number;
  type?: string;
  magnitude?: string | number;
  severity_level?: string;
  event_time?: string;
  region_id?: string | number;
  source_api?: string;
  display_value?: string;
};

type RawAlert = {
  alert_id?: string | number;
  event_id?: string | number;
  alert_message?: string;
  alert_time?: string;
  alert_status?: string;
  disaster_type?: string;
  region_name?: string;
};

type RawResource = {
  shelter_id?: string | number;
  shelter_name?: string;
  resource_type?: string;
  quantity?: string | number;
  region_id?: string | number;
  max_quantity?: string | number;
};

type RawVolunteer = {
  id?: string | number;
  volunteer_id?: string | number;
  name?: string;
  email?: string;
  region?: string;
  region_id?: string;
  status?: string;
  availability_status?: string;
  skills?: string;
  skill?: string;
  expertise?: string;
  phone?: string;
};

const toNumber = (value: string | number | undefined): number => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toAlertStatus = (value: string | undefined): Alert["status"] => {
  const status = value?.toUpperCase();
  if (status === "PENDING" || status === "SENT" || status === "DELIVERED" || status === "FAILED") {
    return status;
  }
  return "PENDING";
};

const toVolunteerStatus = (value: string | undefined): Volunteer["availability_status"] =>
  value === "Available" || value === "Assigned" || value === "Unavailable" ? value : "Unavailable";

export async function fetchDisasters(): Promise<Disaster[]> {
  const res = await fetch(`${BASE_URL}/disasters`);
  const json = (await res.json()) as { success?: boolean; data?: RawDisaster[] };
  const rows = Array.isArray(json.data) ? json.data : [];

  return rows.map((row) => ({
    event_id: row.event_id ?? "",
    type: String(row.type ?? "Unknown"),
    magnitude: toNumber(row.magnitude),
    severity_level: ((row.severity_level?.toUpperCase() ?? "LOW") as Disaster["severity_level"]),
    event_time: String(row.event_time ?? ""),
    region_id: row.region_id ?? "",
    source_api: String(row.source_api ?? ""),
    display_value: String(row.display_value ?? "Details unavailable"),
  }));
}

export async function fetchAlerts(): Promise<Alert[]> {
  const res = await fetch(`${BASE_URL}/alerts`);
  const json = (await res.json()) as { success?: boolean; data?: RawAlert[] };
  const rows = Array.isArray(json.data) ? json.data : [];

  return rows.map((row) => ({
    alert_id: row.alert_id ?? "",
    alert_message: String(row.alert_message ?? ""),
    disaster_type: String(row.disaster_type ?? "Unknown"),
    region_name: String(row.region_name ?? (row.event_id != null ? `Event ${row.event_id}` : "Unknown")),
    status: toAlertStatus(row.alert_status),
    alert_time: String(row.alert_time ?? ""),
  }));
}

export async function fetchResources(): Promise<Resource[]> {
  const res = await fetch(`${BASE_URL}/resources`);
  const json = (await res.json()) as { success?: boolean; data?: RawResource[] };
  const rows = Array.isArray(json.data) ? json.data : [];

  return rows.map((row, index) => ({
    id: `${row.shelter_name ?? "shelter"}-${row.resource_type ?? "resource"}-${index}`,
    shelter_id: row.shelter_id,
    shelter_name: String(row.shelter_name ?? "Unknown Shelter"),
    resource_type: String(row.resource_type ?? "Unknown Resource"),
    quantity: toNumber(row.quantity),
    max_quantity: Math.max(toNumber(row.max_quantity ?? row.quantity), 1),
    region_id: row.region_id,
  }));
}

export async function fetchVolunteers(): Promise<Volunteer[]> {
  const res = await fetch(`${BASE_URL}/volunteers`);
  const json = (await res.json()) as { success?: boolean; data?: RawVolunteer[] };
  const rows = Array.isArray(json.data) ? json.data : [];

  return rows.map((row) => ({
    id: row.id ?? row.volunteer_id ?? "",
    name: String(row.name ?? ""),
    email: String(row.email ?? ""),
    region_id: row.region_id ?? row.region ?? "",
    availability_status: toVolunteerStatus(row.availability_status ?? row.status),
    skills: String(row.skills ?? row.skill ?? row.expertise ?? "").trim(),
  }));
}

export async function useResource(payload: {
  shelter_id: number;
  resource_type: string;
  amount: number;
}): Promise<{ success: boolean; message?: string; remaining_quantity?: number }> {
  const res = await fetch(`${BASE_URL}/resources/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      shelter_id: Number(payload.shelter_id),
      resource_type: payload.resource_type,
      amount: Number(payload.amount),
    }),
  });

  const json = (await res.json()) as { success?: boolean; message?: string; error?: string; remaining_quantity?: number };

  if (!res.ok || !json.success) {
    throw new Error(json.message ?? json.error ?? "Failed to update resource quantity.");
  }

  return {
    success: true,
    message: json.message ?? "Resource updated.",
    remaining_quantity: json.remaining_quantity,
  };
}

export async function updateVolunteerStatus(payload: {
  volunteer_id: number;
  availability_status: Volunteer["availability_status"];
}): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${BASE_URL}/volunteers/update-status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      volunteer_id: payload.volunteer_id,
      availability_status: payload.availability_status,
      status: payload.availability_status,
    }),
  });

  const json = (await res.json()) as { success?: boolean; message?: string; error?: string };

  if (!res.ok || !json.success) {
    throw new Error(json.message ?? json.error ?? "Failed to update volunteer status.");
  }

  return {
    success: true,
    message: json.message ?? "Volunteer status updated.",
  };
}