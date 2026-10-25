"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Navbar from '../../../components/Navbar';
import BookingModal from '../../../components/BookingModal';
import { fetchPropertyById } from '../../../services/api';

const MapView = dynamic(() => import('../../../components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 text-sm">
      Loading neighborhood map...
    </div>
  ),
});

const FALLBACK_GALLERY = [
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
];

const CATEGORY_LABELS = {
  ALL: 'All Room Tiers',
  PRIVATE_ROOM: 'Private Room',
  EN_SUITE: 'En-Suite',
  ENTIRE_PLACE: 'Studio / Entire Place',
  SHARED_ROOM: 'Shared Room',
};

const CATEGORY_BADGE_STYLES = {
  PRIVATE_ROOM: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  EN_SUITE: 'bg-blue-50 text-blue-700 border-blue-200',
  ENTIRE_PLACE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  SHARED_ROOM: 'bg-amber-50 text-amber-800 border-amber-200',
};

export default function PropertyDetailsPage() {
  const params = useParams();
  const propertyId = params?.id;

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Multi-photo gallery state
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Room filter & Lease Calculator state
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [leaseMonths, setLeaseMonths] = useState(9);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    if (!propertyId) return;
    setLoading(true);
    fetchPropertyById(propertyId)
      .then((data) => {
        setProperty(data);
        if (data.rooms?.length > 0) {
          setSelectedRoomId(data.rooms[0].id);
        }
      })
      .catch((err) => setError(err.message || 'Could not load property'))
      .finally(() => setLoading(false));
  }, [propertyId]);

  const galleryImages = useMemo(() => {
    if (!property) return FALLBACK_GALLERY;
    if (Array.isArray(property.images) && property.images.length > 0) {
      return property.images;
    }
    return [FALLBACK_GALLERY[0]];
  }, [property]);

  const filteredRooms = useMemo(() => {
    if (!property?.rooms) return [];
    if (selectedCategory === 'ALL') return property.rooms;
    return property.rooms.filter((r) => r.category === selectedCategory);
  }, [property, selectedCategory]);

  const selectedRoom = useMemo(() => {
    if (!property?.rooms) return null;
    return (
      property.rooms.find((r) => r.id === selectedRoomId) ||
      property.rooms[0] ||
      null
    );
  }, [property, selectedRoomId]);

  // Lease Cost Calculator figures
  const monthlyRent = selectedRoom ? Number(selectedRoom.pricePerMonth) : 0;
  const securityDeposit = monthlyRent > 0 ? Math.round(monthlyRent * 0.5) : 0;
  const totalRentCost = monthlyRent * Number(leaseMonths);
  const grandTotalLeaseCost = totalRentCost + securityDeposit;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
          Loading property details & room tiers...
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-lg mx-auto mt-16 p-8 bg-white rounded-2xl border border-slate-200 text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Property Not Found
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            {error || 'The requested student accommodation could not be found.'}
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700"
          >
            &larr; Back to Explore Map
          </Link>
        </div>
      </div>
    );
  }

  const mapUniversity = property.primaryUniversity || {
    id: 'default-uni',
    name: `${property.city} Campus`,
    latitude: property.latitude,
    longitude: property.longitude,
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Breadcrumb & Header */}
        <div className="mb-4">
          <Link
            href="/"
            className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            &larr; Back to University Search
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {property.city}
              </span>
              {property.distanceToUniKm !== undefined && (
                <span className="bg-slate-200 text-slate-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  📍 {property.distanceToUniKm} km from{' '}
                  {property.primaryUniversity?.name || 'Campus'}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {property.title}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {property.address}, {property.city}
            </p>
          </div>

          {property.startingPrice && (
            <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm flex items-baseline gap-1.5 self-start md:self-auto">
              <span className="text-xs text-slate-400 font-medium">Starting from</span>
              <span className="text-2xl font-extrabold text-blue-600">
                ${property.startingPrice}
              </span>
              <span className="text-xs text-slate-500">/ month</span>
            </div>
          )}
        </div>

        {/* 1. Multi-Photo Gallery */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-10">
          <div className="lg:col-span-3 h-80 sm:h-[420px] rounded-2xl overflow-hidden bg-slate-200 relative">
            <img
              src={galleryImages[activeImageIdx]}
              alt={`${property.title} photo ${activeImageIdx + 1}`}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-3 right-3 bg-slate-900/75 text-white text-xs px-3 py-1 rounded-full">
              Photo {activeImageIdx + 1} of {galleryImages.length}
            </span>
          </div>

          <div className="grid grid-cols-4 lg:grid-cols-1 gap-3">
            {galleryImages.slice(0, 4).map((imgUrl, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveImageIdx(index)}
                className={`h-20 lg:h-[96px] rounded-xl overflow-hidden border-2 transition ${
                  activeImageIdx === index
                    ? 'border-blue-600 ring-2 ring-blue-500/30'
                    : 'border-transparent opacity-75 hover:opacity-100'
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </section>

        {/* Main 2-Column Layout: Left (Overview, Rooms, Map) | Right (Sticky Lease Cost Calculator) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Overview & Amenities */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                About This Student Residence
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {property.description}
              </p>

              {/* Commute Summary */}
              {property.commute && (
                <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400">
                      Campus Commute Estimate
                    </p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">
                      {property.primaryUniversity?.name || `${property.city} University`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-medium text-slate-700">
                    <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                      🚶 {property.commute.walkMins} mins walk
                    </span>
                    <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                      🚇 {property.commute.transitMins} mins transit
                    </span>
                  </div>
                </div>
              )}

              {/* Included Amenities */}
              {property.amenities?.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Included Amenities & Facilities
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {property.amenities.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100"
                      >
                        <span className="text-blue-600 font-bold">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Breakdown of Available Room Tiers */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Available Room Tiers ({property.rooms?.length || 0})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Select any room tier below to calculate your total lease cost or book immediately.
                  </p>
                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {Object.keys(CATEGORY_LABELS).map((catKey) => (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setSelectedCategory(catKey)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                        selectedCategory === catKey
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {CATEGORY_LABELS[catKey]}
                    </button>
                  ))}
                </div>
              </div>

              {filteredRooms.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">
                  No rooms match the selected category filter.
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredRooms.map((room) => {
                    const isSelected = selectedRoom?.id === room.id;
                    const badgeStyle =
                      CATEGORY_BADGE_STYLES[room.category] ||
                      'bg-slate-100 text-slate-700 border-slate-200';

                    return (
                      <div
                        key={room.id}
                        onClick={() => setSelectedRoomId(room.id)}
                        className={`p-4 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h3 className="font-bold text-slate-900">
                              {room.name}
                            </h3>
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeStyle}`}
                            >
                              {CATEGORY_LABELS[room.category] || room.category}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1.5">
                            {room.sizeSqm && <span>📐 {room.sizeSqm} m²</span>}
                            <span>
                              📅 Available from{' '}
                              {new Date(room.availableFrom).toLocaleDateString()}
                            </span>
                            <span className="text-emerald-700 font-medium">
                              ● {room.isAvailable ? 'Available Now' : 'Waitlist'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                          <div className="text-left sm:text-right">
                            <span className="text-lg font-extrabold text-slate-900">
                              ${room.pricePerMonth}
                            </span>
                            <span className="text-xs text-slate-500"> / mo</span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRoomId(room.id);
                              setIsBookingOpen(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
                          >
                            Book Room
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Interactive Neighborhood Map */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Interactive Neighborhood & Campus Map
                </h2>
                <p className="text-xs text-slate-500">
                  Explore {property.title}&apos;s exact location relative to nearby universities in {property.city}.
                </p>
              </div>

              <div className="h-80 w-full rounded-xl overflow-hidden border border-slate-200">
                <MapView
                  university={mapUniversity}
                  listings={[property]}
                  hoveredPropertyId={property.id}
                  onSelectProperty={() => setIsBookingOpen(true)}
                />
              </div>

              {property.nearbyUniversities?.length > 0 && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {property.nearbyUniversities.map((uni) => (
                    <div
                      key={uni.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{uni.name}</p>
                        <p className="text-slate-500">{uni.distanceToUniKm} km away</p>
                      </div>
                      <div className="text-right text-slate-600 font-medium">
                        <div>🚶 {uni.commute.walkMins}m</div>
                        <div>🚇 {uni.commute.transitMins}m</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: 4. Sticky Total Lease Cost Calculator */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Total Lease Calculator
                </h2>
                <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                  No Booking Fees
                </span>
              </div>

              <div className="space-y-4">
                {/* Room Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Selected Room Tier
                  </label>
                  <select
                    value={selectedRoom?.id || ''}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-medium bg-white"
                  >
                    {property.rooms?.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} — ${r.pricePerMonth}/mo
                      </option>
                    ))}
                  </select>
                </div>

                {/* Lease Duration Slider & Quick Presets */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-600 uppercase">
                      Lease Duration
                    </label>
                    <span className="text-sm font-bold text-blue-600">
                      {leaseMonths} {leaseMonths === 1 ? 'Month' : 'Months'}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={1}
                    max={24}
                    value={leaseMonths}
                    onChange={(e) => setLeaseMonths(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />

                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {[4, 6, 9, 12].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setLeaseMonths(m)}
                        className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                          leaseMonths === m
                            ? 'bg-blue-50 border-blue-600 text-blue-700'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {m} mos
                      </button>
                    ))}
                  </div>
                </div>

                {/* Itemized Lease Cost Breakdown */}
                <div className="pt-4 border-t border-slate-200 space-y-2.5 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Monthly Rent</span>
                    <span className="font-semibold text-slate-900">
                      ${monthlyRent.toLocaleString()} / mo
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>
                      Lease Subtotal ({monthlyRent.toLocaleString()} &times; {leaseMonths} mos)
                    </span>
                    <span className="font-semibold text-slate-900">
                      ${totalRentCost.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Refundable Security Deposit (50%)</span>
                    <span className="font-semibold text-slate-900">
                      ${securityDeposit.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Platform Service Fee</span>
                    <span className="text-emerald-600 font-semibold">$0 (Free)</span>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">
                      Total Estimated Lease
                    </span>
                    <span className="text-2xl font-extrabold text-blue-600">
                      ${grandTotalLeaseCost.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsBookingOpen(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm shadow-sm transition"
                >
                  Book This Room ({leaseMonths} Months)
                </button>

                {property.landlord && (
                  <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
                    <p className="font-semibold text-slate-700">
                      Managed by {property.landlord.name}
                    </p>
                    <p>{property.landlord.email}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Pre-Populated Booking Modal */}
      {isBookingOpen && (
        <BookingModal
          property={property}
          isOpen={isBookingOpen}
          initialRoomId={selectedRoom?.id}
          initialDurationMonths={leaseMonths}
          onClose={() => setIsBookingOpen(false)}
        />
      )}
    </div>
  );
}