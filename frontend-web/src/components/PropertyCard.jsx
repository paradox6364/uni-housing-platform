"use client";

import React from 'react';
import Link from 'next/link';
import { useSettings } from '../context/SettingsContext';

export default function PropertyCard({
  property,
  universityName,
  isHovered,
  onHover,
  onLeave,
  onBook,
}) {
  const { t } = useSettings();

  const coverImage =
    property.images?.[0] ||
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80';

  const rooms = property.rooms || [];

  return (
    <div
      onMouseEnter={() => onHover && onHover(property.id)}
      onMouseLeave={() => {
        if (onLeave) onLeave();
        else if (onHover) onHover(null);
      }}
      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col sm:flex-row ${
        isHovered
          ? 'border-brand-500 shadow-lg ring-2 ring-brand-500/20'
          : 'border-slate-200 shadow-sm hover:shadow-md'
      }`}
    >
      {/* صورة العقار — تفتح صفحة التفاصيل */}
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
          <span className="absolute top-3 start-3 bg-slate-900/80 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            {t('card.distance', { km: property.distanceToUniKm })}
          </span>
        )}
      </Link>

      {/* محتوى البطاقة */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link
                href={`/properties/${property.id}`}
                className="text-lg font-bold text-slate-900 hover:text-brand-600 transition"
              >
                {property.title}
              </Link>
              <p className="text-xs text-slate-500 mt-0.5">
                {property.address}, {property.city}
              </p>
            </div>

            {property.startingPrice && (
              <div className="text-end shrink-0">
                <span className="text-xs text-slate-400 block">{t('card.from')}</span>
                <span className="text-lg font-extrabold text-brand-600">
                  ${property.startingPrice}
                </span>
                <span className="text-xs text-slate-500"> {t('card.perMonth')}</span>
              </div>
            )}
          </div>

          {/* مدة الوصول للجامعة */}
          {property.commute && (
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-600">
              <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                🚶 {t('card.walk', { n: property.commute.walkMins })}
              </span>
              <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                🚇 {t('card.transit', { n: property.commute.transitMins })}
              </span>
              {universityName && (
                <span className="text-slate-400 truncate">
                  {t('card.toUni', { name: universityName })}
                </span>
              )}
            </div>
          )}

          {/* المميزات */}
          {property.amenities?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {property.amenities.slice(0, 4).map((amenity, idx) => (
                <span
                  key={idx}
                  className="text-[11px] bg-brand-50 text-brand-700 px-2 py-0.5 rounded font-medium"
                >
                  {amenity}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* الأزرار */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {t('card.roomTiers', { n: rooms.length })}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/properties/${property.id}`}
              className="border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg transition"
            >
              {t('card.viewDetails')}
            </Link>
            {onBook && (
              <button
                type="button"
                onClick={() => onBook(property)}
                className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition shadow-sm"
              >
                {t('card.book')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
