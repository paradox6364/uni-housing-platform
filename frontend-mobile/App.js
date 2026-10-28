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
import { WebView } from 'react-native-webview';

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

const TRANSLATIONS = {
  en: {
    brand: 'UniHousing',
    signInJoin: 'Sign In',
    logOut: 'Log Out',
    selectCampus: 'SELECT UNIVERSITY CAMPUS',
    addCampus: '+ Add Campus',
    maxDist: 'Max Dist (km)',
    maxPrice: 'Max Price ($)',
    any: 'Any',
    allRoomTypes: 'All Room Types',
    privateRoom: 'Private Room',
    entirePlace: 'Studio / Entire Place',
    sharedRoom: 'Shared Room',
    searchingProps: 'Searching accommodations...',
    propsNear: 'Student Properties Near',
    kmFromCampus: 'km from campus',
    perMonth: '/ month',
    walk: 'm walk',
    transit: 'm transit',
    viewDetails: 'View Details & Rooms',
    bookRoom: 'Book Room',
    tapToBook: 'Tap to Book Room →',
    backToMap: '← Back to University Map',
    aboutResidence: 'About This Residence',
    includedAmenities: 'INCLUDED AMENITIES & FACILITIES',
    availableRooms: 'Available Room Tiers',
    allTiers: 'All Tiers',
    book: 'Book',
    leaseCalculator: 'Total Lease Cost Calculator',
    selectedRoom: 'Selected Room',
    leaseDuration: 'LEASE DURATION',
    months: 'MONTHS',
    mos: 'mos',
    monthlyRent: 'Monthly Rent',
    leaseSubtotal: 'Lease Subtotal',
    securityDeposit: 'Refundable Security Deposit (50%)',
    totalLease: 'Total Estimated Lease',
    bookThisRoom: 'Book This Room',
    neighborhoodMap: 'Neighborhood & Campus Map',
    myBookings: 'My Booking Requests',
    refresh: 'Refresh',
    noStudentBookings: "You haven't submitted any room booking requests yet.",
    moveIn: 'Move-in',
    editProperty: '✏️ Edit Student Property',
    publishProperty: '🏢 Publish New Property',
    cancelEdit: 'Cancel Edit',
    propTitle: 'Property Title',
    streetAddress: 'Street Address',
    city: 'City',
    description: 'Description',
    searchStreetLabel: 'SEARCH STREET & PINPOINT LOCATION ON MAP',
    searchStreetPlaceholder: '🔍 Search street (e.g., Gower Street, London)...',
    searchingStreets: 'Searching streets...',
    tapMapHint: '👆 Tap anywhere on the map or drag pin',
    amenitiesLabel: 'AMENITIES & FACILITIES',
    selected: 'SELECTED',
    addCustomFacility: 'Add custom facility...',
    add: '+ Add',
    propertyPhotos: 'PROPERTY PHOTOS',
    pickFromGallery: '📷 Pick Photos from Phone Gallery',
    pasteImageUrl: 'Or paste image URL (https://...)',
    addUrl: 'Add URL',
    cover: 'Cover',
    setCover: 'Set Cover',
    primaryRoomDetails: 'PRIMARY ROOM TIER DETAILS',
    roomTierName: 'Room Tier Name',
    pricePerMo: 'Price / Month ($)',
    sizeSqm: 'Size (m²)',
    saving: 'Saving...',
    saveChanges: 'Save Property Changes',
    publishListing: 'Publish Property Listing',
    myListedProps: 'My Listed Properties',
    noListedProps: 'No properties published yet.',
    amenitiesCount: 'amenities',
    edit: 'Edit',
    delete: 'Delete',
    incomingBookings: 'Incoming Student Bookings',
    student: 'Student',
    status: 'Status',
    approve: 'Approve',
    reject: 'Reject',
    welcomeBack: 'Welcome Back',
    createAccount: 'Create an Account',
    iAmStudent: '🎓 I am a Student',
    iAmLandlord: '🏢 I am a Landlord',
    fullName: 'Full Name',
    phone: 'Phone Number',
    email: 'Email Address',
    password: 'Password',
    pleaseWait: 'Please wait...',
    signIn: 'Sign In',
    signUpAs: 'Sign Up as',
    fillStudentDemo: 'Fill Student Demo',
    fillLandlordDemo: 'Fill Landlord Demo',
    noAccountPrompt: "Don't have an account? Create one",
    hasAccountPrompt: 'Already have an account? Sign In',
    tabExplore: '🗺️ Explore',
    tabBookings: '📋 My Bookings',
    tabLandlord: '🏢 Landlord Portal',
    tabAccount: '🔑 Account',
    cancel: 'Cancel',
    confirmBooking: 'Confirm Booking',
    sending: 'Sending...',
    addUniTitle: '🎓 Add University Campus',
    autoFillUni: '🔍 Auto-fill: Search university name...',
    uniName: 'University Name',
    country: 'Country',
    latitude: 'Latitude',
    longitude: 'Longitude',
    saveUni: 'Save University',
  },
  ar: {
    brand: 'يوني هاوسينج',
    signInJoin: 'تسجيل الدخول',
    logOut: 'خروج',
    selectCampus: 'اختر الحرم الجامعي',
    addCampus: '+ إضافة جامعة',
    maxDist: 'أقصى مسافة (كم)',
    maxPrice: 'أقصى سعر ($)',
    any: 'الكل',
    allRoomTypes: 'جميع الغرف',
    privateRoom: 'غرفة خاصة',
    entirePlace: 'استوديو / شقة كاملة',
    sharedRoom: 'غرفة مشتركة',
    searchingProps: 'جاري البحث عن سكن طلابي...',
    propsNear: 'سكن طلابي بالقرب من',
    kmFromCampus: 'كم عن الجامعة',
    perMonth: '/ شهرياً',
    walk: 'د مشي',
    transit: 'د مواصلات',
    viewDetails: 'عرض التفاصيل والغرف',
    bookRoom: 'حجز غرفة',
    tapToBook: 'اضغط لحجز الغرفة ←',
    backToMap: '→ العودة لخريطة الجامعة',
    aboutResidence: 'عن هذا السكن',
    includedAmenities: 'المرافق والخدمات المشمولة',
    availableRooms: 'فئات الغرف المتاحة',
    allTiers: 'كل الفئات',
    book: 'إحجز',
    leaseCalculator: 'حاسبة تكلفة الإيجار الإجمالية',
    selectedRoom: 'الغرفة المختارة',
    leaseDuration: 'مدة الإيجار',
    months: 'أشهر',
    mos: 'شهور',
    monthlyRent: 'الإيجار الشهري',
    leaseSubtotal: 'إجمالي الإيجار',
    securityDeposit: 'تأمين مسترد (50%)',
    totalLease: 'إجمالي التكلفة التقديرية',
    bookThisRoom: 'احجز هذه الغرفة',
    neighborhoodMap: 'خريطة الحي والجامعة',
    myBookings: 'طلبات الحجز الخاصة بي',
    refresh: 'تحديث',
    noStudentBookings: 'لم تقم بإرسال أي طلبات حجز حتى الآن.',
    moveIn: 'تاريخ السكن',
    editProperty: '✏️ تعديل بيانات السكن',
    publishProperty: '🏢 نشر سكن طلابي جديد',
    cancelEdit: 'إلغاء التعديل',
    propTitle: 'اسم السكن / العقار',
    streetAddress: 'عنوان الشارع',
    city: 'المدينة',
    description: 'الوصف',
    searchStreetLabel: 'ابحث عن الشارع وحدد الموقع على الخريطة',
    searchStreetPlaceholder: '🔍 ابحث عن شارع (مثال: شارع التحرير، القاهرة)...',
    searchingStreets: 'جاري البحث عن الشوارع...',
    tapMapHint: '👆 اضغط على الخريطة أو اسحب الدبوس لتحديد الموقع',
    amenitiesLabel: 'المرافق والخدمات',
    selected: 'محددة',
    addCustomFacility: 'إضافة مرفق آخر...',
    add: '+ إضافة',
    propertyPhotos: 'صور السكن',
    pickFromGallery: '📷 اختر صوراً من معرض الهاتف',
    pasteImageUrl: 'أو الصق رابط الصورة (https://...)',
    addUrl: 'إضافة رابط',
    cover: 'غلاف',
    setCover: 'تعيين كغلاف',
    primaryRoomDetails: 'تفاصيل فئة الغرفة الأساسية',
    roomTierName: 'اسم فئة الغرفة',
    pricePerMo: 'السعر / شهرياً ($)',
    sizeSqm: 'المساحة (م²)',
    saving: 'جاري الحفظ...',
    saveChanges: 'حفظ التعديلات',
    publishListing: 'نشر إعلان السكن',
    myListedProps: 'عقاراتي المنشورة',
    noListedProps: 'لم تقم بنشر أي عقارات بعد.',
    amenitiesCount: 'مرافق',
    edit: 'تعديل',
    delete: 'حذف',
    incomingBookings: 'طلبات حجز الطلاب الواردة',
    student: 'الطالب',
    status: 'الحالة',
    approve: 'قبول',
    reject: 'رفض',
    welcomeBack: 'مرحباً بعودتك',
    createAccount: 'إنشاء حساب جديد',
    iAmStudent: '🎓 أنا طالب',
    iAmLandlord: '🏢 أنا مالك عقار',
    fullName: 'الاسم الكامل',
    phone: 'رقم الهاتف',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    pleaseWait: 'يرجى الانتظار...',
    signIn: 'تسجيل الدخول',
    signUpAs: 'إنشاء حساب',
    fillStudentDemo: 'حساب طالب تجريبي',
    fillLandlordDemo: 'حساب مالك تجريبي',
    noAccountPrompt: 'ليس لديك حساب؟ أنشئ حساباً',
    hasAccountPrompt: 'لديك حساب بالفعل؟ سجل الدخول',
    tabExplore: '🗺️ استكشاف',
    tabBookings: '📋 حجوزاتي',
    tabLandlord: '🏢 لوحة المالك',
    tabAccount: '🔑 الحساب',
    cancel: 'إلغاء',
    confirmBooking: 'تأكيد الحجز',
    sending: 'جاري الإرسال...',
    addUniTitle: '🎓 إضافة حرم جامعي جديد',
    autoFillUni: '🔍 تعبئة تلقائية: ابحث عن اسم الجامعة...',
    uniName: 'اسم الجامعة',
    country: 'الدولة',
    latitude: 'خط العرض (Latitude)',
    longitude: 'خط الطول (Longitude)',
    saveUni: 'حفظ الجامعة',
  },
};

function LeafletMap({
  mode = 'explore', // 'explore' | 'details' | 'picker'
  centerLat = 30.0276,
  centerLng = 31.2101,
  zoom = 14,
  darkMode = false,
  university = null,
  listings = [],
  property = null,
  pickerLat = 51.5246,
  pickerLng = -0.134,
  tapToBookText = 'Tap to Book Room →',
  perMonthText = '/ month',
  onSelectPropertyBook,
  onLocationPick,
}) {
  const htmlContent = useMemo(() => {
    const payload = JSON.stringify({
      mode,
      centerLat: Number(centerLat) || 30.0276,
      centerLng: Number(centerLng) || 31.2101,
      zoom,
      darkMode: Boolean(darkMode),
      university,
      listings: (listings || []).map((p) => ({
        id: p.id,
        title: p.title,
        city: p.city,
        address: p.address,
        latitude: Number(p.latitude),
        longitude: Number(p.longitude),
        startingPrice:
          p.startingPrice ?? p.rooms?.[0]?.pricePerMonth ?? 'N/A',
        distanceToUniKm: p.distanceToUniKm,
      })),
      property: property
        ? {
            id: property.id,
            title: property.title,
            latitude: Number(property.latitude),
            longitude: Number(property.longitude),
            startingPrice:
              property.startingPrice ??
              property.rooms?.[0]?.pricePerMonth ??
              'N/A',
          }
        : null,
      pickerLat: Number(pickerLat) || 51.5246,
      pickerLng: Number(pickerLng) || -0.134,
      tapToBookText,
      perMonthText,
    });

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { box-sizing: border-box; }
    html, body, #map {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: ${darkMode ? '#0f172a' : '#f1f5f9'};
    }

    /* Dark Mode via CSS Filter on OpenStreetMap tiles (No API key required) */
    body.dark-mode .leaflet-tile-pane {
      filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
    }
    body.dark-mode .leaflet-control-zoom a,
    body.dark-mode .leaflet-control-attribution {
      background: #1e293b !important;
      color: #cbd5e1 !important;
      border-color: #334155 !important;
    }

    .leaflet-div-icon {
      background: transparent !important;
      border: none !important;
    }

    /* Exact Website University Pin (.uni-pin) */
    .uni-pin {
      background: #dc2626;
      color: #ffffff;
      font-weight: 800;
      font-size: 12px;
      padding: 5px 12px;
      border-radius: 9999px;
      border: 2px solid #ffffff;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
      white-space: nowrap;
      width: max-content;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transform: translate(-50%, -50%);
    }

    /* Exact Website Property Price Pin (.price-pin) */
    .price-pin {
      background: #ffffff;
      color: #1e293b;
      font-weight: 700;
      font-size: 13px;
      padding: 4px 10px;
      border-radius: 9999px;
      border: 2px solid #cbd5e1;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
      white-space: nowrap;
      width: max-content;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transform: translate(-50%, -50%);
      transition: all 0.2s ease;
    }

    /* Exact Website Active Pin (.price-pin-active) */
    .price-pin-active {
      background: #2563eb !important;
      color: #ffffff !important;
      border-color: #1e40af !important;
      transform: translate(-50%, -50%) scale(1.15);
      z-index: 999 !important;
    }

    .leaflet-popup-content-wrapper {
      border-radius: 12px;
      background: ${darkMode ? '#1e293b' : '#ffffff'};
      color: ${darkMode ? '#f8fafc' : '#0f172a'};
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }
    .leaflet-popup-tip {
      background: ${darkMode ? '#1e293b' : '#ffffff'};
    }
    .leaflet-popup-content {
      margin: 10px 12px;
    }
    .popup-title {
      font-weight: 800;
      font-size: 13px;
      color: ${darkMode ? '#f8fafc' : '#0f172a'};
    }
    .popup-sub {
      font-size: 11px;
      color: ${darkMode ? '#94a3b8' : '#64748b'};
      margin-top: 2px;
    }
    .book-btn {
      margin-top: 8px;
      display: inline-block;
      background: #2563eb;
      color: #ffffff !important;
      padding: 6px 10px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
    }
  </style>
</head>
<body class="${darkMode ? 'dark-mode' : ''}">
  <div id="map"></div>
  <script>
    const data = ${payload};
    const map = L.map('map', { zoomControl: true }).setView([data.centerLat, data.centerLng], data.zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    function sendMsg(msg) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(msg));
      }
    }

    function createUniIcon(name) {
      return L.divIcon({
        className: '',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
        popupAnchor: [0, -16],
        html: '<div class="uni-pin">🎓 ' + (name || 'University') + '</div>'
      });
    }

    function createPriceIcon(price, isActive) {
      return L.divIcon({
        className: '',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
        popupAnchor: [0, -16],
        html: '<div class="price-pin ' + (isActive ? 'price-pin-active' : '') + '">$' + (price || 'N/A') + '</div>'
      });
    }

    if (data.mode === 'explore') {
      if (data.university) {
        const uniMarker = L.marker(
          [data.university.latitude, data.university.longitude],
          { icon: createUniIcon(data.university.name), zIndexOffset: 1000 }
        ).addTo(map);

        uniMarker.bindPopup(
          '<div>' +
            '<div class="popup-title">🎓 ' + data.university.name + '</div>' +
            '<div class="popup-sub">' + (data.university.city || '') + (data.university.country ? ', ' + data.university.country : '') + '</div>' +
          '</div>'
        );
      }

      const markers = [];
      (data.listings || []).forEach(function(prop) {
        const marker = L.marker(
          [prop.latitude, prop.longitude],
          { icon: createPriceIcon(prop.startingPrice, false) }
        ).addTo(map);

        marker.on('click', function() {
          markers.forEach(function(m) {
            m.instance.setIcon(createPriceIcon(m.price, false));
          });
          marker.setIcon(createPriceIcon(prop.startingPrice, true));
        });

        marker.on('popupclose', function() {
          marker.setIcon(createPriceIcon(prop.startingPrice, false));
        });

        const popupHtml =
          '<div style="min-width:145px">' +
            '<div class="popup-title">' + prop.title + '</div>' +
            '<div class="popup-sub">' +
              (prop.distanceToUniKm !== undefined ? prop.distanceToUniKm + ' km • ' : '') +
              '$' + (prop.startingPrice || 'N/A') + data.perMonthText +
            '</div>' +
            '<div class="book-btn" onclick="window.bookProp(\\'' + prop.id + '\\')">' + data.tapToBookText + '</div>' +
          '</div>';
        marker.bindPopup(popupHtml);

        markers.push({ instance: marker, price: prop.startingPrice });
      });

      window.bookProp = function(propId) {
        sendMsg({ type: 'BOOK_PROPERTY', propertyId: propId });
      };
    }

    if (data.mode === 'details' && data.property) {
      L.marker(
        [data.property.latitude, data.property.longitude],
        { icon: createPriceIcon(data.property.startingPrice, true), zIndexOffset: 900 }
      ).addTo(map).bindPopup('<div class="popup-title">' + data.property.title + '</div>');

      if (data.university) {
        L.marker(
          [data.university.latitude, data.university.longitude],
          { icon: createUniIcon(data.university.name), zIndexOffset: 1000 }
        ).addTo(map);
      }
    }

    if (data.mode === 'picker') {
      const pickerIcon = L.divIcon({
        className: '',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
        html: '<div class="price-pin price-pin-active" style="white-space: nowrap;">📍 Property Pin</div>'
      });

      const pinMarker = L.marker([data.pickerLat, data.pickerLng], {
        icon: pickerIcon,
        draggable: true
      }).addTo(map);

      pinMarker.on('dragend', function(e) {
        const pos = e.target.getLatLng();
        sendMsg({ type: 'PICK_LOCATION', latitude: pos.lat, longitude: pos.lng });
      });

      map.on('click', function(e) {
        pinMarker.setLatLng(e.latlng);
        sendMsg({ type: 'PICK_LOCATION', latitude: e.latlng.lat, longitude: e.latlng.lng });
      });
    }
  </script>
</body>
</html>`;
  }, [
    mode,
    centerLat,
    centerLng,
    zoom,
    darkMode,
    university,
    listings,
    property,
    pickerLat,
    pickerLng,
    tapToBookText,
    perMonthText,
  ]);

  return (
    <WebView
      originWhitelist={['*']}
      source={{
        html: htmlContent,
        baseUrl: 'https://uni-housing-platform.vercel.app',
      }}
      userAgent="UniHousingMobile/1.0 (https://uni-housing-platform.vercel.app)"
      style={styles.map}
      nestedScrollEnabled={true}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      onMessage={(event) => {
        try {
          const msg = JSON.parse(event.nativeEvent.data);
          if (msg.type === 'BOOK_PROPERTY' && onSelectPropertyBook) {
            onSelectPropertyBook(msg.propertyId);
          } else if (msg.type === 'PICK_LOCATION' && onLocationPick) {
            onLocationPick(
              Number(Number(msg.latitude).toFixed(6)),
              Number(Number(msg.longitude).toFixed(6))
            );
          }
        } catch (err) {
          console.warn('Map message parse error:', err);
        }
      }}
    />
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState('en');
  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'ar';

  const theme = useMemo(
    () => ({
      bg: darkMode ? '#0f172a' : '#f8fafc',
      card: darkMode ? '#1e293b' : '#ffffff',
      inputBg: darkMode ? '#0f172a' : '#ffffff',
      subtleBg: darkMode ? '#334155' : '#f1f5f9',
      text: darkMode ? '#f8fafc' : '#0f172a',
      subText: darkMode ? '#94a3b8' : '#64748b',
      bodyText: darkMode ? '#cbd5e1' : '#475569',
      border: darkMode ? '#334155' : '#e2e8f0',
      inputBorder: darkMode ? '#475569' : '#cbd5e1',
    }),
    [darkMode]
  );

  const categoryLabels = useMemo(
    () => ({
      ALL: t.allTiers,
      PRIVATE_ROOM: t.privateRoom,
      ENTIRE_PLACE: t.entirePlace,
      SHARED_ROOM: t.sharedRoom,
    }),
    [t]
  );

  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('EXPLORE');
  const [authMode, setAuthMode] = useState('LOGIN');

  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authRole, setAuthRole] = useState('STUDENT');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [universities, setUniversities] = useState([]);
  const [selectedUni, setSelectedUni] = useState(null);
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [maxDistanceKm, setMaxDistanceKm] = useState('15');
  const [maxPrice, setMaxPrice] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [detailsRoomCategory, setDetailsRoomCategory] = useState('ALL');
  const [calcRoomId, setCalcRoomId] = useState('');
  const [calcMonths, setCalcMonths] = useState(9);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingProperty, setBookingProperty] = useState(null);
  const [bookingRoomId, setBookingRoomId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [moveInDate, setMoveInDate] = useState('2026-09-01');
  const [durationMonths, setDurationMonths] = useState('9');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  const [studentBookings, setStudentBookings] = useState([]);

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

  const [streetQuery, setStreetQuery] = useState('');
  const [streetResults, setStreetResults] = useState([]);
  const [searchingStreet, setSearchingStreet] = useState(false);
  const landlordScrollRef = useRef(null);

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

      const res = await fetch(
        `${API_BASE_URL}/listings/search?${params.toString()}`
      );
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
    }
  }, [selectedUni, maxDistanceKm, maxPrice, categoryFilter]);

  useEffect(() => {
    if (user) {
      setStudentName(user.name || '');
      setStudentEmail(user.email || '');
    }
  }, [user]);

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
        const res = await fetch(url, {
          headers: { 'Accept-Language': lang },
        });
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
  }, [streetQuery, lang]);

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
        const res = await fetch(url, {
          headers: { 'Accept-Language': lang },
        });
        if (res.ok) {
          const data = await res.json();
          setUniSearchResults(data || []);
        }
      } catch (e) {
        console.error(e);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [uniSearchQuery, lang]);

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
        { text: t.cancel, style: 'cancel' },
        {
          text: t.delete,
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
  const calcDeposit =
    calcMonthlyRent > 0 ? Math.round(calcMonthlyRent * 0.5) : 0;
  const calcSubtotal = calcMonthlyRent * calcMonths;
  const calcGrandTotal = calcSubtotal + calcDeposit;

  const allAmenityCheckboxes = useMemo(
    () => Array.from(new Set([...AMENITY_OPTIONS, ...selectedAmenities])),
    [selectedAmenities]
  );

  const rowDir = { flexDirection: isRTL ? 'row-reverse' : 'row' };
  const textAlign = { textAlign: isRTL ? 'right' : 'left' };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <StatusBar style={darkMode ? 'light' : 'dark'} />

      {/* TOP NAVBAR WITH LANGUAGE & DARK MODE TOGGLES */}
      <View
        style={[
          styles.navbar,
          rowDir,
          { backgroundColor: theme.card, borderBottomColor: theme.border },
        ]}
      >
        <TouchableOpacity
          style={[styles.brandRow, rowDir]}
          onPress={() => setActiveTab('EXPLORE')}
        >
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>U</Text>
          </View>
          <Text style={[styles.brandTitle, { color: theme.text }]}>
            {t.brand}
          </Text>
        </TouchableOpacity>

        <View style={[styles.navRight, rowDir]}>
          <TouchableOpacity
            onPress={() => setLang((prev) => (prev === 'en' ? 'ar' : 'en'))}
            style={[
              styles.toggleBtn,
              {
                backgroundColor: theme.subtleBg,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={[styles.toggleBtnText, { color: theme.text }]}>
              {lang === 'en' ? 'عربي' : 'EN'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setDarkMode((prev) => !prev)}
            style={[
              styles.toggleBtn,
              {
                backgroundColor: theme.subtleBg,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={styles.toggleBtnEmoji}>
              {darkMode ? '☀️' : '🌙'}
            </Text>
          </TouchableOpacity>

          {user ? (
            <View style={[styles.userRow, rowDir]}>
              <View
                style={[
                  styles.rolePill,
                  user.role === 'LANDLORD'
                    ? styles.rolePillLandlord
                    : styles.rolePillStudent,
                ]}
              >
                <Text style={styles.rolePillText}>
                  {user.name.split(' ')[0]}
                </Text>
              </View>
              <TouchableOpacity onPress={handleLogout}>
                <Text style={styles.logoutText}>{t.logOut}</Text>
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
              <Text style={styles.loginBtnText}>{t.signInJoin}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* SCREEN 1: EXPLORE MAP & LISTINGS */}
      {activeTab === 'EXPLORE' && (
        <ScrollView style={styles.flex1}>
          <View style={styles.sectionPad}>
            <View style={[styles.rowBetween, rowDir]}>
              <Text style={[styles.sectionLabel, { color: theme.subText }]}>
                {t.selectCampus}
              </Text>
              <TouchableOpacity onPress={() => setUniModalOpen(true)}>
                <Text style={styles.linkText}>{t.addCampus}</Text>
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
                    style={[
                      styles.uniChip,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.inputBorder,
                      },
                      active && styles.uniChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.uniChipText,
                        { color: theme.bodyText },
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
            <View style={[styles.filterRow, rowDir]}>
              <View style={styles.filterBox}>
                <Text
                  style={[
                    styles.filterLabel,
                    textAlign,
                    { color: theme.subText },
                  ]}
                >
                  {t.maxDist}
                </Text>
                <TextInput
                  value={maxDistanceKm}
                  onChangeText={setMaxDistanceKm}
                  keyboardType="numeric"
                  placeholderTextColor={theme.subText}
                  style={[
                    styles.filterInput,
                    textAlign,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: theme.inputBorder,
                      color: theme.text,
                    },
                  ]}
                  placeholder="15"
                />
              </View>
              <View style={styles.filterBox}>
                <Text
                  style={[
                    styles.filterLabel,
                    textAlign,
                    { color: theme.subText },
                  ]}
                >
                  {t.maxPrice}
                </Text>
                <TextInput
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  keyboardType="numeric"
                  placeholderTextColor={theme.subText}
                  style={[
                    styles.filterInput,
                    textAlign,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: theme.inputBorder,
                      color: theme.text,
                    },
                  ]}
                  placeholder={t.any}
                />
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 8 }}
            >
              {[
                { key: '', label: t.allRoomTypes },
                { key: 'PRIVATE_ROOM', label: t.privateRoom },
                { key: 'ENTIRE_PLACE', label: t.entirePlace },
                { key: 'SHARED_ROOM', label: t.sharedRoom },
              ].map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  onPress={() => setCategoryFilter(cat.key)}
                  style={[
                    styles.catChip,
                    { backgroundColor: theme.subtleBg },
                    categoryFilter === cat.key && styles.catChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      { color: theme.bodyText },
                      categoryFilter === cat.key && styles.catChipTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Interactive OpenStreetMap Campus & Property Map */}
          <View
            style={[styles.mapContainer, { borderColor: theme.border }]}
          >
            <LeafletMap
              mode="explore"
              centerLat={selectedUni?.latitude || 30.0276}
              centerLng={selectedUni?.longitude || 31.2101}
              zoom={14}
              darkMode={darkMode}
              university={selectedUni}
              listings={listings}
              tapToBookText={t.tapToBook}
              perMonthText={t.perMonth}
              onSelectPropertyBook={(propId) => {
                const found = listings.find((item) => item.id === propId);
                if (found) openQuickBookingModal(found);
              }}
            />
          </View>

          {/* Listings List */}
          <View style={styles.sectionPad}>
            <Text
              style={[
                styles.sectionHeading,
                textAlign,
                { color: theme.text },
              ]}
            >
              {loadingListings
                ? t.searchingProps
                : `${listings.length} ${t.propsNear} ${
                    selectedUni?.name || ''
                  }`}
            </Text>

            {listings.map((prop) => {
              const walkTime =
                prop.commute?.walkMins ??
                prop.commute?.walkMinutes ??
                prop.walkMins ??
                10;
              const transitTime =
                prop.commute?.transitMins ??
                prop.commute?.transitMinutes ??
                prop.transitMins ??
                5;

              return (
                <View
                  key={prop.id}
                  style={[
                    styles.card,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                    },
                  ]}
                >
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
                          {prop.distanceToUniKm} {t.kmFromCampus}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <View style={styles.cardBody}>
                    <View style={[styles.rowBetween, rowDir]}>
                      <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={() => openPropertyDetails(prop)}
                      >
                        <Text
                          style={[
                            styles.cardTitle,
                            textAlign,
                            { color: theme.text },
                          ]}
                        >
                          {prop.title}
                        </Text>
                        <Text
                          style={[
                            styles.cardSub,
                            textAlign,
                            { color: theme.subText },
                          ]}
                        >
                          {prop.address}, {prop.city}
                        </Text>
                      </TouchableOpacity>
                      {prop.startingPrice && (
                        <View
                          style={{
                            alignItems: isRTL ? 'flex-start' : 'flex-end',
                          }}
                        >
                          <Text style={styles.priceText}>
                            ${prop.startingPrice}
                          </Text>
                          <Text
                            style={[styles.perMoText, { color: theme.subText }]}
                          >
                            {t.perMonth}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={[styles.commuteRow, rowDir]}>
                      <Text
                        style={[
                          styles.commuteBadge,
                          {
                            backgroundColor: theme.subtleBg,
                            color: theme.bodyText,
                          },
                        ]}
                      >
                        🚶 {walkTime}
                        {t.walk}
                      </Text>
                      <Text
                        style={[
                          styles.commuteBadge,
                          {
                            backgroundColor: theme.subtleBg,
                            color: theme.bodyText,
                          },
                        ]}
                      >
                        🚇 {transitTime}
                        {t.transit}
                      </Text>
                    </View>

                    {prop.amenities?.length > 0 && (
                      <View style={[styles.amenityWrap, rowDir]}>
                        {prop.amenities.slice(0, 4).map((am, i) => (
                          <View key={i} style={styles.amenityTag}>
                            <Text style={styles.amenityTagText}>{am}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    <View
                      style={[
                        styles.cardFooter,
                        rowDir,
                        { borderTopColor: theme.border },
                      ]}
                    >
                      <TouchableOpacity
                        style={[
                          styles.outlineBtn,
                          { borderColor: theme.inputBorder },
                        ]}
                        onPress={() => openPropertyDetails(prop)}
                      >
                        <Text
                          style={[
                            styles.outlineBtnText,
                            { color: theme.bodyText },
                          ]}
                        >
                          {t.viewDetails}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.primaryBtnSmall}
                        onPress={() => openQuickBookingModal(prop)}
                      >
                        <Text style={styles.primaryBtnText}>{t.bookRoom}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* SCREEN 2: DEDICATED PROPERTY DETAILS & LEASE CALCULATOR */}
      {activeTab === 'DETAILS' && selectedProperty && (
        <ScrollView style={styles.flex1}>
          <View style={styles.sectionPad}>
            <TouchableOpacity onPress={() => setActiveTab('EXPLORE')}>
              <Text style={[styles.linkText, textAlign]}>{t.backToMap}</Text>
            </TouchableOpacity>

            <Text
              style={[
                styles.detailTitle,
                textAlign,
                { marginTop: 8, color: theme.text },
              ]}
            >
              {selectedProperty.title}
            </Text>
            <Text style={[styles.cardSub, textAlign, { color: theme.subText }]}>
              {selectedProperty.address}, {selectedProperty.city}
            </Text>

            {loadingDetails && (
              <ActivityIndicator
                size="small"
                color="#2563eb"
                style={{ marginVertical: 8 }}
              />
            )}

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

            <View
              style={[
                styles.panel,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text
                style={[styles.panelTitle, textAlign, { color: theme.text }]}
              >
                {t.aboutResidence}
              </Text>
              <Text
                style={[styles.bodyText, textAlign, { color: theme.bodyText }]}
              >
                {selectedProperty.description}
              </Text>

              {selectedProperty.amenities?.length > 0 && (
                <View style={{ marginTop: 12 }}>
                  <Text
                    style={[
                      styles.sectionLabel,
                      textAlign,
                      { color: theme.subText },
                    ]}
                  >
                    {t.includedAmenities}
                  </Text>
                  <View style={[styles.amenityWrap, rowDir]}>
                    {selectedProperty.amenities.map((item, idx) => (
                      <View key={idx} style={styles.amenityTag}>
                        <Text style={styles.amenityTagText}>✓ {item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            <View
              style={[
                styles.panel,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text
                style={[styles.panelTitle, textAlign, { color: theme.text }]}
              >
                {t.availableRooms} ({detailsRooms.length})
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginVertical: 8 }}
              >
                {Object.keys(categoryLabels).map((catKey) => (
                  <TouchableOpacity
                    key={catKey}
                    onPress={() => setDetailsRoomCategory(catKey)}
                    style={[
                      styles.catChip,
                      { backgroundColor: theme.subtleBg },
                      detailsRoomCategory === catKey && styles.catChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.catChipText,
                        { color: theme.bodyText },
                        detailsRoomCategory === catKey &&
                          styles.catChipTextActive,
                      ]}
                    >
                      {categoryLabels[catKey]}
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
                      rowDir,
                      { borderColor: theme.border },
                      isSelected && styles.roomTierBoxActive,
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.roomTierName,
                          textAlign,
                          { color: isSelected ? '#0f172a' : theme.text },
                        ]}
                      >
                        {room.name}
                      </Text>
                      <Text
                        style={[
                          styles.cardSub,
                          textAlign,
                          { color: theme.subText },
                        ]}
                      >
                        {categoryLabels[room.category] || room.category} •{' '}
                        {room.sizeSqm || 18} m²
                      </Text>
                    </View>
                    <View
                      style={{
                        alignItems: isRTL ? 'flex-start' : 'flex-end',
                      }}
                    >
                      <Text style={styles.priceText}>
                        ${room.pricePerMonth}
                        {t.perMonth}
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
                        <Text style={styles.primaryBtnText}>{t.book}</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View
              style={[
                styles.panel,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text
                style={[styles.panelTitle, textAlign, { color: theme.text }]}
              >
                {t.leaseCalculator}
              </Text>
              <Text
                style={[styles.cardSub, textAlign, { color: theme.subText }]}
              >
                {t.selectedRoom}: {selectedCalcRoom?.name || 'N/A'}
              </Text>

              <Text
                style={[
                  styles.sectionLabel,
                  textAlign,
                  { marginTop: 12, color: theme.subText },
                ]}
              >
                {t.leaseDuration}: {calcMonths} {t.months}
              </Text>
              <View style={[styles.presetRow, rowDir]}>
                {[4, 6, 9, 12].map((m) => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setCalcMonths(m)}
                    style={[
                      styles.presetBtn,
                      { borderColor: theme.inputBorder },
                      calcMonths === m && styles.presetBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.presetBtnText,
                        { color: theme.bodyText },
                        calcMonths === m && styles.presetBtnTextActive,
                      ]}
                    >
                      {m} {t.mos}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View
                style={[styles.calcSummary, { borderTopColor: theme.border }]}
              >
                <View style={[styles.rowBetween, rowDir]}>
                  <Text style={[styles.bodyText, { color: theme.bodyText }]}>
                    {t.monthlyRent}
                  </Text>
                  <Text style={[styles.boldText, { color: theme.text }]}>
                    ${calcMonthlyRent} {t.perMonth}
                  </Text>
                </View>
                <View style={[styles.rowBetween, rowDir]}>
                  <Text style={[styles.bodyText, { color: theme.bodyText }]}>
                    {t.leaseSubtotal} ({calcMonths} {t.mos})
                  </Text>
                  <Text style={[styles.boldText, { color: theme.text }]}>
                    ${calcSubtotal.toLocaleString()}
                  </Text>
                </View>
                <View style={[styles.rowBetween, rowDir]}>
                  <Text style={[styles.bodyText, { color: theme.bodyText }]}>
                    {t.securityDeposit}
                  </Text>
                  <Text style={[styles.boldText, { color: theme.text }]}>
                    ${calcDeposit.toLocaleString()}
                  </Text>
                </View>
                <View
                  style={[
                    styles.rowBetween,
                    styles.calcTotalRow,
                    rowDir,
                    { borderTopColor: theme.border },
                  ]}
                >
                  <Text style={[styles.panelTitle, { color: theme.text }]}>
                    {t.totalLease}
                  </Text>
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
                  {t.bookThisRoom} ({calcMonths} {t.mos})
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.panel,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text
                style={[styles.panelTitle, textAlign, { color: theme.text }]}
              >
                {t.neighborhoodMap}
              </Text>
              <View
                style={[
                  styles.mapContainer,
                  { height: 220, marginTop: 8, borderColor: theme.border },
                ]}
              >
                <LeafletMap
                  mode="details"
                  centerLat={selectedProperty.latitude}
                  centerLng={selectedProperty.longitude}
                  zoom={15}
                  darkMode={darkMode}
                  property={selectedProperty}
                  university={selectedProperty.primaryUniversity || selectedUni}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {/* SCREEN 3: STUDENT BOOKINGS DASHBOARD */}
      {activeTab === 'STUDENT' && (
        <ScrollView style={styles.flex1}>
          <View style={styles.sectionPad}>
            <View style={[styles.rowBetween, rowDir]}>
              <Text style={[styles.detailTitle, { color: theme.text }]}>
                {t.myBookings}
              </Text>
              <TouchableOpacity onPress={() => loadStudentBookings()}>
                <Text style={styles.linkText}>{t.refresh}</Text>
              </TouchableOpacity>
            </View>

            {studentBookings.length === 0 ? (
              <View
                style={[
                  styles.panel,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <Text
                  style={[styles.bodyText, textAlign, { color: theme.bodyText }]}
                >
                  {t.noStudentBookings}
                </Text>
              </View>
            ) : (
              studentBookings.map((b) => (
                <View
                  key={b.id}
                  style={[
                    styles.panel,
                    { backgroundColor: theme.card, borderColor: theme.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.roomTierName,
                      textAlign,
                      { color: theme.text },
                    ]}
                  >
                    {b.roomType?.property?.title || 'Student Property'}
                  </Text>
                  <Text
                    style={[
                      styles.bodyText,
                      textAlign,
                      { color: theme.bodyText },
                    ]}
                  >
                    {b.roomType?.name} • ${b.roomType?.pricePerMonth}
                    {t.perMonth}
                  </Text>
                  <Text
                    style={[styles.cardSub, textAlign, { color: theme.subText }]}
                  >
                    {t.moveIn}: {new Date(b.moveInDate).toLocaleDateString()} •{' '}
                    {b.durationMonths} {t.mos}
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
            <View
              style={[
                styles.panel,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <View style={[styles.rowBetween, rowDir]}>
                <Text style={[styles.panelTitle, { color: theme.text }]}>
                  {editingPropertyId ? t.editProperty : t.publishProperty}
                </Text>
                {editingPropertyId && (
                  <TouchableOpacity onPress={resetLandlordForm}>
                    <Text style={styles.logoutText}>{t.cancelEdit}</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text
                style={[styles.inputLabel, textAlign, { color: theme.subText }]}
              >
                {t.propTitle}
              </Text>
              <TextInput
                value={propTitle}
                onChangeText={setPropTitle}
                placeholder="e.g., Bloomsbury Student Studios"
                placeholderTextColor={theme.subText}
                style={[
                  styles.textInput,
                  textAlign,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.text,
                  },
                ]}
              />

              <View style={[styles.filterRow, rowDir]}>
                <View style={{ flex: 2 }}>
                  <Text
                    style={[
                      styles.inputLabel,
                      textAlign,
                      { color: theme.subText },
                    ]}
                  >
                    {t.streetAddress}
                  </Text>
                  <TextInput
                    value={propAddress}
                    onChangeText={setPropAddress}
                    placeholder="42 Gower Street"
                    placeholderTextColor={theme.subText}
                    style={[
                      styles.textInput,
                      textAlign,
                      {
                        backgroundColor: theme.inputBg,
                        borderColor: theme.inputBorder,
                        color: theme.text,
                      },
                    ]}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.inputLabel,
                      textAlign,
                      { color: theme.subText },
                    ]}
                  >
                    {t.city}
                  </Text>
                  <TextInput
                    value={propCity}
                    onChangeText={setPropCity}
                    placeholder="London"
                    placeholderTextColor={theme.subText}
                    style={[
                      styles.textInput,
                      textAlign,
                      {
                        backgroundColor: theme.inputBg,
                        borderColor: theme.inputBorder,
                        color: theme.text,
                      },
                    ]}
                  />
                </View>
              </View>

              <Text
                style={[styles.inputLabel, textAlign, { color: theme.subText }]}
              >
                {t.description}
              </Text>
              <TextInput
                value={propDesc}
                onChangeText={setPropDesc}
                placeholder="Describe study spaces, security, transport..."
                placeholderTextColor={theme.subText}
                style={[
                  styles.textInput,
                  textAlign,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.text,
                  },
                ]}
                multiline
              />

              <Text
                style={[
                  styles.sectionLabel,
                  textAlign,
                  { marginTop: 14, color: theme.subText },
                ]}
              >
                {t.searchStreetLabel}
              </Text>
              <TextInput
                value={streetQuery}
                onChangeText={setStreetQuery}
                placeholder={t.searchStreetPlaceholder}
                placeholderTextColor={theme.subText}
                style={[
                  styles.textInput,
                  textAlign,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.text,
                  },
                ]}
              />
              {searchingStreet && (
                <Text style={[styles.cardSub, { color: theme.subText }]}>
                  {t.searchingStreets}
                </Text>
              )}
              {streetResults.map((place) => (
                <TouchableOpacity
                  key={place.place_id}
                  onPress={() => handleSelectStreet(place)}
                  style={[
                    styles.streetOption,
                    {
                      backgroundColor: theme.inputBg,
                      borderBottomColor: theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[styles.boldText, textAlign, { color: theme.text }]}
                    numberOfLines={1}
                  >
                    📍 {place.display_name.split(',')[0]}
                  </Text>
                  <Text
                    style={[
                      styles.cardSub,
                      textAlign,
                      { color: theme.subText },
                    ]}
                    numberOfLines={1}
                  >
                    {place.display_name}
                  </Text>
                </TouchableOpacity>
              ))}

              <View
                style={[
                  styles.mapContainer,
                  { height: 220, marginTop: 8, borderColor: theme.border },
                ]}
              >
                <LeafletMap
                  mode="picker"
                  centerLat={propLat}
                  centerLng={propLng}
                  pickerLat={propLat}
                  pickerLng={propLng}
                  zoom={16}
                  darkMode={darkMode}
                  onLocationPick={(lat, lng) => {
                    setPropLat(lat);
                    setPropLng(lng);
                  }}
                />
              </View>
              <Text style={[styles.coordHint, { color: theme.subText }]}>
                {t.tapMapHint} ({propLat.toFixed(4)}, {propLng.toFixed(4)})
              </Text>

              <Text
                style={[
                  styles.sectionLabel,
                  textAlign,
                  { marginTop: 14, color: theme.subText },
                ]}
              >
                {t.amenitiesLabel} ({selectedAmenities.length} {t.selected})
              </Text>
              <View style={[styles.amenityWrap, rowDir]}>
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
                        {
                          backgroundColor: theme.inputBg,
                          borderColor: theme.inputBorder,
                        },
                        checked && styles.checkboxPillActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.checkboxPillText,
                          { color: theme.bodyText },
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

              <View style={[styles.filterRow, rowDir, { marginTop: 8 }]}>
                <TextInput
                  value={customAmenity}
                  onChangeText={setCustomAmenity}
                  placeholder={t.addCustomFacility}
                  placeholderTextColor={theme.subText}
                  style={[
                    styles.textInput,
                    textAlign,
                    {
                      flex: 1,
                      marginTop: 0,
                      backgroundColor: theme.inputBg,
                      borderColor: theme.inputBorder,
                      color: theme.text,
                    },
                  ]}
                />
                <TouchableOpacity
                  style={[
                    styles.outlineBtn,
                    { borderColor: theme.inputBorder },
                  ]}
                  onPress={() => {
                    const trimmed = customAmenity.trim();
                    if (trimmed && !selectedAmenities.includes(trimmed)) {
                      setSelectedAmenities((prev) => [...prev, trimmed]);
                    }
                    setCustomAmenity('');
                  }}
                >
                  <Text
                    style={[styles.outlineBtnText, { color: theme.bodyText }]}
                  >
                    {t.add}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text
                style={[
                  styles.sectionLabel,
                  textAlign,
                  { marginTop: 14, color: theme.subText },
                ]}
              >
                {t.propertyPhotos} ({propImages.length})
              </Text>
              <TouchableOpacity
                style={[
                  styles.outlineBtn,
                  { marginBottom: 8, borderColor: theme.inputBorder },
                ]}
                onPress={handlePickImageFromDevice}
              >
                <Text
                  style={[styles.outlineBtnText, { color: theme.bodyText }]}
                >
                  {t.pickFromGallery}
                </Text>
              </TouchableOpacity>

              <View style={[styles.filterRow, rowDir]}>
                <TextInput
                  value={imageUrlInput}
                  onChangeText={setImageUrlInput}
                  placeholder={t.pasteImageUrl}
                  placeholderTextColor={theme.subText}
                  style={[
                    styles.textInput,
                    textAlign,
                    {
                      flex: 1,
                      marginTop: 0,
                      backgroundColor: theme.inputBg,
                      borderColor: theme.inputBorder,
                      color: theme.text,
                    },
                  ]}
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
                  <Text style={styles.primaryBtnText}>{t.addUrl}</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 10 }}
              >
                {propImages.map((uri, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.photoPreviewBox,
                      {
                        backgroundColor: theme.inputBg,
                        borderColor: theme.inputBorder,
                      },
                    ]}
                  >
                    <Image source={{ uri }} style={styles.photoPreviewImg} />
                    <View style={[styles.photoPreviewActions, rowDir]}>
                      {idx === 0 ? (
                        <Text style={styles.coverLabel}>{t.cover}</Text>
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
                          <Text style={styles.linkText}>{t.setCover}</Text>
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

              <Text
                style={[
                  styles.sectionLabel,
                  textAlign,
                  { marginTop: 14, color: theme.subText },
                ]}
              >
                {t.primaryRoomDetails}
              </Text>
              <TextInput
                value={roomName}
                onChangeText={setRoomName}
                placeholder={t.roomTierName}
                placeholderTextColor={theme.subText}
                style={[
                  styles.textInput,
                  textAlign,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.text,
                  },
                ]}
              />

              <View style={[styles.presetRow, rowDir]}>
                {['PRIVATE_ROOM', 'ENTIRE_PLACE', 'SHARED_ROOM'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setRoomCategory(cat)}
                    style={[
                      styles.presetBtn,
                      { borderColor: theme.inputBorder },
                      roomCategory === cat && styles.presetBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.presetBtnText,
                        { color: theme.bodyText },
                        roomCategory === cat && styles.presetBtnTextActive,
                      ]}
                    >
                      {categoryLabels[cat]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={[styles.filterRow, rowDir]}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.inputLabel,
                      textAlign,
                      { color: theme.subText },
                    ]}
                  >
                    {t.pricePerMo}
                  </Text>
                  <TextInput
                    value={pricePerMonth}
                    onChangeText={setPricePerMonth}
                    keyboardType="numeric"
                    style={[
                      styles.textInput,
                      textAlign,
                      {
                        backgroundColor: theme.inputBg,
                        borderColor: theme.inputBorder,
                        color: theme.text,
                      },
                    ]}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.inputLabel,
                      textAlign,
                      { color: theme.subText },
                    ]}
                  >
                    {t.sizeSqm}
                  </Text>
                  <TextInput
                    value={sizeSqm}
                    onChangeText={setSizeSqm}
                    keyboardType="numeric"
                    style={[
                      styles.textInput,
                      textAlign,
                      {
                        backgroundColor: theme.inputBg,
                        borderColor: theme.inputBorder,
                        color: theme.text,
                      },
                    ]}
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
                    ? t.saving
                    : editingPropertyId
                    ? t.saveChanges
                    : t.publishListing}
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.panel,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text
                style={[styles.panelTitle, textAlign, { color: theme.text }]}
              >
                {t.myListedProps} ({myProperties.length})
              </Text>
              {myProperties.length === 0 ? (
                <Text
                  style={[styles.cardSub, textAlign, { color: theme.subText }]}
                >
                  {t.noListedProps}
                </Text>
              ) : (
                myProperties.map((prop) => (
                  <View
                    key={prop.id}
                    style={[
                      styles.roomTierBox,
                      rowDir,
                      { borderColor: theme.border },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.roomTierName,
                          textAlign,
                          { color: theme.text },
                        ]}
                      >
                        {prop.title}
                      </Text>
                      <Text
                        style={[
                          styles.cardSub,
                          textAlign,
                          { color: theme.subText },
                        ]}
                      >
                        {prop.address}, {prop.city} •{' '}
                        {prop.amenities?.length || 0} {t.amenitiesCount}
                      </Text>
                    </View>
                    <View style={[rowDir, { gap: 8 }]}>
                      <TouchableOpacity
                        style={[
                          styles.outlineBtn,
                          { borderColor: theme.inputBorder },
                        ]}
                        onPress={() => handleStartEditProperty(prop)}
                      >
                        <Text
                          style={[
                            styles.outlineBtnText,
                            { color: theme.bodyText },
                          ]}
                        >
                          {t.edit}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.outlineBtn, { borderColor: '#ef4444' }]}
                        onPress={() => handleDeleteProperty(prop)}
                      >
                        <Text
                          style={{
                            color: '#dc2626',
                            fontSize: 12,
                            fontWeight: '700',
                          }}
                        >
                          {t.delete}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>

            <View
              style={[
                styles.panel,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text
                style={[styles.panelTitle, textAlign, { color: theme.text }]}
              >
                {t.incomingBookings} ({landlordBookings.length})
              </Text>
              {landlordBookings.map((b) => (
                <View
                  key={b.id}
                  style={[
                    styles.roomTierBox,
                    rowDir,
                    { borderColor: theme.border },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.roomTierName,
                        textAlign,
                        { color: theme.text },
                      ]}
                    >
                      {b.roomType?.property?.title} — {b.roomType?.name}
                    </Text>
                    <Text
                      style={[
                        styles.bodyText,
                        textAlign,
                        { color: theme.bodyText },
                      ]}
                    >
                      {t.student}: {b.student?.name} ({b.student?.email})
                    </Text>
                    <Text
                      style={[
                        styles.cardSub,
                        textAlign,
                        { color: theme.subText },
                      ]}
                    >
                      {t.status}: {b.status} • {b.durationMonths} {t.mos}
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
                        <Text style={styles.primaryBtnText}>{t.approve}</Text>
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
                        <Text style={styles.primaryBtnText}>{t.reject}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      {/* SCREEN 5: LOGIN & REGISTER */}
      {activeTab === 'AUTH' && (
        <ScrollView style={styles.flex1}>
          <View style={styles.sectionPad}>
            <View
              style={[
                styles.panel,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text
                style={[styles.detailTitle, textAlign, { color: theme.text }]}
              >
                {authMode === 'LOGIN' ? t.welcomeBack : t.createAccount}
              </Text>

              {authMode === 'REGISTER' && (
                <View style={[styles.presetRow, rowDir, { marginVertical: 12 }]}>
                  <TouchableOpacity
                    style={[
                      styles.presetBtn,
                      { borderColor: theme.inputBorder },
                      authRole === 'STUDENT' && styles.presetBtnActive,
                    ]}
                    onPress={() => setAuthRole('STUDENT')}
                  >
                    <Text
                      style={[
                        styles.presetBtnText,
                        { color: theme.bodyText },
                        authRole === 'STUDENT' && styles.presetBtnTextActive,
                      ]}
                    >
                      {t.iAmStudent}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.presetBtn,
                      { borderColor: theme.inputBorder },
                      authRole === 'LANDLORD' && styles.presetBtnActive,
                    ]}
                    onPress={() => setAuthRole('LANDLORD')}
                  >
                    <Text
                      style={[
                        styles.presetBtnText,
                        { color: theme.bodyText },
                        authRole === 'LANDLORD' && styles.presetBtnTextActive,
                      ]}
                    >
                      {t.iAmLandlord}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {authError ? (
                <Text style={styles.errorText}>{authError}</Text>
              ) : null}

              {authMode === 'REGISTER' && (
                <>
                  <Text
                    style={[
                      styles.inputLabel,
                      textAlign,
                      { color: theme.subText },
                    ]}
                  >
                    {t.fullName}
                  </Text>
                  <TextInput
                    value={authName}
                    onChangeText={setAuthName}
                    placeholder="Samir Mohamed"
                    placeholderTextColor={theme.subText}
                    style={[
                      styles.textInput,
                      textAlign,
                      {
                        backgroundColor: theme.inputBg,
                        borderColor: theme.inputBorder,
                        color: theme.text,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.inputLabel,
                      textAlign,
                      { color: theme.subText },
                    ]}
                  >
                    {t.phone}
                  </Text>
                  <TextInput
                    value={authPhone}
                    onChangeText={setAuthPhone}
                    placeholder="+20 100 000 0000"
                    placeholderTextColor={theme.subText}
                    style={[
                      styles.textInput,
                      textAlign,
                      {
                        backgroundColor: theme.inputBg,
                        borderColor: theme.inputBorder,
                        color: theme.text,
                      },
                    ]}
                  />
                </>
              )}

              <Text
                style={[styles.inputLabel, textAlign, { color: theme.subText }]}
              >
                {t.email}
              </Text>
              <TextInput
                value={authEmail}
                onChangeText={setAuthEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="you@university.edu"
                placeholderTextColor={theme.subText}
                style={[
                  styles.textInput,
                  textAlign,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.text,
                  },
                ]}
              />

              <Text
                style={[styles.inputLabel, textAlign, { color: theme.subText }]}
              >
                {t.password}
              </Text>
              <TextInput
                value={authPassword}
                onChangeText={setAuthPassword}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor={theme.subText}
                style={[
                  styles.textInput,
                  textAlign,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.text,
                  },
                ]}
              />

              <TouchableOpacity
                style={[styles.primaryBtn, { marginTop: 16 }]}
                onPress={handleAuthSubmit}
                disabled={authLoading}
              >
                <Text style={styles.primaryBtnText}>
                  {authLoading
                    ? t.pleaseWait
                    : authMode === 'LOGIN'
                    ? t.signIn
                    : `${t.signUpAs} ${authRole}`}
                </Text>
              </TouchableOpacity>

              {authMode === 'LOGIN' && (
                <View style={[styles.presetRow, rowDir, { marginTop: 14 }]}>
                  <TouchableOpacity
                    style={[
                      styles.outlineBtn,
                      { flex: 1, borderColor: theme.inputBorder },
                    ]}
                    onPress={() => {
                      setAuthEmail('student@unihousing.com');
                      setAuthPassword('password123');
                    }}
                  >
                    <Text
                      style={[
                        styles.outlineBtnText,
                        { color: theme.bodyText },
                      ]}
                    >
                      {t.fillStudentDemo}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.outlineBtn,
                      { flex: 1, borderColor: theme.inputBorder },
                    ]}
                    onPress={() => {
                      setAuthEmail('landlord@unihousing.com');
                      setAuthPassword('password123');
                    }}
                  >
                    <Text
                      style={[
                        styles.outlineBtnText,
                        { color: theme.bodyText },
                      ]}
                    >
                      {t.fillLandlordDemo}
                    </Text>
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
                    ? t.noAccountPrompt
                    : t.hasAccountPrompt}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}

      {/* BOTTOM NAVIGATION BAR */}
      <View
        style={[
          styles.bottomTabs,
          rowDir,
          { backgroundColor: theme.card, borderTopColor: theme.border },
        ]}
      >
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('EXPLORE')}
        >
          <Text
            style={[
              styles.tabText,
              { color: theme.subText },
              activeTab === 'EXPLORE' && styles.tabTextActive,
            ]}
          >
            {t.tabExplore}
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
                { color: theme.subText },
                activeTab === 'STUDENT' && styles.tabTextActive,
              ]}
            >
              {t.tabBookings}
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
                { color: theme.subText },
                activeTab === 'LANDLORD' && styles.tabTextActive,
              ]}
            >
              {t.tabLandlord}
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
                { color: theme.subText },
                activeTab === 'AUTH' && styles.tabTextActive,
              ]}
            >
              {t.tabAccount}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* MODAL 1: BOOK ROOM REQUEST */}
      <Modal visible={bookingModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Text
              style={[styles.panelTitle, textAlign, { color: theme.text }]}
            >
              {t.book} {bookingProperty?.title}
            </Text>

            <Text
              style={[styles.inputLabel, textAlign, { color: theme.subText }]}
            >
              {t.fullName}
            </Text>
            <TextInput
              value={studentName}
              onChangeText={setStudentName}
              style={[
                styles.textInput,
                textAlign,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder,
                  color: theme.text,
                },
              ]}
            />

            <Text
              style={[styles.inputLabel, textAlign, { color: theme.subText }]}
            >
              {t.email}
            </Text>
            <TextInput
              value={studentEmail}
              onChangeText={setStudentEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[
                styles.textInput,
                textAlign,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder,
                  color: theme.text,
                },
              ]}
            />

            <View style={[styles.filterRow, rowDir]}>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.inputLabel,
                    textAlign,
                    { color: theme.subText },
                  ]}
                >
                  {t.moveIn}
                </Text>
                <TextInput
                  value={moveInDate}
                  onChangeText={setMoveInDate}
                  style={[
                    styles.textInput,
                    textAlign,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: theme.inputBorder,
                      color: theme.text,
                    },
                  ]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.inputLabel,
                    textAlign,
                    { color: theme.subText },
                  ]}
                >
                  {t.months}
                </Text>
                <TextInput
                  value={durationMonths}
                  onChangeText={setDurationMonths}
                  keyboardType="numeric"
                  style={[
                    styles.textInput,
                    textAlign,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: theme.inputBorder,
                      color: theme.text,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={[styles.filterRow, rowDir, { marginTop: 16 }]}>
              <TouchableOpacity
                style={[
                  styles.outlineBtn,
                  { flex: 1, borderColor: theme.inputBorder },
                ]}
                onPress={() => setBookingModalOpen(false)}
              >
                <Text
                  style={[styles.outlineBtnText, { color: theme.bodyText }]}
                >
                  {t.cancel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, { flex: 1 }]}
                onPress={handleBookingSubmit}
                disabled={bookingSubmitting}
              >
                <Text style={styles.primaryBtnText}>
                  {bookingSubmitting ? t.sending : t.confirmBooking}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: ADD NEW UNIVERSITY CAMPUS */}
      <Modal visible={uniModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Text
              style={[styles.panelTitle, textAlign, { color: theme.text }]}
            >
              {t.addUniTitle}
            </Text>
            <TextInput
              value={uniSearchQuery}
              onChangeText={setUniSearchQuery}
              placeholder={t.autoFillUni}
              placeholderTextColor={theme.subText}
              style={[
                styles.textInput,
                textAlign,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder,
                  color: theme.text,
                },
              ]}
            />
            {uniSearchResults.map((place) => (
              <TouchableOpacity
                key={place.place_id}
                style={[
                  styles.streetOption,
                  {
                    backgroundColor: theme.inputBg,
                    borderBottomColor: theme.border,
                  },
                ]}
                onPress={() => {
                  const addr = place.address || {};
                  setNewUniName(place.name || place.display_name.split(',')[0]);
                  setNewUniCity(
                    addr.city || addr.town || addr.state || 'Cairo'
                  );
                  setNewUniCountry(addr.country || 'Egypt');
                  setNewUniLat(
                    String(Number(parseFloat(place.lat).toFixed(6)))
                  );
                  setNewUniLng(
                    String(Number(parseFloat(place.lon).toFixed(6)))
                  );
                  setUniSearchResults([]);
                  setUniSearchQuery('');
                }}
              >
                <Text
                  style={[styles.boldText, textAlign, { color: theme.text }]}
                  numberOfLines={1}
                >
                  {place.display_name}
                </Text>
              </TouchableOpacity>
            ))}

            <Text
              style={[styles.inputLabel, textAlign, { color: theme.subText }]}
            >
              {t.uniName}
            </Text>
            <TextInput
              value={newUniName}
              onChangeText={setNewUniName}
              style={[
                styles.textInput,
                textAlign,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder,
                  color: theme.text,
                },
              ]}
            />
            <View style={[styles.filterRow, rowDir]}>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.inputLabel,
                    textAlign,
                    { color: theme.subText },
                  ]}
                >
                  {t.city}
                </Text>
                <TextInput
                  value={newUniCity}
                  onChangeText={setNewUniCity}
                  style={[
                    styles.textInput,
                    textAlign,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: theme.inputBorder,
                      color: theme.text,
                    },
                  ]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.inputLabel,
                    textAlign,
                    { color: theme.subText },
                  ]}
                >
                  {t.country}
                </Text>
                <TextInput
                  value={newUniCountry}
                  onChangeText={setNewUniCountry}
                  style={[
                    styles.textInput,
                    textAlign,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: theme.inputBorder,
                      color: theme.text,
                    },
                  ]}
                />
              </View>
            </View>
            <View style={[styles.filterRow, rowDir]}>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.inputLabel,
                    textAlign,
                    { color: theme.subText },
                  ]}
                >
                  {t.latitude}
                </Text>
                <TextInput
                  value={newUniLat}
                  onChangeText={setNewUniLat}
                  keyboardType="numeric"
                  style={[
                    styles.textInput,
                    textAlign,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: theme.inputBorder,
                      color: theme.text,
                    },
                  ]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.inputLabel,
                    textAlign,
                    { color: theme.subText },
                  ]}
                >
                  {t.longitude}
                </Text>
                <TextInput
                  value={newUniLng}
                  onChangeText={setNewUniLng}
                  keyboardType="numeric"
                  style={[
                    styles.textInput,
                    textAlign,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: theme.inputBorder,
                      color: theme.text,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={[styles.filterRow, rowDir, { marginTop: 16 }]}>
              <TouchableOpacity
                style={[
                  styles.outlineBtn,
                  { flex: 1, borderColor: theme.inputBorder },
                ]}
                onPress={() => setUniModalOpen(false)}
              >
                <Text
                  style={[styles.outlineBtnText, { color: theme.bodyText }]}
                >
                  {t.cancel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, { flex: 1 }]}
                onPress={handleCreateUniversity}
              >
                <Text style={styles.primaryBtnText}>{t.saveUni}</Text>
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
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  flex1: { flex: 1 },
  navbar: {
    height: 56,
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: { alignItems: 'center', gap: 6 },
  brandBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadgeText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  brandTitle: { fontSize: 16, fontWeight: '800' },
  navRight: { alignItems: 'center', gap: 6 },
  toggleBtn: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnText: { fontSize: 11, fontWeight: '800' },
  toggleBtnEmoji: { fontSize: 13 },
  userRow: { alignItems: 'center', gap: 6 },
  rolePill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  rolePillStudent: { backgroundColor: '#dbeafe' },
  rolePillLandlord: { backgroundColor: '#fef3c7' },
  rolePillText: { fontSize: 11, fontWeight: '700', color: '#1e293b' },
  logoutText: { fontSize: 11, fontWeight: '700', color: '#dc2626' },
  loginBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  loginBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  sectionPad: { padding: 14 },
  rowBetween: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  linkText: { fontSize: 12, fontWeight: '700', color: '#2563eb' },
  uniScroll: { marginTop: 8, marginBottom: 8 },
  uniChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
  uniChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  uniChipText: { fontSize: 12, fontWeight: '600' },
  uniChipTextActive: { color: '#ffffff' },
  filterRow: { gap: 10, marginTop: 6 },
  filterBox: { flex: 1 },
  filterLabel: { fontSize: 11, fontWeight: '600' },
  filterInput: {
    borderWidth: 1,
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
    marginRight: 6,
  },
  catChipActive: { backgroundColor: '#2563eb' },
  catChipText: { fontSize: 11, fontWeight: '600' },
  catChipTextActive: { color: '#ffffff' },
  mapContainer: {
    height: 250,
    width: '100%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    overflow: 'hidden',
  },
  map: { width: '100%', height: '100%' },
  card: {
    borderRadius: 16,
    borderWidth: 1,
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
  cardTitle: { fontSize: 16, fontWeight: '800' },
  cardSub: { fontSize: 12, marginTop: 2 },
  priceText: { fontSize: 18, fontWeight: '800', color: '#2563eb' },
  perMoText: { fontSize: 11 },
  commuteRow: { gap: 8, marginTop: 8 },
  commuteBadge: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontWeight: '600',
  },
  amenityWrap: {
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  outlineBtn: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: { fontSize: 12, fontWeight: '700' },
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
  detailTitle: { fontSize: 21, fontWeight: '800' },
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
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginTop: 14,
  },
  panelTitle: { fontSize: 15, fontWeight: '800' },
  bodyText: { fontSize: 13, marginTop: 4, lineHeight: 19 },
  boldText: { fontSize: 13, fontWeight: '700' },
  roomTierBox: {
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  roomTierBoxActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  roomTierName: { fontSize: 14, fontWeight: '700' },
  presetRow: { gap: 8, marginTop: 8 },
  presetBtn: {
    flex: 1,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  presetBtnActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },
  presetBtnText: { fontSize: 12, fontWeight: '700' },
  presetBtnTextActive: { color: '#1d4ed8' },
  calcSummary: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 6,
  },
  calcTotalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
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
    marginTop: 10,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    marginTop: 4,
  },
  streetOption: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
  },
  coordHint: {
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
  checkboxPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  checkboxPillActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },
  checkboxPillText: { fontSize: 11, fontWeight: '600' },
  checkboxPillTextActive: { color: '#1e40af', fontWeight: '700' },
  photoPreviewBox: {
    width: 110,
    marginRight: 10,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  photoPreviewImg: { width: '100%', height: 70 },
  photoPreviewActions: {
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
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: { paddingVertical: 8, paddingHorizontal: 16 },
  tabText: { fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: '#2563eb', fontWeight: '800' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
});