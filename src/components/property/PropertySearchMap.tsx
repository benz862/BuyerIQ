"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { BuyerIQProperty } from "@/types/property";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

type Props = {
  properties: BuyerIQProperty[];
  selectedPropertyId?: string | null;
  onSelectProperty?: (property: BuyerIQProperty) => void;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function markerLabel(property: BuyerIQProperty) {
  if (!property.price) {
    return property.listingType === "rent" ? "Rent" : "Sale";
  }

  if (property.listingType === "rent") {
    return `$${Math.round(property.price).toLocaleString()}`;
  }

  return `$${Math.round(property.price / 1000)}k`;
}

export function PropertySearchMap({
  properties,
  selectedPropertyId,
  onSelectProperty,
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
      console.error("Missing NEXT_PUBLIC_MAPBOX_TOKEN.");
      return;
    }

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-81.8723, 26.6406],
      zoom: 10,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const bounds = new mapboxgl.LngLatBounds();

    properties.forEach((property) => {
      const element = document.createElement("button");
      element.type = "button";
      element.className =
        "rounded-full border border-white bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground shadow-md transition-transform";
      element.textContent = markerLabel(property);
      element.setAttribute("aria-label", `Select ${property.address}`);

      if (property.id === selectedPropertyId) {
        element.style.transform = "scale(1.15)";
      }

      element.addEventListener("click", () => {
        onSelectProperty?.(property);
      });

      const popup = new mapboxgl.Popup({ offset: 18 }).setHTML(`
        <div style="max-width:220px">
          <strong>${escapeHtml(property.address)}</strong>
          <div>${property.price ? `$${property.price.toLocaleString()}` : "Price unavailable"}</div>
          <div>${property.bedrooms ?? "-"} bed &middot; ${property.bathrooms ?? "-"} bath</div>
        </div>
      `);

      const marker = new mapboxgl.Marker({ element })
        .setLngLat([property.longitude, property.latitude])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
      bounds.extend([property.longitude, property.latitude]);
    });

    if (properties.length > 0) {
      map.fitBounds(bounds, {
        padding: 60,
        maxZoom: 13,
        duration: 700,
      });
    }
  }, [properties, selectedPropertyId, onSelectProperty]);

  return (
    <div className="h-[520px] w-full overflow-hidden rounded-xl border">
      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  );
}
