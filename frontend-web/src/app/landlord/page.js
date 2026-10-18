'use client';
import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { createNewProperty, fetchAllBookings, updateBookingStatus } from '../../services/api';
import { PlusCircle, Check, X, Building2, ClipboardList } from 'lucide-react';

export default function LandlordPortal() {
  const [bookings, setBookings] = useState([]);
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Giza');
  const [latitude, setLatitude] = useState('30.0330');
  const [longitude, setLongitude] = useState('31.2090');
  const [roomName, setRoomName] = useState('Single En-Suite Room');
  const [roomCategory, setRoomCategory] = useState('PRIVATE_ROOM');
  const [pricePerMonth, setPricePerMonth] = useState('220');
  const [createdMsg, setCreatedMsg] = useState('');

  const loadBookings = async () => {
    const data = await fetchAllBookings();
    setBookings(data);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCreateProperty = async (e) => {
    e.preventDefault();
    try {
      await createNewProperty({
        title,
        description: 'Verified student apartment close to university campus.',
        address,
        city,
        latitude,
        longitude,
        amenities: ['High-Speed WiFi', 'Air Conditioning', 'Study Desk', 'Security'],
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
        rooms: [
          {
            name: roomName,
            category: roomCategory,
            pricePerMonth,
          },
        ],
      });
      setCreatedMsg('✅ Property published! It is now live on the student search map.');
      setTitle('');
      setAddress('');
    } catch {
      setCreatedMsg('⚠️ Make sure your backend server is running on port 5000 to save to PostgreSQL.');
    }
  };

  const handleStatus = async (id, status) => {
    await updateBookingStatus(id, status);
    loadBookings();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Add New Property Listing */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-brand-600" />
            <h2 className="text-lg font-extrabold text-slate-900">List a New Student Property</h2>
          </div>

          {createdMsg && (
            <div className="mb-4 p-3 rounded-xl bg-blue-50 text-brand-700 text-xs font-semibold">
              {createdMsg}
            </div>
          )}

          <form onSubmit={handleCreateProperty} className="space-y-3.5 text-sm">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Building / Property Title</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Giza Campus View Apartments"
                className="w-full border border-slate-300 rounded-xl px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Street Address</label>
                <input
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="10 El-Gamaa St"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">City</label>
                <input
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">GPS Latitude</label>
                <input
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">GPS Longitude</label>
                <input
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-bold uppercase text-brand-600 mb-2">Initial Room Configuration</p>
              <div className="grid grid-cols-3 gap-2">
                <input
                  required
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Room Name"
                  className="border border-slate-300 rounded-xl px-3 py-2"
                />
                <select
                  value={roomCategory}
                  onChange={(e) => setRoomCategory(e.target.value)}
                  className="border border-slate-300 rounded-xl px-2 py-2"
                >
                  <option value="PRIVATE_ROOM">Private</option>
                  <option value="SHARED_ROOM">Shared</option>
                  <option value="ENTIRE_PLACE">Studio</option>
                </select>
                <input
                  required
                  type="number"
                  value={pricePerMonth}
                  onChange={(e) => setPricePerMonth(e.target.value)}
                  placeholder="Price $/mo"
                  className="border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publish Property to Map</span>
            </button>
          </form>
        </div>

        {/* Right: Incoming Student Booking Requests */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-5 h-5 text-brand-600" />
            <h2 className="text-lg font-extrabold text-slate-900">Incoming Student Booking Requests</h2>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No student booking inquiries yet. Click &quot;Book Room&quot; on any listing to test!
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b.id} className="p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {b.status}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 mt-1">
                      {b.student?.name} ({b.student?.email})
                    </h4>
                    <p className="text-xs text-slate-500">
                      {b.roomType?.property?.title} — {b.roomType?.name} (${b.roomType?.pricePerMonth}/mo)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatus(b.id, 'APPROVED')}
                      className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg"
                      title="Approve Booking"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleStatus(b.id, 'REJECTED')}
                      className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg"
                      title="Reject Booking"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
