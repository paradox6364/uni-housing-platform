import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Callout } from 'react-native-maps';

// Automatically resolve localhost for Android Emulator (10.0.2.2) vs iOS/Web (localhost)
const DEFAULT_HOST =
  Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || `${DEFAULT_HOST}/api`;

const DEFAULT_COVER_IMAGE =
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80';

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

const CATEGORY_LABELS = {
  ALL: 'All Tiers',
  PRIVATE_ROOM: 'Private Room',
  ENTIRE_PLACE: 'Studio / Entire Place',
  SHARED_ROOM: 'Shared Room',
};

export default function App() {
  // --- AUTH STATE ---
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('EXPLORE'); // 'EXPLORE' | 'DETAILS' | 'STUDENT' | 'LANDLORD' | 'AUTH'
  const [authMode, setAuthMode] = useState('LOGIN'); // 'LOGIN' | 'REGISTER'

  // Auth Form State
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authRole, setAuthRole] = useState('STUDENT');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // --- EXPLORE & FILTER STATE ---
  const [universities, setUniversities] = useState([]);
  const [selectedUni, setSelectedUni] = useState(null);
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [maxDistanceKm, setMaxDistanceKm] = useState('15');
  const [maxPrice, setMaxPrice] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const exploreMapRef = useRef(null);

  // --- DEDICATED PROPERTY DETAILS STATE ---
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [detailsRoomCategory, setDetailsRoomCategory] = useState('ALL');
  const [calcRoomId, setCalcRoomId] = useState('');
  const [calcMonths, setCalcMonths] = useState(9);

  // --- BOOKING MODAL STATE ---
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingProperty, setBookingProperty] = useState(null);
  const [bookingRoomId, setBookingRoomId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [moveInDate, setMoveInDate] = useState('2026-09-01');
  const [durationMonths, setDurationMonths] = useState('9');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  // --- STUDENT DASHBOARD STATE ---
  const [studentBookings, setStudentBookings] = useState([]);

  // --- LANDLORD PORTAL STATE ---
  const [landlordBookings, setLandlordBookings] = useState([]);
  const [myProperties, setMyProperties] = useState([]);
  const [editingPropertyId, setEditingPropertyId] = useState(null);
  const [propTitle, setPropTitle] = useState('');
  const [propDesc, setPropDesc] = useState('');
  const [propAddress, setPropAddress] = useState('');
  const [propCity, setPropCity] = useState('London');
  const [propLat, setPropLat] = useState(51.5246);
  const [propLng, setPropLng] = useState(-0.134);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [customAmenity, setCustomAmenity] = useState('');
  const [propImages, setPropImages] = useState([DEFAULT_COVER_IMAGE]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [roomName, setRoomName] = useState('Classic Private Room');
  const [roomCategory, setRoomCategory] = useState('PRIVATE_ROOM');
  const [pricePerMonth, setPricePerMonth] = useState('950');
  const [sizeSqm, setSizeSqm] = useState('18');
  const [savingProperty, setSavingProperty] = useState(false);

  // Street Search Autocomplete (Landlord Map Picker)
  const [streetQuery, setStreetQuery] = useState('');
  const [streetResults, setStreetResults] = useState([]);
  const [searchingStreet, setSearchingStreet] = useState(false);
  const landlordMapRef = useRef(null);
  const landlordScrollRef = useRef(null);

  // --- ADD UNIVERSITY MODAL STATE ---
  const [uniModalOpen, setUniModalOpen] = useState(false);
  const [uniSearchQuery, setUniSearchQuery] = useState('');
  const [uniSearchResults, setUniSearchResults] = useState([]);
  const [newUniName, setNewUniName] = useState('');
  const [newUniCity, setNewUniCity] = useState('');
  const [newUniCountry, setNewUniCountry] = useState('');
  const [newUniLat, setNewUniLat] = useState('');
  const [newUniLng, setNewUniLng] = useState('');

  const getHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  // --- INITIAL DATA FETCH ---
  const loadUniversities = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/universities`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setUniversities(data);
        if (!selectedUni) setSelectedUni(data[0]);
      }
    } catch (err) {
      console.warn('Backend unreachable, check API_BASE_URL:', err.message);
    }
  };

  const loadListings = async (uni = selectedUni) => {
    if (!uni) return;
    setLoadingListings(true);
    try {
      const params = new URLSearchParams({
        universityId: uni.id,
        maxDistanceKm: maxDistanceKm || '15',
      });
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (categoryFilter) params.append('category', categoryFilter);

      const res = await fetch(`${API_BASE_URL}/listings/search?${params.toString()}`);
      const data = await res.json();
      setListings(data.listings || []);
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoadingListings(false);
    }
  };

  useEffect(() => {
    loadUniversities();
  }, []);

  useEffect(() => {
    if (selectedUni) {
      loadListings(selectedUni);
      if (exploreMapRef.current) {
        exploreMapRef.current.animateToRegion(
          {
            latitude: selectedUni.latitude,
            longitude: selectedUni.longitude,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
          },
          800
        );
      }
    }
  }, [selectedUni, maxDistanceKm, maxPrice, categoryFilter]);

  // Pre-fill student info in booking modal when logged in
  useEffect(() => {
    if (user) {
      setStudentName(user.name || '');
      setStudentEmail(user.email || '');
    }
  }, [user]);

  // Debounced Street Geocoding Search for Landlord Map Picker
  useEffect(() => {
    const trimmed = streetQuery.trim();
    if (trimmed.length < 3) {
      setStreetResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchingStreet(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(
          trimmed
        )}`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
        if (res.ok) {
          const data = await res.json();
          setStreetResults(data || []);
        }
      } catch (e) {
        console.error('Street search failed:', e);
      } finally {
        setSearchingStreet(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [streetQuery]);

  // Debounced University Search in Add University Modal
  useEffect(() => {
    const trimmed = uniSearchQuery.trim();
    if (trimmed.length < 3) {
      setUniSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=4&q=${encodeURIComponent(
          trimmed
        )}`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
        if (res.ok) {
          const data = await res.json();
          setUniSearchResults(data || []);
        }
      } catch (e) {
        console.error(e);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [uniSearchQuery]);

  // --- AUTH HANDLERS ---
  const handleAuthSubmit = async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      const endpoint = authMode === 'LOGIN' ? '/auth/login' : '/auth/register';
      const body =
        authMode === 'LOGIN'
          ? { email: authEmail, password: authPassword }
          : {
              name: authName,
              email: authEmail,
              phone: authPhone,
              password: authPassword,
              role: authRole,
            };

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      setToken(data.token);
      setUser(data.user);
      if (data.user.role === 'LANDLORD') {
        setActiveTab('LANDLORD');
        loadLandlordData(data.token);
      } else {
        setActiveTab('EXPLORE');
        loadStudentBookings(data.token);
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setActiveTab('EXPLORE');
  };

  // --- DEDICATED PROPERTY DETAILS HANDLER ---
  const openPropertyDetails = async (propertySummary) => {
    setSelectedProperty(propertySummary);
    setActivePhotoIdx(0);
    setDetailsRoomCategory('ALL');
    const firstRoom = propertySummary.rooms?.[0];
    setCalcRoomId(firstRoom?.id || '');
    setCalcMonths(9);
    setActiveTab('DETAILS');

    setLoadingDetails(true);
    try {
      const res = await fetch(`${API_BASE_URL}/listings/${propertySummary.id}`);
      if (res.ok) {
        const fullData = await res.json();
        setSelectedProperty(fullData);
        if (fullData.rooms?.length > 0) {
          setCalcRoomId(fullData.rooms[0].id);
        }
      }
    } catch (e) {
      console.error('Error loading full property details:', e);
    } finally {
      setLoadingDetails(false);
    }
  };

  const openQuickBookingModal = (property, roomId = '', months = 9) => {
    const rooms = property?.rooms || [];
    setBookingProperty(property);
    setBookingRoomId(roomId || rooms[0]?.id || '');
    setDurationMonths(String(months || 9));
    setBookingModalOpen(true);
  };

  const handleBookingSubmit = async () => {
    if (!bookingRoomId || !studentName || !studentEmail) {
      Alert.alert('Missing Info', 'Please fill in your name and email.');
      return;
    }
    setBookingSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          studentId: user?.id,
          studentName,
          studentEmail,
          roomTypeId: bookingRoomId,
          moveInDate,
          durationMonths: Number(durationMonths) || 9,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit booking');

      setBookingModalOpen(false);
      Alert.alert(
        'Booking Submitted!',
        'Your room booking request has been sent to the landlord.'
      );
      if (token) loadStudentBookings(token);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setBookingSubmitting(false);
    }
  };

  // --- STUDENT & LANDLORD DATA LOADERS ---
  const loadStudentBookings = async (overrideToken = token) => {
    if (!overrideToken) return;
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${overrideToken}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setStudentBookings(data.user.bookings || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadLandlordData = async (overrideToken = token) => {
    if (!overrideToken) return;
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${overrideToken}`,
    };
    try {
      const [bookingsRes, propsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/bookings`, { headers: authHeaders }),
        fetch(`${API_BASE_URL}/listings/my`, { headers: authHeaders }),
      ]);
      if (bookingsRes.ok) {
        setLandlordBookings(await bookingsRes.json());
      }
      if (propsRes.ok) {
        setMyProperties(await propsRes.json());
      }
    } catch (e) {
      console.error('Error loading landlord data:', e);
    }
  };

  // --- LANDLORD PORTAL ACTIONS ---
  const handleSelectStreet = (place) => {
    const lat = Number(parseFloat(place.lat).toFixed(6));
    const lng = Number(parseFloat(place.lon).toFixed(6));
    const addr = place.address || {};
    const streetLine =
      [
        addr.house_number,
        addr.road || addr.pedestrian || addr.suburb || place.name,
      ]
        .filter(Boolean)
        .join(' ') || place.display_name.split(',')[0];
    const detectedCity =
      addr.city || addr.town || addr.state || addr.county || propCity;

    setPropAddress(streetLine);
    setPropCity(detectedCity);
    setPropLat(lat);
    setPropLng(lng);
    setStreetQuery(place.display_name);
    setStreetResults([]);

    if (landlordMapRef.current) {
      landlordMapRef.current.animateToRegion(
        {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.006,
          longitudeDelta: 0.006,
        },
        800
      );
    }
  };

  const handlePickImageFromDevice = async () => {
    try {
      const ImagePicker = await import('expo-image-picker');
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow photo library access to upload property photos.'
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        base64: true,
        quality: 0.6,
      });
      if (!result.canceled && result.assets?.length > 0) {
        const base64Uris = result.assets
          .filter((a) => a.base64)
          .map((a) => `data:image/jpeg;base64,${a.base64}`);
        setPropImages((prev) => [...prev, ...base64Uris]);
      }
    } catch (err) {
      Alert.alert(
        'Tip: Paste Image URL or Install ImagePicker',
        'You can paste any image URL right now, or run "npx expo install expo-image-picker" in frontend-mobile to pick photos from your phone gallery.'
      );
    }
  };

  const resetLandlordForm = () => {
    setEditingPropertyId(null);
    setPropTitle('');
    setPropDesc('');
    setPropAddress('');
    setPropCity('London');
    setPropLat(51.5246);
    setPropLng(-0.134);
    setSelectedAmenities([]);
    setPropImages([DEFAULT_COVER_IMAGE]);
    setRoomName('Classic Private Room');
    setRoomCategory('PRIVATE_ROOM');
    setPricePerMonth('950');
    setSizeSqm('18');
    setStreetQuery('');
  };

  const handleStartEditProperty = (prop) => {
    setEditingPropertyId(prop.id);
    setPropTitle(prop.title || '');
    setPropDesc(prop.description || '');
    setPropAddress(prop.address || '');
    setPropCity(prop.city || 'London');
    setPropLat(prop.latitude || 51.5246);
    setPropLng(prop.longitude || -0.134);
    setSelectedAmenities(Array.isArray(prop.amenities) ? prop.amenities : []);
    setPropImages(
      Array.isArray(prop.images) && prop.images.length > 0
        ? prop.images
        : [DEFAULT_COVER_IMAGE]
    );
    const primaryRoom = prop.rooms?.[0];
    if (primaryRoom) {
      setRoomName(primaryRoom.name || 'Classic Private Room');
      setRoomCategory(primaryRoom.category || 'PRIVATE_ROOM');
      setPricePerMonth(String(primaryRoom.pricePerMonth ?? 950));
      setSizeSqm(String(primaryRoom.sizeSqm ?? 18));
    }
    if (landlordScrollRef.current) {
      landlordScrollRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const handleSaveProperty = async () => {
    if (!propTitle.trim() || !propAddress.trim() || !propCity.trim()) {
      Alert.alert('Missing Fields', 'Please enter a title, address, and city.');
      return;
    }
    if (propImages.length === 0) {
      Alert.alert('Photo Required', 'Please add at least one property photo.');
      return;
    }

    const payload = {
      title: propTitle.trim(),
      description:
        propDesc.trim() || `Modern student accommodation in ${propCity}`,
      address: propAddress.trim(),
      city: propCity.trim(),
      latitude: Number(propLat),
      longitude: Number(propLng),
      amenities: selectedAmenities,
      images: propImages,
      landlordId: user?.id,
      rooms: [
        {
          name: roomName,
          category: roomCategory,
          pricePerMonth: parseFloat(pricePerMonth) || 950,
          currency: 'USD',
          sizeSqm: parseFloat(sizeSqm) || 18,
          availableFrom: new Date('2026-09-01').toISOString(),
        },
      ],
    };

    setSavingProperty(true);
    try {
      const url = editingPropertyId
        ? `${API_BASE_URL}/listings/${editingPropertyId}`
        : `${API_BASE_URL}/listings`;
      const method = editingPropertyId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save property');

      Alert.alert(
        'Success',
        editingPropertyId
          ? 'Property updated successfully!'
          : 'Property published successfully!'
      );
      resetLandlordForm();
      loadLandlordData();
      loadListings();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSavingProperty(false);
    }
  };

  const handleDeleteProperty = (prop) => {
    Alert.alert(
      'Delete Property',
      `Are you sure you want to delete "${prop.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${API_BASE_URL}/listings/${prop.id}`, {
                method: 'DELETE',
                headers: getHeaders(),
              });
              if (!res.ok) throw new Error('Could not delete property');
              if (editingPropertyId === prop.id) resetLandlordForm();
              loadLandlordData();
              loadListings();
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      if (res.ok) loadLandlordData();
    } catch (e) {
      Alert.alert('Error', 'Could not update booking status');
    }
  };

  const handleCreateUniversity = async () => {
    if (!newUniName || !newUniCity || !newUniLat || !newUniLng) {
      Alert.alert('Missing Info', 'Please fill out all university fields.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/universities`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: newUniName.trim(),
          city: newUniCity.trim(),
          country: newUniCountry.trim() || 'Egypt',
          latitude: parseFloat(newUniLat),
          longitude: parseFloat(newUniLng),
        }),
      });
      const created = await res.json();
      if (!res.ok) throw new Error(created.error || 'Failed to add university');

      setUniversities((prev) => [...prev, created]);
      setSelectedUni(created);
      setUniModalOpen(false);
      setNewUniName('');
      setNewUniCity('');
      setNewUniCountry('');
      setNewUniLat('');
      setNewUniLng('');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  // --- LEASE COST CALCULATOR COMPUTATIONS ---
  const detailsRooms = selectedProperty?.rooms || [];
  const filteredDetailsRooms =
    detailsRoomCategory === 'ALL'
      ? detailsRooms
      : detailsRooms.filter((r) => r.category === detailsRoomCategory);
  const selectedCalcRoom =
    detailsRooms.find((r) => r.id === calcRoomId) || detailsRooms[0] || null;
  const calcMonthlyRent = selectedCalcRoom
    ? Number(selectedCalcRoom.pricePerMonth)
    : 0;
  const calcDeposit = calcMonthlyRent > 0 ? Math.round(calcMonthlyRent * 0.5) : 0;
  const calcSubtotal = calcMonthlyRent * calcMonths;
  const calcGrandTotal = calcSubtotal + calcDeposit;

  const allAmenityCheckboxes = useMemo(
    () => Array.from(new Set([...AMENITY_OPTIONS, ...selectedAmenities])),
    [selectedAmenities]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* TOP NAVBAR */}
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.brandRow}
          onPress={() => setActiveTab('EXPLORE')}
        >
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>U</Text>
          </View>
          <Text style={styles.brandTitle}>UniHousing</Text>
        </TouchableOpacity>

        <View style={styles.navRight}>
          {user ? (
            <View style={styles.userRow}>
              <View
                style={[
                  styles.rolePill,
                  user.role === 'LANDLORD'
                    ? styles.rolePillLandlord
                    : styles.rolePillStudent,
                ]}
              >
                <Text style={styles.rolePillText}>
                  {user.name.split(' ')[0]} • {user.role}
                </Text>
              </View>
              <TouchableOpacity onPress={handleLogout}>
                <Text style={styles.logoutText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => {
                setAuthMode('LOGIN');
                setActiveTab('AUTH');
              }}
            >
              <Text style={styles.loginBtnText}>Sign In / Join</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* SCREEN 1: EXPLORE MAP & LISTINGS */}
      {activeTab === 'EXPLORE' && (
        <ScrollView style={styles.flex1}>
          {/* University Selector Bar */}
          <View style={styles.sectionPad}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionLabel}>SELECT UNIVERSITY CAMPUS</Text>
              <TouchableOpacity onPress={() => setUniModalOpen(true)}>
                <Text style={styles.linkText}>+ Add Campus</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.uniScroll}
            >
              {universities.map((uni) => {
                const active = selectedUni?.id === uni.id;
                return (
                  <TouchableOpacity
                    key={uni.id}
                    onPress={() => setSelectedUni(uni)}
                    style={[styles.uniChip, active && styles.uniChipActive]}
                  >
                    <Text
                      style={[
                        styles.uniChipText,
                        active && styles.uniChipTextActive,
                      ]}
                    >
                      🎓 {uni.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Filter Inputs */}
            <View style={styles.filterRow}>
              <View style={styles.filterBox}>
                <Text style={styles.filterLabel}>Max Dist (km)</Text>
                <TextInput
                  value={maxDistanceKm}
                  onChangeText={setMaxDistanceKm}
                  keyboardType="numeric"
                  style={styles.filterInput}
                  placeholder="15"
                />
              </View>
              <View style={styles.filterBox}>
                <Text style={styles.filterLabel}>Max Price ($)</Text>
                <TextInput
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  keyboardType="numeric"
                  style={styles.filterInput}
                  placeholder="Any"
                />
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 8 }}
            >
              {[
                { key: '', label: 'All Room Types' },
                { key: 'PRIVATE_ROOM', label: 'Private Room' },
                { key: 'ENTIRE_PLACE', label: 'Entire Place' },
                { key: 'SHARED_ROOM', label: 'Shared Room' },
              ].map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  onPress={() => setCategoryFilter(cat.key)}
                  style={[
                    styles.catChip,
                    categoryFilter === cat.key && styles.catChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      categoryFilter === cat.key && styles.catChipTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Interactive Campus & Property Map */}
          <View style={styles.mapContainer}>
            <MapView
              ref={exploreMapRef}
              style={styles.map}
              initialRegion={{
                latitude: selectedUni?.latitude || 30.0276,
                longitude: selectedUni?.longitude || 31.2101,
                latitudeDelta: 0.04,
                longitudeDelta: 0.04,
              }}
            >
              {selectedUni && (
                <Marker
                  coordinate={{
                    latitude: selectedUni.latitude,
                    longitude: selectedUni.longitude,
                  }}
                  title={selectedUni.name}
                  description={`${selectedUni.city}, ${selectedUni.country}`}
                >
                  <View style={styles.uniMarkerBadge}>
                    <Text style={styles.uniMarkerText}>
                      🎓 {selectedUni.name}
                    </Text>
                  </View>
                </Marker>
              )}

              {listings.map((prop) => (
                <Marker
                  key={prop.id}
                  coordinate={{
                    latitude: prop.latitude,
                    longitude: prop.longitude,
                  }}
                >
                  <View style={styles.priceMarkerBadge}>
                    <Text style={styles.priceMarkerText}>
                      ${prop.startingPrice || 'N/A'}
                    </Text>
                  </View>
                  <Callout onPress={() => openQuickBookingModal(prop)}>
                    <View style={styles.calloutBox}>
                      <Text style={styles.calloutTitle}>{prop.title}</Text>
                      <Text style={styles.calloutSub}>
                        {prop.distanceToUniKm} km • From ${prop.startingPrice}/mo
                      </Text>
                      <Text style={styles.calloutAction}>
                        Tap to Book Room &rarr;
                      </Text>
                    </View>
                  </Callout>
                </Marker>
              ))}
            </MapView>
          </View>

          {/* Listings List */}
          <View style={styles.sectionPad}>
            <Text style={styles.sectionHeading}>
              {loadingListings
                ? 'Searching accommodations...'
                : `${listings.length} Student Properties Near ${
                    selectedUni?.name || 'Campus'
                  }`}
            </Text>

            {listings.map((prop) => (
              <View key={prop.id} style={styles.card}>
                <TouchableOpacity onPress={() => openPropertyDetails(prop)}>
                  <Image
                    source={{
                      uri: prop.images?.[0] || DEFAULT_COVER_IMAGE,
                    }}
                    style={styles.cardImage}
                  />
                  {prop.distanceToUniKm !== undefined && (
                    <View style={styles.distanceOverlay}>
                      <Text style={styles.distanceOverlayText}>
                        {prop.distanceToUniKm} km from campus
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.cardBody}>
                  <View style={styles.rowBetween}>
                    <TouchableOpacity
                      style={{ flex: 1 }}
                      onPress={() => openPropertyDetails(prop)}
                    >
                      <Text style={styles.cardTitle}>{prop.title}</Text>
                      <Text style={styles.cardSub}>
                        {prop.address}, {prop.city}
                      </Text>
                    </TouchableOpacity>
                    {prop.startingPrice && (
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.priceText}>
                          ${prop.startingPrice}
                        </Text>
                        <Text style={styles.perMoText}>/ month</Text>
                      </View>
                    )}
                  </View>

                  {prop.commute && (
                    <View style={styles.commuteRow}>
                      <Text style={styles.commuteBadge}>
                        🚶 {prop.commute.walkMins}m walk
                      </Text>
                      <Text style={styles.commuteBadge}>
                        🚇 {prop.commute.transitMins}m transit
                      </Text>
                    </View>
                  )}

                  {prop.amenities?.length > 0 && (
                    <View style={styles.amenityWrap}>
                      {prop.amenities.slice(0, 4).map((am, i) => (
                        <View key={i} style={styles.amenityTag}>
                          <Text style={styles.amenityTagText}>{am}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={styles.cardFooter}>
                    <TouchableOpacity
                      style={styles.outlineBtn}
                      onPress={() => openPropertyDetails(prop)}
                    >
                      <Text style={styles.outlineBtnText}>
                        View Details & Rooms
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.primaryBtnSmall}
                      onPress={() => openQuickBookingModal(prop)}
                    >
                      <Text style={styles.primaryBtnText}>Book Room</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* SCREEN 2: DEDICATED PROPERTY DETAILS & LEASE CALCULATOR */}
      {activeTab === 'DETAILS' && selectedProperty && (
        <ScrollView style={styles.flex1}>
          <View style={styles.sectionPad}>
            <TouchableOpacity onPress={() => setActiveTab('EXPLORE')}>
              <Text style={styles.linkText}>&larr; Back to University Map</Text>
            </TouchableOpacity>

            <Text style={[styles.detailTitle, { marginTop: 8 }]}>
              {selectedProperty.title}
            </Text>
            <Text style={styles.cardSub}>
              {selectedProperty.address}, {selectedProperty.city}
            </Text>

            {loadingDetails && (
              <ActivityIndicator
                size="small"
                color="#2563eb"
                style={{ marginVertical: 8 }}
              />
            )}

            {/* 1. Multi-Photo Gallery */}
            <Image
              source={{
                uri:
                  selectedProperty.images?.[activePhotoIdx] ||
                  selectedProperty.images?.[0] ||
                  DEFAULT_COVER_IMAGE,
              }}
              style={styles.detailHeroImage}
            />
            {selectedProperty.images?.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 8 }}
              >
                {selectedProperty.images.map((imgUrl, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setActivePhotoIdx(idx)}
                  >
                    <Image
                      source={{ uri: imgUrl }}
                      style={[
                        styles.thumbImage,
                        activePhotoIdx === idx && styles.thumbImageActive,
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* About & Landlord Checked Amenities */}
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>About This Residence</Text>
              <Text style={styles.bodyText}>
                {selectedProperty.description}
              </Text>

              {selectedProperty.amenities?.length > 0 && (
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.sectionLabel}>
                    INCLUDED AMENITIES & FACILITIES
                  </Text>
                  <View style={styles.amenityWrap}>
                    {selectedProperty.amenities.map((item, idx) => (
                      <View key={idx} style={styles.amenityTag}>
                        <Text style={styles.amenityTagText}>✓ {item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* 2. Breakdown of Room Tiers */}
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>
                Available Room Tiers ({detailsRooms.length})
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginVertical: 8 }}
              >
                {Object.keys(CATEGORY_LABELS).map((catKey) => (
                  <TouchableOpacity
                    key={catKey}
                    onPress={() => setDetailsRoomCategory(catKey)}
                    style={[
                      styles.catChip,
                      detailsRoomCategory === catKey && styles.catChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.catChipText,
                        detailsRoomCategory === catKey &&
                          styles.catChipTextActive,
                      ]}
                    >
                      {CATEGORY_LABELS[catKey]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {filteredDetailsRooms.map((room) => {
                const isSelected = selectedCalcRoom?.id === room.id;
                return (
                  <TouchableOpacity
                    key={room.id}
                    onPress={() => setCalcRoomId(room.id)}
                    style={[
                      styles.roomTierBox,
                      isSelected && styles.roomTierBoxActive,
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.roomTierName}>{room.name}</Text>
                      <Text style={styles.cardSub}>
                        {CATEGORY_LABELS[room.category] || room.category} •{' '}
                        {room.sizeSqm || 18} m²
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.priceText}>
                        ${room.pricePerMonth}/mo
                      </Text>
                      <TouchableOpacity
                        style={[styles.primaryBtnSmall, { marginTop: 6 }]}
                        onPress={() =>
                          openQuickBookingModal(
                            selectedProperty,
                            room.id,
                            calcMonths
                          )
                        }
                      >
                        <Text style={styles.primaryBtnText}>Book</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 3. Total Lease Cost Calculator */}
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Total Lease Cost Calculator</Text>
              <Text style={styles.cardSub}>
                Selected Room: {selectedCalcRoom?.name || 'N/A'}
              </Text>

              <Text style={[styles.sectionLabel, { marginTop: 12 }]}>
                LEASE DURATION: {calcMonths} MONTHS
              </Text>
              <View style={styles.presetRow}>
                {[4, 6, 9, 12].map((m) => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setCalcMonths(m)}
                    style={[
                      styles.presetBtn,
                      calcMonths === m && styles.presetBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.presetBtnText,
                        calcMonths === m && styles.presetBtnTextActive,
                      ]}
                    >
                      {m} mos
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.calcSummary}>
                <View style={styles.rowBetween}>
                  <Text style={styles.bodyText}>Monthly Rent</Text>
                  <Text style={styles.boldText}>${calcMonthlyRent} / mo</Text>
                </View>
                <View style={styles.rowBetween}>
                  <Text style={styles.bodyText}>
                    Lease Subtotal ({calcMonths} mos)
                  </Text>
                  <Text style={styles.boldText}>
                    ${calcSubtotal.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.rowBetween}>
                  <Text style={styles.bodyText}>
                    Refundable Security Deposit (50%)
                  </Text>
                  <Text style={styles.boldText}>
                    ${calcDeposit.toLocaleString()}
                  </Text>
                </View>
                <View style={[styles.rowBetween, styles.calcTotalRow]}>
                  <Text style={styles.panelTitle}>Total Estimated Lease</Text>
                  <Text style={styles.priceText}>
                    ${calcGrandTotal.toLocaleString()}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, { marginTop: 12 }]}
                onPress={() =>
                  openQuickBookingModal(
                    selectedProperty,
                    selectedCalcRoom?.id,
                    calcMonths
                  )
                }
              >
                <Text style={styles.primaryBtnText}>
                  Book This Room ({calcMonths} Months)
                </Text>
              </TouchableOpacity>
            </View>

            {/* 4. Neighborhood Map */}
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Neighborhood & Campus Map</Text>
              <View style={[styles.mapContainer, { height: 220, marginTop: 8 }]}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: selectedProperty.latitude,
                    longitude: selectedProperty.longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: selectedProperty.latitude,
                      longitude: selectedProperty.longitude,
                    }}
                    title={selectedProperty.title}
                  />
                  {selectedProperty.primaryUniversity && (
                    <Marker
                      coordinate={{
                        latitude: selectedProperty.primaryUniversity.latitude,
                        longitude: selectedProperty.primaryUniversity.longitude,
                      }}
                      title={selectedProperty.primaryUniversity.name}
                      pinColor="blue"
                    />
                  )}
                </MapView>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {/* SCREEN 3: STUDENT BOOKINGS DASHBOARD */}
      {activeTab === 'STUDENT' && (
        <ScrollView style={styles.flex1}>
          <View style={styles.sectionPad}>
            <View style={styles.rowBetween}>
              <Text style={styles.detailTitle}>My Booking Requests</Text>
              <TouchableOpacity onPress={() => loadStudentBookings()}>
                <Text style={styles.linkText}>Refresh</Text>
              </TouchableOpacity>
            </View>

            {studentBookings.length === 0 ? (
              <View style={styles.panel}>
                <Text style={styles.bodyText}>
                  You haven&apos;t submitted any room booking requests yet.
                </Text>
              </View>
            ) : (
              studentBookings.map((b) => (
                <View key={b.id} style={styles.panel}>
                  <Text style={styles.roomTierName}>
                    {b.roomType?.property?.title || 'Student Property'}
                  </Text>
                  <Text style={styles.bodyText}>
                    Room: {b.roomType?.name} • ${b.roomType?.pricePerMonth}/mo
                  </Text>
                  <Text style={styles.cardSub}>
                    Move-in: {new Date(b.moveInDate).toLocaleDateString()} •{' '}
                    {b.durationMonths} months
                  </Text>
                  <View style={[styles.statusBadge, { marginTop: 8 }]}>
                    <Text style={styles.statusBadgeText}>{b.status}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}

      {/* SCREEN 4: LANDLORD MANAGEMENT PORTAL */}
      {activeTab === 'LANDLORD' && (
        <ScrollView ref={landlordScrollRef} style={styles.flex1}>
          <View style={styles.sectionPad}>
            {/* Publish / Edit Property Form */}
            <View style={styles.panel}>
              <View style={styles.rowBetween}>
                <Text style={styles.panelTitle}>
                  {editingPropertyId
                    ? '✏️ Edit Student Property'
                    : '🏢 Publish New Property'}
                </Text>
                {editingPropertyId && (
                  <TouchableOpacity onPress={resetLandlordForm}>
                    <Text style={styles.logoutText}>Cancel Edit</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.inputLabel}>Property Title</Text>
              <TextInput
                value={propTitle}
                onChangeText={setPropTitle}
                placeholder="e.g., Bloomsbury Student Studios"
                style={styles.textInput}
              />

              <View style={styles.filterRow}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.inputLabel}>Street Address</Text>
                  <TextInput
                    value={propAddress}
                    onChangeText={setPropAddress}
                    placeholder="42 Gower Street"
                    style={styles.textInput}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>City</Text>
                  <TextInput
                    value={propCity}
                    onChangeText={setPropCity}
                    placeholder="London"
                    style={styles.textInput}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                value={propDesc}
                onChangeText={setPropDesc}
                placeholder="Describe study spaces, security, transport..."
                style={styles.textInput}
                multiline
              />

              {/* Street Search Autocomplete + Interactive Map Location Picker */}
              <Text style={[styles.sectionLabel, { marginTop: 14 }]}>
                SEARCH STREET & PINPOINT LOCATION ON MAP
              </Text>
              <TextInput
                value={streetQuery}
                onChangeText={setStreetQuery}
                placeholder="🔍 Search street (e.g., Gower Street, London)..."
                style={styles.textInput}
              />
              {searchingStreet && (
                <Text style={styles.cardSub}>Searching streets...</Text>
              )}
              {streetResults.map((place) => (
                <TouchableOpacity
                  key={place.place_id}
                  onPress={() => handleSelectStreet(place)}
                  style={styles.streetOption}
                >
                  <Text style={styles.boldText} numberOfLines={1}>
                    📍 {place.display_name.split(',')[0]}
                  </Text>
                  <Text style={styles.cardSub} numberOfLines={1}>
                    {place.display_name}
                  </Text>
                </TouchableOpacity>
              ))}

              <View style={[styles.mapContainer, { height: 220, marginTop: 8 }]}>
                <MapView
                  ref={landlordMapRef}
                  style={styles.map}
                  initialRegion={{
                    latitude: propLat,
                    longitude: propLng,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                  }}
                  onPress={(e) => {
                    const { latitude, longitude } = e.nativeEvent.coordinate;
                    setPropLat(Number(latitude.toFixed(6)));
                    setPropLng(Number(longitude.toFixed(6)));
                  }}
                >
                  <Marker
                    draggable
                    coordinate={{ latitude: propLat, longitude: propLng }}
                    onDragEnd={(e) => {
                      const { latitude, longitude } = e.nativeEvent.coordinate;
                      setPropLat(Number(latitude.toFixed(6)));
                      setPropLng(Number(longitude.toFixed(6)));
                    }}
                    title="Property Pin (Tap map or drag)"
                  />
                </MapView>
              </View>
              <Text style={styles.coordHint}>
                👆 Tap anywhere on the map or drag pin ({propLat.toFixed(4)},{' '}
                {propLng.toFixed(4)})
              </Text>

              {/* Amenities & Facilities Checkboxes */}
              <Text style={[styles.sectionLabel, { marginTop: 14 }]}>
                AMENITIES & FACILITIES ({selectedAmenities.length} SELECTED)
              </Text>
              <View style={styles.amenityWrap}>
                {allAmenityCheckboxes.map((am) => {
                  const checked = selectedAmenities.includes(am);
                  return (
                    <TouchableOpacity
                      key={am}
                      onPress={() =>
                        setSelectedAmenities((prev) =>
                          prev.includes(am)
                            ? prev.filter((item) => item !== am)
                            : [...prev, am]
                        )
                      }
                      style={[
                        styles.checkboxPill,
                        checked && styles.checkboxPillActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.checkboxPillText,
                          checked && styles.checkboxPillTextActive,
                        ]}
                      >
                        {checked ? '☑ ' : '☐ '}
                        {am}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={[styles.filterRow, { marginTop: 8 }]}>
                <TextInput
                  value={customAmenity}
                  onChangeText={setCustomAmenity}
                  placeholder="Add custom facility..."
                  style={[styles.textInput, { flex: 1, marginTop: 0 }]}
                />
                <TouchableOpacity
                  style={styles.outlineBtn}
                  onPress={() => {
                    const t = customAmenity.trim();
                    if (t && !selectedAmenities.includes(t)) {
                      setSelectedAmenities((prev) => [...prev, t]);
                    }
                    setCustomAmenity('');
                  }}
                >
                  <Text style={styles.outlineBtnText}>+ Add</Text>
                </TouchableOpacity>
              </View>

              {/* Property Photos Manager */}
              <Text style={[styles.sectionLabel, { marginTop: 14 }]}>
                PROPERTY PHOTOS ({propImages.length})
              </Text>
              <TouchableOpacity
                style={[styles.outlineBtn, { marginBottom: 8 }]}
                onPress={handlePickImageFromDevice}
              >
                <Text style={styles.outlineBtnText}>
                  📷 Pick Photos from Phone Gallery
                </Text>
              </TouchableOpacity>

              <View style={styles.filterRow}>
                <TextInput
                  value={imageUrlInput}
                  onChangeText={setImageUrlInput}
                  placeholder="Or paste image URL (https://...)"
                  style={[styles.textInput, { flex: 1, marginTop: 0 }]}
                />
                <TouchableOpacity
                  style={styles.primaryBtnSmall}
                  onPress={() => {
                    if (imageUrlInput.trim()) {
                      setPropImages((prev) => [...prev, imageUrlInput.trim()]);
                      setImageUrlInput('');
                    }
                  }}
                >
                  <Text style={styles.primaryBtnText}>Add URL</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 10 }}
              >
                {propImages.map((uri, idx) => (
                  <View key={idx} style={styles.photoPreviewBox}>
                    <Image source={{ uri }} style={styles.photoPreviewImg} />
                    <View style={styles.photoPreviewActions}>
                      {idx === 0 ? (
                        <Text style={styles.coverLabel}>Cover</Text>
                      ) : (
                        <TouchableOpacity
                          onPress={() =>
                            setPropImages((prev) => {
                              const copy = [...prev];
                              const [picked] = copy.splice(idx, 1);
                              return [picked, ...copy];
                            })
                          }
                        >
                          <Text style={styles.linkText}>Set Cover</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={() =>
                          setPropImages((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                      >
                        <Text style={styles.logoutText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* Primary Room Configuration */}
              <Text style={[styles.sectionLabel, { marginTop: 14 }]}>
                PRIMARY ROOM TIER DETAILS
              </Text>
              <TextInput
                value={roomName}
                onChangeText={setRoomName}
                placeholder="Room Tier Name"
                style={styles.textInput}
              />

              <View style={styles.presetRow}>
                {['PRIVATE_ROOM', 'ENTIRE_PLACE', 'SHARED_ROOM'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setRoomCategory(cat)}
                    style={[
                      styles.presetBtn,
                      roomCategory === cat && styles.presetBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.presetBtnText,
                        roomCategory === cat && styles.presetBtnTextActive,
                      ]}
                    >
                      {CATEGORY_LABELS[cat]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.filterRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Price / Month ($)</Text>
                  <TextInput
                    value={pricePerMonth}
                    onChangeText={setPricePerMonth}
                    keyboardType="numeric"
                    style={styles.textInput}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Size (m²)</Text>
                  <TextInput
                    value={sizeSqm}
                    onChangeText={setSizeSqm}
                    keyboardType="numeric"
                    style={styles.textInput}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, { marginTop: 14 }]}
                onPress={handleSaveProperty}
                disabled={savingProperty}
              >
                <Text style={styles.primaryBtnText}>
                  {savingProperty
                    ? 'Saving...'
                    : editingPropertyId
                    ? 'Save Property Changes'
                    : 'Publish Property Listing'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* My Listed Properties Section (Edit / Delete) */}
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>
                My Listed Properties ({myProperties.length})
              </Text>
              {myProperties.length === 0 ? (
                <Text style={styles.cardSub}>
                  No properties published yet.
                </Text>
              ) : (
                myProperties.map((prop) => (
                  <View key={prop.id} style={styles.roomTierBox}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.roomTierName}>{prop.title}</Text>
                      <Text style={styles.cardSub}>
                        {prop.address}, {prop.city} •{' '}
                        {prop.amenities?.length || 0} amenities
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        style={styles.outlineBtn}
                        onPress={() => handleStartEditProperty(prop)}
                      >
                        <Text style={styles.outlineBtnText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.outlineBtn,
                          { borderColor: '#ef4444' },
                        ]}
                        onPress={() => handleDeleteProperty(prop)}
                      >
                        <Text style={{ color: '#dc2626', fontSize: 12, fontWeight: '700' }}>
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Incoming Student Bookings Section */}
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>
                Incoming Student Bookings ({landlordBookings.length})
              </Text>
              {landlordBookings.map((b) => (
                <View key={b.id} style={styles.roomTierBox}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.roomTierName}>
                      {b.roomType?.property?.title} — {b.roomType?.name}
                    </Text>
                    <Text style={styles.bodyText}>
                      Student: {b.student?.name} ({b.student?.email})
                    </Text>
                    <Text style={styles.cardSub}>
                      Status: {b.status} • {b.durationMonths} mos
                    </Text>
                  </View>
                  {b.status === 'PENDING' && (
                    <View style={{ gap: 6 }}>
                      <TouchableOpacity
                        style={[
                          styles.primaryBtnSmall,
                          { backgroundColor: '#059669' },
                        ]}
                        onPress={() =>
                          handleUpdateBookingStatus(b.id, 'APPROVED')
                        }
                      >
                        <Text style={styles.primaryBtnText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.primaryBtnSmall,
                          { backgroundColor: '#dc2626' },
                        ]}
                        onPress={() =>
                          handleUpdateBookingStatus(b.id, 'REJECTED')
                        }
                      >
                        <Text style={styles.primaryBtnText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      {/* SCREEN 5: LOGIN & REGISTER (STUDENT / LANDLORD) */}
      {activeTab === 'AUTH' && (
        <ScrollView style={styles.flex1}>
          <View style={styles.sectionPad}>
            <View style={styles.panel}>
              <Text style={styles.detailTitle}>
                {authMode === 'LOGIN' ? 'Welcome Back' : 'Create an Account'}
              </Text>

              {authMode === 'REGISTER' && (
                <View style={[styles.presetRow, { marginVertical: 12 }]}>
                  <TouchableOpacity
                    style={[
                      styles.presetBtn,
                      authRole === 'STUDENT' && styles.presetBtnActive,
                    ]}
                    onPress={() => setAuthRole('STUDENT')}
                  >
                    <Text
                      style={[
                        styles.presetBtnText,
                        authRole === 'STUDENT' && styles.presetBtnTextActive,
                      ]}
                    >
                      🎓 I am a Student
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.presetBtn,
                      authRole === 'LANDLORD' && styles.presetBtnActive,
                    ]}
                    onPress={() => setAuthRole('LANDLORD')}
                  >
                    <Text
                      style={[
                        styles.presetBtnText,
                        authRole === 'LANDLORD' && styles.presetBtnTextActive,
                      ]}
                    >
                      🏢 I am a Landlord
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {authError ? (
                <Text style={styles.errorText}>{authError}</Text>
              ) : null}

              {authMode === 'REGISTER' && (
                <>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput
                    value={authName}
                    onChangeText={setAuthName}
                    placeholder="Samir Mohamed"
                    style={styles.textInput}
                  />
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <TextInput
                    value={authPhone}
                    onChangeText={setAuthPhone}
                    placeholder="+20 100 000 0000"
                    style={styles.textInput}
                  />
                </>
              )}

              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                value={authEmail}
                onChangeText={setAuthEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="you@university.edu"
                style={styles.textInput}
              />

              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                value={authPassword}
                onChangeText={setAuthPassword}
                secureTextEntry
                placeholder="••••••••"
                style={styles.textInput}
              />

              <TouchableOpacity
                style={[styles.primaryBtn, { marginTop: 16 }]}
                onPress={handleAuthSubmit}
                disabled={authLoading}
              >
                <Text style={styles.primaryBtnText}>
                  {authLoading
                    ? 'Please wait...'
                    : authMode === 'LOGIN'
                    ? 'Sign In'
                    : `Sign Up as ${authRole}`}
                </Text>
              </TouchableOpacity>

              {authMode === 'LOGIN' && (
                <View style={[styles.presetRow, { marginTop: 14 }]}>
                  <TouchableOpacity
                    style={styles.outlineBtn}
                    onPress={() => {
                      setAuthEmail('student@unihousing.com');
                      setAuthPassword('password123');
                    }}
                  >
                    <Text style={styles.outlineBtnText}>Fill Student Demo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.outlineBtn}
                    onPress={() => {
                      setAuthEmail('landlord@unihousing.com');
                      setAuthPassword('password123');
                    }}
                  >
                    <Text style={styles.outlineBtnText}>Fill Landlord Demo</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={{ marginTop: 16, alignItems: 'center' }}
                onPress={() =>
                  setAuthMode(authMode === 'LOGIN' ? 'REGISTER' : 'LOGIN')
                }
              >
                <Text style={styles.linkText}>
                  {authMode === 'LOGIN'
                    ? "Don't have an account? Create one"
                    : 'Already have an account? Sign In'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}

      {/* BOTTOM NAVIGATION BAR */}
      <View style={styles.bottomTabs}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('EXPLORE')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'EXPLORE' && styles.tabTextActive,
            ]}
          >
            🗺️ Explore
          </Text>
        </TouchableOpacity>

        {user?.role === 'STUDENT' && (
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => {
              loadStudentBookings();
              setActiveTab('STUDENT');
            }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'STUDENT' && styles.tabTextActive,
              ]}
            >
              📋 My Bookings
            </Text>
          </TouchableOpacity>
        )}

        {user?.role === 'LANDLORD' && (
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => {
              loadLandlordData();
              setActiveTab('LANDLORD');
            }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'LANDLORD' && styles.tabTextActive,
              ]}
            >
              🏢 Landlord Portal
            </Text>
          </TouchableOpacity>
        )}

        {!user && (
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('AUTH')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'AUTH' && styles.tabTextActive,
              ]}
            >
              🔑 Account
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* MODAL 1: BOOK ROOM REQUEST */}
      <Modal visible={bookingModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.panelTitle}>
              Book {bookingProperty?.title}
            </Text>

            <Text style={styles.inputLabel}>Student Name</Text>
            <TextInput
              value={studentName}
              onChangeText={setStudentName}
              style={styles.textInput}
            />

            <Text style={styles.inputLabel}>Student Email</Text>
            <TextInput
              value={studentEmail}
              onChangeText={setStudentEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.textInput}
            />

            <View style={styles.filterRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Move-in Date</Text>
                <TextInput
                  value={moveInDate}
                  onChangeText={setMoveInDate}
                  style={styles.textInput}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Months</Text>
                <TextInput
                  value={durationMonths}
                  onChangeText={setDurationMonths}
                  keyboardType="numeric"
                  style={styles.textInput}
                />
              </View>
            </View>

            <View style={[styles.filterRow, { marginTop: 16 }]}>
              <TouchableOpacity
                style={[styles.outlineBtn, { flex: 1 }]}
                onPress={() => setBookingModalOpen(false)}
              >
                <Text style={styles.outlineBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, { flex: 1 }]}
                onPress={handleBookingSubmit}
                disabled={bookingSubmitting}
              >
                <Text style={styles.primaryBtnText}>
                  {bookingSubmitting ? 'Sending...' : 'Confirm Booking'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: ADD NEW UNIVERSITY CAMPUS */}
      <Modal visible={uniModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.panelTitle}>🎓 Add University Campus</Text>
            <TextInput
              value={uniSearchQuery}
              onChangeText={setUniSearchQuery}
              placeholder="🔍 Auto-fill: Search university name..."
              style={styles.textInput}
            />
            {uniSearchResults.map((place) => (
              <TouchableOpacity
                key={place.place_id}
                style={styles.streetOption}
                onPress={() => {
                  const addr = place.address || {};
                  setNewUniName(place.name || place.display_name.split(',')[0]);
                  setNewUniCity(
                    addr.city || addr.town || addr.state || 'Cairo'
                  );
                  setNewUniCountry(addr.country || 'Egypt');
                  setNewUniLat(String(Number(parseFloat(place.lat).toFixed(6))));
                  setNewUniLng(String(Number(parseFloat(place.lon).toFixed(6))));
                  setUniSearchResults([]);
                  setUniSearchQuery('');
                }}
              >
                <Text style={styles.boldText} numberOfLines={1}>
                  {place.display_name}
                </Text>
              </TouchableOpacity>
            ))}

            <Text style={styles.inputLabel}>University Name</Text>
            <TextInput
              value={newUniName}
              onChangeText={setNewUniName}
              style={styles.textInput}
            />
            <View style={styles.filterRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>City</Text>
                <TextInput
                  value={newUniCity}
                  onChangeText={setNewUniCity}
                  style={styles.textInput}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Country</Text>
                <TextInput
                  value={newUniCountry}
                  onChangeText={setNewUniCountry}
                  style={styles.textInput}
                />
              </View>
            </View>
            <View style={styles.filterRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Latitude</Text>
                <TextInput
                  value={newUniLat}
                  onChangeText={setNewUniLat}
                  keyboardType="numeric"
                  style={styles.textInput}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Longitude</Text>
                <TextInput
                  value={newUniLng}
                  onChangeText={setNewUniLng}
                  keyboardType="numeric"
                  style={styles.textInput}
                />
              </View>
            </View>

            <View style={[styles.filterRow, { marginTop: 16 }]}>
              <TouchableOpacity
                style={[styles.outlineBtn, { flex: 1 }]}
                onPress={() => setUniModalOpen(false)}
              >
                <Text style={styles.outlineBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, { flex: 1 }]}
                onPress={handleCreateUniversity}
              >
                <Text style={styles.primaryBtnText}>Save University</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  flex1: { flex: 1 },
  navbar: {
    height: 56,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadgeText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  brandTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  navRight: { flexDirection: 'row', alignItems: 'center' },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rolePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  rolePillStudent: { backgroundColor: '#dbeafe' },
  rolePillLandlord: { backgroundColor: '#fef3c7' },
  rolePillText: { fontSize: 11, fontWeight: '700', color: '#1e293b' },
  logoutText: { fontSize: 12, fontWeight: '700', color: '#dc2626' },
  loginBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  loginBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  sectionPad: { padding: 14 },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 10,
  },
  linkText: { fontSize: 12, fontWeight: '700', color: '#2563eb' },
  uniScroll: { marginTop: 8, marginBottom: 8 },
  uniChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginRight: 8,
  },
  uniChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  uniChipText: { fontSize: 12, fontWeight: '600', color: '#334155' },
  uniChipTextActive: { color: '#ffffff' },
  filterRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  filterBox: { flex: 1 },
  filterLabel: { fontSize: 11, fontWeight: '600', color: '#475569' },
  filterInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    marginTop: 4,
  },
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
    marginRight: 6,
  },
  catChipActive: { backgroundColor: '#0f172a' },
  catChipText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  catChipTextActive: { color: '#ffffff' },
  mapContainer: {
    height: 250,
    width: '100%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  map: { width: '100%', height: '100%' },
  uniMarkerBadge: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  uniMarkerText: { color: '#ffffff', fontSize: 11, fontWeight: '800' },
  priceMarkerBadge: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  priceMarkerText: { color: '#ffffff', fontSize: 11, fontWeight: '800' },
  calloutBox: { width: 170, padding: 4 },
  calloutTitle: { fontSize: 12, fontWeight: '800', color: '#0f172a' },
  calloutSub: { fontSize: 11, color: '#475569', marginTop: 2 },
  calloutAction: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    overflow: 'hidden',
  },
  cardImage: { width: '100%', height: 165 },
  distanceOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  distanceOverlayText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  cardBody: { padding: 14 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  cardSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  priceText: { fontSize: 18, fontWeight: '800', color: '#2563eb' },
  perMoText: { fontSize: 11, color: '#64748b' },
  commuteRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  commuteBadge: {
    fontSize: 11,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    color: '#334155',
    fontWeight: '600',
  },
  amenityWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  amenityTag: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  amenityTagText: { fontSize: 11, color: '#1d4ed8', fontWeight: '600' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 8,
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: { fontSize: 12, fontWeight: '700', color: '#334155' },
  primaryBtnSmall: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  detailTitle: { fontSize: 21, fontWeight: '800', color: '#0f172a' },
  detailHeroImage: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    marginTop: 10,
  },
  thumbImage: {
    width: 72,
    height: 54,
    borderRadius: 8,
    marginRight: 8,
    opacity: 0.6,
  },
  thumbImageActive: {
    opacity: 1,
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  panel: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginTop: 14,
  },
  panelTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  bodyText: { fontSize: 13, color: '#475569', marginTop: 4, lineHeight: 19 },
  boldText: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  roomTierBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 8,
  },
  roomTierBoxActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  roomTierName: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  presetRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  presetBtn: {
    flex: 1,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    alignItems: 'center',
  },
  presetBtnActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },
  presetBtnText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  presetBtnTextActive: { color: '#1d4ed8' },
  calcSummary: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 6,
  },
  calcTotalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '800', color: '#92400e' },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginTop: 10,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    marginTop: 4,
  },
  streetOption: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  coordHint: {
    fontSize: 11,
    color: '#475569',
    marginTop: 6,
    textAlign: 'center',
  },
  checkboxPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  checkboxPillActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },
  checkboxPillText: { fontSize: 11, fontWeight: '600', color: '#334155' },
  checkboxPillTextActive: { color: '#1e40af', fontWeight: '700' },
  photoPreviewBox: {
    width: 110,
    marginRight: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  photoPreviewImg: { width: '100%', height: 70 },
  photoPreviewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  coverLabel: { fontSize: 10, fontWeight: '800', color: '#2563eb' },
  errorText: {
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    padding: 8,
    borderRadius: 8,
    fontSize: 12,
    marginTop: 8,
  },
  bottomTabs: {
    height: 54,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: { paddingVertical: 8, paddingHorizontal: 16 },
  tabText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  tabTextActive: { color: '#2563eb', fontWeight: '800' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
  },
});