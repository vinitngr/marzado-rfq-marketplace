"use client";

import L from "leaflet";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
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

export function LocationMap({ position, onPositionChange }: LocationMapProps) {
  const mapElement = React.useRef<HTMLDivElement>(null);
  const mapInstance = React.useRef<LeafletMap | null>(null);
  const markerInstance = React.useRef<LeafletMarker | null>(null);
  const initialPosition = React.useRef(position);
  const onPositionChangeRef = React.useRef(onPositionChange);

  React.useEffect(() => {
    onPositionChangeRef.current = onPositionChange;
  }, [onPositionChange]);

  React.useEffect(() => {
    if (!mapElement.current || mapInstance.current) return;

    const map = L.map(mapElement.current, { scrollWheelZoom: true }).setView([initialPosition.current.lat, initialPosition.current.lng], 15);
    const marker = L.marker([initialPosition.current.lat, initialPosition.current.lng], { icon: pinIcon, draggable: true }).addTo(map);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    map.on("click", (event) => {
      marker.setLatLng(event.latlng);
      onPositionChangeRef.current({ lat: event.latlng.lat, lng: event.latlng.lng });
    });
    marker.on("dragend", () => {
      const location = marker.getLatLng();
      onPositionChangeRef.current({ lat: location.lat, lng: location.lng });
    });

    mapInstance.current = map;
    markerInstance.current = marker;

    return () => {
      marker.off();
      map.off();
      map.remove();
      markerInstance.current = null;
      mapInstance.current = null;
    };
  }, []);

  React.useEffect(() => {
    const map = mapInstance.current;
    const marker = markerInstance.current;
    if (!map || !marker) return;
    const nextPoint: L.LatLngExpression = [position.lat, position.lng];
    marker.setLatLng(nextPoint);
    map.flyTo(nextPoint, Math.max(map.getZoom(), 15), { duration: 0.6 });
  }, [position.lat, position.lng]);

  return (
    <div className="relative overflow-hidden rounded-none border border-slate-200 bg-slate-100 shadow-sm">
      <div ref={mapElement} className="h-72 w-full sm:h-80" />
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-white/95 px-3 py-2 text-xs font-medium text-slate-700 shadow-md">
        Drag the pin to the exact drop-off point
      </div>
    </div>
  );
}
