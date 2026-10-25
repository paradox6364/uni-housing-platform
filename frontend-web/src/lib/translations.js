// قاموس النصوص: كل نص مكتوب بالعربي والإنجليزي.
// لإضافة نص جديد: ضع نفس المفتاح في ar و en، ثم استخدمه في الصفحة هكذا: t('المفتاح')
// القيم المتغيرة تُكتب بين أقواس مثل {n} وتُمرَّر هكذا: t('المفتاح', { n: 5 })

export const translations = {
  ar: {
    // شريط التنقل
    'nav.explore': 'استكشف الخريطة',
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
    'toggle.languageLabel': 'تغيير اللغة إلى الإنجليزية',
    'toggle.toDark': 'التبديل إلى الوضع الليلي',
    'toggle.toLight': 'التبديل إلى الوضع النهاري',

    // شريط الفلاتر
    'filter.university': 'الجامعة',
    'filter.roomType': 'نوع الغرفة',
    'filter.allRoomTypes': 'كل الأنواع',
    'room.PRIVATE_ROOM': 'غرفة خاصة',
    'room.SHARED_ROOM': 'غرفة مشتركة',
    'room.ENTIRE_PLACE': 'سكن كامل',
    'filter.maxBudget': 'أقصى إيجار شهريًا',
    'filter.anyPrice': 'أي سعر',
    'filter.upTo': 'حتى ${price} / شهريًا',
    'filter.maxDistance': 'أقصى مسافة: {km} كم',
    'filter.showing': 'عدد العقارات الموثّقة: {n}',

    // الصفحة الرئيسية
    'home.title': 'سكن طلابي بالقرب من {name}',
    'home.campusFallback': 'الجامعة',
    'home.subtitle': 'قارن بين الغرف الموثّقة والمسافة سيرًا والإيجار الشهري في مكان واحد.',
    'home.mapLoading': 'جارٍ تحميل خريطة الجامعة...',
    'home.emptyTitle': 'لا يوجد سكن طلابي يطابق هذه الفلاتر',
    'home.emptyHint': 'جرّب زيادة نطاق المسافة أو الميزانية القصوى.',
    'home.showMap': 'عرض الخريطة',
    'home.showList': 'عرض القائمة',

    // بطاقة العقار
    'card.distance': '{km} كم من الجامعة',
    'card.from': 'يبدأ من',
    'card.perMonth': '/ شهريًا',
    'card.walk': '{n} دقيقة مشيًا',
    'card.transit': '{n} دقيقة بالمواصلات',
    'card.toUni': 'إلى {name}',
    'card.roomTiers': 'أنواع الغرف المتاحة: {n}',
    'card.viewDetails': 'عرض التفاصيل',
    'card.book': 'احجز غرفة',
  },

  en: {
    'nav.explore': 'Explore Map',
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
    'toggle.languageLabel': 'Switch language to Arabic',
    'toggle.toDark': 'Switch to dark mode',
    'toggle.toLight': 'Switch to light mode',

    'filter.university': 'University Campus',
    'filter.roomType': 'Room Type',
    'filter.allRoomTypes': 'All Room Types',
    'room.PRIVATE_ROOM': 'Private Room',
    'room.SHARED_ROOM': 'Shared Room',
    'room.ENTIRE_PLACE': 'Entire Place',
    'filter.maxBudget': 'Max Budget / Mo',
    'filter.anyPrice': 'Any Price',
    'filter.upTo': 'Up to ${price} / mo',
    'filter.maxDistance': 'Max Distance: {km} km',
    'filter.showing': 'Showing {n} verified properties',

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
  },
};

// يرجع النص المناسب للغة. لو المفتاح ناقص في اللغة يجرب الإنجليزي، ولو ناقص أيضًا يرجع المفتاح نفسه
export function translate(lang, key, vars) {
  let text = translations[lang]?.[key] ?? translations.en[key] ?? key;
  if (vars) {
    Object.entries(vars).forEach(([name, value]) => {
      text = text.split(`{${name}}`).join(String(value));
    });
  }
  return text;
}
