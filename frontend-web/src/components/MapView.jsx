"use client";

import React, { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, 14, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

const createUniIcon = () =>
  L.divIcon({
    className: 'custom-uni-marker',
    html: `<div class="uni-pin">🎓 Campus</div>`,
    iconSize: [90, 32],
    iconAnchor: [45, 16],
  });

const createPriceIcon = (price, isHovered) =>
  L.divIcon({
    className: 'custom-price-marker',
    html: `<div class="price-pin ${
      isHovered ? 'price-pin-active' : ''
    }">$${price || 'N/A'}</div>`,
    iconSize: [70, 30],
    iconAnchor: [35, 15],
  });

export default function MapView({
  university,
  listings = [],
  hoveredPropertyId,
  onSelectProperty,
}) {
  const center = university
    ? [university.latitude, university.longitude]
    : [51.5246, -0.134];

  return (
    <MapContainer
      center={center}
      zoom={14}
      className="w-full h-full z-0"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapUpdater center={center} />

      {/* University Campus Marker */}
      {university && (
        <Marker
          position={[university.latitude, university.longitude]}
          icon={createUniIcon()}
        >
          <Popup>
            <div className="text-xs font-bold text-slate-900">
              {university.name}
            </div>
            <div className="text-[11px] text-slate-500">
              {university.city}, {university.country}
            </div>
          </Popup>
        </Marker>
      )}

      {/* Property Price Markers: Hover = Details Tooltip, Click = Booking Modal */}
      {listings.map((property) => {
        const isHovered = hoveredPropertyId === property.id;
        const coverImg =
          property.images?.[0] ||
          'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80';

        return (
          <Marker
            key={`${property.id}-${isHovered ? 'active' : 'idle'}`}
            position={[property.latitude, property.longitude]}
            icon={createPriceIcon(property.startingPrice, isHovered)}
            zIndexOffset={isHovered ? 1000 : 0}
            eventHandlers={{
              click: (e) => {
                e.target.closeTooltip();
                if (onSelectProperty) {
                  onSelectProperty(property);
                }
              },
            }}
          >
            <Tooltip
              direction="top"
              offset={[0, -16]}
              opacity={1}
              className="!p-0 !border-0 !bg-transparent !shadow-none"
            >
              <div className="w-56 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden text-left whitespace-normal">
                <img
                  src={coverImg}
                  alt={property.title}
                  className="w-full h-28 object-cover"
                />
                <div className="p-3">
                  <h4 className="font-bold text-slate-900 text-xs truncate">
                    {property.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {property.address}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-blue-600">
                      From ${property.startingPrice}/mo
                    </span>
                    {property.distanceToUniKm !== undefined && (
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                        {property.distanceToUniKm} km
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                    Click pin to book room
                  </p>
                </div>
              </div>
            </Tooltip>
          </Marker>
        );
      })}
    </MapContainer>
  );
}