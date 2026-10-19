"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { submitBookingRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function BookingModal({ property, isOpen = true, onClose }) {
  const { user, isLandlord } = useAuth();

  const rooms = property?.rooms || property?.roomTypes || [];

  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0]?.id || '');
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [moveInDate, setMoveInDate] = useState('2026-09-01');
  const [durationMonths, setDurationMonths] = useState(9);
  const [statusMsg, setStatusMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setStudentName(user.name || '');
      setStudentEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    const availableRooms = property?.rooms || property?.roomTypes || [];
    if (availableRooms.length > 0) {
      setSelectedRoomId(availableRooms[0].id);
    }
  }, [property]);

  if (!isOpen || !property) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg(null);

    try {
      await submitBookingRequest({
        studentId: user?.id,
        studentName,
        studentEmail,
        roomTypeId: selectedRoomId,
        moveInDate,
        durationMonths: Number(durationMonths),
      });
      setStatusMsg({
        type: 'success',
        text: 'Booking request submitted! Track it in My Bookings.',
      });
    } catch (error) {
      setStatusMsg({
        type: 'error',
        text: error.message || 'Failed to submit booking.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">
            Book {property.title}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {isLandlord ? (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
            You are signed in with a <strong>Landlord</strong> account. Switch to a{' '}
            <strong>Student</strong> account to book rooms.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!user && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800 flex justify-between items-center">
                <span>Sign in as a student to track your booking status!</span>
                <Link href="/login" className="font-bold underline">
                  Sign In
                </Link>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Select Room Type
              </label>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                required
              >
                {rooms.map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    {rt.name} — ${rt.pricePerMonth}/mo
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Student Name
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Student Email
              </label>
              <input
                type="email"
                required
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Move-in Date
                </label>
                <input
                  type="date"
                  required
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Duration (Months)
                </label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  required
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            {statusMsg && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  statusMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {statusMsg.text}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={submitting || rooms.length === 0}
                className="px-5 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"
              >
                {submitting ? 'Sending...' : 'Request Booking'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
