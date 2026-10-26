'use client';
import { MapPin, DollarSign, Home, Compass } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

// ستايل مشترك لعناوين الحقول الصغيرة
// (tracking في العربي يفكّك اتصال الحروف، لذلك نلغيه في وضع RTL)
const labelClass =
  'text-[10px] uppercase tracking-wider rtl:tracking-normal rtl:text-[11px] font-bold text-slate-500';

const fieldClass =
  'flex items-center bg-slate-100 rounded-xl px-3 py-2 border border-slate-200 shrink-0';

export default function FilterBar({
  universities,
  selectedUniId,
  onSelectUni,
  maxDistanceKm,
  onChangeDistance,
  maxPrice,
  onChangePrice,
  category,
  onChangeCategory,
  totalFound
}) {
  const { t } = useSettings();

  return (
    <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2 sm:gap-4 z-20 shadow-sm">
      <div className="flex flex-nowrap sm:flex-wrap items-center gap-2 sm:gap-3 overflow-x-auto sm:overflow-visible w-full lg:w-auto pb-1 sm:pb-0">
        <div className={fieldClass}>
          <MapPin className="w-4 h-4 text-brand-600 me-2 shrink-0" />
          <div className="flex flex-col">
            <span className={labelClass}>{t('filter.university')}</span>
            <select
              value={selectedUniId}
              onChange={(e) => onSelectUni(e.target.value)}
              className="bg-transparent font-semibold text-sm text-slate-900 focus:outline-none cursor-pointer pe-4"
            >
              {universities.map((uni) => (
                <option key={uni.id} value={uni.id}>
                  {uni.name} ({uni.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={fieldClass}>
          <Home className="w-4 h-4 text-slate-500 me-2 shrink-0" />
          <div className="flex flex-col">
            <span className={labelClass}>{t('filter.roomType')}</span>
            <select
              value={category}
              onChange={(e) => onChangeCategory(e.target.value)}
              className="bg-transparent font-semibold text-sm text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="">{t('filter.allRoomTypes')}</option>
              <option value="PRIVATE_ROOM">{t('room.PRIVATE_ROOM')}</option>
              <option value="SHARED_ROOM">{t('room.SHARED_ROOM')}</option>
              <option value="ENTIRE_PLACE">{t('room.ENTIRE_PLACE')}</option>
            </select>
          </div>
        </div>

        <div className={fieldClass}>
          <DollarSign className="w-4 h-4 text-slate-500 me-1.5 shrink-0" />
          <div className="flex flex-col">
            <span className={labelClass}>{t('filter.maxBudget')}</span>
            <select
              value={maxPrice}
              onChange={(e) => onChangePrice(e.target.value)}
              className="bg-transparent font-semibold text-sm text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="">{t('filter.anyPrice')}</option>
              {[180, 250, 350, 500].map((price) => (
                <option key={price} value={String(price)}>
                  {t('filter.upTo', { price })}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={fieldClass}>
          <Compass className="w-4 h-4 text-slate-500 me-2 shrink-0" />
          <div className="flex flex-col">
            <span className={labelClass}>{t('filter.maxDistance', { km: maxDistanceKm })}</span>
            <input
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={maxDistanceKm}
              onChange={(e) => onChangeDistance(e.target.value)}
              className="w-28 accent-brand-600 cursor-pointer h-4"
            />
          </div>
        </div>
      </div>

      <div className="text-xs sm:text-sm font-semibold text-slate-600">
        {t('filter.showing', { n: totalFound })}
      </div>
    </div>
  );
}
