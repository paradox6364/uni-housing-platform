'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

export default function MapView({ university, listings, hoveredPropertyId, onSelectProperty }) {
  const center = university
    ? [university.latitude, university.longitude]
    : [30.0276, 31.2101];

  const uniIcon = L.divIcon({
    className: '',
    html: `<div class="uni-pin">🎓 ${university?.name || 'University'}</div>`,
    iconSize: [150, 32],
    iconAnchor: [75, 16],
  });

  return (
    <MapContainer center={center} zoom={14} className="w-full h-full z-10" scrollWheelZoom={true}>
      {/* Official Keyless OpenStreetMap Standard Tile Server */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapUpdater center={center} />

      {university && (
        <>
          <Marker position={[university.latitude, university.longitude]} icon={uniIcon}>
            <Popup>
              <div className="font-bold text-sm">{university.name}</div>
              <div className="text-xs text-slate-500">Main Campus Coordinates</div>
            </Popup>
          </Marker>
          <Circle
            center={[university.latitude, university.longitude]}
            radius={1500}
            pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.08, weight: 1, dashArray: '4 4' }}
          />
        </>
      )}

      {listings.map((property) => {
        const isHovered = hoveredPropertyId === property.id;
        const priceIcon = L.divIcon({
          className: '',
          html: `<div class="price-pin ${isHovered ? 'price-pin-active' : ''}">$${property.startingPrice}</div>`,
          iconSize: [64, 28],
          iconAnchor: [32, 14],
        });

        return (
          <Marker
            key={property.id}
            position={[property.latitude, property.longitude]}
            icon={priceIcon}
            eventHandlers={{ click: () => onSelectProperty(property) }}
          >
            <Popup>
              <div className="w-48">
                <img
                  src={property.images?.[0]}
                  alt={property.title}
                  className="w-full h-24 object-cover rounded-lg mb-2"
                />
                <h4 className="font-bold text-sm text-slate-900">{property.title}</h4>
                <p className="text-xs text-slate-500">{property.distanceToUniKm} km from campus</p>
                <p className="text-sm font-extrabold text-brand-600 mt-1">
                  From ${property.startingPrice}/mo
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
