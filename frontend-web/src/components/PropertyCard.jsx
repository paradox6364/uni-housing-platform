'use client';
import { Footprints, Bus, Check, Sparkles } from 'lucide-react';

export default function PropertyCard({ property, universityName, isHovered, onHover, onLeave, onBook }) {
  return (
    <div
      onMouseEnter={() => onHover(property.id)}
      onMouseLeave={onLeave}
      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col sm:flex-row ${
        isHovered
          ? 'border-brand-500 shadow-lg ring-2 ring-brand-500/20'
          : 'border-slate-200 shadow-sm hover:shadow-md'
      }`}
    >
      <div className="sm:w-64 h-52 sm:h-auto relative shrink-0 bg-slate-200">
        <img
          src={property.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          {property.distanceToUniKm} km to Campus
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-lg text-slate-900 leading-snug">{property.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{property.address}, {property.city}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">From</span>
              <span className="text-2xl font-extrabold text-brand-600">${property.startingPrice}</span>
              <span className="text-xs text-slate-500 font-medium"> /month</span>
            </div>
          </div>

          {property.commute && (
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
              <span className="text-slate-400 font-medium">To {universityName}:</span>
              <span className="flex items-center gap-1 text-emerald-700">
                <Footprints className="w-3.5 h-3.5" />
                {property.commute.walkMinutes} min walk
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-blue-700">
                <Bus className="w-3.5 h-3.5" />
                {property.commute.transitMinutes} min transit
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 mt-3">
            {property.amenities?.slice(0, 4).map((amenity, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md"
              >
                <Check className="w-3 h-3 text-brand-600" />
                {amenity}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {property.rooms?.slice(0, 2).map((room) => (
              <div
                key={room.id}
                className="text-xs bg-blue-50/60 border border-blue-100 rounded-lg px-2.5 py-1 flex items-center gap-2"
              >
                <span className="font-medium text-slate-700">{room.name}</span>
                <span className="font-bold text-brand-600">${room.pricePerMonth}/mo</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => onBook(property)}
            className="shrink-0 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-sm"
          >
            Book Room
          </button>
        </div>
      </div>
    </div>
  );
}
