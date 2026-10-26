'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Map as MapIcon, List as ListIcon } from 'lucide-react';
import Navbar from '../components/Navbar';
import FilterBar from '../components/FilterBar';
import PropertyCard from '../components/PropertyCard';
import BookingModal from '../components/BookingModal';
import { fetchUniversities, searchListings } from '../services/api';
import { useSettings } from '../context/SettingsContext';

function MapLoading() {
  const { t } = useSettings();
  return (
    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-medium">
      {t('home.mapLoading')}
    </div>
  );
}

const MapView = dynamic(() => import('../components/MapView'), {
  ssr: false,
  loading: () => <MapLoading />,
});

export default function HomePage() {
  const { t } = useSettings();
  const [universities, setUniversities] = useState([]);
  const [selectedUniId, setSelectedUniId] = useState('');
  const [currentUni, setCurrentUni] = useState(null);
  const [listings, setListings] = useState([]);
  const [hoveredPropertyId, setHoveredPropertyId] = useState(null);
  const [bookingProperty, setBookingProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  // على الموبايل نعرض إمّا القائمة أو الخريطة (على الشاشات الكبيرة يظهر الاثنان معًا)
  const [mobileView, setMobileView] = useState('list');

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
    <div className="app-screen flex flex-col overflow-hidden">
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
        <div
          className={`${
            mobileView === 'map' ? 'hidden' : 'block'
          } lg:block w-full lg:w-[55%] xl:w-[52%] h-full overflow-y-auto p-4 sm:p-6 pb-24 lg:pb-6 space-y-4 bg-slate-50`}
        >
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">
              {t('home.title', { name: currentUni?.name || t('home.campusFallback') })}
            </h1>
            <p className="text-xs text-slate-500">
              {t('home.subtitle')}
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
              <p className="font-bold text-slate-800 text-lg">{t('home.emptyTitle')}</p>
              <p className="text-sm text-slate-500 mt-1">{t('home.emptyHint')}</p>
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

        <div
          className={`${
            mobileView === 'map' ? 'block' : 'hidden'
          } lg:block w-full lg:w-[45%] xl:w-[48%] h-full relative border-s border-slate-200`}
        >
          <MapView
            university={currentUni}
            listings={listings}
            hoveredPropertyId={hoveredPropertyId}
            onSelectProperty={setBookingProperty}
          />
        </div>
      </main>

      {/* زر التبديل بين القائمة والخريطة (موبايل وتابلت فقط) */}
      <button
        type="button"
        onClick={() => setMobileView(mobileView === 'map' ? 'list' : 'map')}
        className="lg:hidden fixed bottom-5 inset-x-0 mx-auto w-fit z-30 inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold px-5 py-3 rounded-full shadow-lg shadow-brand-900/30 transition"
      >
        {mobileView === 'map' ? <ListIcon className="w-4 h-4" /> : <MapIcon className="w-4 h-4" />}
        {mobileView === 'map' ? t('home.showList') : t('home.showMap')}
      </button>

      {bookingProperty && (
        <BookingModal property={bookingProperty} onClose={() => setBookingProperty(null)} />
      )}
    </div>
  );
}
