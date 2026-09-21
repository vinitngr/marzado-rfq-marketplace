"use client";

import dynamic from "next/dynamic";
import * as React from "react";
import { Check, LocateFixed, MapPin, Search, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const LocationMap = dynamic(
  () => import("./location-map").then((module) => module.LocationMap),
  { ssr: false },
);
const SAVED_LOCATIONS_KEY = "merzado:saved-delivery-locations";
const DEFAULT_POSITION = { lat: 20.5937, lng: 78.9629 };

type SavedLocation = { label: string; lat: number; lng: number };
type AddressResult = { label: string; lat: number; lng: number };

async function reverseGeocode(lat: number, lng: number) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
    { headers: { Accept: "application/json" } },
  );
  if (!response.ok) throw new Error("Could not find this address.");
  const result = (await response.json()) as { display_name?: string };
  return (
    result.display_name ??
    `Pinned location (${lat.toFixed(5)}, ${lng.toFixed(5)})`
  );
}

async function findAddresses(query: string) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(query)}`,
    { headers: { Accept: "application/json" } },
  );
  if (!response.ok) throw new Error("Could not search for this address.");
  const results = (await response.json()) as Array<{
    display_name: string;
    lat: string;
    lon: string;
  }>;
  return results.map((result) => ({
    label: result.display_name,
    lat: Number(result.lat),
    lng: Number(result.lon),
  }));
}

export function LocationPicker() {
  const [address, setAddress] = React.useState("");
  const [position, setPosition] = React.useState(DEFAULT_POSITION);
  const [savedLocations, setSavedLocations] = React.useState<SavedLocation[]>(
    [],
  );
  const [busy, setBusy] = React.useState<"search" | "locate" | "">("");
  const [saved, setSaved] = React.useState(false);
  const [locationError, setLocationError] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<AddressResult[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = React.useState(false);

  React.useEffect(() => {
    const restoreSavedLocations = window.setTimeout(() => {
      const stored = window.localStorage.getItem(SAVED_LOCATIONS_KEY);
      if (!stored) return;
      try {
        setSavedLocations(JSON.parse(stored) as SavedLocation[]);
      } catch {
        window.localStorage.removeItem(SAVED_LOCATIONS_KEY);
      }
    }, 0);
    return () => window.clearTimeout(restoreSavedLocations);
  }, []);

  function updatePosition(nextPosition: { lat: number; lng: number }) {
    setPosition(nextPosition);
    setSaved(false);
    setLocationError("");
    void reverseGeocode(nextPosition.lat, nextPosition.lng)
      .then(setAddress)
      .catch(() => undefined);
  }

  async function searchAddress() {
    if (!address.trim()) return;
    setBusy("search");
    setLocationError("");
    try {
      const results = await findAddresses(address.trim());
      if (!results[0]) throw new Error("No matching address found.");
      selectAddress(results[0]);
    } catch (error) {
      setLocationError(
        error instanceof Error
          ? error.message
          : "Could not search for this address.",
      );
    } finally {
      setBusy("");
    }
  }

  function selectAddress(result: AddressResult) {
    setAddress(result.label);
    setPosition({ lat: result.lat, lng: result.lng });
    setSuggestions([]);
    setSuggestionsOpen(false);
    setSaved(false);
    setLocationError("");
  }

  React.useEffect(() => {
    if (address.trim().length < 3 || saved) return;
    const timer = window.setTimeout(async () => {
      try {
        setSuggestions(await findAddresses(address.trim()));
      } catch {
        setSuggestions([]);
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [address, saved]);

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationError("Location is not available in this browser.");
      return;
    }
    setBusy("locate");
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const nextPosition = { lat: coords.latitude, lng: coords.longitude };
        setPosition(nextPosition);
        try {
          setAddress(await reverseGeocode(nextPosition.lat, nextPosition.lng));
        } catch {
          setAddress(
            `Pinned location (${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)})`,
          );
        } finally {
          setBusy("");
        }
      },
      () => {
        setLocationError(
          "We could not access your location. You can search for an address or drag the pin instead.",
        );
        setBusy("");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function saveLocation() {
    if (!address.trim()) return;
    const nextLocation = { label: address.trim(), ...position };
    const nextSavedLocations = [
      nextLocation,
      ...savedLocations.filter(
        (location) => location.label !== nextLocation.label,
      ),
    ].slice(0, 3);
    window.localStorage.setItem(
      SAVED_LOCATIONS_KEY,
      JSON.stringify(nextSavedLocations),
    );
    setSavedLocations(nextSavedLocations);
    setSaved(true);
  }

  function selectSavedLocation(location: SavedLocation) {
    setAddress(location.label);
    updatePosition({ lat: location.lat, lng: location.lng });
    setSaved(true);
  }

  function deleteSavedLocation(location: SavedLocation) {
    const nextSavedLocations = savedLocations.filter(
      (savedLocation) =>
        savedLocation.label !== location.label ||
        savedLocation.lat !== location.lat ||
        savedLocation.lng !== location.lng,
    );
    window.localStorage.setItem(
      SAVED_LOCATIONS_KEY,
      JSON.stringify(nextSavedLocations),
    );
    setSavedLocations(nextSavedLocations);
    if (
      address === location.label &&
      position.lat === location.lat &&
      position.lng === location.lng
    ) {
      setSaved(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <label
          className="text-sm font-medium text-slate-800"
          htmlFor="delivery-location"
        >
          Where should we deliver?
        </label>
        <button
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          type="button"
          onClick={useCurrentLocation}
          disabled={busy === "locate"}
        >
          <LocateFixed className="size-3.5" />
          {busy === "locate" ? "Locating..." : "Use my location"}
        </button>
      </div>
      <div className="relative flex gap-2">
        <div className="relative min-w-0 flex-1">
          <MapPin className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" />
          <Input
            className="border-slate-300 bg-white pl-9 focus-visible:border-slate-400 focus-visible:ring-0"
            id="delivery-location"
            name="deliveryLocation"
            value={address}
            onFocus={() => setSuggestionsOpen(true)}
            onChange={(event) => {
              setAddress(event.target.value);
              setSaved(false);
              setSuggestions([]);
              setSuggestionsOpen(true);
            }}
            placeholder="Search for a building, street, or area"
            required
            maxLength={500}
            autoComplete="off"
          />
          {suggestionsOpen && suggestions.length > 0 && (
            <div className="absolute inset-x-0 top-full z-[1001] mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              {suggestions.map((suggestion) => (
                <button
                  className="flex w-full items-start gap-2 border-b border-slate-100 px-3 py-3 text-left text-xs text-slate-700 last:border-0 hover:bg-emerald-50"
                  key={`${suggestion.label}-${suggestion.lat}`}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectAddress(suggestion)}
                >
                  <MapPin className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                  <span>{suggestion.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <Button
          className="shrink-0"
          type="button"
          variant="outline"
          disabled={busy === "search"}
          onClick={() => void searchAddress()}
          aria-label="Search address"
        >
          <Search className="size-4" />
        </Button>
      </div>
      <LocationMap position={position} onPositionChange={updatePosition} />
      <input
        name="deliveryLatitude"
        type="hidden"
        value={position.lat}
        readOnly
      />
      <input
        name="deliveryLongitude"
        type="hidden"
        value={position.lng}
        readOnly
      />
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 text-xs text-slate-500">
          <span className="font-medium text-slate-700">Selected:</span>{" "}
          {address || "Search or move the pin to choose a location"}
        </p>
        <Button
          className="shrink-0"
          type="button"
          variant="ghost"
          onClick={saveLocation}
          disabled={!address.trim() || saved}
        >
          {saved ? (
            <Check className="size-4 text-emerald-600" />
          ) : (
            <Star className="size-4" />
          )}
          {saved ? "Saved" : "Save location"}
        </Button>
      </div>
      {savedLocations.length > 0 && (
        <div className="rounded-none border border-slate-300 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Saved locations
          </p>
          <div className="mt-2 grid gap-2">
            {savedLocations.map((location) => (
              <div
                className="flex items-stretch border border-slate-200 bg-white"
                key={`${location.label}-${location.lat}`}
              >
                <button
                  className="flex min-w-0 flex-1 items-start gap-2 p-2 text-left text-xs text-slate-700 transition hover:bg-emerald-50"
                  type="button"
                  onClick={() => selectSavedLocation(location)}
                >
                  <Star className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                  <span className="line-clamp-2">{location.label}</span>
                </button>
                <button
                  className="flex w-9 shrink-0 items-center justify-center border-l border-slate-200 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  type="button"
                  onClick={() => deleteSavedLocation(location)}
                  aria-label={`Delete saved location ${location.label}`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {locationError && (
        <p className="text-xs text-red-600" role="alert">
          {locationError}
        </p>
      )}
      <p className="text-xs text-slate-500">
        Your saved locations stay in this browser and are only used to speed up
        your next RFQ.
      </p>
    </div>
  );
}
