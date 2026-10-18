const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const FALLBACK_UNIVERSITIES = [
  { id: 'demo-cairo-uni', name: 'Cairo University', city: 'Giza', country: 'Egypt', latitude: 30.0276, longitude: 31.2101 },
  { id: 'demo-asu', name: 'Ain Shams University', city: 'Cairo', country: 'Egypt', latitude: 30.0764, longitude: 31.2844 },
];

const FALLBACK_LISTINGS = [
  {
    id: 'prop-1',
    title: 'Dokki Student Suites',
    description: 'Modern furnished student apartments 10 minutes from Cairo University main gate.',
    address: '14 Tahrir St, Dokki',
    city: 'Giza',
    latitude: 30.0385,
    longitude: 31.2125,
    distanceToUniKm: 1.23,
    commute: { walkMinutes: 15, transitMinutes: 4 },
    startingPrice: 150,
    amenities: ['High-Speed WiFi', 'Air Conditioning', 'Study Desk', 'Washing Machine'],
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
    rooms: [
      { id: 'r1', name: 'Twin Shared Room', category: 'SHARED_ROOM', pricePerMonth: 150, currency: 'USD', sizeSqm: 24 },
      { id: 'r2', name: 'Single Private En-Suite', category: 'PRIVATE_ROOM', pricePerMonth: 250, currency: 'USD', sizeSqm: 18 }
    ]
  },
  {
    id: 'prop-2',
    title: 'Bein El-Sarayat Campus Lofts',
    description: 'Right across from campus! All utility bills included with 24/7 security.',
    address: '8 Bein El-Sarayat St, Giza',
    city: 'Giza',
    latitude: 30.0312,
    longitude: 31.2065,
    distanceToUniKm: 0.53,
    commute: { walkMinutes: 7, transitMinutes: 2 },
    startingPrice: 210,
    amenities: ['All Bills Included', '24/7 Security', 'Study Lounge', 'WiFi'],
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'],
    rooms: [
      { id: 'r3', name: 'Standard Private Room', category: 'PRIVATE_ROOM', pricePerMonth: 210, currency: 'USD', sizeSqm: 16 },
      { id: 'r4', name: 'Deluxe Studio Apartment', category: 'ENTIRE_PLACE', pricePerMonth: 340, currency: 'USD', sizeSqm: 32 }
    ]
  }
];

export async function fetchUniversities(query = '') {
  try {
    const res = await fetch(`${API_BASE_URL}/universities?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();
    return data.length > 0 ? data : FALLBACK_UNIVERSITIES;
  } catch (err) {
    return FALLBACK_UNIVERSITIES;
  }
}

export async function searchListings({ universityId, maxDistanceKm = 15, maxPrice = '', category = '' }) {
  try {
    const params = new URLSearchParams({ universityId, maxDistanceKm });
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (category) params.append('category', category);

    const res = await fetch(`${API_BASE_URL}/listings/search?${params.toString()}`);
    if (!res.ok) throw new Error('Search API Error');
    return await res.json();
  } catch (err) {
    const uni = FALLBACK_UNIVERSITIES.find((u) => u.id === universityId) || FALLBACK_UNIVERSITIES[0];
    return { university: uni, totalFound: FALLBACK_LISTINGS.length, listings: FALLBACK_LISTINGS };
  }
}

export async function submitBookingRequest(payload) {
  const res = await fetch(`${API_BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Booking failed');
  return res.json();
}

export async function createNewProperty(payload) {
  const res = await fetch(`${API_BASE_URL}/listings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Create property failed');
  return res.json();
}

export async function fetchAllBookings() {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function updateBookingStatus(id, status) {
  const res = await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return res.json();
}
