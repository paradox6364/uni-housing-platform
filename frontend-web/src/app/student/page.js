"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { fetchCurrentUser } from '../../services/api';

export default function StudentDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      fetchCurrentUser()
        .then((data) => setProfile(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-5xl mx-auto p-8 text-center text-slate-500">
          Loading your student account...
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'STUDENT') {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-2xl shadow-sm border border-slate-200 text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Student Access Only</h2>
          <p className="text-sm text-slate-600 mb-6">
            Please sign in with a Student account to view and manage your accommodation bookings.
          </p>
          <Link
            href="/login"
            className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const bookings = profile?.bookings || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome, {user.name}</h1>
            <p className="text-sm text-slate-500">{user.email} • Student Account</p>
          </div>
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            Browse More Rooms
          </Link>
        </div>

        <h2 className="text-lg font-semibold text-slate-800 mb-4">My Booking Requests</h2>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
            You haven&apos;t submitted any room booking requests yet.
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h3 className="font-bold text-slate-900">
                    {b.roomType?.property?.title || 'Student Property'}
                  </h3>
                  <p className="text-sm text-slate-600">
                    Room: <span className="font-medium">{b.roomType?.name}</span> • $
                    {b.roomType?.pricePerMonth}/mo
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Move-in: {new Date(b.moveInDate).toLocaleDateString()} • Lease:{' '}
                    {b.leaseDurationMonths} months
                  </p>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      b.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : b.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}