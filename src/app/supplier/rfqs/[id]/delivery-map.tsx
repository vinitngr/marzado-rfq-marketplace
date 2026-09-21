"use client";

import L from "leaflet";
import * as React from "react";

const pinIcon = L.divIcon({
  className: "delivery-pin",
  html: "<span></span>",
  iconSize: [34, 42],
  iconAnchor: [17, 42],
});

export function DeliveryMap({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const element = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!element.current) return;
    const map = L.map(element.current, {
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: false,
      doubleClickZoom: false,
    }).setView([latitude, longitude], 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    L.marker([latitude, longitude], { icon: pinIcon }).addTo(map);
    return () => {
      map.remove();
    };
  }, [latitude, longitude]);

  return (
    <div className="relative overflow-hidden border border-slate-200 bg-slate-100">
      <div ref={element} className="h-52 w-full" />
      <div className="pointer-events-none absolute bottom-2 left-2 bg-white/95 px-2.5 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm">
        Delivery point
      </div>
    </div>
  );
}
