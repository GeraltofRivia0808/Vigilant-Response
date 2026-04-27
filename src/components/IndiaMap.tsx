import { useMemo, useState } from "react";
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Disaster, Resource, Volunteer } from "@/lib/types";

type Region = {
  id: number;
  name: string;
  lat: number;
  lng: number;
};

const regions: Region[] = [
  { id: 1, name: "Chennai Metro", lat: 13.0827, lng: 80.2707 },
  { id: 2, name: "Mumbai Coastal", lat: 18.95, lng: 72.82 },
  { id: 3, name: "Mumbai", lat: 19.076, lng: 72.8777 },
  { id: 4, name: "Delhi", lat: 28.6139, lng: 77.209 },
  { id: 5, name: "Bangalore", lat: 12.9716, lng: 77.5946 },
  { id: 6, name: "Kolkata", lat: 22.5726, lng: 88.3639 },
];

const inferResourceRegionId = (resource: Resource): number | null => {
  if (resource.region_id != null) {
    const value = Number(resource.region_id);
    return Number.isFinite(value) ? value : null;
  }

  const shelter = resource.shelter_name.toLowerCase();
  if (shelter.includes("chennai")) return 1;
  if (shelter.includes("mumbai")) return shelter.includes("coastal") ? 2 : 3;
  if (shelter.includes("delhi")) return 4;
  if (shelter.includes("bangalore")) return 5;
  if (shelter.includes("kolkata")) return 6;
  return null;
};

interface IndiaMapProps {
  disasters: Disaster[];
  resources: Resource[];
  volunteers: Volunteer[];
}

export default function IndiaMap({ disasters, resources, volunteers }: IndiaMapProps) {
  const [activeRegionId, setActiveRegionId] = useState<number | null>(null);

  const regionResourceCache = useMemo(
    () =>
      resources.map((resource) => ({
        ...resource,
        mapped_region_id: inferResourceRegionId(resource),
      })),
    [resources]
  );

  const getRegionStats = (regionId: number) => {
    const disasterCount = disasters.filter((disaster) => Number(disaster.region_id) === regionId).length;
    const matchedResources = regionResourceCache.filter((resource) => resource.mapped_region_id === regionId);
    const totalResourceQuantity = matchedResources.reduce((sum, resource) => sum + resource.quantity, 0);
    const volunteerCount = volunteers.filter((volunteer) => Number(volunteer.region_id) === regionId).length;

    return {
      disasterCount,
      resourceTypes: matchedResources.length,
      totalResourceQuantity,
      volunteerCount,
    };
  };

  return (
    <div className="eoc-panel p-3">
      <div className="eoc-panel-header mb-2">
        <span>India Region Overview</span>
        <span className="text-[10px] text-muted-foreground">Pan, zoom, and hover markers</span>
      </div>

      <div className="overflow-hidden rounded border border-border">
        <MapContainer
          center={[22.5937, 78.9629]}
          zoom={5}
          minZoom={4}
          maxZoom={8}
          scrollWheelZoom
          className="h-[420px] w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            subdomains={["a", "b", "c", "d"]}
          />

          {regions.map((region) => {
            const stats = getRegionStats(region.id);
            const intensity = Math.min(1, stats.disasterCount / 5);
            const isActive = activeRegionId === region.id;

            return (
              <CircleMarker
                key={region.id}
                center={[region.lat, region.lng]}
                radius={isActive ? 12 : 9}
                pathOptions={{
                  color: "hsl(210 20% 90%)",
                  weight: 1.5,
                  fillOpacity: 0.8,
                  fillColor: intensity > 0 ? `rgba(239,68,68,${0.35 + intensity * 0.5})` : "rgba(34,197,94,0.65)",
                }}
                eventHandlers={{
                  mouseover: () => setActiveRegionId(region.id),
                  mouseout: () => setActiveRegionId((current) => (current === region.id ? null : current)),
                }}
              >
                <Tooltip direction="top" offset={[0, -8]} opacity={1} className="!bg-background !border !border-border !rounded !text-[11px] !text-foreground !shadow-lg">
                  <div className="space-y-0.5">
                    <p className="font-semibold">{region.name}</p>
                    <p>Disasters: {stats.disasterCount}</p>
                    <p>Resource Types: {stats.resourceTypes}</p>
                    <p>Total Resources: {stats.totalResourceQuantity}</p>
                    <p>Volunteers: {stats.volunteerCount}</p>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
