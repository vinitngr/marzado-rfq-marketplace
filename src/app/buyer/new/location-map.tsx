"use client";

import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression, LeafletMouseEvent } from "leaflet";
import * as React from "react";

const pinIcon = L.divIcon({
  className: "delivery-pin",
  html: "<span></span>",
  iconSize: [34, 42],
  iconAnchor: [17, 42],
});

type LocationMapProps = {
  position: { lat: number; lng: number };
  onPositionChange: (position: { lat: number; lng: number }) => void;
};

function MapViewport({ position }: { position: LocationMapProps["position"] }) {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo([position.lat, position.lng], Math.max(map.getZoom(), 15), { duration: 0.6 });
  }, [map, position.lat, position.lng]);
  return null;
}

function MapClickHandler({ onPositionChange }: Pick<LocationMapProps, "onPositionChange">) {
  useMapEvents({
    click(event: LeafletMouseEvent) {
      onPositionChange({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });
  return null;
}

export function LocationMap({ position, onPositionChange }: LocationMapProps) {
  const center: LatLngExpression = [position.lat, position.lng];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
      <MapContainer center={center} zoom={15} scrollWheelZoom className="h-72 w-full sm:h-80">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewport position={position} />
        <MapClickHandler onPositionChange={onPositionChange} />
        <Marker
          position={center}
          icon={pinIcon}
          draggable
          eventHandlers={{
            dragend(event) {
              const marker = event.target as L.Marker;
              const location = marker.getLatLng();
              onPositionChange({ lat: location.lat, lng: location.lng });
            },
          }}
        />
      </MapContainer>
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-white/95 px-3 py-2 text-xs font-medium text-slate-700 shadow-md">
        Drag the pin to the exact drop-off point
      </div>
    </div>
  );
}
