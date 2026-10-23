"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Navbar from '../../components/Navbar';
import {
  fetchAllBookings,
  fetchUniversities,
  createNewProperty,
  updateBookingStatus,
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const LocationPickerMap = dynamic(
  () => import('../../components/LocationPickerMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-80 rounded-xl bg-slate-100 animate-pulse flex items-center justify-center text-xs text-slate-400 border border-slate-200">
        Loading interactive map picker...
      </div>
    ),
  }
);

const AMENITY_OPTIONS = [
  'High-Speed Wi-Fi',
  'All Bills Included',
  '24/7 Security & CCTV',
  'Air Conditioning',
  'Study Lounge',
  'On-Site Laundry',
  'Gym & Fitness Center',
  'Fully Furnished',
  'Shared Kitchen',
  'Bike Storage',
  'Elevator Access',
  'Cleaning Service',
];

// Client-side image compressor so uploaded files stay lightweight
const compressImageFile = (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function LandlordPortal() {
  const { user, loading: authLoading, isLandlord } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [universities, setUniversities] = useState([]);

  // Property Details State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('London');
  const [latitude, setLatitude] = useState(51.5246);
  const [longitude, setLongitude] = useState(-0.134);
  const [flyToTarget, setFlyToTarget] = useState(null);

  // Amenities State (Starts empty so only landlord-checked items appear)
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [customAmenity, setCustomAmenity] = useState('');

  // Street Search Autocomplete State
  const [streetQuery, setStreetQuery] = useState('');
  const [streetResults, setStreetResults] = useState([]);
  const [searchingStreet, setSearchingStreet] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef(null);

  // Property Images State
  const [images, setImages] = useState([
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
  ]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  // Initial Room Tier State
  const [roomName, setRoomName] = useState('Classic Private Room');
  const [roomCategory, setRoomCategory] = useState('PRIVATE_ROOM');
  const [pricePerMonth, setPricePerMonth] = useState('950');
  const [sizeSqm, setSizeSqm] = useState('18');

  const [submitting, setSubmitting] = useState(false);
  const [createdMsg, setCreatedMsg] = useState({ type: '', text: '' });

  const loadBookings = async () => {
    try {
      const data = await fetchAllBookings();
      setBookings(data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    }
  };

  useEffect(() => {
    fetchUniversities()
      .then((data) => setUniversities(data || []))
      .catch((err) => console.error('Failed to load universities:', err));
  }, []);

  useEffect(() => {
    if (!authLoading && user && isLandlord) {
      loadBookings();
    }
  }, [authLoading, user, isLandlord]);

  // Close street search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Street Geocoding Search via OpenStreetMap Nominatim
  useEffect(() => {
    const trimmed = streetQuery.trim();
    if (trimmed.length < 3) {
      setStreetResults([]);
      setSearchingStreet(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingStreet(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&q=${encodeURIComponent(
          trimmed
        )}`;
        const res = await fetch(url, {
          headers: { 'Accept-Language': 'en' },
        });
        if (res.ok) {
          const data = await res.json();
          setStreetResults(data || []);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error('Street search failed:', err);
      } finally {
        setSearchingStreet(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [streetQuery]);

  // Toggle an amenity checkbox on or off
  const handleToggleAmenity = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((item) => item !== amenity)
        : [...prev, amenity]
    );
  };

  // Allow landlord to add a custom amenity checkbox
  const handleAddCustomAmenity = () => {
    const trimmed = customAmenity.trim();
    if (!trimmed) return;
    if (!selectedAmenities.includes(trimmed)) {
      setSelectedAmenities((prev) => [...prev, trimmed]);
    }
    setCustomAmenity('');
  };

  // Handle selecting a street option from the search dropdown
  const handleSelectStreetResult = (place) => {
    const lat = Number(parseFloat(place.lat).toFixed(6));
    const lng = Number(parseFloat(place.lon).toFixed(6));

    const addr = place.address || {};
    const streetLine =
      [
        addr.house_number,
        addr.road ||
          addr.pedestrian ||
          addr.footway ||
          addr.suburb ||
          addr.neighbourhood ||
          place.name,
      ]
        .filter(Boolean)
        .join(' ') || place.display_name.split(',')[0];

    const detectedCity =
      addr.city ||
      addr.town ||
      addr.municipality ||
      addr.village ||
      addr.county ||
      addr.state ||
      city;

    setAddress(streetLine);
    setCity(detectedCity);
    setLatitude(lat);
    setLongitude(lng);
    setFlyToTarget({ lat, lng, zoom: 17, timestamp: Date.now() });
    setStreetQuery(place.display_name);
    setShowDropdown(false);
  };

  // Jump map camera to a selected university campus
  const handleSelectCampusJump = (uniId) => {
    const uni = universities.find((u) => u.id === uniId);
    if (uni) {
      const lat = Number((uni.latitude + 0.002).toFixed(6));
      const lng = Number((uni.longitude + 0.002).toFixed(6));
      setCity(uni.city);
      setLatitude(lat);
      setLongitude(lng);
      setFlyToTarget({ lat, lng, zoom: 15, timestamp: Date.now() });
    }
  };

  // Handle uploading one or multiple image files from disk
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingPhotos(true);
    try {
      const compressedDataUrls = await Promise.all(
        files.map((file) => compressImageFile(file))
      );
      setImages((prev) => [...prev, ...compressedDataUrls]);
    } catch (err) {
      console.error('Failed to process uploaded images:', err);
    } finally {
      setUploadingPhotos(false);
      e.target.value = '';
    }
  };

  // Handle adding an external image URL
  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    setImages((prev) => [...prev, trimmed]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetCoverImage = (index) => {
    if (index === 0) return;
    setImages((prev) => {
      const updated = [...prev];
      const [picked] = updated.splice(index, 1);
      return [picked, ...updated];
    });
  };

  const handleCreateProperty = async (e) => {
    e.preventDefault();
    setCreatedMsg({ type: '', text: '' });

    if (images.length === 0) {
      setCreatedMsg({
        type: 'error',
        text: 'Please upload or add at least one photo of the property.',
      });
      return;
    }

    setSubmitting(true);
    try {
      await createNewProperty({
        title,
        description:
          description.trim() || `Modern student accommodation in ${city}`,
        address,
        city,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        amenities: selectedAmenities,
        images,
        landlordId: user.id,
        rooms: [
          {
            name: roomName,
            category: roomCategory,
            pricePerMonth: parseFloat(pricePerMonth),
            currency: 'USD',
            sizeSqm: parseFloat(sizeSqm) || 18,
            availableFrom: new Date('2026-09-01').toISOString(),
          },
        ],
      });

      setCreatedMsg({
        type: 'success',
        text: 'Property published with your selected amenities, coordinates, and photos!',
      });
      setTitle('');
      setDescription('');
      setAddress('');
      setStreetQuery('');
      setSelectedAmenities([]);
    } catch (err) {
      setCreatedMsg({
        type: 'error',
        text: err.message || 'Error creating property.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatus = async (bookingId, status) => {
    try {
      await updateBookingStatus(bookingId, status);
      await loadBookings();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Combine standard options with any custom amenities added by the landlord
  const allDisplayAmenities = Array.from(
    new Set([...AMENITY_OPTIONS, ...selectedAmenities])
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-500">
          Checking account permissions...
        </div>
      </div>
    );
  }

  if (!user || !isLandlord) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-2xl shadow-sm border border-slate-200 text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Landlord Account Required
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            {user
              ? `You are currently signed in as ${user.name} (STUDENT). Please sign in with a Landlord account to list properties and manage student bookings.`
              : 'Please sign in with a Landlord account to publish properties and manage student booking requests.'}
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition"
            >
              Sign In as Landlord
            </Link>
            <Link
              href="/register"
              className="border border-slate-300 hover:bg-slate-100 text-slate-700 px-5 py-2.5 rounded-lg text-sm font-semibold transition"
            >
              Register Landlord
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Landlord Management Portal
            </h1>
            <p className="text-sm text-slate-500">
              Signed in as{' '}
              <span className="font-semibold text-slate-700">{user.name}</span> (
              {user.email})
            </p>
          </div>
          <span className="self-start sm:self-auto text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-800">
            Verified Landlord
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 7 Columns: Publish New Property Studio */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Publish New Student Property
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Search for a street to jump the map, select included amenities, and upload property photos.
            </p>

            <form onSubmit={handleCreateProperty} className="space-y-6">
              {/* Step 1: Basic Info */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Property Title
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Bloomsbury Student Studios"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="London"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="42 Gower Street (or use street search below)"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Property Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the residence, study spaces, nearby transport, and security..."
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Step 2: Street Search Autocomplete + Interactive Map Location Picker */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase">
                      Search Street & Pinpoint Property Location
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Search for a street to fly the map there, then click or drag the pin onto the exact building.
                    </p>
                  </div>

                  {universities.length > 0 && (
                    <select
                      onChange={(e) => handleSelectCampusJump(e.target.value)}
                      defaultValue=""
                      className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium"
                    >
                      <option value="" disabled>
                        🎯 Or jump near university...
                      </option>
                      {universities.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.city})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Street Search Input & Autocomplete Dropdown */}
                <div ref={searchContainerRef} className="relative">
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-slate-400 text-sm pointer-events-none">
                      🔍
                    </span>
                    <input
                      type="text"
                      value={streetQuery}
                      onFocus={() => {
                        if (streetResults.length > 0) setShowDropdown(true);
                      }}
                      onChange={(e) => {
                        setStreetQuery(e.target.value);
                        setShowDropdown(true);
                      }}
                      placeholder="Search street, neighborhood, or landmark (e.g., Gower Street, London)..."
                      className="w-full pl-9 pr-20 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/60"
                    />
                    {searchingStreet && (
                      <span className="absolute right-3 text-[11px] text-blue-600 font-semibold animate-pulse">
                        Searching...
                      </span>
                    )}
                    {!searchingStreet && streetQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setStreetQuery('');
                          setStreetResults([]);
                          setShowDropdown(false);
                        }}
                        className="absolute right-3 text-xs text-slate-400 hover:text-slate-600 font-semibold"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Matching Street Options Dropdown */}
                  {showDropdown && streetResults.length > 0 && (
                    <ul className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-[1000] divide-y divide-slate-100">
                      {streetResults.map((place) => (
                        <li key={place.place_id}>
                          <button
                            type="button"
                            onClick={() => handleSelectStreetResult(place)}
                            className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition flex items-start gap-2.5"
                          >
                            <span className="text-blue-600 mt-0.5 shrink-0">
                              📍
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {place.display_name.split(',')[0]}
                              </p>
                              <p className="text-[11px] text-slate-500 line-clamp-1">
                                {place.display_name}
                              </p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {showDropdown &&
                    !searchingStreet &&
                    streetQuery.trim().length >= 3 &&
                    streetResults.length === 0 && (
                      <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs text-slate-500 text-center z-[1000]">
                        No matching streets found. Try adding the city name (e.g., &ldquo;Tahrir Street, Cairo&rdquo;).
                      </div>
                    )}
                </div>

                <LocationPickerMap
                  latitude={latitude}
                  longitude={longitude}
                  flyToTarget={flyToTarget}
                  onLocationChange={(lat, lng) => {
                    setLatitude(lat);
                    setLongitude(lng);
                  }}
                />
              </div>

              <hr className="border-slate-200" />

              {/* Step 3: Amenities & Facilities Checkboxes */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-600 uppercase">
                    Amenities & Facilities ({selectedAmenities.length} selected)
                  </label>
                  {selectedAmenities.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedAmenities([])}
                      className="text-[11px] text-slate-400 hover:text-red-600 font-medium"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Check the facilities included with this property. Only checked items will be shown on the listing page.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3">
                  {allDisplayAmenities.map((amenity) => {
                    const isChecked = selectedAmenities.includes(amenity);
                    return (
                      <label
                        key={amenity}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer select-none transition ${
                          isChecked
                            ? 'bg-blue-50 border-blue-600 text-blue-800 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleAmenity(amenity)}
                          className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                        />
                        <span className="truncate">{amenity}</span>
                      </label>
                    );
                  })}
                </div>

                {/* Add Custom Amenity Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customAmenity}
                    onChange={(e) => setCustomAmenity(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomAmenity();
                      }
                    }}
                    placeholder="Add custom facility (e.g., Rooftop Terrace, Cinema Room)..."
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAmenity}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition shrink-0"
                  >
                    + Add Custom
                  </button>
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Step 4: Property Photos Uploader & Gallery */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Property Photos ({images.length})
                </label>
                <p className="text-[11px] text-slate-500 mb-3">
                  Upload photos from your computer or paste an image URL. The first photo is used as the cover image.
                </p>

                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                  {/* Upload from Device Button */}
                  <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition shrink-0">
                    <span>
                      📷 {uploadingPhotos ? 'Processing...' : 'Upload Photos'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingPhotos}
                    />
                  </label>

                  {/* Or Paste Image URL */}
                  <div className="flex flex-1 gap-2">
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="Or paste image URL (https://...)"
                      className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition shrink-0"
                    >
                      Add URL
                    </button>
                  </div>
                </div>

                {/* Photo Previews Grid */}
                {images.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-xs text-slate-400">
                    No photos added yet. Upload files or add an image URL above.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {images.map((imgSrc, idx) => (
                      <div
                        key={idx}
                        className={`relative group h-24 rounded-xl overflow-hidden border-2 ${
                          idx === 0 ? 'border-blue-600' : 'border-slate-200'
                        }`}
                      >
                        <img
                          src={imgSrc}
                          alt={`Property preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />

                        {idx === 0 ? (
                          <span className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                            Cover
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetCoverImage(idx)}
                            className="opacity-0 group-hover:opacity-100 absolute bottom-1.5 left-1.5 bg-slate-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded transition"
                          >
                            Make Cover
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center shadow hover:bg-red-700"
                          title="Remove photo"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <hr className="border-slate-200" />

              {/* Step 5: Initial Room Configuration */}
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase mb-3">
                  Initial Room Tier Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Room Tier Name
                    </label>
                    <input
                      type="text"
                      required
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Category
                    </label>
                    <select
                      value={roomCategory}
                      onChange={(e) => setRoomCategory(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                    >
                      <option value="PRIVATE_ROOM">Private Room</option>
                      <option value="ENTIRE_PLACE">Studio / Entire Place</option>
                      <option value="SHARED_ROOM">Shared Room</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Price / Month ($)
                    </label>
                    <input
                      type="number"
                      required
                      value={pricePerMonth}
                      onChange={(e) => setPricePerMonth(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Room Size (m²)
                    </label>
                    <input
                      type="number"
                      required
                      value={sizeSqm}
                      onChange={(e) => setSizeSqm(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || uploadingPhotos}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl text-sm transition shadow-sm"
              >
                {submitting
                  ? 'Publishing Property...'
                  : 'Publish Property Listing'}
              </button>

              {createdMsg.text && (
                <div
                  className={`text-sm font-medium p-3 rounded-xl border ${
                    createdMsg.type === 'error'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {createdMsg.text}
                </div>
              )}
            </form>
          </div>

          {/* Right 5 Columns: Incoming Student Booking Requests */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Incoming Student Bookings
              </h2>
              <button
                onClick={loadBookings}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Refresh
              </button>
            </div>

            {bookings.length === 0 ? (
              <p className="text-sm text-slate-500 py-8 text-center">
                No booking requests submitted yet.
              </p>
            ) : (
              <div className="space-y-4">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-xl border border-slate-200 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {b.roomType?.property?.title || 'Property'} —{' '}
                        <span className="text-blue-600">{b.roomType?.name}</span>
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Student: <strong>{b.student?.name}</strong> (
                        {b.student?.email})
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Move-in: {new Date(b.moveInDate).toLocaleDateString()} •{' '}
                        {b.durationMonths} months • $
                        {b.roomType?.pricePerMonth}/mo
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          b.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {b.status}
                      </span>

                      {b.status === 'PENDING' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStatus(b.id, 'APPROVED')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatus(b.id, 'REJECTED')}
                            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}