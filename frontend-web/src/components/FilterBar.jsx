'use client';
import { MapPin, DollarSign, Home, Compass } from 'lucide-react';

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
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 z-20 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2 border border-slate-200">
          <MapPin className="w-4 h-4 text-brand-600 mr-2 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">University Campus</span>
            <select
              value={selectedUniId}
              onChange={(e) => onSelectUni(e.target.value)}
              className="bg-transparent font-semibold text-sm text-slate-900 focus:outline-none cursor-pointer pr-4"
            >
              {universities.map((uni) => (
                <option key={uni.id} value={uni.id}>
                  {uni.name} ({uni.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2 border border-slate-200">
          <Home className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Room Type</span>
            <select
              value={category}
              onChange={(e) => onChangeCategory(e.target.value)}
              className="bg-transparent font-semibold text-sm text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="">All Room Types</option>
              <option value="PRIVATE_ROOM">Private Room</option>
              <option value="SHARED_ROOM">Shared Room</option>
              <option value="ENTIRE_PLACE">Entire Place</option>
            </select>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2 border border-slate-200">
          <DollarSign className="w-4 h-4 text-slate-500 mr-1.5 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Max Budget / Mo</span>
            <select
              value={maxPrice}
              onChange={(e) => onChangePrice(e.target.value)}
              className="bg-transparent font-semibold text-sm text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="">Any Price</option>
              <option value="180">Up to $180 / mo</option>
              <option value="250">Up to $250 / mo</option>
              <option value="350">Up to $350 / mo</option>
              <option value="500">Up to $500 / mo</option>
            </select>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2 border border-slate-200">
          <Compass className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
              Max Distance: {maxDistanceKm} km
            </span>
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

      <div className="text-sm font-semibold text-slate-600">
        Showing <span className="text-brand-600 font-bold">{totalFound}</span> verified properties
      </div>
    </div>
  );
}
