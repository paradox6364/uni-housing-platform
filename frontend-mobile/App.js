import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DEFAULT_HOST =
  Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || `${DEFAULT_HOST}/api`;

const DEFAULT_COVER_IMAGE =
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80';

const FALLBACK_GALLERY = [
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
];

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

const AMENITY_AR_MAP = {
  'High-Speed Wi-Fi': 'واي فاي فائق السرعة',
  'All Bills Included': 'شامل جميع الفواتير',
  '24/7 Security & CCTV': 'أمن وحراسة وكاميرات 24/7',
  'Air Conditioning': 'تكييف هواء',
  'Study Lounge': 'قاعة دراسة هادئة',
  'On-Site Laundry': 'غسيل ملابس في الموقع',
  'Gym & Fitness Center': 'صالة رياضية ولياقة',
  'Fully Furnished': 'مفروش بالكامل',
  'Shared Kitchen': 'مطبخ مشترك',
  'Bike Storage': 'مخزن دراجات',
  'Elevator Access': 'مصعد كهربائي',
  'Cleaning Service': 'خدمة تنظيف دورية',
};

const HERO_SLIDES = {
  ar: [
    {
      id: 1,
      badge: 'المنصة الأولى للسكن الطلابي الموثق',
      title: 'اسكن على بُعد خطوات من',
      highlight: 'حرم جامعتك',
      description:
        'اكتشف وقارن بين مئات الغرف والاستوديوهات الطلابية الموثقة 100%. شاهد المسافة الفعلية بالدقائق على الخريطة التفاعلية واحجز بأمان تام.',
      image:
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=2000&q=85',
      cta: 'ابدأ استكشاف السكن الآن',
      card: {
        title: 'استوديوهات بلومزبري الطلابية',
        location: '4 دقائق مشياً إلى الحرم الجامعي',
        price: '£240',
        period: '/ شهرياً',
        rating: '4.9',
        tag: 'موثق وفوري',
        perks: ['شامل جميع الفواتير', 'إنترنت فايبر فائق السرعة', 'أمن وحراسة 24/7'],
      },
    },
    {
      id: 2,
      badge: 'بيئة مصممة للتفوق والراحة',
      title: 'غرف عصرية مجهزة بالكامل',
      highlight: 'لنجاحك الدراسي',
      description:
        'لا تشغل بالك بالتجهيزات أو الفواتير؛ جميع الوحدات تأتي مفروشة بالكامل مع مكاتب دراسية مريحة، صالات مذاكرة هادئة، وخدمات صيانة دورية.',
      image:
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=2000&q=85',
      cta: 'تصفح الغرف والاستوديوهات',
      card: {
        title: 'أجنحة كامبوس فيو الحديثة',
        location: '6 دقائق بالمواصلات للجامعة',
        price: '£195',
        period: '/ شهرياً',
        rating: '4.8',
        tag: 'الأكثر طلباً',
        perks: ['مفروش بالكامل', 'قاعة دراسة مشتركة', 'صالة رياضية مجانية'],
      },
    },
    {
      id: 3,
      badge: 'حجز إلكتروني مباشر بدون عمولة',
      title: 'حدد جامعتك على الخريطة',
      highlight: 'واحجز بضغطة زر',
      description:
        'تواصل مباشرة مع ملاك العقارات المعتمدين، قارن الأسعار الحقيقية، وأرسل طلب حجزك في ثوانٍ بدون أي رسوم خفية أو سماسرة.',
      image:
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=2000&q=85',
      cta: 'انتقل إلى الخريطة التفاعلية',
      card: {
        title: 'ريزيدنس الطلاب الملكي',
        location: '3 دقائق مشياً للبوابة الرئيسية',
        price: '£310',
        period: '/ شهرياً',
        rating: '5.0',
        tag: 'عمولة 0%',
        perks: ['عقود موثقة رسمياً', 'تأكيد حجز سريع', 'دعم طلابي متواصل'],
      },
    },
  ],
  en: [
    {
      id: 1,
      badge: '#1 Verified Student Housing Marketplace',
      title: 'Live Just Steps Away From',
      highlight: 'Your University',
      description:
        'Discover and compare hundreds of 100% verified student rooms and studios. Check exact walking minutes on the interactive map and book securely.',
      image:
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=2000&q=85',
      cta: 'Explore Student Housing',
      card: {
        title: 'Bloomsbury Student Studios',
        location: '4 mins walk to Main Campus',
        price: '£240',
        period: '/ month',
        rating: '4.9',
        tag: 'Verified & Instant',
        perks: ['All Utility Bills Included', 'High-Speed Fiber Wi-Fi', '24/7 CCTV & Security'],
      },
    },
    {
      id: 2,
      badge: 'Designed for Study & Comfort',
      title: 'Modern Fully Furnished Rooms',
      highlight: 'Built For Success',
      description:
        'Skip the hassle of furniture and utility setup. Every listing comes move-in ready with ergonomic study desks, quiet lounges, and fast Wi-Fi.',
      image:
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=2000&q=85',
      cta: 'Browse Rooms & Studios',
      card: {
        title: 'Campus View Modern Suites',
        location: '6 mins transit to University',
        price: '£195',
        period: '/ month',
        rating: '4.8',
        tag: 'Most Popular',
        perks: ['Fully Furnished', 'Dedicated Study Lounge', 'On-Site Gym & Laundry'],
      },
    },
    {
      id: 3,
      badge: 'Direct Booking • Zero Hidden Fees',
      title: 'Pinpoint Your Campus on the Map',
      highlight: '& Book in One Click',
      description:
        'Connect directly with verified landlords, inspect real street locations, and submit your booking request in seconds with 0% commission.',
      image:
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=2000&q=85',
      cta: 'Jump to Interactive Map',
      card: {
        title: 'Royal Courtyards Residence',
        location: '3 mins walk to Main Gate',
        price: '£310',
        period: '/ month',
        rating: '5.0',
        tag: '0% Booking Fee',
        perks: ['Official Verified Lease', 'Fast Landlord Approval', '24/7 Student Support'],
      },
    },
  ],
};

const translations = {
  ar: {
    'nav.home': 'الرئيسية',
    'nav.explore': 'استكشف السكن',
    'nav.myBookings': 'حجوزاتي',
    'nav.landlordDashboard': 'لوحة المالك',
    'nav.login': 'تسجيل الدخول',
    'nav.signup': 'إنشاء حساب',
    'nav.logout': 'تسجيل الخروج',
    'nav.menu': 'القائمة',
    'role.LANDLORD': 'مالك',
    'role.STUDENT': 'طالب',
    'role.ADMIN': 'مدير',
    'toggle.language': 'English',

    'filter.university': 'الجامعة',
    'filter.roomType': 'نوع الغرفة',
    'filter.allRoomTypes': 'كل الأنواع',
    'room.PRIVATE_ROOM': 'غرفة خاصة',
    'room.EN_SUITE': 'غرفة بحمام خاص (En-Suite)',
    'room.SHARED_ROOM': 'غرفة مشتركة',
    'room.ENTIRE_PLACE': 'سكن كامل',
    'filter.maxBudget': 'أقصى إيجار شهريًا',
    'filter.anyPrice': 'أي سعر',
    'filter.upTo': 'حتى ${price} / شهريًا',
    'filter.maxDistance': 'أقصى مسافة: {km} كم',
    'filter.showing': 'عدد العقارات الموثّقة: {n}',
    'filter.addCampus': '+ إضافة جامعة',

    'home.title': 'سكن طلابي بالقرب من {name}',
    'home.campusFallback': 'الجامعة',
    'home.subtitle': 'قارن بين الغرف الموثّقة والمسافة سيرًا والإيجار الشهري في مكان واحد.',
    'home.mapLoading': 'جارٍ تحميل خريطة الجامعة...',
    'home.emptyTitle': 'لا يوجد سكن طلابي يطابق هذه الفلاتر',
    'home.emptyHint': 'جرّب زيادة نطاق المسافة أو الميزانية القصوى.',
    'home.showMap': 'عرض الخريطة',
    'home.showList': 'عرض القائمة',

    'card.distance': '{km} كم من الجامعة',
    'card.from': 'يبدأ من',
    'card.perMonth': '/ شهريًا',
    'card.walk': '{n} دقيقة مشيًا',
    'card.transit': '{n} دقيقة بالمواصلات',
    'card.toUni': 'إلى {name}',
    'card.roomTiers': 'أنواع الغرف المتاحة: {n}',
    'card.viewDetails': 'عرض التفاصيل',
    'card.book': 'احجز غرفة',

    'details.backToSearch': '→ العودة لبحث الجامعات',
    'details.startingFrom': 'يبدأ من',
    'details.photoCount': 'صورة {current} من {total}',
    'details.aboutTitle': 'عن هذا السكن الطلابي',
    'details.commuteEstimate': 'تقدير المسافة للحرم الجامعي',
    'details.includedAmenities': 'المرافق والخدمات المشمولة',
    'details.availableRoomTiers': 'فئات الغرف المتاحة ({n})',
    'details.selectRoomSub': 'اختر أي فئة غرفة بالأسفل لحساب إجمالي تكلفة العقد أو الحجز فوراً.',
    'details.allRoomTiers': 'كل الفئات',
    'details.availableFrom': 'متاح من',
    'details.availableNow': 'متاح الآن',
    'details.waitlist': 'قائمة انتظار',
    'details.calculatorTitle': 'حاسبة تكلفة العقد الإجمالية',
    'details.noBookingFees': 'بدون رسوم حجز',
    'details.selectedRoomTier': 'فئة الغرفة المختارة',
    'details.leaseDuration': 'مدة العقد',
    'details.month': 'شهر',
    'details.months': 'أشهر',
    'details.mosShort': 'شهور',
    'details.monthlyRent': 'الإيجار الشهري',
    'details.leaseSubtotal': 'إجمالي الإيجار ({rent} × {months} شهور)',
    'details.securityDeposit': 'تأمين مسترد (50%)',
    'details.serviceFee': 'رسوم خدمة المنصة',
    'details.freeFee': '£0 (مجاناً)',
    'details.totalEstimatedLease': 'إجمالي التكلفة التقديرية',
    'details.bookRoomMonths': 'احجز هذه الغرفة ({months} أشهر)',
    'details.managedBy': 'يديره {name}',
    'details.neighborhoodMapTitle': 'خريطة الحي والجامعة التفاعلية',
    'details.neighborhoodMapSub': 'استكشف الموقع الدقيق لـ {title} بالنسبة للجامعات القريبة في {city}.',
    'details.kmAway': 'كم',

    'booking.modalTitle': 'حجز {title}',
    'booking.landlordWarning': 'أنت مسجل الدخول بحساب مالك عقار. قم بالتبديل إلى حساب طالب لحجز الغرف.',
    'booking.guestPrompt': 'سجّل الدخول كطالب لمتابعة حالة طلب حجزك!',
    'booking.selectRoomType': 'اختر نوع الغرفة',
    'booking.studentName': 'اسم الطالب',
    'booking.studentEmail': 'البريد الإلكتروني للطالب',
    'booking.moveInDate': 'تاريخ الانتقال',
    'booking.durationMonths': 'المدة (بالأشهر)',
    'booking.close': 'إغلاق',
    'booking.sending': 'جارٍ الإرسال...',
    'booking.confirmRequest': 'تأكيد طلب الحجز',
    'booking.successMsg': 'تم إرسال طلب الحجز بنجاح! يمكنك متابعته في صفحة حجوزاتي.',

    'login.title': 'مرحبًا بعودتك',
    'login.subtitle': 'سجّل الدخول إلى حسابك كطالب أو مالك في UniHousing.',
    'login.invalidCredentials': 'بيانات تسجيل الدخول غير صحيحة',
    'login.emailLabel': 'البريد الإلكتروني',
    'login.emailPlaceholder': 'you@university.edu',
    'login.passwordLabel': 'كلمة المرور',
    'login.signingIn': 'جارٍ تسجيل الدخول...',
    'login.submit': 'تسجيل الدخول',
    'login.demoTitle': 'بيانات دخول تجريبية سريعة',
    'login.fillStudentDemo': 'ملء حساب طالب تجريبي',
    'login.fillLandlordDemo': 'ملء حساب مالك تجريبي',
    'login.noAccount': 'ليس لديك حساب؟',
    'login.createOne': 'أنشئ حسابًا',

    'register.title': 'إنشاء حساب جديد',
    'register.subtitle': 'اختر نوع حسابك للبدء في استخدام UniHousing.',
    'register.errorDefault': 'تعذّر إنشاء الحساب',
    'register.roleStudent': '🎓 أنا طالب',
    'register.roleLandlord': '🏢 أنا مالك عقار',
    'register.fullNameLabel': 'الاسم الكامل',
    'register.namePlaceholderLandlord': 'شركة إدارة العقارات',
    'register.namePlaceholderStudent': 'سمير محمد',
    'register.emailLabel': 'البريد الإلكتروني',
    'register.emailPlaceholder': 'you@example.com',
    'register.phoneLabel': 'رقم الهاتف',
    'register.phonePlaceholder': '+20 100 000 0000',
    'register.passwordLabel': 'كلمة المرور',
    'register.passwordPlaceholder': '6 أحرف على الأقل',
    'register.creatingAccount': 'جارٍ إنشاء الحساب...',
    'register.submitLandlord': 'التسجيل كمالك عقار',
    'register.submitStudent': 'التسجيل كطالب',
    'register.hasAccount': 'لديك حساب بالفعل؟',
    'register.logIn': 'تسجيل الدخول',

    'student.loading': 'جارٍ تحميل حساب الطالب الخاص بك...',
    'student.accessOnlyTitle': 'مخصص للطلاب فقط',
    'student.accessOnlySub': 'يرجى تسجيل الدخول بحساب طالب لعرض وإدارة حجوزات السكن الخاصة بك.',
    'student.goToLogin': 'الانتقال لتسجيل الدخول',
    'student.welcome': 'مرحبًا، {name}',
    'student.accountBadge': 'حساب طالب',
    'student.browseMoreRooms': 'تصفّح المزيد من الغرف',
    'student.myBookingRequests': 'طلبات الحجز الخاصة بي',
    'student.noBookingsYet': 'لم تقم بتقديم أي طلبات لحجز الغرف بعد.',
    'student.propertyFallback': 'سكن طلابي',
    'student.roomLabel': 'الغرفة:',
    'student.perMonthShort': '/شهريًا',
    'student.moveInLabel': 'تاريخ الانتقال:',
    'student.leaseLabel': 'مدة العقد:',
    'student.monthsUnit': 'أشهر',
    'student.status.APPROVED': 'مقبول',
    'student.status.REJECTED': 'مرفوض',
    'student.status.PENDING': 'قيد الانتظار',
    'student.unbookBtn': 'إلغاء الحجز',
    'student.unbookingBtn': 'جارٍ الإلغاء...',
    'student.confirmUnbook': 'هل أنت متأكد من إلغاء حجزك في "{property}"؟',
    'student.unbookError': 'فشل في إلغاء الحجز.',

    'landlord.accountRequiredTitle': 'مطلوب حساب مالك عقار',
    'landlord.accountRequiredSignedIn':
      'أنت مسجل الدخول حاليًا باسم {name} (طالب). يرجى تسجيل الدخول بحساب مالك لإضافة العقارات وإدارة حجوزات الطلاب.',
    'landlord.accountRequiredGuest':
      'يرجى تسجيل الدخول بحساب مالك لنشر العقارات وإدارة طلبات حجز الطلاب.',
    'landlord.signInAsLandlord': 'تسجيل الدخول كمالك',
    'landlord.registerLandlord': 'تسجيل حساب مالك',
    'landlord.portalTitle': 'بوابة إدارة الملاك',
    'landlord.signedInAs': 'مسجل الدخول باسم',
    'landlord.verifiedLandlord': 'مالك موثّق',
    'landlord.editPropertyTitle': '✏️ تعديل عقار طلابي',
    'landlord.publishPropertyTitle': 'نشر عقار طلابي جديد',
    'landlord.cancelEdit': 'إلغاء التعديل',
    'landlord.editPropertySub':
      'حدّث تفاصيل العقار، دقائق الوصول، موقع الدبوس على الخريطة، المرافق، الصور، أو تسعير الغرف أدناه.',
    'landlord.publishPropertySub':
      'ابحث عن شارع لتحريك الخريطة، حدّد وقت الوصول للجامعة، اختر المرافق، وارفع الصور.',
    'landlord.propertyTitleLabel': 'اسم العقار',
    'landlord.propertyTitlePlaceholder': 'مثال: استوديوهات بلومزبري الطلابية',
    'landlord.cityLabel': 'المدينة',
    'landlord.cityPlaceholder': 'لندن',
    'landlord.streetAddressLabel': 'عنوان الشارع',
    'landlord.streetAddressPlaceholder': '42 شارع غاور (أو استخدم البحث عن الشارع أدناه)',
    'landlord.walkingTimeLabel': '🚶 وقت المشي للجامعة (دقائق)',
    'landlord.walkingTimePlaceholder': 'مثال: 12',
    'landlord.transitTimeLabel': '🚇 وقت المواصلات للجامعة (دقائق)',
    'landlord.transitTimePlaceholder': 'مثال: 5',
    'landlord.descriptionLabel': 'وصف العقار',
    'landlord.descriptionPlaceholder':
      'صف السكن، مساحات الدراسة، المواصلات القريبة، والأمان...',
    'landlord.defaultDescription': 'سكن طلابي حديث في {city}',
    'landlord.searchStreetLabel': 'ابحث عن الشارع وحدّد موقع العقار على الخريطة',
    'landlord.searchStreetSub':
      'ابحث عن شارع لتحريك الخريطة إليه، ثم اضغط أو اسحب الدبوس فوق المبنى تمامًا.',
    'landlord.jumpNearUni': '🎯 أو انتقل بالقرب من جامعة:',
    'landlord.streetSearchPlaceholder':
      'ابحث عن شارع أو حي أو معلم (مثال: شارع غاور، لندن)...',
    'landlord.searching': 'جارٍ البحث...',
    'landlord.clear': 'مسح',
    'landlord.noStreetsFound':
      'لم يتم العثور على شوارع مطابقة. جرّب إضافة اسم المدينة (مثال: "Tahrir Street, Cairo").',
    'landlord.amenitiesLabel': 'المرافق والخدمات ({count} محددة)',
    'landlord.clearAll': 'مسح الكل',
    'landlord.amenitiesSub':
      'حدّد المرافق المشمولة في هذا العقار. ستظهر العناصر المحددة فقط في صفحة العقار.',
    'landlord.customAmenityPlaceholder':
      'أضف مرفقًا مخصصًا (مثال: تراس علوي، غرفة سينما)...',
    'landlord.addCustomBtn': '+ إضافة مرفق',
    'landlord.propertyPhotosLabel': 'صور العقار ({count})',
    'landlord.propertyPhotosSub':
      'ارفع صورًا من جهازك أو الصق رابط صورة. تُستخدم الصورة الأولى كصورة غلاف.',
    'landlord.processingPhotos': 'جارٍ المعالجة...',
    'landlord.uploadPhotosBtn': 'رفع الصور من المعرض',
    'landlord.pasteImageUrlPlaceholder': 'أو الصق رابط صورة (https://...)',
    'landlord.addUrlBtn': 'إضافة رابط',
    'landlord.noPhotosAdded': 'لم تتم إضافة صور بعد. ارفع ملفات أو أضف رابط صورة أعلاه.',
    'landlord.coverBadge': 'غلاف',
    'landlord.makeCoverBtn': 'تعيين كغلاف',
    'landlord.primaryRoomHeading': 'تفاصيل فئة الغرفة الأساسية',
    'landlord.roomTierNameLabel': 'اسم فئة الغرفة',
    'landlord.categoryLabel': 'الفئة',
    'landlord.privateRoomOption': 'غرفة خاصة',
    'landlord.entirePlaceOption': 'استوديو / سكن كامل',
    'landlord.sharedRoomOption': 'غرفة مشتركة',
    'landlord.pricePerMonthLabel': 'السعر / شهريًا (£)',
    'landlord.roomSizeLabel': 'مساحة الغرفة (م²)',
    'landlord.savingBtn': 'جارٍ الحفظ...',
    'landlord.saveChangesBtn': 'حفظ تعديلات العقار',
    'landlord.publishListingBtn': 'نشر إعلان العقار',
    'landlord.cancelBtn': 'إلغاء',
    'landlord.errorAtLeastOnePhoto': 'يرجى رفع أو إضافة صورة واحدة على الأقل للعقار.',
    'landlord.successUpdated': 'تم حفظ تعديلات العقار وأوقات الوصول بنجاح!',
    'landlord.successPublished':
      'تم نشر العقار مع أوقات الوصول والمرافق والإحداثيات والصور بنجاح!',
    'landlord.errorSavingProperty': 'حدث خطأ أثناء حفظ العقار.',
    'landlord.confirmDelete':
      'هل أنت متأكد من حذف "{title}"؟ سيؤدي ذلك أيضًا إلى إزالة غرفه وطلبات الحجز المرتبطة به.',
    'landlord.errorDeleteProperty': 'فشل في حذف العقار.',
    'landlord.incomingBookingsTitle': 'طلبات حجز الطلاب الواردة',
    'landlord.refreshBtn': 'تحديث',
    'landlord.noBookingsYet': 'لم يتم تقديم أي طلبات حجز بعد.',
    'landlord.propertyFallback': 'عقار',
    'landlord.studentLabel': 'الطالب:',
    'landlord.moveInLabel': 'تاريخ الانتقال:',
    'landlord.monthsUnit': 'أشهر',
    'landlord.perMonthShort': '/شهريًا',
    'landlord.status.APPROVED': 'مقبول',
    'landlord.status.REJECTED': 'مرفوض',
    'landlord.status.PENDING': 'قيد الانتظار',
    'landlord.approveBtn': 'قبول',
    'landlord.rejectBtn': 'رفض',
    'landlord.myListedPropertiesTitle': 'عقاراتي المنشورة ({count})',
    'landlord.myListedPropertiesSub':
      'اعرض أو عدّل التفاصيل أو احذف العقارات الطلابية التي قمت بنشرها.',
    'landlord.refreshListBtn': 'تحديث القائمة',
    'landlord.loadingMyProperties': 'جارٍ تحميل عقاراتك...',
    'landlord.noListedPropertiesYet':
      'لم تقم بنشر أي عقارات بعد. استخدم النموذج أعلاه لإنشاء أول إعلان لك.',
    'landlord.walkBadge': '🚶 {mins} د مشيًا',
    'landlord.transitBadge': '🚇 {mins} د مواصلات',
    'landlord.amenitiesCountBadge': '✨ {count} مرافق',
    'landlord.photosCountBadge': '📷 {count} صور',
    'landlord.viewPageLink': 'عرض الصفحة ←',
    'landlord.editingBtn': 'قيد التعديل...',
    'landlord.editBtn': 'تعديل',
    'landlord.deletingBtn': 'جارٍ الحذف...',
    'landlord.deleteBtn': 'حذف',
    'landlord.amenity.High-Speed Wi-Fi': 'واي فاي فائق السرعة',
    'landlord.amenity.All Bills Included': 'شامل جميع الفواتير',
    'landlord.amenity.24/7 Security & CCTV': 'أمن وحراسة وكاميرات 24/7',
    'landlord.amenity.Air Conditioning': 'تكييف هواء',
    'landlord.amenity.Study Lounge': 'قاعة دراسة',
    'landlord.amenity.On-Site Laundry': 'غسيل ملابس في الموقع',
    'landlord.amenity.Gym & Fitness Center': 'صالة رياضية ولياقة',
    'landlord.amenity.Fully Furnished': 'مفروش بالكامل',
    'landlord.amenity.Shared Kitchen': 'مطبخ مشترك',
    'landlord.amenity.Bike Storage': 'مخزن دراجات',
    'landlord.amenity.Elevator Access': 'مصعد كهربائي',
    'landlord.amenity.Cleaning Service': 'خدمة تنظيف',
  },
  en: {
    'nav.home': 'Home',
    'nav.explore': 'Explore Housing',
    'nav.myBookings': 'My Bookings',
    'nav.landlordDashboard': 'Landlord Dashboard',
    'nav.login': 'Log In',
    'nav.signup': 'Sign Up',
    'nav.logout': 'Log Out',
    'nav.menu': 'Menu',
    'role.LANDLORD': 'Landlord',
    'role.STUDENT': 'Student',
    'role.ADMIN': 'Admin',
    'toggle.language': 'العربية',

    'filter.university': 'University Campus',
    'filter.roomType': 'Room Type',
    'filter.allRoomTypes': 'All Room Types',
    'room.PRIVATE_ROOM': 'Private Room',
    'room.EN_SUITE': 'En-Suite',
    'room.SHARED_ROOM': 'Shared Room',
    'room.ENTIRE_PLACE': 'Entire Place',
    'filter.maxBudget': 'Max Budget / Mo',
    'filter.anyPrice': 'Any Price',
    'filter.upTo': 'Up to ${price} / mo',
    'filter.maxDistance': 'Max Distance: {km} km',
    'filter.showing': 'Showing {n} verified properties',
    'filter.addCampus': '+ Add Campus',

    'home.title': 'Student Housing near {name}',
    'home.campusFallback': 'Campus',
    'home.subtitle': 'Compare verified rooms, walking distance, and monthly rent—all in one place.',
    'home.mapLoading': 'Loading Campus Map...',
    'home.emptyTitle': 'No student housing matches those filters',
    'home.emptyHint': 'Try increasing your distance radius or max budget.',
    'home.showMap': 'Show map',
    'home.showList': 'Show list',

    'card.distance': '{km} km from campus',
    'card.from': 'From',
    'card.perMonth': '/mo',
    'card.walk': '{n} min walk',
    'card.transit': '{n} min transit',
    'card.toUni': 'to {name}',
    'card.roomTiers': 'Room types available: {n}',
    'card.viewDetails': 'View Details',
    'card.book': 'Book Room',

    'details.backToSearch': '← Back to University Search',
    'details.startingFrom': 'Starting from',
    'details.photoCount': 'Photo {current} of {total}',
    'details.aboutTitle': 'About This Student Residence',
    'details.commuteEstimate': 'Campus Commute Estimate',
    'details.includedAmenities': 'Included Amenities & Facilities',
    'details.availableRoomTiers': 'Available Room Tiers ({n})',
    'details.selectRoomSub': 'Select any room tier below to calculate your total lease cost or book immediately.',
    'details.allRoomTiers': 'All Room Tiers',
    'details.availableFrom': 'Available from',
    'details.availableNow': 'Available Now',
    'details.waitlist': 'Waitlist',
    'details.calculatorTitle': 'Total Lease Calculator',
    'details.noBookingFees': 'No Booking Fees',
    'details.selectedRoomTier': 'Selected Room Tier',
    'details.leaseDuration': 'Lease Duration',
    'details.month': 'Month',
    'details.months': 'Months',
    'details.mosShort': 'mos',
    'details.monthlyRent': 'Monthly Rent',
    'details.leaseSubtotal': 'Lease Subtotal ({rent} × {months} mos)',
    'details.securityDeposit': 'Refundable Security Deposit (50%)',
    'details.serviceFee': 'Platform Service Fee',
    'details.freeFee': '£0 (Free)',
    'details.totalEstimatedLease': 'Total Estimated Lease',
    'details.bookRoomMonths': 'Book This Room ({months} Months)',
    'details.managedBy': 'Managed by {name}',
    'details.neighborhoodMapTitle': 'Interactive Neighborhood & Campus Map',
    'details.neighborhoodMapSub': "Explore {title}'s exact location relative to nearby universities in {city}.",
    'details.kmAway': 'km away',

    'booking.modalTitle': 'Book {title}',
    'booking.landlordWarning': 'You are signed in with a Landlord account. Switch to a Student account to book rooms.',
    'booking.guestPrompt': 'Sign in as a student to track your booking status!',
    'booking.selectRoomType': 'Select Room Type',
    'booking.studentName': 'Student Name',
    'booking.studentEmail': 'Student Email',
    'booking.moveInDate': 'Move-in Date',
    'booking.durationMonths': 'Duration (Months)',
    'booking.close': 'Close',
    'booking.sending': 'Sending...',
    'booking.confirmRequest': 'Confirm Booking Request',
    'booking.successMsg': 'Booking request submitted! Track it in My Bookings.',

    'login.title': 'Welcome Back',
    'login.subtitle': 'Sign in to your Student or Landlord UniHousing account.',
    'login.invalidCredentials': 'Invalid login credentials',
    'login.emailLabel': 'Email Address',
    'login.emailPlaceholder': 'you@university.edu',
    'login.passwordLabel': 'Password',
    'login.signingIn': 'Signing in...',
    'login.submit': 'Sign In',
    'login.demoTitle': 'Quick Demo Credentials',
    'login.fillStudentDemo': 'Fill Student Demo',
    'login.fillLandlordDemo': 'Fill Landlord Demo',
    'login.noAccount': "Don't have an account?",
    'login.createOne': 'Create one',

    'register.title': 'Create an Account',
    'register.subtitle': 'Choose your account type to get started on UniHousing.',
    'register.errorDefault': 'Could not create account',
    'register.roleStudent': '🎓 I am a Student',
    'register.roleLandlord': '🏢 I am a Landlord',
    'register.fullNameLabel': 'Full Name',
    'register.namePlaceholderLandlord': 'Property Management Co.',
    'register.namePlaceholderStudent': 'Samir Mohamed',
    'register.emailLabel': 'Email Address',
    'register.emailPlaceholder': 'you@example.com',
    'register.phoneLabel': 'Phone Number',
    'register.phonePlaceholder': '+20 100 000 0000',
    'register.passwordLabel': 'Password',
    'register.passwordPlaceholder': 'At least 6 characters',
    'register.creatingAccount': 'Creating Account...',
    'register.submitLandlord': 'Sign Up as Landlord',
    'register.submitStudent': 'Sign Up as Student',
    'register.hasAccount': 'Already have an account?',
    'register.logIn': 'Log in',

    'student.loading': 'Loading your student account...',
    'student.accessOnlyTitle': 'Student Access Only',
    'student.accessOnlySub':
      'Please sign in with a Student account to view and manage your accommodation bookings.',
    'student.goToLogin': 'Go to Login',
    'student.welcome': 'Welcome, {name}',
    'student.accountBadge': 'Student Account',
    'student.browseMoreRooms': 'Browse More Rooms',
    'student.myBookingRequests': 'My Booking Requests',
    'student.noBookingsYet': "You haven't submitted any room booking requests yet.",
    'student.propertyFallback': 'Student Property',
    'student.roomLabel': 'Room:',
    'student.perMonthShort': '/mo',
    'student.moveInLabel': 'Move-in:',
    'student.leaseLabel': 'Lease:',
    'student.monthsUnit': 'months',
    'student.status.APPROVED': 'APPROVED',
    'student.status.REJECTED': 'REJECTED',
    'student.status.PENDING': 'PENDING',
    'student.unbookBtn': 'Unbook',
    'student.unbookingBtn': 'Unbooking...',
    'student.confirmUnbook': 'Are you sure you want to unbook "{property}"?',
    'student.unbookError': 'Failed to cancel booking.',

    'landlord.accountRequiredTitle': 'Landlord Account Required',
    'landlord.accountRequiredSignedIn':
      'You are currently signed in as {name} (STUDENT). Please sign in with a Landlord account to list properties and manage student bookings.',
    'landlord.accountRequiredGuest':
      'Please sign in with a Landlord account to publish properties and manage student booking requests.',
    'landlord.signInAsLandlord': 'Sign In as Landlord',
    'landlord.registerLandlord': 'Register Landlord',
    'landlord.portalTitle': 'Landlord Management Portal',
    'landlord.signedInAs': 'Signed in as',
    'landlord.verifiedLandlord': 'Verified Landlord',
    'landlord.editPropertyTitle': '✏️ Edit Student Property',
    'landlord.publishPropertyTitle': 'Publish New Student Property',
    'landlord.cancelEdit': 'Cancel Edit',
    'landlord.editPropertySub':
      'Update your property details, commute minutes, map pin, amenities, photos, or room pricing below.',
    'landlord.publishPropertySub':
      'Search for a street to jump the map, set commute times to campus, select amenities, and upload photos.',
    'landlord.propertyTitleLabel': 'Property Title',
    'landlord.propertyTitlePlaceholder': 'e.g., Bloomsbury Student Studios',
    'landlord.cityLabel': 'City',
    'landlord.cityPlaceholder': 'London',
    'landlord.streetAddressLabel': 'Street Address',
    'landlord.streetAddressPlaceholder': '42 Gower Street (or use street search below)',
    'landlord.walkingTimeLabel': '🚶 Walking Time to Campus (mins)',
    'landlord.walkingTimePlaceholder': 'e.g., 12',
    'landlord.transitTimeLabel': '🚇 Transit Time to Campus (mins)',
    'landlord.transitTimePlaceholder': 'e.g., 5',
    'landlord.descriptionLabel': 'Property Description',
    'landlord.descriptionPlaceholder':
      'Describe the residence, study spaces, nearby transport, and security...',
    'landlord.defaultDescription': 'Modern student accommodation in {city}',
    'landlord.searchStreetLabel': 'Search Street & Pinpoint Property Location',
    'landlord.searchStreetSub':
      'Search for a street to fly the map there, then click or drag the pin onto the exact building.',
    'landlord.jumpNearUni': '🎯 Or jump near university:',
    'landlord.streetSearchPlaceholder':
      'Search street, neighborhood, or landmark (e.g., Gower Street, London)...',
    'landlord.searching': 'Searching...',
    'landlord.clear': 'Clear',
    'landlord.noStreetsFound':
      'No matching streets found. Try adding the city name (e.g., "Tahrir Street, Cairo").',
    'landlord.amenitiesLabel': 'Amenities & Facilities ({count} selected)',
    'landlord.clearAll': 'Clear all',
    'landlord.amenitiesSub':
      'Check the facilities included with this property. Only checked items will be shown on the listing page.',
    'landlord.customAmenityPlaceholder':
      'Add custom facility (e.g., Rooftop Terrace, Cinema Room)...',
    'landlord.addCustomBtn': '+ Add Custom',
    'landlord.propertyPhotosLabel': 'Property Photos ({count})',
    'landlord.propertyPhotosSub':
      'Upload photos from your phone or paste an image URL. The first photo is used as the cover image.',
    'landlord.processingPhotos': 'Processing...',
    'landlord.uploadPhotosBtn': 'Upload Photos',
    'landlord.pasteImageUrlPlaceholder': 'Or paste image URL (https://...)',
    'landlord.addUrlBtn': 'Add URL',
    'landlord.noPhotosAdded': 'No photos added yet. Upload files or add an image URL above.',
    'landlord.coverBadge': 'Cover',
    'landlord.makeCoverBtn': 'Make Cover',
    'landlord.primaryRoomHeading': 'Primary Room Tier Details',
    'landlord.roomTierNameLabel': 'Room Tier Name',
    'landlord.categoryLabel': 'Category',
    'landlord.privateRoomOption': 'Private Room',
    'landlord.entirePlaceOption': 'Studio / Entire Place',
    'landlord.sharedRoomOption': 'Shared Room',
    'landlord.pricePerMonthLabel': 'Price / Month (£)',
    'landlord.roomSizeLabel': 'Room Size (m²)',
    'landlord.savingBtn': 'Saving...',
    'landlord.saveChangesBtn': 'Save Property Changes',
    'landlord.publishListingBtn': 'Publish Property Listing',
    'landlord.cancelBtn': 'Cancel',
    'landlord.errorAtLeastOnePhoto': 'Please upload or add at least one photo of the property.',
    'landlord.successUpdated': 'Property changes and commute times saved successfully!',
    'landlord.successPublished':
      'Property published with your commute times, amenities, coordinates, and photos!',
    'landlord.errorSavingProperty': 'Error saving property.',
    'landlord.confirmDelete':
      'Are you sure you want to delete "{title}"? This will also remove its rooms and associated booking requests.',
    'landlord.errorDeleteProperty': 'Failed to delete property.',
    'landlord.incomingBookingsTitle': 'Incoming Student Bookings',
    'landlord.refreshBtn': 'Refresh',
    'landlord.noBookingsYet': 'No booking requests submitted yet.',
    'landlord.propertyFallback': 'Property',
    'landlord.studentLabel': 'Student:',
    'landlord.moveInLabel': 'Move-in:',
    'landlord.monthsUnit': 'months',
    'landlord.perMonthShort': '/mo',
    'landlord.status.APPROVED': 'APPROVED',
    'landlord.status.REJECTED': 'REJECTED',
    'landlord.status.PENDING': 'PENDING',
    'landlord.approveBtn': 'Approve',
    'landlord.rejectBtn': 'Reject',
    'landlord.myListedPropertiesTitle': 'My Listed Properties ({count})',
    'landlord.myListedPropertiesSub':
      'View, edit details, or remove the student properties you have published.',
    'landlord.refreshListBtn': 'Refresh List',
    'landlord.loadingMyProperties': 'Loading your properties...',
    'landlord.noListedPropertiesYet':
      "You haven't published any properties yet. Use the form above to create your first listing.",
    'landlord.walkBadge': '🚶 {mins}m walk',
    'landlord.transitBadge': '🚇 {mins}m transit',
    'landlord.amenitiesCountBadge': '✨ {count} amenities',
    'landlord.photosCountBadge': '📷 {count} photos',
    'landlord.viewPageLink': 'View Page →',
    'landlord.editingBtn': 'Editing...',
    'landlord.editBtn': 'Edit',
    'landlord.deletingBtn': 'Deleting...',
    'landlord.deleteBtn': 'Delete',
    'landlord.amenity.High-Speed Wi-Fi': 'High-Speed Wi-Fi',
    'landlord.amenity.All Bills Included': 'All Bills Included',
    'landlord.amenity.24/7 Security & CCTV': '24/7 Security & CCTV',
    'landlord.amenity.Air Conditioning': 'Air Conditioning',
    'landlord.amenity.Study Lounge': 'Study Lounge',
    'landlord.amenity.On-Site Laundry': 'On-Site Laundry',
    'landlord.amenity.Gym & Fitness Center': 'Gym & Fitness Center',
    'landlord.amenity.Fully Furnished': 'Fully Furnished',
    'landlord.amenity.Shared Kitchen': 'Shared Kitchen',
    'landlord.amenity.Bike Storage': 'Bike Storage',
    'landlord.amenity.Elevator Access': 'Elevator Access',
    'landlord.amenity.Cleaning Service': 'Cleaning Service',
  },
};

function translate(lang, key, vars) {
  let text = translations[lang]?.[key] ?? translations.en[key] ?? key;
  if (vars) {
    Object.entries(vars).forEach(([name, value]) => {
      text = text.split(`{${name}}`).join(String(value));
    });
  }
  return text;
}

/* ============================================================================
   INTERACTIVE LEAFLET MAP COMPONENT (Synced with MapView & LocationPickerMap)
   ============================================================================ */
function LeafletMap({
  mode = 'explore', // 'explore' | 'details' | 'picker'
  centerLat = 30.0444,
  centerLng = 31.2357,
  zoom = 14,
  darkMode = false,
  university = null,
  listings = [],
  property = null,
  pickerLat = 30.0444,
  pickerLng = 31.2357,
  flyToTarget = null,
  onSelectPropertyBook,
  onLocationPick,
}) {
  const htmlContent = useMemo(() => {
    const payload = JSON.stringify({
      mode,
      centerLat: Number(centerLat) || 30.0444,
      centerLng: Number(centerLng) || 31.2357,
      zoom,
      darkMode: Boolean(darkMode),
      university,
      listings: (listings || []).map((p) => ({
        id: p.id,
        title: p.title,
        city: p.city,
        address: p.address,
        image: p.images?.[0] || DEFAULT_COVER_IMAGE,
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
            address: property.address,
            image: property.images?.[0] || DEFAULT_COVER_IMAGE,
            latitude: Number(property.latitude),
            longitude: Number(property.longitude),
            startingPrice:
              property.startingPrice ??
              property.rooms?.[0]?.pricePerMonth ??
              'N/A',
            distanceToUniKm: property.distanceToUniKm,
          }
        : null,
      pickerLat: Number(pickerLat) || 30.0444,
      pickerLng: Number(pickerLng) || 31.2357,
      flyToTarget,
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
      background: ${darkMode ? '#0b1220' : '#f1f5f9'};
    }
    body.dark-mode .leaflet-tile-pane {
      filter: invert(1) hue-rotate(180deg) brightness(0.95) contrast(0.9);
    }
    body.dark-mode .leaflet-control-zoom a,
    body.dark-mode .leaflet-control-attribution {
      background: #101a2e !important;
      color: #cbd5e1 !important;
      border-color: #223049 !important;
    }
    .leaflet-div-icon {
      background: transparent !important;
      border: none !important;
    }
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
    .price-pin {
      background: ${darkMode ? '#101a2e' : '#ffffff'};
      color: ${darkMode ? '#e2e8f0' : '#1e293b'};
      font-weight: 700;
      font-size: 13px;
      padding: 4px 10px;
      border-radius: 9999px;
      border: 2px solid ${darkMode ? '#31415f' : '#cbd5e1'};
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
      white-space: nowrap;
      width: max-content;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transform: translate(-50%, -50%);
      transition: all 0.2s ease;
    }
    .price-pin-active {
      background: #142B4A !important;
      color: #ffffff !important;
      border-color: #10B981 !important;
      transform: translate(-50%, -50%) scale(1.15);
      z-index: 999 !important;
    }
    .leaflet-popup-content-wrapper {
      padding: 0;
      border-radius: 12px;
      overflow: hidden;
      background: ${darkMode ? '#101a2e' : '#ffffff'};
      color: ${darkMode ? '#f1f5f9' : '#172033'};
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.22);
    }
    .leaflet-popup-content {
      margin: 0;
      width: 210px !important;
    }
    .leaflet-popup-tip {
      background: ${darkMode ? '#101a2e' : '#ffffff'};
    }
    .card-img {
      width: 100%;
      height: 96px;
      object-fit: cover;
      display: block;
    }
    .card-body {
      padding: 10px 12px;
    }
    .popup-title {
      font-weight: 800;
      font-size: 12px;
      color: ${darkMode ? '#f1f5f9' : '#0f172a'};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .popup-sub {
      font-size: 11px;
      color: ${darkMode ? '#94a3b8' : '#64748b'};
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .popup-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 6px;
    }
    .popup-price {
      font-size: 12px;
      font-weight: 800;
      color: ${darkMode ? '#a5b4fc' : '#142B4A'};
    }
    .popup-dist {
      font-size: 10px;
      background: ${darkMode ? '#162033' : '#f1f5f9'};
      color: ${darkMode ? '#cbd5e1' : '#334155'};
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }
    .book-btn {
      margin-top: 8px;
      display: block;
      text-align: center;
      background: #10B981;
      color: #ffffff !important;
      padding: 6px 10px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
    }
    .picker-bar {
      position: absolute;
      bottom: 8px;
      left: 8px;
      right: 8px;
      z-index: 500;
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(15, 23, 42, 0.85);
      color: #ffffff;
      font-size: 10px;
      padding: 6px 10px;
      border-radius: 8px;
    }
    .picker-coords {
      font-family: monospace;
      font-weight: 700;
      color: #93c5fd;
    }
  </style>
</head>
<body class="${darkMode ? 'dark-mode' : ''}">
  <div id="map"></div>
  ${
    mode === 'picker'
      ? `<div class="picker-bar">
           <span>👆 Tap street or drag pin</span>
           <span id="coordLabel" class="picker-coords">${Number(pickerLat).toFixed(5)}, ${Number(pickerLng).toFixed(5)}</span>
         </div>`
      : ''
  }
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
          '<div class="card-body">' +
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
          '<div>' +
            '<img class="card-img" src="' + prop.image + '" />' +
            '<div class="card-body">' +
              '<div class="popup-title">' + prop.title + '</div>' +
              '<div class="popup-sub">' + (prop.address || '') + '</div>' +
              '<div class="popup-row">' +
                '<span class="popup-price">From $' + (prop.startingPrice || 'N/A') + '/mo</span>' +
                (prop.distanceToUniKm !== undefined ? '<span class="popup-dist">' + prop.distanceToUniKm + ' km</span>' : '') +
              '</div>' +
              '<div class="book-btn" onclick="window.bookProp(\\'' + prop.id + '\\')">Click pin to book room</div>' +
            '</div>' +
          '</div>';
        marker.bindPopup(popupHtml);
        markers.push({ instance: marker, price: prop.startingPrice });
      });

      window.bookProp = function(propId) {
        sendMsg({ type: 'BOOK_PROPERTY', propertyId: propId });
      };
    }

    if (data.mode === 'details' && data.property) {
      const m = L.marker(
        [data.property.latitude, data.property.longitude],
        { icon: createPriceIcon(data.property.startingPrice, true), zIndexOffset: 900 }
      ).addTo(map);

      m.bindPopup(
        '<div class="card-body">' +
          '<div class="popup-title">' + data.property.title + '</div>' +
          '<div class="popup-sub">' + (data.property.address || '') + '</div>' +
        '</div>'
      );

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

      if (data.flyToTarget && data.flyToTarget.lat && data.flyToTarget.lng) {
        map.flyTo([data.flyToTarget.lat, data.flyToTarget.lng], data.flyToTarget.zoom || 17, { duration: 1.0 });
      }

      function updateCoords(lat, lng) {
        const el = document.getElementById('coordLabel');
        if (el) el.innerText = lat.toFixed(5) + ', ' + lng.toFixed(5);
        sendMsg({ type: 'PICK_LOCATION', latitude: lat, longitude: lng });
      }

      pinMarker.on('dragend', function(e) {
        const pos = e.target.getLatLng();
        updateCoords(pos.lat, pos.lng);
      });

      map.on('click', function(e) {
        pinMarker.setLatLng(e.latlng);
        updateCoords(e.latlng.lat, e.latlng.lng);
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
    flyToTarget,
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

/* ============================================================================
   MAIN APPLICATION (Synced with Next.js Frontend)
   ============================================================================ */
export default function App() {
  // Default settings match SettingsContext.jsx: Arabic ('ar') + Light ('light')
  const [lang, setLang] = useState('ar');
  const [darkMode, setDarkMode] = useState(false);
  const isRTL = lang === 'ar';
  const t = useCallback((key, vars) => translate(lang, key, vars), [lang]);

  // Exact Tailwind & globals.css color tokens
  const theme = useMemo(
    () => ({
      bg: darkMode ? '#0b1220' : '#f8fafc',
      card: darkMode ? '#101a2e' : '#ffffff',
      inputBg: darkMode ? '#1e293b' : '#ffffff',
      subtleBg: darkMode ? '#162033' : '#f1f5f9',
      text: darkMode ? '#f1f5f9' : '#172033',
      subText: darkMode ? '#94a3b8' : '#64748b',
      bodyText: darkMode ? '#cbd5e1' : '#334155',
      border: darkMode ? '#223049' : '#e2e8f0',
      inputBorder: darkMode ? '#31415f' : '#cbd5e1',
      brand: '#142B4A',
      brandText: darkMode ? '#a5b4fc' : '#142B4A',
      brandSoftBg: darkMode ? 'rgba(99, 102, 241, 0.16)' : '#f0f4f8',
      emerald: '#10B981',
    }),
    [darkMode]
  );

  // DoorTransition animation state
  const doorAnim = useRef(new Animated.Value(0)).current; // 0 = closed, 1 = open
  const [doorVisible, setDoorVisible] = useState(true);
  const isTransitioningRef = useRef(false);

  const openDoors = useCallback(() => {
    Animated.timing(doorAnim, {
      toValue: 1,
      duration: 750,
      easing: Easing.bezier(0.85, 0, 0.15, 1),
      useNativeDriver: true,
    }).start(() => {
      setDoorVisible(false);
      isTransitioningRef.current = false;
    });
  }, [doorAnim]);

  useEffect(() => {
    const timer = setTimeout(() => {
      openDoors();
    }, 450);
    return () => clearTimeout(timer);
  }, [openDoors]);

  const [activeTab, setActiveTab] = useState('EXPLORE');
  const [menuOpen, setMenuOpen] = useState(false);

  const navigateWithDoors = useCallback(
    (nextTab, callback) => {
      setMenuOpen(false);
      if (isTransitioningRef.current) {
        if (callback) callback();
        setActiveTab(nextTab);
        return;
      }
      isTransitioningRef.current = true;
      setDoorVisible(true);
      Animated.timing(doorAnim, {
        toValue: 0,
        duration: 420,
        easing: Easing.bezier(0.7, 0, 0.2, 1),
        useNativeDriver: true,
      }).start(() => {
        if (callback) callback();
        setActiveTab(nextTab);
        setTimeout(() => {
          openDoors();
        }, 220);
      });
    },
    [doorAnim, openDoors]
  );

  // Auth State
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const isStudent = user?.role === 'STUDENT';
  const isLandlord = user?.role === 'LANDLORD';

  const [authMode, setAuthMode] = useState('LOGIN'); // 'LOGIN' | 'REGISTER'
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authRole, setAuthRole] = useState('STUDENT');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Explore & FilterBar State (default 10 km like web page.js)
  const [universities, setUniversities] = useState([]);
  const [selectedUni, setSelectedUni] = useState(null);
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [maxDistanceKm, setMaxDistanceKm] = useState(10);
  const [maxPrice, setMaxPrice] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'map'
  const exploreScrollRef = useRef(null);
  const [explorerOffsetY, setExplorerOffsetY] = useState(480);

  // HeroSlider State
  const [heroIndex, setHeroIndex] = useState(0);
  const [randomHeroProps, setRandomHeroProps] = useState([]);

  // Property Details State
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [detailsRoomCategory, setDetailsRoomCategory] = useState('ALL');
  const [calcRoomId, setCalcRoomId] = useState('');
  const [calcMonths, setCalcMonths] = useState(9);

  // BookingModal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingProperty, setBookingProperty] = useState(null);
  const [bookingRoomId, setBookingRoomId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [moveInDate, setMoveInDate] = useState('2026-09-01');
  const [durationMonths, setDurationMonths] = useState('9');
  const [bookingStatusMsg, setBookingStatusMsg] = useState(null);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  // Student Dashboard State
  const [studentBookings, setStudentBookings] = useState([]);
  const [cancellingId, setCancellingId] = useState(null);

  // Landlord Portal State
  const [landlordBookings, setLandlordBookings] = useState([]);
  const [myProperties, setMyProperties] = useState([]);
  const [loadingMyProps, setLoadingMyProps] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState(null);
  const [deletingPropId, setDeletingPropId] = useState(null);
  const [propTitle, setPropTitle] = useState('');
  const [propDesc, setPropDesc] = useState('');
  const [propAddress, setPropAddress] = useState('');
  const [propCity, setPropCity] = useState('Cairo');
  const [propLat, setPropLat] = useState(30.0444);
  const [propLng, setPropLng] = useState(31.2357);
  const [walkMins, setWalkMins] = useState('12');
  const [transitMins, setTransitMins] = useState('5');
  const [flyToTarget, setFlyToTarget] = useState(null);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [customAmenity, setCustomAmenity] = useState('');
  const [propImages, setPropImages] = useState([DEFAULT_COVER_IMAGE]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [roomName, setRoomName] = useState('Classic Private Room');
  const [roomCategory, setRoomCategory] = useState('PRIVATE_ROOM');
  const [pricePerMonth, setPricePerMonth] = useState('950');
  const [sizeSqm, setSizeSqm] = useState('18');
  const [savingProperty, setSavingProperty] = useState(false);
  const [landlordMsg, setLandlordMsg] = useState({ type: '', text: '' });

  const [streetQuery, setStreetQuery] = useState('');
  const [streetResults, setStreetResults] = useState([]);
  const [searchingStreet, setSearchingStreet] = useState(false);
  const landlordScrollRef = useRef(null);

  // Add University Modal State
  const [uniModalOpen, setUniModalOpen] = useState(false);
  const [uniSearchQuery, setUniSearchQuery] = useState('');
  const [uniSearchResults, setUniSearchResults] = useState([]);
  const [newUniName, setNewUniName] = useState('');
  const [newUniCity, setNewUniCity] = useState('');
  const [newUniCountry, setNewUniCountry] = useState('');
  const [newUniLat, setNewUniLat] = useState('');
  const [newUniLng, setNewUniLng] = useState('');

  const getHeaders = useCallback(
    (overrideToken = token) => {
      const headers = { 'Content-Type': 'application/json' };
      if (overrideToken) headers['Authorization'] = `Bearer ${overrideToken}`;
      return headers;
    },
    [token]
  );

  // Translate amenity helper
  const translateAmenity = useCallback(
    (amenity) => {
      if (!isRTL) return amenity;
      const key = `landlord.amenity.${amenity}`;
      const translated = t(key);
      if (translated && translated !== key) return translated;
      return AMENITY_AR_MAP[amenity] || amenity;
    },
    [isRTL, t]
  );

  // Load Universities & Listings
  const loadUniversities = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/universities`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setUniversities(data);
        if (!selectedUni) setSelectedUni(data[0]);
      }
    } catch (err) {
      console.warn('Backend unreachable:', err.message);
    }
  };

  const loadListings = async (uni = selectedUni) => {
    if (!uni) return;
    setLoadingListings(true);
    try {
      const params = new URLSearchParams({
        universityId: uni.id,
        maxDistanceKm: String(maxDistanceKm || 10),
      });
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (categoryFilter) params.append('category', categoryFilter);

      const res = await fetch(
        `${API_BASE_URL}/listings/search?${params.toString()}`
      );
      const data = await res.json();
      const fetched = data.listings || [];
      setListings(fetched);
      if (fetched.length > 0) {
        const shuffled = [...fetched].sort(() => 0.5 - Math.random());
        setRandomHeroProps(shuffled.slice(0, 3));
      }
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

  // HeroSlider merged slides + auto-advance
  const heroSlides = useMemo(() => {
    const baseSlides = HERO_SLIDES[lang] || HERO_SLIDES.ar;
    if (randomHeroProps.length === 0) return baseSlides;

    return baseSlides.map((slide, idx) => {
      const prop = randomHeroProps[idx % randomHeroProps.length];
      if (!prop) return slide;

      const coverImage =
        Array.isArray(prop.images) && prop.images.length > 0 && prop.images[0]
          ? prop.images[0]
          : slide.image;

      const roomPrices = Array.isArray(prop.rooms)
        ? prop.rooms
            .map((r) => Number(r.pricePerMonth))
            .filter((n) => !Number.isNaN(n) && n > 0)
        : [];
      const lowestPrice =
        prop.minPrice ??
        prop.startingPrice ??
        (roomPrices.length > 0 ? Math.min(...roomPrices) : null);

      const wMins = prop.commute?.walkMins ?? prop.walkMins;
      const tMins = prop.commute?.transitMins ?? prop.transitMins;
      let locationText = slide.card.location;
      if (wMins) {
        locationText = isRTL
          ? `${wMins} دقيقة مشياً للجامعة${prop.city ? ` • ${prop.city}` : ''}`
          : `${wMins} mins walk to Campus${prop.city ? ` • ${prop.city}` : ''}`;
      } else if (tMins) {
        locationText = isRTL
          ? `${tMins} دقيقة بالمواصلات${prop.city ? ` • ${prop.city}` : ''}`
          : `${tMins} mins transit${prop.city ? ` • ${prop.city}` : ''}`;
      } else if (prop.address || prop.city) {
        locationText = [prop.address, prop.city].filter(Boolean).join(' • ');
      }

      const rawAmenities =
        Array.isArray(prop.amenities) && prop.amenities.length > 0
          ? prop.amenities.slice(0, 3)
          : null;

      const perks = rawAmenities
        ? rawAmenities.map((am) => translateAmenity(am))
        : slide.card.perks;

      const deterministicRating = (
        4.7 +
        ((idx + (prop.title?.length || 0)) % 4) * 0.1
      ).toFixed(1);

      return {
        ...slide,
        image: coverImage,
        propertyObj: prop,
        card: {
          ...slide.card,
          title: prop.title || slide.card.title,
          location: locationText,
          price: lowestPrice !== null ? `£${lowestPrice}` : slide.card.price,
          period: isRTL ? '/ شهرياً' : '/ month',
          rating: prop.rating ? String(prop.rating) : deterministicRating,
          tag: prop.city || slide.card.tag,
          perks,
        },
      };
    });
  }, [lang, randomHeroProps, isRTL, translateAmenity]);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Street Autocomplete Search
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
    }, 350);
    return () => clearTimeout(timer);
  }, [streetQuery, lang]);

  // University Autocomplete Search
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

  // Auth Handlers
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
      if (!res.ok)
        throw new Error(
          data.error ||
            (authMode === 'LOGIN'
              ? t('login.invalidCredentials')
              : t('register.errorDefault'))
        );

      setToken(data.token);
      setUser(data.user);
      if (data.user.role === 'LANDLORD') {
        loadLandlordData(data.token);
        navigateWithDoors('LANDLORD');
      } else {
        loadStudentBookings(data.token);
        navigateWithDoors('EXPLORE');
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
    navigateWithDoors('EXPLORE');
  };

  // Property Details Navigation
  const openPropertyDetails = async (propertySummary) => {
    const firstRoom = propertySummary.rooms?.[0];
    navigateWithDoors('DETAILS', () => {
      setSelectedProperty(propertySummary);
      setActivePhotoIdx(0);
      setDetailsRoomCategory('ALL');
      setCalcRoomId(firstRoom?.id || '');
      setCalcMonths(9);
    });

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

  // Booking Modal Handlers
  const openQuickBookingModal = (property, roomId = '', months = 9) => {
    const rooms = property?.rooms || property?.roomTypes || [];
    setBookingProperty(property);
    setBookingRoomId(roomId || rooms[0]?.id || '');
    setDurationMonths(String(months || 9));
    setBookingStatusMsg(null);
    setBookingModalOpen(true);
  };

  const handleBookingSubmit = async () => {
    if (!bookingRoomId || !studentName || !studentEmail) {
      setBookingStatusMsg({
        type: 'error',
        text: 'Please fill in your name and email.',
      });
      return;
    }
    setBookingSubmitting(true);
    setBookingStatusMsg(null);
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

      setBookingStatusMsg({
        type: 'success',
        text: t('booking.successMsg'),
      });
      if (token) loadStudentBookings(token);
    } catch (err) {
      setBookingStatusMsg({
        type: 'error',
        text: err.message || 'Failed to submit booking.',
      });
    } finally {
      setBookingSubmitting(false);
    }
  };

  // Student Bookings + Unbook (DELETE /bookings/:id)
  const loadStudentBookings = async (overrideToken = token) => {
    if (!overrideToken) return;
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getHeaders(overrideToken),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setStudentBookings(data.user.bookings || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUnbook = (booking) => {
    const propName =
      booking.roomType?.property?.title || t('student.propertyFallback');
    Alert.alert(
      t('student.unbookBtn'),
      t('student.confirmUnbook', { property: propName }),
      [
        { text: t('landlord.cancelBtn'), style: 'cancel' },
        {
          text: t('student.unbookBtn'),
          style: 'destructive',
          onPress: async () => {
            setCancellingId(booking.id);
            try {
              const res = await fetch(
                `${API_BASE_URL}/bookings/${booking.id}`,
                {
                  method: 'DELETE',
                  headers: getHeaders(),
                }
              );
              const data = await res.json();
              if (!res.ok)
                throw new Error(data.error || t('student.unbookError'));
              setStudentBookings((prev) =>
                prev.filter((b) => b.id !== booking.id)
              );
            } catch (err) {
              Alert.alert('Error', err.message || t('student.unbookError'));
            } finally {
              setCancellingId(null);
            }
          },
        },
      ]
    );
  };

  // Landlord Data & Actions
  const loadLandlordData = async (overrideToken = token) => {
    if (!overrideToken) return;
    setLoadingMyProps(true);
    const authHeaders = getHeaders(overrideToken);
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
    } finally {
      setLoadingMyProps(false);
    }
  };

  const handleSelectStreet = (place) => {
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
      addr.state ||
      addr.county ||
      propCity;

    setPropAddress(streetLine);
    setPropCity(detectedCity);
    setPropLat(lat);
    setPropLng(lng);
    setFlyToTarget({ lat, lng, zoom: 17, timestamp: Date.now() });
    setStreetQuery(place.display_name);
    setStreetResults([]);
  };

  const handleSelectCampusJump = (uni) => {
    if (!uni) return;
    const lat = Number((uni.latitude + 0.002).toFixed(6));
    const lng = Number((uni.longitude + 0.002).toFixed(6));
    setPropCity(uni.city);
    setPropLat(lat);
    setPropLng(lng);
    setFlyToTarget({ lat, lng, zoom: 15, timestamp: Date.now() });
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
        'Upload Photo',
        'Paste an image URL or ensure expo-image-picker is installed.'
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
    setWalkMins('12');
    setTransitMins('5');
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
    setLandlordMsg({ type: '', text: '' });
    setPropTitle(prop.title || '');
    setPropDesc(prop.description || '');
    setPropAddress(prop.address || '');
    setPropCity(prop.city || 'London');
    setPropLat(prop.latitude || 51.5246);
    setPropLng(prop.longitude || -0.134);
    setWalkMins(
      prop.walkMins !== null && prop.walkMins !== undefined
        ? String(prop.walkMins)
        : '12'
    );
    setTransitMins(
      prop.transitMins !== null && prop.transitMins !== undefined
        ? String(prop.transitMins)
        : '5'
    );
    setFlyToTarget({
      lat: prop.latitude || 51.5246,
      lng: prop.longitude || -0.134,
      zoom: 17,
      timestamp: Date.now(),
    });
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
    setLandlordMsg({ type: '', text: '' });
    if (!propTitle.trim() || !propAddress.trim() || !propCity.trim()) {
      setLandlordMsg({
        type: 'error',
        text: t('landlord.errorSavingProperty'),
      });
      return;
    }
    if (propImages.length === 0) {
      setLandlordMsg({
        type: 'error',
        text: t('landlord.errorAtLeastOnePhoto'),
      });
      return;
    }

    const payload = {
      title: propTitle.trim(),
      description:
        propDesc.trim() ||
        t('landlord.defaultDescription', { city: propCity.trim() }),
      address: propAddress.trim(),
      city: propCity.trim(),
      latitude: parseFloat(propLat),
      longitude: parseFloat(propLng),
      walkMins: walkMins !== '' ? parseInt(walkMins, 10) : null,
      transitMins: transitMins !== '' ? parseInt(transitMins, 10) : null,
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
      if (!res.ok)
        throw new Error(data.error || t('landlord.errorSavingProperty'));

      setLandlordMsg({
        type: 'success',
        text: editingPropertyId
          ? t('landlord.successUpdated')
          : t('landlord.successPublished'),
      });
      resetLandlordForm();
      loadLandlordData();
      loadListings();
    } catch (err) {
      setLandlordMsg({
        type: 'error',
        text: err.message || t('landlord.errorSavingProperty'),
      });
    } finally {
      setSavingProperty(false);
    }
  };

  const handleDeleteProperty = (prop) => {
    Alert.alert(
      t('landlord.deleteBtn'),
      t('landlord.confirmDelete', { title: prop.title }),
      [
        { text: t('landlord.cancelBtn'), style: 'cancel' },
        {
          text: t('landlord.deleteBtn'),
          style: 'destructive',
          onPress: async () => {
            setDeletingPropId(prop.id);
            try {
              const res = await fetch(`${API_BASE_URL}/listings/${prop.id}`, {
                method: 'DELETE',
                headers: getHeaders(),
              });
              if (!res.ok) throw new Error(t('landlord.errorDeleteProperty'));
              if (editingPropertyId === prop.id) resetLandlordForm();
              loadLandlordData();
              loadListings();
            } catch (e) {
              Alert.alert('Error', e.message);
            } finally {
              setDeletingPropId(null);
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

  // Property Details derived data
  const detailsGallery = useMemo(() => {
    if (!selectedProperty) return FALLBACK_GALLERY;
    if (
      Array.isArray(selectedProperty.images) &&
      selectedProperty.images.length > 0
    ) {
      return selectedProperty.images;
    }
    return [FALLBACK_GALLERY[0]];
  }, [selectedProperty]);

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

  const categoryLabels = useMemo(
    () => ({
      ALL: t('details.allRoomTiers'),
      PRIVATE_ROOM: t('room.PRIVATE_ROOM'),
      EN_SUITE: t('room.EN_SUITE'),
      ENTIRE_PLACE: t('room.ENTIRE_PLACE'),
      SHARED_ROOM: t('room.SHARED_ROOM'),
    }),
    [t]
  );

  const allAmenityCheckboxes = useMemo(
    () => Array.from(new Set([...AMENITY_OPTIONS, ...selectedAmenities])),
    [selectedAmenities]
  );

  const rowDir = { flexDirection: isRTL ? 'row-reverse' : 'row' };
  const textAlign = { textAlign: isRTL ? 'right' : 'left' };
  const activeHero = heroSlides[heroIndex] || heroSlides[0];
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  // DoorTransition animated transforms
  const leftDoorTranslateX = doorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -SCREEN_WIDTH * 0.55],
  });
  const rightDoorTranslateX = doorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCREEN_WIDTH * 0.55],
  });
  const emblemScale = doorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.55],
  });
  const emblemOpacity = doorAnim.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [1, 0.3, 0],
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <StatusBar style={darkMode ? 'light' : 'dark'} />

      {/* ====================================================================
          TOP NAVBAR + MOBILE MENU DRAWER (Synced with Navbar.jsx)
         ==================================================================== */}
      <View
        style={[
          styles.navbar,
          rowDir,
          { backgroundColor: theme.card, borderBottomColor: theme.border },
        ]}
      >
        <TouchableOpacity
          style={[styles.brandRow, rowDir]}
          onPress={() => navigateWithDoors('EXPLORE')}
        >
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>U</Text>
          </View>
          <Text style={[styles.brandTitle, { color: theme.text }]}>
            UniHousing
          </Text>
        </TouchableOpacity>

        <View style={[styles.navRight, rowDir]}>
          <TouchableOpacity
            onPress={() => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))}
            style={[
              styles.toggleBtn,
              { backgroundColor: theme.subtleBg, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.toggleBtnText, { color: theme.text }]}>
              🌐 {t('toggle.language')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setDarkMode((prev) => !prev)}
            style={[
              styles.toggleBtn,
              { backgroundColor: theme.subtleBg, borderColor: theme.border },
            ]}
          >
            <Text style={styles.toggleBtnEmoji}>{darkMode ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMenuOpen((prev) => !prev)}
            style={[
              styles.toggleBtn,
              { backgroundColor: theme.subtleBg, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.toggleBtnText, { color: theme.text }]}>
              {menuOpen ? '✕' : '☰'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Collapsible Mobile Menu Drawer */}
      {menuOpen && (
        <View
          style={[
            styles.menuDrawer,
            { backgroundColor: theme.card, borderBottomColor: theme.border },
          ]}
        >
          {user && (
            <View
              style={[
                styles.menuUserBox,
                rowDir,
                { backgroundColor: theme.subtleBg },
              ]}
            >
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarCircleText}>{userInitial}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.boldText, textAlign, { color: theme.text }]}
                  numberOfLines={1}
                >
                  {user.name}
                </Text>
                <Text
                  style={[styles.cardSub, textAlign, { color: theme.subText }]}
                >
                  {t(`role.${user.role}`)}
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.menuLink,
              activeTab === 'EXPLORE' && {
                backgroundColor: theme.brandSoftBg,
              },
            ]}
            onPress={() => navigateWithDoors('EXPLORE')}
          >
            <Text
              style={[
                styles.menuLinkText,
                textAlign,
                {
                  color:
                    activeTab === 'EXPLORE' ? theme.brandText : theme.text,
                },
              ]}
            >
              {t('nav.explore')}
            </Text>
          </TouchableOpacity>

          {isStudent && (
            <TouchableOpacity
              style={[
                styles.menuLink,
                activeTab === 'STUDENT' && {
                  backgroundColor: theme.brandSoftBg,
                },
              ]}
              onPress={() => {
                loadStudentBookings();
                navigateWithDoors('STUDENT');
              }}
            >
              <Text
                style={[
                  styles.menuLinkText,
                  textAlign,
                  {
                    color:
                      activeTab === 'STUDENT' ? theme.brandText : theme.text,
                  },
                ]}
              >
                {t('nav.myBookings')}
              </Text>
            </TouchableOpacity>
          )}

          {isLandlord && (
            <TouchableOpacity
              style={[
                styles.menuLink,
                activeTab === 'LANDLORD' && {
                  backgroundColor: theme.brandSoftBg,
                },
              ]}
              onPress={() => {
                loadLandlordData();
                navigateWithDoors('LANDLORD');
              }}
            >
              <Text
                style={[
                  styles.menuLinkText,
                  textAlign,
                  {
                    color:
                      activeTab === 'LANDLORD' ? theme.brandText : theme.text,
                  },
                ]}
              >
                {t('nav.landlordDashboard')}
              </Text>
            </TouchableOpacity>
          )}

          <View
            style={[styles.menuFooter, rowDir, { borderTopColor: theme.border }]}
          >
            {user ? (
              <TouchableOpacity
                style={styles.logoutFullBtn}
                onPress={handleLogout}
              >
                <Text style={[styles.logoutText, textAlign]}>
                  {t('nav.logout')}
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={[
                    styles.outlineBtn,
                    { flex: 1, borderColor: theme.inputBorder },
                  ]}
                  onPress={() => {
                    setAuthMode('LOGIN');
                    navigateWithDoors('AUTH');
                  }}
                >
                  <Text style={[styles.outlineBtnText, { color: theme.text }]}>
                    {t('nav.login')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.brandBtn, { flex: 1 }]}
                  onPress={() => {
                    setAuthMode('REGISTER');
                    navigateWithDoors('AUTH');
                  }}
                >
                  <Text style={styles.primaryBtnText}>{t('nav.signup')}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      )}

      {/* ====================================================================
          SCREEN 1: EXPLORE (HeroSlider + Sticky FilterBar + List/Map View)
         ==================================================================== */}
      {activeTab === 'EXPLORE' && (
        <View style={styles.flex1}>
          <ScrollView ref={exploreScrollRef} style={styles.flex1}>
            {/* HERO SLIDER (Synced with HeroSlider.jsx) */}
            <View style={styles.heroContainer}>
              <Image
                source={{ uri: activeHero.image }}
                style={styles.heroBgImage}
              />
              <View style={styles.heroDarkOverlay} />

              <View style={styles.heroContent}>
                <View style={[styles.heroBadge, rowDir]}>
                  <View style={styles.heroDot} />
                  <Text style={styles.heroBadgeText}>{activeHero.badge}</Text>
                </View>

                <Text style={[styles.heroTitle, textAlign]}>
                  {activeHero.title}{' '}
                  <Text style={styles.heroHighlight}>
                    {activeHero.highlight}
                  </Text>
                </Text>

                <Text style={[styles.heroDesc, textAlign]}>
                  {activeHero.description}
                </Text>

                {/* CTA Buttons */}
                <View style={[styles.heroActions, rowDir]}>
                  <TouchableOpacity
                    style={styles.emeraldCtaBtn}
                    onPress={() => {
                      if (exploreScrollRef.current) {
                        exploreScrollRef.current.scrollTo({
                          y: explorerOffsetY,
                          animated: true,
                        });
                      }
                    }}
                  >
                    <Text style={styles.emeraldCtaText}>
                      {activeHero.cta} ↓
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.glassLandlordBtn}
                    onPress={() => {
                      if (isLandlord) {
                        loadLandlordData();
                        navigateWithDoors('LANDLORD');
                      } else {
                        setAuthMode('LOGIN');
                        navigateWithDoors('AUTH');
                      }
                    }}
                  >
                    <Text style={styles.glassLandlordText}>
                      🏢{' '}
                      {isRTL
                        ? 'هل أنت مالك؟ اعرض عقارك'
                        : 'Are you a Landlord? List Property'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Trust Metrics */}
                <View style={[styles.trustRow, rowDir]}>
                  <Text style={styles.trustItem}>
                    🛡️{' '}
                    {isRTL
                      ? 'عقارات مفحوصة وموثقة 100%'
                      : '100% Verified Listings'}
                  </Text>
                  <Text style={styles.trustItem}>
                    📍{' '}
                    {isRTL
                      ? 'حساب دقيق للمسافة من جامعتك'
                      : 'Exact Campus Distance'}
                  </Text>
                  <Text style={styles.trustItem}>
                    📶{' '}
                    {isRTL
                      ? 'شامل الإنترنت والفواتير'
                      : 'Bills & Fast Wi-Fi Included'}
                  </Text>
                </View>

                {/* Showcase Property Card inside HeroSlider */}
                <View style={styles.heroShowcaseCard}>
                  <View style={styles.heroCardImageWrap}>
                    <Image
                      source={{ uri: activeHero.image }}
                      style={styles.heroCardImg}
                    />
                    <View style={styles.heroCardTag}>
                      <Text style={styles.heroCardTagText}>
                        ✨ {activeHero.card.tag}
                      </Text>
                    </View>
                    <View style={styles.heroCardPriceBadge}>
                      <Text style={styles.heroCardPriceText}>
                        {activeHero.card.price}
                        <Text style={{ fontSize: 10, fontWeight: '500' }}>
                          {' '}
                          {activeHero.card.period}
                        </Text>
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.rowBetween, rowDir]}>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.heroCardTitle, textAlign]}
                        numberOfLines={1}
                      >
                        {activeHero.card.title}
                      </Text>
                      <Text
                        style={[styles.heroCardLoc, textAlign]}
                        numberOfLines={1}
                      >
                        🕒 {activeHero.card.location}
                      </Text>
                    </View>
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingBadgeText}>
                        ★ {activeHero.card.rating}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.heroPerksWrap}>
                    {activeHero.card.perks.map((perk, i) => (
                      <Text
                        key={i}
                        style={[styles.heroPerkItem, textAlign]}
                        numberOfLines={1}
                      >
                        ✓ {perk}
                      </Text>
                    ))}
                  </View>

                  {activeHero.propertyObj && (
                    <TouchableOpacity
                      style={styles.heroViewDetailsBtn}
                      onPress={() =>
                        openPropertyDetails(activeHero.propertyObj)
                      }
                    >
                      <Text style={styles.heroViewDetailsText}>
                        {isRTL ? 'عرض تفاصيل العقار ↗' : 'View Property Details ↗'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Slide Indicators & Controls */}
                <View style={[styles.heroBottomBar, rowDir]}>
                  <View style={[styles.heroDotsRow, rowDir]}>
                    {heroSlides.map((s, idx) => (
                      <TouchableOpacity
                        key={s.id}
                        onPress={() => setHeroIndex(idx)}
                        style={[
                          styles.heroDotPill,
                          idx === heroIndex && styles.heroDotPillActive,
                        ]}
                      />
                    ))}
                    <Text style={styles.heroCounterText}>
                      0{heroIndex + 1} / 0{heroSlides.length}
                    </Text>
                  </View>

                  <View style={[styles.heroArrowsRow, rowDir]}>
                    <TouchableOpacity
                      style={styles.heroArrowBtn}
                      onPress={() =>
                        setHeroIndex((prev) =>
                          prev === 0 ? heroSlides.length - 1 : prev - 1
                        )
                      }
                    >
                      <Text style={styles.heroArrowText}>
                        {isRTL ? '›' : '‹'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.heroArrowBtn}
                      onPress={() =>
                        setHeroIndex((prev) =>
                          prev === heroSlides.length - 1 ? 0 : prev + 1
                        )
                      }
                    >
                      <Text style={styles.heroArrowText}>
                        {isRTL ? '‹' : '›'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* FILTER BAR SECTION (Synced with FilterBar.jsx) */}
            <View
              onLayout={(e) => setExplorerOffsetY(e.nativeEvent.layout.y)}
              style={[
                styles.filterBarWrap,
                {
                  backgroundColor: theme.card,
                  borderBottomColor: theme.border,
                },
              ]}
            >
              {/* University Selector */}
              <View style={[styles.rowBetween, rowDir]}>
                <Text style={[styles.sectionLabel, { color: theme.subText }]}>
                  📍 {t('filter.university')}
                </Text>
                <TouchableOpacity onPress={() => setUniModalOpen(true)}>
                  <Text style={[styles.linkText, { color: theme.brandText }]}>
                    {t('filter.addCampus')}
                  </Text>
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
                          backgroundColor: theme.subtleBg,
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
                        🎓 {uni.name} ({uni.city})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Room Type Filter Pills */}
              <Text
                style={[
                  styles.sectionLabel,
                  textAlign,
                  { color: theme.subText, marginTop: 6 },
                ]}
              >
                🏠 {t('filter.roomType')}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 6 }}
              >
                {[
                  { key: '', label: t('filter.allRoomTypes') },
                  { key: 'PRIVATE_ROOM', label: t('room.PRIVATE_ROOM') },
                  { key: 'SHARED_ROOM', label: t('room.SHARED_ROOM') },
                  { key: 'ENTIRE_PLACE', label: t('room.ENTIRE_PLACE') },
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

              {/* Max Budget Presets ([1000, 2500, 3000, 5000]) */}
              <Text
                style={[
                  styles.sectionLabel,
                  textAlign,
                  { color: theme.subText, marginTop: 10 },
                ]}
              >
                💷 {t('filter.maxBudget')}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 6 }}
              >
                {[
                  { val: '', label: t('filter.anyPrice') },
                  { val: '1000', label: t('filter.upTo', { price: 1000 }) },
                  { val: '2500', label: t('filter.upTo', { price: 2500 }) },
                  { val: '3000', label: t('filter.upTo', { price: 3000 }) },
                  { val: '5000', label: t('filter.upTo', { price: 5000 }) },
                ].map((b) => (
                  <TouchableOpacity
                    key={b.val}
                    onPress={() => setMaxPrice(b.val)}
                    style={[
                      styles.catChip,
                      { backgroundColor: theme.subtleBg },
                      maxPrice === b.val && styles.catChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.catChipText,
                        { color: theme.bodyText },
                        maxPrice === b.val && styles.catChipTextActive,
                      ]}
                    >
                      {b.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Max Distance Controls (1 - 20 km) & Total Found */}
              <View style={[styles.rowBetween, rowDir, { marginTop: 10 }]}>
                <Text style={[styles.sectionLabel, { color: theme.subText }]}>
                  🧭 {t('filter.maxDistance', { km: maxDistanceKm })}
                </Text>
                <Text
                  style={[styles.showingCountText, { color: theme.bodyText }]}
                >
                  {t('filter.showing', { n: listings.length })}
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 6 }}
              >
                {[2, 5, 10, 15, 20].map((km) => (
                  <TouchableOpacity
                    key={km}
                    onPress={() => setMaxDistanceKm(km)}
                    style={[
                      styles.catChip,
                      { backgroundColor: theme.subtleBg },
                      Number(maxDistanceKm) === km && styles.catChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.catChipText,
                        { color: theme.bodyText },
                        Number(maxDistanceKm) === km &&
                          styles.catChipTextActive,
                      ]}
                    >
                      {km} km
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* MAIN CONTENT: MAP VIEW OR LIST VIEW */}
            {mobileView === 'map' ? (
              <View
                style={[styles.fullMapContainer, { borderColor: theme.border }]}
              >
                <LeafletMap
                  mode="explore"
                  centerLat={selectedUni?.latitude || 30.0444}
                  centerLng={selectedUni?.longitude || 31.2357}
                  zoom={14}
                  darkMode={darkMode}
                  university={selectedUni}
                  listings={listings}
                  onSelectPropertyBook={(propId) => {
                    const found = listings.find((item) => item.id === propId);
                    if (found) openQuickBookingModal(found);
                  }}
                />
              </View>
            ) : (
              <View style={[styles.sectionPad, { paddingBottom: 76 }]}>
                <Text
                  style={[
                    styles.homeHeading,
                    textAlign,
                    { color: theme.text },
                  ]}
                >
                  {t('home.title', {
                    name: selectedUni?.name || t('home.campusFallback'),
                  })}
                </Text>
                <Text
                  style={[
                    styles.cardSub,
                    textAlign,
                    { color: theme.subText, marginBottom: 14 },
                  ]}
                >
                  {t('home.subtitle')}
                </Text>

                {loadingListings ? (
                  <View style={styles.emptyCard}>
                    <ActivityIndicator size="large" color={theme.brand} />
                    <Text
                      style={[
                        styles.cardSub,
                        { color: theme.subText, marginTop: 8 },
                      ]}
                    >
                      {t('home.mapLoading')}
                    </Text>
                  </View>
                ) : listings.length === 0 ? (
                  <View
                    style={[
                      styles.panel,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                        alignItems: 'center',
                        paddingVertical: 32,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.panelTitle,
                        { color: theme.text, textAlign: 'center' },
                      ]}
                    >
                      {t('home.emptyTitle')}
                    </Text>
                    <Text
                      style={[
                        styles.cardSub,
                        {
                          color: theme.subText,
                          marginTop: 4,
                          textAlign: 'center',
                        },
                      ]}
                    >
                      {t('home.emptyHint')}
                    </Text>
                  </View>
                ) : (
                  listings.map((prop) => {
                    const walkTime =
                      prop.commute?.walkMins ?? prop.walkMins ?? 10;
                    const transitTime =
                      prop.commute?.transitMins ?? prop.transitMins ?? 5;
                    const rooms = prop.rooms || [];

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
                        <TouchableOpacity
                          onPress={() => openPropertyDetails(prop)}
                        >
                          <Image
                            source={{
                              uri: prop.images?.[0] || DEFAULT_COVER_IMAGE,
                            }}
                            style={styles.cardImage}
                          />
                          {prop.distanceToUniKm !== undefined && (
                            <View
                              style={[
                                styles.distanceOverlay,
                                isRTL ? { right: 12 } : { left: 12 },
                              ]}
                            >
                              <Text style={styles.distanceOverlayText}>
                                {t('card.distance', {
                                  km: prop.distanceToUniKm,
                                })}
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
                                <Text
                                  style={[
                                    styles.fromLabel,
                                    { color: theme.subText },
                                  ]}
                                >
                                  {t('card.from')}
                                </Text>
                                <Text
                                  style={[
                                    styles.priceText,
                                    { color: theme.brandText },
                                  ]}
                                >
                                  £{prop.startingPrice}
                                  <Text
                                    style={[
                                      styles.perMoText,
                                      { color: theme.subText },
                                    ]}
                                  >
                                    {' '}
                                    {t('card.perMonth')}
                                  </Text>
                                </Text>
                              </View>
                            )}
                          </View>

                          {/* Commute Row */}
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
                              🚶 {t('card.walk', { n: walkTime })}
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
                              🚇 {t('card.transit', { n: transitTime })}
                            </Text>
                            {selectedUni?.name && (
                              <Text
                                style={[
                                  styles.toUniText,
                                  { color: theme.subText },
                                ]}
                                numberOfLines={1}
                              >
                                {t('card.toUni', { name: selectedUni.name })}
                              </Text>
                            )}
                          </View>

                          {/* Amenities */}
                          {prop.amenities?.length > 0 && (
                            <View style={[styles.amenityWrap, rowDir]}>
                              {prop.amenities.slice(0, 4).map((am, i) => (
                                <View
                                  key={i}
                                  style={[
                                    styles.amenityTag,
                                    { backgroundColor: theme.brandSoftBg },
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.amenityTagText,
                                      { color: theme.brandText },
                                    ]}
                                  >
                                    {translateAmenity(am)}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          )}

                          {/* Card Footer */}
                          <View
                            style={[
                              styles.cardFooter,
                              rowDir,
                              { borderTopColor: theme.border },
                            ]}
                          >
                            <Text
                              style={[
                                styles.cardSub,
                                { color: theme.subText },
                              ]}
                            >
                              {t('card.roomTiers', { n: rooms.length })}
                            </Text>

                            <View style={[rowDir, { gap: 8 }]}>
                              <TouchableOpacity
                                style={[
                                  styles.outlineBtn,
                                  { borderColor: theme.border },
                                ]}
                                onPress={() => openPropertyDetails(prop)}
                              >
                                <Text
                                  style={[
                                    styles.outlineBtnText,
                                    { color: theme.text },
                                  ]}
                                >
                                  {t('card.viewDetails')}
                                </Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={styles.emeraldBtnSmall}
                                onPress={() => openQuickBookingModal(prop)}
                              >
                                <Text style={styles.primaryBtnText}>
                                  {t('card.book')}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}
          </ScrollView>

          {/* FLOATING MAP / LIST TOGGLE PILL (Synced with page.js) */}
          <View style={styles.floatingToggleWrap} pointerEvents="box-none">
            <TouchableOpacity
              style={[styles.floatingToggleBtn, rowDir]}
              onPress={() =>
                setMobileView((prev) => (prev === 'map' ? 'list' : 'map'))
              }
            >
              <Text style={styles.floatingToggleText}>
                {mobileView === 'map'
                  ? `📋 ${t('home.showList')}`
                  : `🗺️ ${t('home.showMap')}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ====================================================================
          SCREEN 2: PROPERTY DETAILS & LEASE CALCULATOR (properties/[id]/page.js)
         ==================================================================== */}
      {activeTab === 'DETAILS' && selectedProperty && (
        <ScrollView style={styles.flex1}>
          <View style={styles.sectionPad}>
            <TouchableOpacity onPress={() => navigateWithDoors('EXPLORE')}>
              <Text
                style={[styles.linkText, textAlign, { color: theme.brandText }]}
              >
                {t('details.backToSearch')}
              </Text>
            </TouchableOpacity>

            {/* City & Distance Badges */}
            <View style={[styles.commuteRow, rowDir, { marginTop: 10 }]}>
              <View
                style={[
                  styles.cityPill,
                  { backgroundColor: theme.brandSoftBg },
                ]}
              >
                <Text style={[styles.cityPillText, { color: theme.brandText }]}>
                  {selectedProperty.city}
                </Text>
              </View>
              {selectedProperty.distanceToUniKm !== undefined && (
                <View
                  style={[
                    styles.cityPill,
                    { backgroundColor: theme.subtleBg },
                  ]}
                >
                  <Text
                    style={[styles.cityPillText, { color: theme.bodyText }]}
                  >
                    📍 {selectedProperty.distanceToUniKm} km from{' '}
                    {selectedProperty.primaryUniversity?.name || 'Campus'}
                  </Text>
                </View>
              )}
            </View>

            <View
              style={[
                styles.rowBetween,
                rowDir,
                { marginTop: 8, alignItems: 'flex-end' },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.detailTitle,
                    textAlign,
                    { color: theme.text },
                  ]}
                >
                  {selectedProperty.title}
                </Text>
                <Text
                  style={[styles.cardSub, textAlign, { color: theme.subText }]}
                >
                  {selectedProperty.address}, {selectedProperty.city}
                </Text>
              </View>

              {selectedProperty.startingPrice && (
                <View
                  style={[
                    styles.startingPriceBox,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text style={[styles.fromLabel, { color: theme.subText }]}>
                    {t('details.startingFrom')}
                  </Text>
                  <Text style={[styles.priceText, { color: theme.brandText }]}>
                    £{selectedProperty.startingPrice}
                    <Text style={[styles.perMoText, { color: theme.subText }]}>
                      {' '}
                      {t('card.perMonth')}
                    </Text>
                  </Text>
                </View>
              )}
            </View>

            {loadingDetails && (
              <ActivityIndicator
                size="small"
                color={theme.brand}
                style={{ marginVertical: 8 }}
              />
            )}

            {/* 1. Multi-Photo Gallery */}
            <View style={styles.detailHeroWrap}>
              <Image
                source={{
                  uri:
                    detailsGallery[activePhotoIdx] ||
                    detailsGallery[0] ||
                    DEFAULT_COVER_IMAGE,
                }}
                style={styles.detailHeroImage}
              />
              <View style={styles.photoCountBadge}>
                <Text style={styles.photoCountText}>
                  {t('details.photoCount', {
                    current: activePhotoIdx + 1,
                    total: detailsGallery.length,
                  })}
                </Text>
              </View>
            </View>

            {detailsGallery.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 10 }}
              >
                {detailsGallery.map((imgUrl, idx) => (
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

            {/* Overview, Commute Estimate & Amenities */}
            <View
              style={[
                styles.panel,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text
                style={[styles.panelTitle, textAlign, { color: theme.text }]}
              >
                {t('details.aboutTitle')}
              </Text>
              <Text
                style={[styles.bodyText, textAlign, { color: theme.bodyText }]}
              >
                {selectedProperty.description}
              </Text>

              {selectedProperty.commute && (
                <View
                  style={[
                    styles.commuteSummaryBox,
                    rowDir,
                    {
                      backgroundColor: theme.subtleBg,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.sectionLabel,
                        textAlign,
                        { color: theme.subText },
                      ]}
                    >
                      {t('details.commuteEstimate')}
                    </Text>
                    <Text
                      style={[
                        styles.boldText,
                        textAlign,
                        { color: theme.text, marginTop: 2 },
                      ]}
                    >
                      {selectedProperty.primaryUniversity?.name ||
                        `${selectedProperty.city} University`}
                    </Text>
                  </View>
                  <View style={[rowDir, { gap: 8 }]}>
                    <Text
                      style={[
                        styles.commuteBadge,
                        {
                          backgroundColor: theme.card,
                          color: theme.bodyText,
                        },
                      ]}
                    >
                      🚶 {selectedProperty.commute.walkMins}m
                    </Text>
                    <Text
                      style={[
                        styles.commuteBadge,
                        {
                          backgroundColor: theme.card,
                          color: theme.bodyText,
                        },
                      ]}
                    >
                      🚇 {selectedProperty.commute.transitMins}m
                    </Text>
                  </View>
                </View>
              )}

              {selectedProperty.amenities?.length > 0 && (
                <View style={{ marginTop: 14 }}>
                  <Text
                    style={[
                      styles.sectionLabel,
                      textAlign,
                      { color: theme.subText },
                    ]}
                  >
                    {t('details.includedAmenities')}
                  </Text>
                  <View style={[styles.amenityWrap, rowDir]}>
                    {selectedProperty.amenities.map((item, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.amenityTag,
                          { backgroundColor: theme.subtleBg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.amenityTagText,
                            { color: theme.bodyText },
                          ]}
                        >
                          <Text style={{ color: theme.brandText }}>✓ </Text>
                          {translateAmenity(item)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* 2. Breakdown of Available Room Tiers */}
            <View
              style={[
                styles.panel,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text
                style={[styles.panelTitle, textAlign, { color: theme.text }]}
              >
                {t('details.availableRoomTiers', { n: detailsRooms.length })}
              </Text>
              <Text
                style={[styles.cardSub, textAlign, { color: theme.subText }]}
              >
                {t('details.selectRoomSub')}
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginVertical: 10 }}
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
                const availDate = room.availableFrom
                  ? new Date(room.availableFrom).toLocaleDateString()
                  : '2026-09-01';
                const isAvail = room.isAvailable !== false;

                return (
                  <TouchableOpacity
                    key={room.id}
                    onPress={() => setCalcRoomId(room.id)}
                    style={[
                      styles.roomTierBox,
                      rowDir,
                      { borderColor: theme.border },
                      isSelected && {
                        borderColor: theme.brand,
                        backgroundColor: theme.brandSoftBg,
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <View
                        style={[
                          rowDir,
                          { alignItems: 'center', gap: 6, flexWrap: 'wrap' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.roomTierName,
                            textAlign,
                            { color: theme.text },
                          ]}
                        >
                          {room.name}
                        </Text>
                        <View
                          style={[
                            styles.roomCatBadge,
                            { backgroundColor: theme.subtleBg },
                          ]}
                        >
                          <Text
                            style={[
                              styles.roomCatBadgeText,
                              { color: theme.brandText },
                            ]}
                          >
                            {categoryLabels[room.category] || room.category}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={[
                          rowDir,
                          { gap: 10, marginTop: 6, flexWrap: 'wrap' },
                        ]}
                      >
                        <Text
                          style={[styles.cardSub, { color: theme.subText }]}
                        >
                          📐 {room.sizeSqm || 18} m²
                        </Text>
                        <Text
                          style={[styles.cardSub, { color: theme.subText }]}
                        >
                          📅 {t('details.availableFrom')} {availDate}
                        </Text>
                        <Text
                          style={[
                            styles.cardSub,
                            { color: '#10B981', fontWeight: '700' },
                          ]}
                        >
                          ●{' '}
                          {isAvail
                            ? t('details.availableNow')
                            : t('details.waitlist')}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={{
                        alignItems: isRTL ? 'flex-start' : 'flex-end',
                      }}
                    >
                      <Text
                        style={[styles.priceText, { color: theme.brandText }]}
                      >
                        £{room.pricePerMonth}
                        <Text
                          style={[styles.perMoText, { color: theme.subText }]}
                        >
                          {' '}
                          {t('card.perMonth')}
                        </Text>
                      </Text>
                      <TouchableOpacity
                        style={[styles.brandBtnSmall, { marginTop: 6 }]}
                        onPress={() =>
                          openQuickBookingModal(
                            selectedProperty,
                            room.id,
                            calcMonths
                          )
                        }
                      >
                        <Text style={styles.primaryBtnText}>
                          {t('card.book')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 3. Total Lease Cost Calculator */}
            <View
              style={[
                styles.panel,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <View style={[styles.rowBetween, rowDir]}>
                <Text style={[styles.panelTitle, { color: theme.text }]}>
                  {t('details.calculatorTitle')}
                </Text>
                <View style={styles.noFeeBadge}>
                  <Text style={styles.noFeeBadgeText}>
                    {t('details.noBookingFees')}
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  styles.sectionLabel,
                  textAlign,
                  { marginTop: 12, color: theme.subText },
                ]}
              >
                {t('details.selectedRoomTier')}: {selectedCalcRoom?.name || 'N/A'}
              </Text>

              <View style={[styles.rowBetween, rowDir, { marginTop: 12 }]}>
                <Text style={[styles.sectionLabel, { color: theme.subText }]}>
                  {t('details.leaseDuration')}
                </Text>
                <View style={[rowDir, { alignItems: 'center', gap: 10 }]}>
                  <TouchableOpacity
                    style={[
                      styles.stepBtn,
                      { borderColor: theme.inputBorder },
                    ]}
                    onPress={() =>
                      setCalcMonths((m) => Math.max(1, Number(m) - 1))
                    }
                  >
                    <Text style={{ color: theme.text, fontWeight: '800' }}>
                      −
                    </Text>
                  </TouchableOpacity>
                  <Text style={[styles.boldText, { color: theme.brandText }]}>
                    {calcMonths}{' '}
                    {calcMonths === 1
                      ? t('details.month')
                      : t('details.months')}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.stepBtn,
                      { borderColor: theme.inputBorder },
                    ]}
                    onPress={() =>
                      setCalcMonths((m) => Math.min(24, Number(m) + 1))
                    }
                  >
                    <Text style={{ color: theme.text, fontWeight: '800' }}>
                      +
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

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
                      {m} {t('details.mosShort')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View
                style={[styles.calcSummary, { borderTopColor: theme.border }]}
              >
                <View style={[styles.rowBetween, rowDir]}>
                  <Text style={[styles.bodyText, { color: theme.bodyText }]}>
                    {t('details.monthlyRent')}
                  </Text>
                  <Text style={[styles.boldText, { color: theme.text }]}>
                    £{calcMonthlyRent.toLocaleString()} {t('card.perMonth')}
                  </Text>
                </View>

                <View style={[styles.rowBetween, rowDir]}>
                  <Text style={[styles.bodyText, { color: theme.bodyText }]}>
                    {t('details.leaseSubtotal', {
                      rent: calcMonthlyRent.toLocaleString(),
                      months: calcMonths,
                    })}
                  </Text>
                  <Text style={[styles.boldText, { color: theme.text }]}>
                    £{calcSubtotal.toLocaleString()}
                  </Text>
                </View>

                <View style={[styles.rowBetween, rowDir]}>
                  <Text style={[styles.bodyText, { color: theme.bodyText }]}>
                    {t('details.securityDeposit')}
                  </Text>
                  <Text style={[styles.boldText, { color: theme.text }]}>
                    £{calcDeposit.toLocaleString()}
                  </Text>
                </View>

                <View style={[styles.rowBetween, rowDir]}>
                  <Text style={[styles.bodyText, { color: theme.bodyText }]}>
                    {t('details.serviceFee')}
                  </Text>
                  <Text style={[styles.boldText, { color: '#10B981' }]}>
                    {t('details.freeFee')}
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
                    {t('details.totalEstimatedLease')}
                  </Text>
                  <Text style={[styles.priceText, { color: theme.brandText }]}>
                    £{calcGrandTotal.toLocaleString()}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.brandBtn, { marginTop: 12 }]}
                onPress={() =>
                  openQuickBookingModal(
                    selectedProperty,
                    selectedCalcRoom?.id,
                    calcMonths
                  )
                }
              >
                <Text style={styles.primaryBtnText}>
                  {t('details.bookRoomMonths', { months: calcMonths })}
                </Text>
              </TouchableOpacity>

              {selectedProperty.landlord && (
                <View
                  style={{
                    marginTop: 12,
                    paddingTop: 10,
                    borderTopWidth: 1,
                    borderTopColor: theme.border,
                  }}
                >
                  <Text
                    style={[styles.boldText, textAlign, { color: theme.text }]}
                  >
                    {t('details.managedBy', {
                      name: selectedProperty.landlord.name,
                    })}
                  </Text>
                  <Text
                    style={[
                      styles.cardSub,
                      textAlign,
                      { color: theme.subText },
                    ]}
                  >
                    {selectedProperty.landlord.email}
                  </Text>
                </View>
              )}
            </View>

            {/* 4. Interactive Neighborhood Map & Nearby Universities */}
            <View
              style={[
                styles.panel,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text
                style={[styles.panelTitle, textAlign, { color: theme.text }]}
              >
                {t('details.neighborhoodMapTitle')}
              </Text>
              <Text
                style={[styles.cardSub, textAlign, { color: theme.subText }]}
              >
                {t('details.neighborhoodMapSub', {
                  title: selectedProperty.title,
                  city: selectedProperty.city,
                })}
              </Text>
              <View
                style={[
                  styles.mapContainer,
                  {
                    height: 240,
                    marginTop: 10,
                    borderRadius: 12,
                    borderColor: theme.border,
                  },
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

              {selectedProperty.nearbyUniversities?.length > 0 && (
                <View style={{ marginTop: 10, gap: 8 }}>
                  {selectedProperty.nearbyUniversities.map((uni) => (
                    <View
                      key={uni.id}
                      style={[
                        styles.commuteSummaryBox,
                        rowDir,
                        {
                          marginTop: 0,
                          backgroundColor: theme.subtleBg,
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.boldText,
                            textAlign,
                            { color: theme.text },
                          ]}
                        >
                          {uni.name}
                        </Text>
                        <Text
                          style={[
                            styles.cardSub,
                            textAlign,
                            { color: theme.subText },
                          ]}
                        >
                          {uni.distanceToUniKm} {t('details.kmAway')}
                        </Text>
                      </View>
                      <View
                        style={{
                          alignItems: isRTL ? 'flex-start' : 'flex-end',
                        }}
                      >
                        <Text
                          style={[styles.cardSub, { color: theme.bodyText }]}
                        >
                          🚶 {uni.commute?.walkMins}m
                        </Text>
                        <Text
                          style={[styles.cardSub, { color: theme.bodyText }]}
                        >
                          🚇 {uni.commute?.transitMins}m
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      )}

      {/* ====================================================================
          SCREEN 3: STUDENT DASHBOARD (Synced with student/page.js + Unbook)
         ==================================================================== */}
      {activeTab === 'STUDENT' && (
        <ScrollView style={styles.flex1}>
          <View style={styles.sectionPad}>
            {!user || !isStudent ? (
              <View
                style={[
                  styles.panel,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    alignItems: 'center',
                    paddingVertical: 28,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.detailTitle,
                    { color: theme.text, textAlign: 'center' },
                  ]}
                >
                  {t('student.accessOnlyTitle')}
                </Text>
                <Text
                  style={[
                    styles.bodyText,
                    {
                      color: theme.subText,
                      textAlign: 'center',
                      marginVertical: 10,
                    },
                  ]}
                >
                  {t('student.accessOnlySub')}
                </Text>
                <TouchableOpacity
                  style={[styles.brandBtn, { paddingHorizontal: 24 }]}
                  onPress={() => {
                    setAuthMode('LOGIN');
                    navigateWithDoors('AUTH');
                  }}
                >
                  <Text style={styles.primaryBtnText}>
                    {t('student.goToLogin')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={[styles.rowBetween, rowDir, { marginBottom: 14 }]}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.detailTitle,
                        textAlign,
                        { color: theme.text },
                      ]}
                    >
                      {t('student.welcome', { name: user.name })}
                    </Text>
                    <Text
                      style={[
                        styles.cardSub,
                        textAlign,
                        { color: theme.subText },
                      ]}
                    >
                      {user.email} • {t('student.accountBadge')}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.brandBtnSmall}
                    onPress={() => navigateWithDoors('EXPLORE')}
                  >
                    <Text style={styles.primaryBtnText}>
                      {t('student.browseMoreRooms')}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text
                  style={[
                    styles.panelTitle,
                    textAlign,
                    { color: theme.text, marginBottom: 8 },
                  ]}
                >
                  {t('student.myBookingRequests')}
                </Text>

                {studentBookings.length === 0 ? (
                  <View
                    style={[
                      styles.panel,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.bodyText,
                        textAlign,
                        { color: theme.subText },
                      ]}
                    >
                      {t('student.noBookingsYet')}
                    </Text>
                  </View>
                ) : (
                  studentBookings.map((b) => {
                    const statusBg =
                      b.status === 'APPROVED'
                        ? '#d1fae5'
                        : b.status === 'REJECTED'
                        ? '#fee2e2'
                        : '#fef3c7';
                    const statusColor =
                      b.status === 'APPROVED'
                        ? '#065f46'
                        : b.status === 'REJECTED'
                        ? '#991b1b'
                        : '#92400e';

                    return (
                      <View
                        key={b.id}
                        style={[
                          styles.panel,
                          {
                            backgroundColor: theme.card,
                            borderColor: theme.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.roomTierName,
                            textAlign,
                            { color: theme.text },
                          ]}
                        >
                          {b.roomType?.property?.title ||
                            t('student.propertyFallback')}
                        </Text>
                        <Text
                          style={[
                            styles.bodyText,
                            textAlign,
                            { color: theme.bodyText },
                          ]}
                        >
                          {t('student.roomLabel')} {b.roomType?.name} • $
                          {b.roomType?.pricePerMonth}
                          {t('student.perMonthShort')}
                        </Text>
                        <Text
                          style={[
                            styles.cardSub,
                            textAlign,
                            { color: theme.subText },
                          ]}
                        >
                          {t('student.moveInLabel')}{' '}
                          {new Date(b.moveInDate).toLocaleDateString()} •{' '}
                          {t('student.leaseLabel')} {b.durationMonths}{' '}
                          {t('student.monthsUnit')}
                        </Text>

                        <View
                          style={[
                            styles.rowBetween,
                            rowDir,
                            { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.border },
                          ]}
                        >
                          <View
                            style={[
                              styles.statusBadge,
                              { backgroundColor: statusBg },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusBadgeText,
                                { color: statusColor },
                              ]}
                            >
                              {t(`student.status.${b.status}`)}
                            </Text>
                          </View>

                          <TouchableOpacity
                            style={styles.unbookBtn}
                            disabled={cancellingId === b.id}
                            onPress={() => handleUnbook(b)}
                          >
                            <Text style={styles.unbookBtnText}>
                              {cancellingId === b.id
                                ? t('student.unbookingBtn')
                                : t('student.unbookBtn')}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}
              </>
            )}
          </View>
        </ScrollView>
      )}

      {/* ====================================================================
          SCREEN 4: LANDLORD PORTAL (Synced with landlord/page.js)
         ==================================================================== */}
      {activeTab === 'LANDLORD' && (
        <ScrollView ref={landlordScrollRef} style={styles.flex1}>
          <View style={styles.sectionPad}>
            {!user || !isLandlord ? (
              <View
                style={[
                  styles.panel,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    alignItems: 'center',
                    paddingVertical: 28,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.detailTitle,
                    { color: theme.text, textAlign: 'center' },
                  ]}
                >
                  {t('landlord.accountRequiredTitle')}
                </Text>
                <Text
                  style={[
                    styles.bodyText,
                    {
                      color: theme.subText,
                      textAlign: 'center',
                      marginVertical: 10,
                    },
                  ]}
                >
                  {user
                    ? t('landlord.accountRequiredSignedIn', { name: user.name })
                    : t('landlord.accountRequiredGuest')}
                </Text>
                <View style={[rowDir, { gap: 10, marginTop: 6 }]}>
                  <TouchableOpacity
                    style={[styles.brandBtn, { paddingHorizontal: 18 }]}
                    onPress={() => {
                      setAuthMode('LOGIN');
                      navigateWithDoors('AUTH');
                    }}
                  >
                    <Text style={styles.primaryBtnText}>
                      {t('landlord.signInAsLandlord')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.outlineBtn,
                      { borderColor: theme.inputBorder, paddingHorizontal: 18 },
                    ]}
                    onPress={() => {
                      setAuthMode('REGISTER');
                      setAuthRole('LANDLORD');
                      navigateWithDoors('AUTH');
                    }}
                  >
                    <Text style={[styles.outlineBtnText, { color: theme.text }]}>
                      {t('landlord.registerLandlord')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                {/* Portal Header */}
                <View style={[styles.rowBetween, rowDir, { marginBottom: 10 }]}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.detailTitle,
                        textAlign,
                        { color: theme.text },
                      ]}
                    >
                      {t('landlord.portalTitle')}
                    </Text>
                    <Text
                      style={[
                        styles.cardSub,
                        textAlign,
                        { color: theme.subText },
                      ]}
                    >
                      {t('landlord.signedInAs')} {user.name} ({user.email})
                    </Text>
                  </View>
                  <View style={styles.verifiedLandlordPill}>
                    <Text style={styles.verifiedLandlordText}>
                      {t('landlord.verifiedLandlord')}
                    </Text>
                  </View>
                </View>

                {/* Publish / Edit Property Studio */}
                <View
                  style={[
                    styles.panel,
                    {
                      backgroundColor: theme.card,
                      borderColor: editingPropertyId ? '#f59e0b' : theme.border,
                      borderWidth: editingPropertyId ? 2 : 1,
                    },
                  ]}
                >
                  <View style={[styles.rowBetween, rowDir]}>
                    <Text style={[styles.panelTitle, { color: theme.text }]}>
                      {editingPropertyId
                        ? t('landlord.editPropertyTitle')
                        : t('landlord.publishPropertyTitle')}
                    </Text>
                    {editingPropertyId && (
                      <TouchableOpacity onPress={resetLandlordForm}>
                        <Text style={styles.logoutText}>
                          {t('landlord.cancelEdit')}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.cardSub,
                      textAlign,
                      { color: theme.subText, marginTop: 4 },
                    ]}
                  >
                    {editingPropertyId
                      ? t('landlord.editPropertySub')
                      : t('landlord.publishPropertySub')}
                  </Text>

                  {/* Title & City */}
                  <Text
                    style={[
                      styles.inputLabel,
                      textAlign,
                      { color: theme.subText },
                    ]}
                  >
                    {t('landlord.propertyTitleLabel')}
                  </Text>
                  <TextInput
                    value={propTitle}
                    onChangeText={setPropTitle}
                    placeholder={t('landlord.propertyTitlePlaceholder')}
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
                        {t('landlord.streetAddressLabel')}
                      </Text>
                      <TextInput
                        value={propAddress}
                        onChangeText={setPropAddress}
                        placeholder={t('landlord.streetAddressPlaceholder')}
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
                        {t('landlord.cityLabel')}
                      </Text>
                      <TextInput
                        value={propCity}
                        onChangeText={setPropCity}
                        placeholder={t('landlord.cityPlaceholder')}
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

                  {/* Walk & Transit Commute Time Inputs */}
                  <View
                    style={[
                      styles.commuteInputsBox,
                      rowDir,
                      {
                        backgroundColor: theme.subtleBg,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.inputLabel,
                          textAlign,
                          { color: theme.text, marginTop: 0 },
                        ]}
                      >
                        {t('landlord.walkingTimeLabel')}
                      </Text>
                      <TextInput
                        value={walkMins}
                        onChangeText={setWalkMins}
                        keyboardType="numeric"
                        placeholder={t('landlord.walkingTimePlaceholder')}
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
                          { color: theme.text, marginTop: 0 },
                        ]}
                      >
                        {t('landlord.transitTimeLabel')}
                      </Text>
                      <TextInput
                        value={transitMins}
                        onChangeText={setTransitMins}
                        keyboardType="numeric"
                        placeholder={t('landlord.transitTimePlaceholder')}
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

                  {/* Description */}
                  <Text
                    style={[
                      styles.inputLabel,
                      textAlign,
                      { color: theme.subText },
                    ]}
                  >
                    {t('landlord.descriptionLabel')}
                  </Text>
                  <TextInput
                    value={propDesc}
                    onChangeText={setPropDesc}
                    placeholder={t('landlord.descriptionPlaceholder')}
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

                  {/* Street Search + Jump Near University */}
                  <Text
                    style={[
                      styles.sectionLabel,
                      textAlign,
                      { marginTop: 14, color: theme.subText },
                    ]}
                  >
                    {t('landlord.searchStreetLabel')}
                  </Text>
                  <Text
                    style={[
                      styles.cardSub,
                      textAlign,
                      { color: theme.subText },
                    ]}
                  >
                    {t('landlord.searchStreetSub')}
                  </Text>

                  {universities.length > 0 && (
                    <View style={{ marginTop: 8 }}>
                      <Text
                        style={[
                          styles.cardSub,
                          textAlign,
                          { color: theme.brandText, fontWeight: '700' },
                        ]}
                      >
                        {t('landlord.jumpNearUni')}
                      </Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ marginTop: 4 }}
                      >
                        {universities.map((u) => (
                          <TouchableOpacity
                            key={u.id}
                            onPress={() => handleSelectCampusJump(u)}
                            style={[
                              styles.catChip,
                              { backgroundColor: theme.subtleBg },
                            ]}
                          >
                            <Text
                              style={[
                                styles.catChipText,
                                { color: theme.bodyText },
                              ]}
                            >
                              🎯 {u.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  <View style={[styles.filterRow, rowDir, { marginTop: 8 }]}>
                    <TextInput
                      value={streetQuery}
                      onChangeText={setStreetQuery}
                      placeholder={t('landlord.streetSearchPlaceholder')}
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
                    {streetQuery !== '' && (
                      <TouchableOpacity
                        style={[
                          styles.outlineBtn,
                          { borderColor: theme.inputBorder },
                        ]}
                        onPress={() => {
                          setStreetQuery('');
                          setStreetResults([]);
                        }}
                      >
                        <Text
                          style={[
                            styles.outlineBtnText,
                            { color: theme.bodyText },
                          ]}
                        >
                          {t('landlord.clear')}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {searchingStreet && (
                    <Text
                      style={[
                        styles.cardSub,
                        textAlign,
                        { color: theme.brandText, marginTop: 4 },
                      ]}
                    >
                      {t('landlord.searching')}
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
                        style={[
                          styles.boldText,
                          textAlign,
                          { color: theme.text },
                        ]}
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

                  {/* Interactive Location Picker Map */}
                  <View
                    style={[
                      styles.mapContainer,
                      {
                        height: 230,
                        marginTop: 10,
                        borderRadius: 12,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <LeafletMap
                      mode="picker"
                      centerLat={propLat}
                      centerLng={propLng}
                      pickerLat={propLat}
                      pickerLng={propLng}
                      flyToTarget={flyToTarget}
                      zoom={15}
                      darkMode={darkMode}
                      onLocationPick={(lat, lng) => {
                        setPropLat(lat);
                        setPropLng(lng);
                      }}
                    />
                  </View>

                  {/* Amenities Checkboxes */}
                  <View style={[styles.rowBetween, rowDir, { marginTop: 14 }]}>
                    <Text
                      style={[styles.sectionLabel, { color: theme.subText }]}
                    >
                      {t('landlord.amenitiesLabel', {
                        count: selectedAmenities.length,
                      })}
                    </Text>
                    {selectedAmenities.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setSelectedAmenities([])}
                      >
                        <Text style={styles.logoutText}>
                          {t('landlord.clearAll')}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

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
                            checked && {
                              backgroundColor: theme.brandSoftBg,
                              borderColor: theme.brand,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.checkboxPillText,
                              {
                                color: checked
                                  ? theme.brandText
                                  : theme.bodyText,
                              },
                            ]}
                          >
                            {checked ? '☑ ' : '☐ '}
                            {translateAmenity(am)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={[styles.filterRow, rowDir, { marginTop: 8 }]}>
                    <TextInput
                      value={customAmenity}
                      onChangeText={setCustomAmenity}
                      placeholder={t('landlord.customAmenityPlaceholder')}
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
                        style={[
                          styles.outlineBtnText,
                          { color: theme.bodyText },
                        ]}
                      >
                        {t('landlord.addCustomBtn')}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Property Photos */}
                  <Text
                    style={[
                      styles.sectionLabel,
                      textAlign,
                      { marginTop: 14, color: theme.subText },
                    ]}
                  >
                    {t('landlord.propertyPhotosLabel', {
                      count: propImages.length,
                    })}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.outlineBtn,
                      {
                        marginTop: 6,
                        marginBottom: 8,
                        borderColor: theme.inputBorder,
                      },
                    ]}
                    onPress={handlePickImageFromDevice}
                  >
                    <Text
                      style={[styles.outlineBtnText, { color: theme.brandText }]}
                    >
                      📷 {t('landlord.uploadPhotosBtn')}
                    </Text>
                  </TouchableOpacity>

                  <View style={[styles.filterRow, rowDir]}>
                    <TextInput
                      value={imageUrlInput}
                      onChangeText={setImageUrlInput}
                      placeholder={t('landlord.pasteImageUrlPlaceholder')}
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
                      style={styles.brandBtnSmall}
                      onPress={() => {
                        if (imageUrlInput.trim()) {
                          setPropImages((prev) => [
                            ...prev,
                            imageUrlInput.trim(),
                          ]);
                          setImageUrlInput('');
                        }
                      }}
                    >
                      <Text style={styles.primaryBtnText}>
                        {t('landlord.addUrlBtn')}
                      </Text>
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
                            borderColor:
                              idx === 0 ? theme.brand : theme.inputBorder,
                          },
                        ]}
                      >
                        <Image
                          source={{ uri }}
                          style={styles.photoPreviewImg}
                        />
                        <View style={[styles.photoPreviewActions, rowDir]}>
                          {idx === 0 ? (
                            <Text
                              style={[
                                styles.coverLabel,
                                { color: theme.brandText },
                              ]}
                            >
                              {t('landlord.coverBadge')}
                            </Text>
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
                              <Text
                                style={[
                                  styles.linkText,
                                  { color: theme.brandText, fontSize: 10 },
                                ]}
                              >
                                {t('landlord.makeCoverBtn')}
                              </Text>
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
                  <Text
                    style={[
                      styles.sectionLabel,
                      textAlign,
                      { marginTop: 14, color: theme.subText },
                    ]}
                  >
                    {t('landlord.primaryRoomHeading')}
                  </Text>
                  <TextInput
                    value={roomName}
                    onChangeText={setRoomName}
                    placeholder={t('landlord.roomTierNameLabel')}
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
                    {[
                      {
                        key: 'PRIVATE_ROOM',
                        label: t('landlord.privateRoomOption'),
                      },
                      {
                        key: 'ENTIRE_PLACE',
                        label: t('landlord.entirePlaceOption'),
                      },
                      {
                        key: 'SHARED_ROOM',
                        label: t('landlord.sharedRoomOption'),
                      },
                    ].map((cat) => (
                      <TouchableOpacity
                        key={cat.key}
                        onPress={() => setRoomCategory(cat.key)}
                        style={[
                          styles.presetBtn,
                          { borderColor: theme.inputBorder },
                          roomCategory === cat.key && styles.presetBtnActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.presetBtnText,
                            { color: theme.bodyText },
                            roomCategory === cat.key &&
                              styles.presetBtnTextActive,
                          ]}
                        >
                          {cat.label}
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
                        {t('landlord.pricePerMonthLabel')}
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
                        {t('landlord.roomSizeLabel')}
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

                  <View style={[rowDir, { gap: 8, marginTop: 14 }]}>
                    <TouchableOpacity
                      style={[
                        styles.brandBtn,
                        {
                          flex: 1,
                          backgroundColor: editingPropertyId
                            ? '#d97706'
                            : theme.brand,
                        },
                      ]}
                      onPress={handleSaveProperty}
                      disabled={savingProperty}
                    >
                      <Text style={styles.primaryBtnText}>
                        {savingProperty
                          ? t('landlord.savingBtn')
                          : editingPropertyId
                          ? t('landlord.saveChangesBtn')
                          : t('landlord.publishListingBtn')}
                      </Text>
                    </TouchableOpacity>

                    {editingPropertyId && (
                      <TouchableOpacity
                        style={[
                          styles.outlineBtn,
                          { borderColor: theme.inputBorder },
                        ]}
                        onPress={resetLandlordForm}
                      >
                        <Text
                          style={[styles.outlineBtnText, { color: theme.text }]}
                        >
                          {t('landlord.cancelBtn')}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {landlordMsg.text ? (
                    <View
                      style={[
                        styles.statusBanner,
                        {
                          backgroundColor:
                            landlordMsg.type === 'error'
                              ? '#fef2f2'
                              : '#ecfdf5',
                          borderColor:
                            landlordMsg.type === 'error'
                              ? '#fecaca'
                              : '#a7f3d0',
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '600',
                          color:
                            landlordMsg.type === 'error'
                              ? '#b91c1c'
                              : '#047857',
                          textAlign: isRTL ? 'right' : 'left',
                        }}
                      >
                        {landlordMsg.text}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Incoming Student Bookings */}
                <View
                  style={[
                    styles.panel,
                    { backgroundColor: theme.card, borderColor: theme.border },
                  ]}
                >
                  <View style={[styles.rowBetween, rowDir]}>
                    <Text style={[styles.panelTitle, { color: theme.text }]}>
                      {t('landlord.incomingBookingsTitle')} (
                      {landlordBookings.length})
                    </Text>
                    <TouchableOpacity onPress={() => loadLandlordData()}>
                      <Text
                        style={[styles.linkText, { color: theme.brandText }]}
                      >
                        {t('landlord.refreshBtn')}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {landlordBookings.length === 0 ? (
                    <Text
                      style={[
                        styles.cardSub,
                        textAlign,
                        { color: theme.subText, marginTop: 8 },
                      ]}
                    >
                      {t('landlord.noBookingsYet')}
                    </Text>
                  ) : (
                    landlordBookings.map((b) => {
                      const statusBg =
                        b.status === 'APPROVED'
                          ? '#d1fae5'
                          : b.status === 'REJECTED'
                          ? '#fee2e2'
                          : '#fef3c7';
                      const statusColor =
                        b.status === 'APPROVED'
                          ? '#065f46'
                          : b.status === 'REJECTED'
                          ? '#991b1b'
                          : '#92400e';

                      return (
                        <View
                          key={b.id}
                          style={[
                            styles.roomTierBox,
                            {
                              borderColor: theme.border,
                              flexDirection: 'column',
                              alignItems: 'stretch',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.roomTierName,
                              textAlign,
                              { color: theme.text },
                            ]}
                          >
                            {b.roomType?.property?.title ||
                              t('landlord.propertyFallback')}{' '}
                            —{' '}
                            <Text style={{ color: theme.brandText }}>
                              {b.roomType?.name}
                            </Text>
                          </Text>
                          <Text
                            style={[
                              styles.bodyText,
                              textAlign,
                              { color: theme.bodyText },
                            ]}
                          >
                            {t('landlord.studentLabel')} {b.student?.name} (
                            {b.student?.email})
                          </Text>
                          <Text
                            style={[
                              styles.cardSub,
                              textAlign,
                              { color: theme.subText },
                            ]}
                          >
                            {t('landlord.moveInLabel')}{' '}
                            {new Date(b.moveInDate).toLocaleDateString()} •{' '}
                            {b.durationMonths} {t('landlord.monthsUnit')} • $
                            {b.roomType?.pricePerMonth}
                            {t('landlord.perMonthShort')}
                          </Text>

                          <View
                            style={[
                              styles.rowBetween,
                              rowDir,
                              {
                                marginTop: 10,
                                paddingTop: 8,
                                borderTopWidth: 1,
                                borderTopColor: theme.border,
                              },
                            ]}
                          >
                            <View
                              style={[
                                styles.statusBadge,
                                { backgroundColor: statusBg },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.statusBadgeText,
                                  { color: statusColor },
                                ]}
                              >
                                {t(`landlord.status.${b.status}`)}
                              </Text>
                            </View>

                            {b.status === 'PENDING' && (
                              <View style={[rowDir, { gap: 8 }]}>
                                <TouchableOpacity
                                  style={[
                                    styles.emeraldBtnSmall,
                                    { backgroundColor: '#059669' },
                                  ]}
                                  onPress={() =>
                                    handleUpdateBookingStatus(b.id, 'APPROVED')
                                  }
                                >
                                  <Text style={styles.primaryBtnText}>
                                    {t('landlord.approveBtn')}
                                  </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={[
                                    styles.emeraldBtnSmall,
                                    { backgroundColor: '#dc2626' },
                                  ]}
                                  onPress={() =>
                                    handleUpdateBookingStatus(b.id, 'REJECTED')
                                  }
                                >
                                  <Text style={styles.primaryBtnText}>
                                    {t('landlord.rejectBtn')}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>

                {/* My Listed Properties Visual Cards */}
                <View
                  style={[
                    styles.panel,
                    { backgroundColor: theme.card, borderColor: theme.border },
                  ]}
                >
                  <View style={[styles.rowBetween, rowDir]}>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.panelTitle,
                          textAlign,
                          { color: theme.text },
                        ]}
                      >
                        {t('landlord.myListedPropertiesTitle', {
                          count: myProperties.length,
                        })}
                      </Text>
                      <Text
                        style={[
                          styles.cardSub,
                          textAlign,
                          { color: theme.subText },
                        ]}
                      >
                        {t('landlord.myListedPropertiesSub')}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => loadLandlordData()}>
                      <Text
                        style={[styles.linkText, { color: theme.brandText }]}
                      >
                        {t('landlord.refreshListBtn')}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {loadingMyProps ? (
                    <Text
                      style={[
                        styles.cardSub,
                        textAlign,
                        { color: theme.subText, marginTop: 10 },
                      ]}
                    >
                      {t('landlord.loadingMyProperties')}
                    </Text>
                  ) : myProperties.length === 0 ? (
                    <Text
                      style={[
                        styles.cardSub,
                        textAlign,
                        { color: theme.subText, marginTop: 10 },
                      ]}
                    >
                      {t('landlord.noListedPropertiesYet')}
                    </Text>
                  ) : (
                    myProperties.map((prop) => {
                      const cover = prop.images?.[0] || DEFAULT_COVER_IMAGE;
                      const primaryRoom = prop.rooms?.[0];
                      const isBeingEdited = editingPropertyId === prop.id;

                      return (
                        <View
                          key={prop.id}
                          style={[
                            styles.card,
                            {
                              marginTop: 12,
                              marginBottom: 0,
                              backgroundColor: theme.card,
                              borderColor: isBeingEdited
                                ? '#f59e0b'
                                : theme.border,
                            },
                          ]}
                        >
                          <View>
                            <Image
                              source={{ uri: cover }}
                              style={{ width: '100%', height: 140 }}
                            />
                            <View
                              style={[
                                styles.distanceOverlay,
                                { left: 10, top: 10 },
                              ]}
                            >
                              <Text style={styles.distanceOverlayText}>
                                {prop.city}
                              </Text>
                            </View>
                            {primaryRoom && (
                              <View style={styles.myPropPriceOverlay}>
                                <Text style={styles.myPropPriceText}>
                                  £{primaryRoom.pricePerMonth}
                                  {t('landlord.perMonthShort')}
                                </Text>
                              </View>
                            )}
                          </View>

                          <View style={styles.cardBody}>
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
                              {prop.address}, {prop.city}
                            </Text>

                            <View
                              style={[
                                styles.amenityWrap,
                                rowDir,
                                { marginTop: 8 },
                              ]}
                            >
                              {prop.walkMins && (
                                <View
                                  style={[
                                    styles.amenityTag,
                                    { backgroundColor: theme.brandSoftBg },
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.amenityTagText,
                                      { color: theme.brandText },
                                    ]}
                                  >
                                    {t('landlord.walkBadge', {
                                      mins: prop.walkMins,
                                    })}
                                  </Text>
                                </View>
                              )}
                              {prop.transitMins && (
                                <View
                                  style={[
                                    styles.amenityTag,
                                    { backgroundColor: theme.brandSoftBg },
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.amenityTagText,
                                      { color: theme.brandText },
                                    ]}
                                  >
                                    {t('landlord.transitBadge', {
                                      mins: prop.transitMins,
                                    })}
                                  </Text>
                                </View>
                              )}
                              <View
                                style={[
                                  styles.amenityTag,
                                  { backgroundColor: theme.subtleBg },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.amenityTagText,
                                    { color: theme.bodyText },
                                  ]}
                                >
                                  {t('landlord.amenitiesCountBadge', {
                                    count: prop.amenities?.length || 0,
                                  })}
                                </Text>
                              </View>
                              <View
                                style={[
                                  styles.amenityTag,
                                  { backgroundColor: theme.subtleBg },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.amenityTagText,
                                    { color: theme.bodyText },
                                  ]}
                                >
                                  {t('landlord.photosCountBadge', {
                                    count: prop.images?.length || 0,
                                  })}
                                </Text>
                              </View>
                            </View>

                            <View
                              style={[
                                styles.cardFooter,
                                rowDir,
                                { borderTopColor: theme.border },
                              ]}
                            >
                              <TouchableOpacity
                                onPress={() => openPropertyDetails(prop)}
                              >
                                <Text
                                  style={[
                                    styles.linkText,
                                    { color: theme.brandText },
                                  ]}
                                >
                                  {t('landlord.viewPageLink')}
                                </Text>
                              </TouchableOpacity>

                              <View style={[rowDir, { gap: 8 }]}>
                                <TouchableOpacity
                                  style={styles.amberEditBtn}
                                  onPress={() => handleStartEditProperty(prop)}
                                >
                                  <Text style={styles.amberEditBtnText}>
                                    {isBeingEdited
                                      ? t('landlord.editingBtn')
                                      : t('landlord.editBtn')}
                                  </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={styles.unbookBtn}
                                  disabled={deletingPropId === prop.id}
                                  onPress={() => handleDeleteProperty(prop)}
                                >
                                  <Text style={styles.unbookBtnText}>
                                    {deletingPropId === prop.id
                                      ? t('landlord.deletingBtn')
                                      : t('landlord.deleteBtn')}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
              </>
            )}
          </View>
        </ScrollView>
      )}

      {/* ====================================================================
          SCREEN 5: LOGIN & REGISTER (Synced with login/page.js & register/page.js)
         ==================================================================== */}
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
                {authMode === 'LOGIN' ? t('login.title') : t('register.title')}
              </Text>
              <Text
                style={[
                  styles.cardSub,
                  textAlign,
                  { color: theme.subText, marginTop: 4, marginBottom: 12 },
                ]}
              >
                {authMode === 'LOGIN'
                  ? t('login.subtitle')
                  : t('register.subtitle')}
              </Text>

              {authError ? (
                <Text style={[styles.errorText, textAlign]}>{authError}</Text>
              ) : null}

              {/* Register Account Role Toggle */}
              {authMode === 'REGISTER' && (
                <View
                  style={[
                    styles.roleToggleTrack,
                    rowDir,
                    { backgroundColor: theme.subtleBg },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.roleToggleOption,
                      authRole === 'STUDENT' && [
                        styles.roleToggleActive,
                        { backgroundColor: theme.card },
                      ],
                    ]}
                    onPress={() => setAuthRole('STUDENT')}
                  >
                    <Text
                      style={[
                        styles.roleToggleText,
                        {
                          color:
                            authRole === 'STUDENT'
                              ? theme.brandText
                              : theme.subText,
                        },
                      ]}
                    >
                      {t('register.roleStudent')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleToggleOption,
                      authRole === 'LANDLORD' && [
                        styles.roleToggleActive,
                        { backgroundColor: theme.card },
                      ],
                    ]}
                    onPress={() => setAuthRole('LANDLORD')}
                  >
                    <Text
                      style={[
                        styles.roleToggleText,
                        {
                          color:
                            authRole === 'LANDLORD'
                              ? '#b45309'
                              : theme.subText,
                        },
                      ]}
                    >
                      {t('register.roleLandlord')}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {authMode === 'REGISTER' && (
                <>
                  <Text
                    style={[
                      styles.inputLabel,
                      textAlign,
                      { color: theme.text },
                    ]}
                  >
                    {t('register.fullNameLabel')}
                  </Text>
                  <TextInput
                    value={authName}
                    onChangeText={setAuthName}
                    placeholder={
                      authRole === 'LANDLORD'
                        ? t('register.namePlaceholderLandlord')
                        : t('register.namePlaceholderStudent')
                    }
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
                style={[styles.inputLabel, textAlign, { color: theme.text }]}
              >
                {authMode === 'LOGIN'
                  ? t('login.emailLabel')
                  : t('register.emailLabel')}
              </Text>
              <TextInput
                value={authEmail}
                onChangeText={setAuthEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder={
                  authMode === 'LOGIN'
                    ? t('login.emailPlaceholder')
                    : t('register.emailPlaceholder')
                }
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

              {authMode === 'REGISTER' && (
                <>
                  <Text
                    style={[
                      styles.inputLabel,
                      textAlign,
                      { color: theme.text },
                    ]}
                  >
                    {t('register.phoneLabel')}
                  </Text>
                  <TextInput
                    value={authPhone}
                    onChangeText={setAuthPhone}
                    keyboardType="phone-pad"
                    placeholder={t('register.phonePlaceholder')}
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
                style={[styles.inputLabel, textAlign, { color: theme.text }]}
              >
                {authMode === 'LOGIN'
                  ? t('login.passwordLabel')
                  : t('register.passwordLabel')}
              </Text>
              <TextInput
                value={authPassword}
                onChangeText={setAuthPassword}
                secureTextEntry
                placeholder={
                  authMode === 'LOGIN'
                    ? '••••••••'
                    : t('register.passwordPlaceholder')
                }
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
                style={[styles.brandBtn, { marginTop: 16 }]}
                onPress={handleAuthSubmit}
                disabled={authLoading}
              >
                <Text style={styles.primaryBtnText}>
                  {authLoading
                    ? authMode === 'LOGIN'
                      ? t('login.signingIn')
                      : t('register.creatingAccount')
                    : authMode === 'LOGIN'
                    ? t('login.submit')
                    : authRole === 'LANDLORD'
                    ? t('register.submitLandlord')
                    : t('register.submitStudent')}
                </Text>
              </TouchableOpacity>

              {authMode === 'LOGIN' && (
                <View
                  style={{
                    marginTop: 18,
                    paddingTop: 14,
                    borderTopWidth: 1,
                    borderTopColor: theme.border,
                  }}
                >
                  <Text
                    style={[
                      styles.sectionLabel,
                      { color: theme.subText, textAlign: 'center' },
                    ]}
                  >
                    {t('login.demoTitle')}
                  </Text>
                  <View style={[styles.presetRow, rowDir, { marginTop: 10 }]}>
                    <TouchableOpacity
                      style={[
                        styles.demoStudentBtn,
                        { backgroundColor: theme.brandSoftBg },
                      ]}
                      onPress={() => {
                        setAuthEmail('student@unihousing.com');
                        setAuthPassword('password123');
                      }}
                    >
                      <Text
                        style={[
                          styles.demoBtnText,
                          { color: theme.brandText },
                        ]}
                      >
                        {t('login.fillStudentDemo')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.demoLandlordBtn}
                      onPress={() => {
                        setAuthEmail('landlord@unihousing.com');
                        setAuthPassword('password123');
                      }}
                    >
                      <Text style={[styles.demoBtnText, { color: '#92400e' }]}>
                        {t('login.fillLandlordDemo')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={{ marginTop: 16, alignItems: 'center' }}
                onPress={() => {
                  setAuthError('');
                  setAuthMode(authMode === 'LOGIN' ? 'REGISTER' : 'LOGIN');
                }}
              >
                <Text style={[styles.cardSub, { color: theme.subText }]}>
                  {authMode === 'LOGIN'
                    ? t('login.noAccount')
                    : t('register.hasAccount')}{' '}
                  <Text style={[styles.linkText, { color: theme.brandText }]}>
                    {authMode === 'LOGIN'
                      ? t('login.createOne')
                      : t('register.logIn')}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}

      {/* ====================================================================
          BOTTOM NAVIGATION BAR
         ==================================================================== */}
      <View
        style={[
          styles.bottomTabs,
          rowDir,
          { backgroundColor: theme.card, borderTopColor: theme.border },
        ]}
      >
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigateWithDoors('EXPLORE')}
        >
          <Text
            style={[
              styles.tabText,
              { color: theme.subText },
              activeTab === 'EXPLORE' && [
                styles.tabTextActive,
                { color: theme.brandText },
              ],
            ]}
          >
            🗺️ {t('nav.explore')}
          </Text>
        </TouchableOpacity>

        {isStudent && (
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => {
              loadStudentBookings();
              navigateWithDoors('STUDENT');
            }}
          >
            <Text
              style={[
                styles.tabText,
                { color: theme.subText },
                activeTab === 'STUDENT' && [
                  styles.tabTextActive,
                  { color: theme.brandText },
                ],
              ]}
            >
              📋 {t('nav.myBookings')}
            </Text>
          </TouchableOpacity>
        )}

        {isLandlord && (
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => {
              loadLandlordData();
              navigateWithDoors('LANDLORD');
            }}
          >
            <Text
              style={[
                styles.tabText,
                { color: theme.subText },
                activeTab === 'LANDLORD' && [
                  styles.tabTextActive,
                  { color: theme.brandText },
                ],
              ]}
            >
              🏢 {t('nav.landlordDashboard')}
            </Text>
          </TouchableOpacity>
        )}

        {!user && (
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => navigateWithDoors('AUTH')}
          >
            <Text
              style={[
                styles.tabText,
                { color: theme.subText },
                activeTab === 'AUTH' && [
                  styles.tabTextActive,
                  { color: theme.brandText },
                ],
              ]}
            >
              🔑 {t('nav.login')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ====================================================================
          MODAL 1: BOOK ROOM REQUEST (Synced with BookingModal.jsx)
         ==================================================================== */}
      <Modal visible={bookingModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={[styles.rowBetween, rowDir, { marginBottom: 8 }]}>
              <Text
                style={[styles.panelTitle, textAlign, { color: theme.text }]}
              >
                {t('booking.modalTitle', {
                  title: bookingProperty?.title || '',
                })}
              </Text>
              <TouchableOpacity onPress={() => setBookingModalOpen(false)}>
                <Text style={{ fontSize: 18, color: theme.subText }}>✕</Text>
              </TouchableOpacity>
            </View>

            {isLandlord ? (
              <View style={styles.landlordWarningBox}>
                <Text style={[styles.landlordWarningText, textAlign]}>
                  {t('booking.landlordWarning')}
                </Text>
              </View>
            ) : (
              <>
                {!user && (
                  <View
                    style={[
                      styles.guestPromptBox,
                      rowDir,
                      { backgroundColor: theme.brandSoftBg },
                    ]}
                  >
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 11,
                        color: theme.brandText,
                        textAlign: isRTL ? 'right' : 'left',
                      }}
                    >
                      {t('booking.guestPrompt')}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setBookingModalOpen(false);
                        setAuthMode('LOGIN');
                        navigateWithDoors('AUTH');
                      }}
                    >
                      <Text
                        style={[
                          styles.linkText,
                          { color: theme.brandText, textDecorationLine: 'underline' },
                        ]}
                      >
                        {t('nav.login')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Room Tier Selector inside BookingModal */}
                <Text
                  style={[
                    styles.inputLabel,
                    textAlign,
                    { color: theme.subText },
                  ]}
                >
                  {t('booking.selectRoomType')}
                </Text>
                <View style={{ gap: 6, marginTop: 4 }}>
                  {(
                    bookingProperty?.rooms ||
                    bookingProperty?.roomTypes ||
                    []
                  ).map((rt) => {
                    const active = bookingRoomId === rt.id;
                    return (
                      <TouchableOpacity
                        key={rt.id}
                        onPress={() => setBookingRoomId(rt.id)}
                        style={[
                          styles.modalRoomOption,
                          rowDir,
                          {
                            backgroundColor: theme.inputBg,
                            borderColor: active
                              ? theme.brand
                              : theme.inputBorder,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: active ? '800' : '600',
                            color: active ? theme.brandText : theme.text,
                          }}
                        >
                          {active ? '● ' : '○ '}
                          {rt.name} ({rt.category?.replace('_', ' ')})
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: '800',
                            color: theme.brandText,
                          }}
                        >
                          ${rt.pricePerMonth}/mo
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text
                  style={[
                    styles.inputLabel,
                    textAlign,
                    { color: theme.subText },
                  ]}
                >
                  {t('booking.studentName')}
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
                  style={[
                    styles.inputLabel,
                    textAlign,
                    { color: theme.subText },
                  ]}
                >
                  {t('booking.studentEmail')}
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
                      {t('booking.moveInDate')}
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
                      {t('booking.durationMonths')}
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

                {bookingStatusMsg && (
                  <View
                    style={[
                      styles.statusBanner,
                      {
                        backgroundColor:
                          bookingStatusMsg.type === 'success'
                            ? '#ecfdf5'
                            : '#fef2f2',
                        borderColor:
                          bookingStatusMsg.type === 'success'
                            ? '#a7f3d0'
                            : '#fecaca',
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color:
                          bookingStatusMsg.type === 'success'
                            ? '#065f46'
                            : '#b91c1c',
                        textAlign: isRTL ? 'right' : 'left',
                      }}
                    >
                      {bookingStatusMsg.text}
                    </Text>
                  </View>
                )}

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
                      {t('booking.close')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.emeraldBtn, { flex: 1 }]}
                    onPress={handleBookingSubmit}
                    disabled={bookingSubmitting}
                  >
                    <Text style={styles.primaryBtnText}>
                      {bookingSubmitting
                        ? t('booking.sending')
                        : t('booking.confirmRequest')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ====================================================================
          MODAL 2: ADD NEW UNIVERSITY CAMPUS
         ==================================================================== */}
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
              🎓 {t('filter.addCampus')}
            </Text>
            <TextInput
              value={uniSearchQuery}
              onChangeText={setUniSearchQuery}
              placeholder="🔍 Search university name..."
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
              University Name
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
                  {t('landlord.cityLabel')}
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
                  Country
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
                  Latitude
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
                  Longitude
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
                  {t('booking.close')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.brandBtn, { flex: 1 }]}
                onPress={handleCreateUniversity}
              >
                <Text style={styles.primaryBtnText}>Save Campus</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ====================================================================
          ANIMATED DOOR TRANSITION OVERLAY (Synced with DoorTransition.jsx)
         ==================================================================== */}
      {doorVisible && (
        <View style={styles.doorOverlay} pointerEvents="auto">
          <Animated.View
            style={[
              styles.doorHalf,
              styles.doorLeft,
              { transform: [{ translateX: leftDoorTranslateX }] },
            ]}
          >
            <View style={styles.doorGlowSeam} />
          </Animated.View>

          <Animated.View
            style={[
              styles.doorHalf,
              styles.doorRight,
              { transform: [{ translateX: rightDoorTranslateX }] },
            ]}
          >
            <View style={styles.doorGlowSeam} />
          </Animated.View>

          <Animated.View
            style={[
              styles.doorEmblemWrap,
              {
                opacity: emblemOpacity,
                transform: [{ scale: emblemScale }],
              },
            ]}
          >
            <View style={styles.doorEmblemOuter}>
              <View style={styles.doorEmblemInner}>
                <Text style={styles.doorEmblemLetter}>U</Text>
              </View>
            </View>
            <Text style={styles.doorEmblemBrand}>UNIHOUSING</Text>
          </Animated.View>
        </View>
      )}
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
    height: 60,
    borderBottomWidth: 1,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 40,
  },
  brandRow: { alignItems: 'center', gap: 8 },
  brandBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#142B4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadgeText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  brandTitle: { fontSize: 18, fontWeight: '800' },
  navRight: { alignItems: 'center', gap: 6 },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnText: { fontSize: 12, fontWeight: '700' },
  toggleBtnEmoji: { fontSize: 14 },

  menuDrawer: {
    borderBottomWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
    zIndex: 35,
  },
  menuUserBox: {
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 12,
    marginBottom: 4,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: '#142B4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircleText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  menuLink: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  menuLinkText: { fontSize: 14, fontWeight: '700' },
  menuFooter: {
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  logoutFullBtn: { paddingVertical: 6, width: '100%' },
  logoutText: { fontSize: 12, fontWeight: '700', color: '#dc2626' },

  /* HeroSlider Styles */
  heroContainer: {
    backgroundColor: '#060913',
    position: 'relative',
    overflow: 'hidden',
    paddingVertical: 22,
    paddingHorizontal: 16,
  },
  heroBgImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.32,
  },
  heroDarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 9, 19, 0.72)',
  },
  heroContent: { position: 'relative', zIndex: 10 },
  heroBadge: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 10,
  },
  heroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  heroBadgeText: { color: '#d1fae5', fontSize: 11, fontWeight: '700' },
  heroTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 33,
  },
  heroHighlight: { color: '#10B981' },
  heroDesc: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  heroActions: {
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  emeraldCtaBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
  },
  emeraldCtaText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  glassLandlordBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
  },
  glassLandlordText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
  trustRow: {
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
  },
  trustItem: { color: '#e2e8f0', fontSize: 11, fontWeight: '600' },
  heroShowcaseCard: {
    marginTop: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    borderColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  heroCardImageWrap: {
    height: 130,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    position: 'relative',
  },
  heroCardImg: { width: '100%', height: '100%' },
  heroCardTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(6, 9, 19, 0.82)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  heroCardTagText: { color: '#6ee7b7', fontSize: 10, fontWeight: '700' },
  heroCardPriceBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#142B4A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  heroCardPriceText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  heroCardTitle: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
  heroCardLoc: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
  ratingBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingBadgeText: { color: '#fcd34d', fontSize: 11, fontWeight: '800' },
  heroPerksWrap: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: 3,
  },
  heroPerkItem: { color: '#e2e8f0', fontSize: 11, fontWeight: '500' },
  heroViewDetailsBtn: {
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  heroViewDetailsText: { color: '#ffffff', fontSize: 11, fontWeight: '700' },
  heroBottomBar: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroDotsRow: { alignItems: 'center', gap: 6 },
  heroDotPill: {
    height: 7,
    width: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  heroDotPillActive: { width: 38, backgroundColor: '#10B981' },
  heroCounterText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    marginHorizontal: 6,
  },
  heroArrowsRow: { gap: 8 },
  heroArrowBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroArrowText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },

  /* FilterBar Styles */
  filterBarWrap: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  sectionPad: { padding: 14 },
  rowBetween: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  showingCountText: { fontSize: 11, fontWeight: '700' },
  homeHeading: { fontSize: 20, fontWeight: '800' },
  linkText: { fontSize: 12, fontWeight: '700' },
  uniScroll: { marginTop: 6, marginBottom: 4 },
  uniChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
  },
  uniChipActive: { backgroundColor: '#142B4A', borderColor: '#142B4A' },
  uniChipText: { fontSize: 12, fontWeight: '600' },
  uniChipTextActive: { color: '#ffffff' },
  filterRow: { gap: 10, marginTop: 6 },
  catChip: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
    marginRight: 6,
  },
  catChipActive: { backgroundColor: '#142B4A' },
  catChipText: { fontSize: 11, fontWeight: '600' },
  catChipTextActive: { color: '#ffffff' },

  fullMapContainer: {
    height: 480,
    width: '100%',
    borderBottomWidth: 1,
  },
  mapContainer: {
    width: '100%',
    borderWidth: 1,
    overflow: 'hidden',
  },
  map: { width: '100%', height: '100%' },

  floatingToggleWrap: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 30,
  },
  floatingToggleBtn: {
    backgroundColor: '#142B4A',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 999,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  floatingToggleText: { color: '#ffffff', fontSize: 13, fontWeight: '800' },

  emptyCard: { paddingVertical: 40, alignItems: 'center' },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardImage: { width: '100%', height: 180 },
  distanceOverlay: {
    position: 'absolute',
    top: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  distanceOverlayText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  cardBody: { padding: 16 },
  cardTitle: { fontSize: 17, fontWeight: '800' },
  cardSub: { fontSize: 12, marginTop: 2 },
  fromLabel: { fontSize: 10, fontWeight: '600' },
  priceText: { fontSize: 18, fontWeight: '800' },
  perMoText: { fontSize: 11, fontWeight: '500' },
  commuteRow: {
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  commuteBadge: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontWeight: '600',
  },
  toUniText: { fontSize: 11, flexShrink: 1 },
  amenityWrap: {
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  amenityTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  amenityTagText: { fontSize: 11, fontWeight: '600' },
  cardFooter: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  outlineBtn: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: { fontSize: 12, fontWeight: '700' },
  emeraldBtnSmall: {
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emeraldBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBtnSmall: {
    backgroundColor: '#142B4A',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBtn: {
    backgroundColor: '#142B4A',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },

  /* Property Details Styles */
  cityPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  cityPillText: { fontSize: 11, fontWeight: '700' },
  startingPriceBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  detailTitle: { fontSize: 21, fontWeight: '800' },
  detailHeroWrap: {
    position: 'relative',
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  detailHeroImage: { width: '100%', height: 230 },
  photoCountBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  photoCountText: { color: '#ffffff', fontSize: 11, fontWeight: '600' },
  thumbImage: {
    width: 76,
    height: 56,
    borderRadius: 10,
    marginRight: 8,
    opacity: 0.65,
  },
  thumbImageActive: {
    opacity: 1,
    borderWidth: 2,
    borderColor: '#142B4A',
  },
  panel: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 14,
  },
  panelTitle: { fontSize: 16, fontWeight: '800' },
  bodyText: { fontSize: 13, marginTop: 4, lineHeight: 20 },
  boldText: { fontSize: 13, fontWeight: '700' },
  commuteSummaryBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  roomTierBox: {
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    gap: 10,
  },
  roomTierName: { fontSize: 14, fontWeight: '700' },
  roomCatBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  roomCatBadgeText: { fontSize: 10, fontWeight: '700' },
  noFeeBadge: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  noFeeBadgeText: { color: '#047857', fontSize: 10, fontWeight: '800' },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetRow: { gap: 8, marginTop: 8 },
  presetBtn: {
    flex: 1,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
  },
  presetBtnActive: {
    backgroundColor: '#142B4A',
    borderColor: '#142B4A',
  },
  presetBtnText: { fontSize: 12, fontWeight: '700' },
  presetBtnTextActive: { color: '#ffffff' },
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

  /* Student & Landlord Badges/Buttons */
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '800' },
  unbookBtn: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  unbookBtnText: { color: '#dc2626', fontSize: 12, fontWeight: '700' },
  amberEditBtn: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  amberEditBtnText: { color: '#92400e', fontSize: 12, fontWeight: '700' },
  verifiedLandlordPill: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  verifiedLandlordText: { color: '#92400e', fontSize: 10, fontWeight: '800' },
  commuteInputsBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  myPropPriceOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#142B4A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  myPropPriceText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 10,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    marginTop: 4,
  },
  streetOption: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
  },
  checkboxPill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  checkboxPillText: { fontSize: 11, fontWeight: '600' },
  photoPreviewBox: {
    width: 115,
    marginRight: 10,
    borderRadius: 10,
    borderWidth: 2,
    overflow: 'hidden',
  },
  photoPreviewImg: { width: '100%', height: 72 },
  photoPreviewActions: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  coverLabel: { fontSize: 10, fontWeight: '800' },
  statusBanner: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },

  /* Login & Register Styles */
  errorText: {
    color: '#b91c1c',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    fontSize: 12,
    marginBottom: 10,
  },
  roleToggleTrack: {
    padding: 4,
    borderRadius: 12,
    gap: 6,
    marginBottom: 8,
  },
  roleToggleOption: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: 'center',
  },
  roleToggleActive: {
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  roleToggleText: { fontSize: 12, fontWeight: '700' },
  demoStudentBtn: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bcccdc',
    alignItems: 'center',
  },
  demoLandlordBtn: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fde68a',
    backgroundColor: '#fffbeb',
    alignItems: 'center',
  },
  demoBtnText: { fontSize: 11, fontWeight: '700', textAlign: 'center' },

  /* Bottom Tabs & Modals */
  bottomTabs: {
    height: 56,
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: { paddingVertical: 8, paddingHorizontal: 12 },
  tabText: { fontSize: 12, fontWeight: '600' },
  tabTextActive: { fontWeight: '800' },
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
  landlordWarningBox: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
    marginVertical: 8,
  },
  landlordWarningText: { color: '#92400e', fontSize: 13, fontWeight: '600' },
  guestPromptBox: {
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  modalRoomOption: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  /* Animated DoorTransition Styles */
  doorOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    flexDirection: 'row',
  },
  doorHalf: {
    width: '50%',
    height: '100%',
    backgroundColor: '#0a1626',
    justifyContent: 'center',
  },
  doorLeft: {
    alignItems: 'flex-end',
    borderRightWidth: 1,
    borderRightColor: '#10B981',
  },
  doorRight: {
    alignItems: 'flex-start',
    borderLeftWidth: 1,
    borderLeftColor: '#10B981',
  },
  doorGlowSeam: {
    width: 3,
    height: '80%',
    backgroundColor: '#10B981',
  },
  doorEmblemWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  doorEmblemOuter: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: '#0a1626',
    borderWidth: 2,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
  },
  doorEmblemInner: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#142B4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doorEmblemLetter: {
    color: '#10B981',
    fontSize: 32,
    fontWeight: '900',
  },
  doorEmblemBrand: {
    marginTop: 12,
    color: '#e0e7ff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 4,
  },
});