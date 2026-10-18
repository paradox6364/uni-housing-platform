"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import {
  fetchAllBookings,
  createNewProperty,
  updateBookingStatus,
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function LandlordPortal() {
  const { user, loading: authLoading, isLandlord } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('London');
  const [latitude, setLatitude] = useState('51.5246');
  const [longitude, setLongitude] = useState('-0.1340');
  const [roomName, setRoomName] = useState('Classic En-Suite');
  const [roomCategory, setRoomCategory] = useState('EN_SUITE');
  const [pricePerMonth, setPricePerMonth] = useState('950');
  const [createdMsg, setCreatedMsg] = useState('');

  const loadBookings = async () => {
    try {
      const data = await fetchAllBookings();
      setBookings(data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    }
  };

  useEffect(() => {
    if (!authLoading && user && isLandlord) {
      loadBookings();
    }
  }, [authLoading, user, isLandlord]);

  const handleCreateProperty = async (e) => {
    e.preventDefault();
    setCreatedMsg('');
    try {
      await createNewProperty({
        title,
        description: `Modern student accommodation in ${city}`,
        address,
        city,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        amenities: ['High-Speed Wi-Fi', '24/7 Security', 'Study Lounge', 'Laundry'],
        images: [
          'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
        ],
        landlordId: user.id,
        rooms: [
          {
            name: roomName,
            category: roomCategory,
            pricePerMonth: parseFloat(pricePerMonth),
            currency: 'USD',
            sizeSqm: 18,
            availableFrom: new Date('2026-09-01').toISOString(),
          },
        ],
      });

      setCreatedMsg('Property published successfully!');
      setTitle('');
      setAddress('');
    } catch (err) {
      setCreatedMsg(err.message || 'Error creating property.');
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
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Landlord Management Portal
            </h1>
            <p className="text-sm text-slate-500">
              Signed in as <span className="font-semibold text-slate-700">{user.name}</span> ({user.email})
            </p>
          </div>
          <span className="self-start sm:self-auto text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-800">
            Verified Landlord
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Publish New Property Form */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Publish New Property
            </h2>

            <form onSubmit={handleCreateProperty} className="space-y-4">
              <div>
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
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="42 Gower Street"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <hr className="border-slate-200" />

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Initial Room Name
                </label>
                <input
                  type="text"
                  required
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={roomCategory}
                    onChange={(e) => setRoomCategory(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="PRIVATE_ROOM">Private Room</option>
                    <option value="EN_SUITE">En-Suite</option>
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
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition"
              >
                Publish Listing
              </button>

              {createdMsg && (
                <p className="text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
                  {createdMsg}
                </p>
              )}
            </form>
          </div>

          {/* Incoming Student Booking Requests */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Incoming Student Booking Requests
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
                    className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {b.roomType?.property?.title || 'Property'} —{' '}
                        <span className="text-blue-600">{b.roomType?.name}</span>
                      </h3>
                      <p className="text-sm text-slate-600">
                        Student: <strong>{b.student?.name}</strong> ({b.student?.email})
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Move-in: {new Date(b.moveInDate).toLocaleDateString()} •{' '}
                        {b.leaseDurationMonths} months • ${b.roomType?.pricePerMonth}/mo
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
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
                        <>
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
                        </>
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
