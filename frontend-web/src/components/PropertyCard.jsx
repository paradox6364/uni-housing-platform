"use client";

import React from 'react';
import Link from 'next/link';

export default function PropertyCard({
  property,
  universityName,
  isHovered,
  onHover,
  onLeave,
  onBook,
}) {
  const coverImage =
    property.images?.[0] ||
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80';

  const walkTime =
    property.commute?.walkMins ??
    property.commute?.walkMinutes ??
    property.walkMins ??
    10;

  const transitTime =
    property.commute?.transitMins ??
    property.commute?.transitMinutes ??
    property.transitMins ??
    5;

  return (
    <div
      onMouseEnter={() => onHover && onHover(property.id)}
      onMouseLeave={() => onLeave && onLeave()}
      className={`bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border transition-all duration-200 flex flex-col justify-between ${
        isHovered
          ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-lg -translate-y-0.5'
          : 'border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md'
      }`}
    >
      <div>
        {/* Property Cover Image & Distance Badge */}
        <Link href={`/properties/${property.id}`} className="block relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden group">
          <img
            src={coverImage}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {property.distanceToUniKm !== undefined && (
            <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              📍 {property.distanceToUniKm} km to {universityName || 'Campus'}
            </span>
          )}
          <span className="absolute bottom-3 right-3 bg-white/95 dark:bg-slate-900/90 text-slate-900 dark:text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow">
            View Photos ({property.images?.length || 1})
          </span>
        </Link>

        {/* Card Body */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link href={`/properties/${property.id}`}>
                <h3 className="font-bold text-slate-900 dark:text-white text-base hover:text-blue-600 dark:hover:text-blue-400 transition truncate">
                  {property.title}
                </h3>
              </Link>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {property.address}, {property.city}
              </p>
            </div>

            {property.startingPrice && (
              <div className="text-right shrink-0">
                <span className="text-xs text-slate-400 block">From</span>
                <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400">
                  ${property.startingPrice}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  /mo
                </span>
              </div>
            )}
          </div>

          {/* Commute Time Badges (Safeguarded against undefined) */}
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-600 dark:text-slate-300">
            <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md font-medium">
              🚶 {walkTime} min walk
            </span>
            <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md font-medium">
              🚇 {transitTime} min transit
            </span>
          </div>

          {/* Landlord-Selected Amenities */}
          {Array.isArray(property.amenities) && property.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {property.amenities.slice(0, 4).map((amenity, idx) => (
                <span
                  key={idx}
                  className="text-[11px] bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md font-medium"
                >
                  {amenity}
                </span>
              ))}
              {property.amenities.length > 4 && (
                <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md font-medium">
                  +{property.amenities.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <Link
          href={`/properties/${property.id}`}
          className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          View Details &rarr;
        </Link>

        <button
          type="button"
          onClick={() => onBook && onBook(property)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition shadow-sm"
        >
          Book Room
        </button>
      </div>
    </div>
  );
}