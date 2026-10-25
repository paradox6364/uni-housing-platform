"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isLandlord, isStudent } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center">
              U
            </span>
            <span className="text-xl font-bold text-slate-900">UniHousing</span>
          </Link>

          <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-blue-600 transition">
              Explore Map
            </Link>
            {isStudent && (
              <Link href="/student" className="hover:text-blue-600 transition">
                My Bookings
              </Link>
            )}
            {isLandlord && (
              <Link href="/landlord" className="hover:text-blue-600 transition">
                Landlord Dashboard
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-sm">
                <span className="font-semibold text-slate-800">{user.name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    isLandlord
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {user.role}
                </span>
              </div>

              {isLandlord && (
                <Link
                  href="/landlord"
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg font-medium transition"
                >
                  Manage Properties
                </Link>
              )}

              {isStudent && (
                <Link
                  href="/student"
                  className="text-sm bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-2 rounded-lg font-medium transition"
                >
                  My Bookings
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="text-sm text-slate-600 hover:text-red-600 px-3 py-2 font-medium transition"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-slate-700 hover:text-blue-600 px-3 py-2 transition"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
