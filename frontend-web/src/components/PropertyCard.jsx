"use client";

import React from 'react';
import Link from 'next/link';

export default function PropertyCard({
  property,
  universityName,
  isHovered,
  onHover,
  onLeave,
}) {
  const coverImage =
    property.images?.[0] ||
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80';

  const rooms = property.rooms || [];

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col sm:flex-row ${
        isHovered
          ? 'border-blue-500 shadow-lg ring-2 ring-blue-500/20'
          : 'border-slate-200 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Thumbnail Image linking to Details Page */}
      <Link
        href={`/properties/${property.id}`}
        className="sm:w-56 h-48 sm:h-auto relative shrink-0 block group overflow-hidden"
      >
        <img
          src={coverImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {property.distanceToUniKm !== undefined && (
          <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            {property.distanceToUniKm} km from campus
          </span>
        )}
      </Link>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link
                href={`/properties/${property.id}`}
                className="text-lg font-bold text-slate-900 hover:text-blue-600 transition"
              >
                {property.title}
              </Link>
              <p className="text-xs text-slate-500 mt-0.5">
                {property.address}, {property.city}
              </p>
            </div>

            {property.startingPrice && (
              <div className="text-right shrink-0">
                <span className="text-xs text-slate-400 block">From</span>
                <span className="text-lg font-extrabold text-blue-600">
                  ${property.startingPrice}
                </span>
                <span className="text-xs text-slate-500">/mo</span>
              </div>
            )}
          </div>

          {/* Commute Badges */}
          {property.commute && (
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-600">
              <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                🚶 {property.commute.walkMins} min walk
              </span>
              <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                🚇 {property.commute.transitMins} min transit
              </span>
              {universityName && (
                <span className="text-slate-400 truncate">
                  to {universityName}
                </span>
              )}
            </div>
          )}

          {/* Amenities Preview */}
          {property.amenities?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {property.amenities.slice(0, 4).map((amenity, idx) => (
                <span
                  key={idx}
                  className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium"
                >
                  {amenity}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer: Room Tiers Count & View Details CTA */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{rooms.length}</span>{' '}
            {rooms.length === 1 ? 'room tier' : 'room tiers'} available
          </div>

          <Link
            href={`/properties/${property.id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm"
          >
            View Details & Rooms &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}