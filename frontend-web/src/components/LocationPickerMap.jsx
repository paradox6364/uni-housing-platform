"use client";

import React, { useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const createPinIcon = () =>
  L.divIcon({
    className: '',
    html: `<div class="price-pin price-pin-active" style="white-space: nowrap;">📍 Property Pin</div>`,
    iconSize: [110, 32],
    iconAnchor: [55, 16],
  });

function MapCameraUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (
      center &&
      typeof center[0] === 'number' &&
      !Number.isNaN(center[0]) &&
      typeof center[1] === 'number' &&
      !Number.isNaN(center[1])
    ) {
      map.flyTo(center, map.getZoom() < 13 ? 14 : map.getZoom(), {
        duration: 0.8,
      });
    }
  }, [center, map]);
  return null;
}

function MapClickHandler({ onPickLocation }) {
  useMapEvents({
    click(e) {
      onPickLocation(
        Number(e.latlng.lat.toFixed(6)),
        Number(e.latlng.lng.toFixed(6))
      );
    },
  });
  return null;
}

export default function LocationPickerMap({
  latitude,
  longitude,
  onLocationChange,
}) {
  const lat = parseFloat(latitude) || 30.04446;
  const lng = parseFloat(longitude) || 31.23565;
  const position = useMemo(() => [lat, lng], [lat, lng]);
  const pinIcon = useMemo(() => createPinIcon(), []);

  return (
    <div className="relative w-full h-72 rounded-xl overflow-hidden border border-slate-300 shadow-inner">
      <MapContainer
        center={position}
        zoom={14}
        className="w-full h-full z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapCameraUpdater center={position} />
        <MapClickHandler onPickLocation={onLocationChange} />

        <Marker
          position={position}
          icon={pinIcon}
          draggable={true}
          eventHandlers={{
            dragend: (e) => {
              const coords = e.target.getLatLng();
              onLocationChange(
                Number(coords.lat.toFixed(6)),
                Number(coords.lng.toFixed(6))
              );
            },
          }}
        />
      </MapContainer>

      <div className="absolute bottom-2.5 left-2.5 right-2.5 z-[400] pointer-events-none flex items-center justify-between bg-slate-900/80 backdrop-blur-sm text-white text-[11px] px-3 py-1.5 rounded-lg">
        <span>👆 Click anywhere on the map or drag the pin</span>
        <span className="font-mono font-semibold text-blue-300">
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </span>
      </div>
    </div>
  );
}