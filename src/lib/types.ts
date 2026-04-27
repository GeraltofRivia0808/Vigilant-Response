export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type AlertStatus = "PENDING" | "SENT" | "DELIVERED" | "FAILED";
export type VolunteerStatus = "Available" | "Assigned" | "Unavailable";

export interface Disaster {
  event_id: string | number;
  type: string;
  magnitude: number;
  severity_level: Severity;
  event_time: string;
  region_id: string | number;
  source_api: string;
  display_value: string;
}

export interface Alert {
  alert_id: string | number;
  alert_message: string;
  disaster_type: string;
  region_name: string;
  status: AlertStatus;
  alert_time: string;
}

export interface Resource {
  id: string;
  shelter_id?: string | number;
  shelter_name: string;
  resource_type: string;
  quantity: number;
  max_quantity: number;
  region_id?: string | number;
}

export interface Volunteer {
  id: string | number;
  name: string;
  email: string;
  region_id: string | number;
  availability_status: VolunteerStatus;
  skills: string;
}