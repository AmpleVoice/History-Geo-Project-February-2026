"use client";

// @ts-ignore
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Types for the map component
interface Region {
  id: string;
  nameAr: string;
  code: string;
  eventCount: number;
}

interface AlgeriaMapProps {
  onRegionHover?: (region: Region | null) => void;
  onRegionSelect?: (region: Region | null) => void;
  selectedRegionId?: string | null;
  className?: string;
}

// This component will be dynamically imported to avoid SSR issues with Leaflet
export function AlgeriaMap({
  onRegionHover,
  onRegionSelect,
  selectedRegionId,
  className,
}: AlgeriaMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let map: L.Map | null = null;
    let geoJsonLayer: L.LayerGroup | null = null;

    const initMap = async () => {
      try {
        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");

        if (!mapRef.current || (mapRef.current as any)._leaflet_id) return; // Prevent double init

        map = L.map(mapRef.current, {
          center: [28.0339, 1.6596],
          zoom: 5,
          minZoom: 4,
          maxZoom: 10,
          zoomControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(map);

        // Fetch the GeoJSON from the public folder
        try {
          const response = await fetch("/data/algeria-wilayas.geojson");
          if (response.ok) {
            const geoJsonData = await response.json();
            console.log("--- GEOJSON DATA CHECK ---");
            console.log("Total features found:", geoJsonData.features?.length);
            console.log(
              "First feature properties:",
              geoJsonData.features?.[0]?.properties,
            );
            console.log("--------------------------");
            // Render features as circle markers (centroid-based) for a cleaner look
            const markers = L.layerGroup();
            const features = Array.isArray(geoJsonData.features)
              ? geoJsonData.features
              : [];
            features.forEach((feature: any) => {
              const props = feature.properties || {};
              const count = Number(props.event_count ?? 0);
              
              // Skip regions with no events
              if (count === 0) return;

              // compute a simple centroid (average of first ring coordinates)
              let lat = 28.0339,
                lng = 1.6596;
              try {
                const geom = feature.geometry;
                if (geom) {
                  let ring = null;
                  if (geom.type === "Polygon") ring = geom.coordinates?.[0];
                  else if (geom.type === "MultiPolygon")
                    ring = geom.coordinates?.[0]?.[0];
                  if (ring && ring.length) {
                    let sumLat = 0,
                      sumLng = 0;
                    ring.forEach((pt: any) => {
                      sumLng += Number(pt?.[0] ?? 0);
                      sumLat += Number(pt?.[1] ?? 0);
                    });
                    lat = sumLat / ring.length;
                    lng = sumLng / ring.length;
                  }
                }
              } catch (err) {
                // fallback center
              }

              const fill =
                count >= 3
                  ? "#1e3a8a"
                  : count === 2
                    ? "#2563eb"
                    : count === 1
                      ? "#60a5fa"
                      : "#e6f0ff";
              const stroke = "#0b3d91";
              const baseRadius = Math.min(12, 4 + count * 2);

              const marker = L.circleMarker([lat, lng], {
                radius: baseRadius,
                fillColor: fill,
                color: stroke,
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8,
              }) as any;

              // attach feature for identification in updates
              marker.feature = feature;
              marker.__baseStyle = {
                radius: baseRadius,
                fillColor: fill,
                color: stroke,
                weight: 1,
                fillOpacity: 0.8,
              };

              const region = {
                id: props.id || props.code,
                nameAr: props.name_ar || props.name,
                code: props.code,
                eventCount: props.event_count || 0,
              };

              marker.bindTooltip(
                `<b>${region.nameAr}</b><br>${region.eventCount} حدث`,
                { sticky: true },
              );

              marker.on("mouseover", (e: any) => {
                try {
                  marker.bringToFront?.();
                } catch {}
                marker.setStyle({
                  radius: baseRadius * 1.4,
                  weight: 2,
                  fillOpacity: 0.95,
                });
                const el = (marker as any)._path;
                if (el) {
                  el.style.cursor = "pointer";
                  el.style.transition =
                    "r 160ms, stroke-width 160ms, fill-opacity 160ms";
                }
                onRegionHover?.(region);
              });

              marker.on("mouseout", (e: any) => {
                const s = marker.__baseStyle || {};
                marker.setStyle({
                  radius: s.radius,
                  weight: s.weight,
                  fillOpacity: s.fillOpacity,
                });
                onRegionHover?.(null);
              });

              marker.on("click", () => onRegionSelect?.(region));

              markers.addLayer(marker);
            });

            markers.addTo(map);
            geoJsonLayer = markers;
          }
        } catch (e) {
          console.error("GeoJSON load error", e);
        }

        setIsLoaded(true);

        // Final Fix: Force Leaflet to recalculate size after loading
        setTimeout(() => map?.invalidateSize(), 100);
      } catch (err) {
        console.error("Map initialization error:", err);
        setError("فشل تحميل الخريطة");
      }
    };

    initMap();

    return () => {
      if (map) {
        map.off();
        map.remove();
        map = null;
      }
    };
    // Keep the dependency array simple to avoid re-runs
  }, []);

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-neutral-100",
          className,
        )}
      >
        <div className="text-center p-8">
          <p className="text-accent-600 mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-primary-600 hover:underline"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-neutral-600">جاري تحميل الخريطة...</p>
          </div>
        </div>
      )}
      <div
        ref={mapRef}
        className="w-full h-full"
        style={{ minHeight: "400px" }}
      />
    </div>
  );
}

// Default export for dynamic import
export default AlgeriaMap;
