const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('unihousing_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

// --- AUTHENTICATION API ---

export async function registerUser(userData) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data;
}

export async function loginUser(credentials) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function fetchCurrentUser() {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch user');
  return data.user;
}

// --- UNIVERSITIES & LISTINGS API ---

export async function fetchUniversities() {
  const res = await fetch(`${API_BASE_URL}/universities`);
  if (!res.ok) throw new Error('Failed to fetch universities');
  return res.json();
}

export async function searchListings(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE_URL}/listings/search?${query}`);
  if (!res.ok) throw new Error('Failed to fetch listings');
  return res.json();
}

export async function createNewProperty(propertyData) {
  const res = await fetch(`${API_BASE_URL}/listings`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(propertyData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create property');
  return data;
}

// --- BOOKINGS API ---

export async function submitBookingRequest(bookingData) {
  const res = await fetch(`${API_BASE_URL}/bookings`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(bookingData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to submit booking');
  return data;
}

export async function fetchAllBookings() {
  const res = await fetch(`${API_BASE_URL}/bookings`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch bookings');
  return res.json();
}

export async function updateBookingStatus(bookingId, status) {
  const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update booking status');
  return data;
}
