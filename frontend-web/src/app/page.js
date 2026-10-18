'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '../components/Navbar';
import FilterBar from '../components/FilterBar';
import PropertyCard from '../components/PropertyCard';
import BookingModal from '../components/BookingModal';
import { fetchUniversities, searchListings } from '../services/api';

const MapView = dynamic(() => import('../components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-medium">
      Loading Campus Map...
    </div>
  ),
});

export default function HomePage() {
  const [universities, setUniversities] = useState([]);
  const [selectedUniId, setSelectedUniId] = useState('');
  const [currentUni, setCurrentUni] = useState(null);
  const [listings, setListings] = useState([]);
  const [hoveredPropertyId, setHoveredPropertyId] = useState(null);
  const [bookingProperty, setBookingProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  const [maxDistanceKm, setMaxDistanceKm] = useState(10);
  const [maxPrice, setMaxPrice] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    async function init() {
      const uniList = await fetchUniversities();
      setUniversities(uniList);
      if (uniList.length > 0) setSelectedUniId(uniList[0].id);
    }
    init();
  }, []);

  useEffect(() => {
    if (!selectedUniId) return;
    async function loadListings() {
      setLoading(true);
      const data = await searchListings({
        universityId: selectedUniId,
        maxDistanceKm,
        maxPrice,
        category,
      });
      setCurrentUni(data.university);
      setListings(data.listings || []);
      setLoading(false);
    }
    loadListings();
  }, [selectedUniId, maxDistanceKm, maxPrice, category]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />

      <FilterBar
        universities={universities}
        selectedUniId={selectedUniId}
        onSelectUni={setSelectedUniId}
        maxDistanceKm={maxDistanceKm}
        onChangeDistance={setMaxDistanceKm}
        maxPrice={maxPrice}
        onChangePrice={setMaxPrice}
        category={category}
        onChangeCategory={setCategory}
        totalFound={listings.length}
      />

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="w-full lg:w-[55%] xl:w-[52%] h-full overflow-y-auto p-6 space-y-4 bg-slate-50">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">
              Student Housing near {currentUni?.name || 'Campus'}
            </h1>
            <p className="text-xs text-slate-500">
              Compare verified rooms, walking distance, and monthly rent—all in one place.
            </p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="h-48 bg-white rounded-2xl border border-slate-200 animate-pulse p-5" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <p className="font-bold text-slate-800 text-lg">No student housing matches those filters</p>
              <p className="text-sm text-slate-500 mt-1">Try increasing your distance radius or max budget.</p>
            </div>
          ) : (
            listings.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                universityName={currentUni?.name}
                isHovered={hoveredPropertyId === property.id}
                onHover={setHoveredPropertyId}
                onLeave={() => setHoveredPropertyId(null)}
                onBook={setBookingProperty}
              />
            ))
          )}
        </div>

        <div className="hidden lg:block lg:w-[45%] xl:w-[48%] h-full relative border-l border-slate-200">
          <MapView
            university={currentUni}
            listings={listings}
            hoveredPropertyId={hoveredPropertyId}
            onSelectProperty={setBookingProperty}
          />
        </div>
      </main>

      {bookingProperty && (
        <BookingModal property={bookingProperty} onClose={() => setBookingProperty(null)} />
      )}
    </div>
  );
}
