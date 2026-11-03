"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  MapPin,
  Wifi,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Building2,
  Star,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { fetchUniversities, searchListings } from '../services/api';

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

const SLIDES = {
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
        reviews: '128 تقييم طلابي',
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
        reviews: '94 تقييم طلابي',
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
        reviews: '210 تقييم طلابي',
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
        reviews: '128 student reviews',
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
        reviews: '94 student reviews',
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
        reviews: '210 student reviews',
        tag: '0% Booking Fee',
        perks: ['Official Verified Lease', 'Fast Landlord Approval', '24/7 Student Support'],
      },
    },
  ],
};

export default function HeroSlider({ listings: propListings }) {
  const settings = useSettings ? useSettings() : {};
  const lang = settings?.lang || 'ar';
  const isRTL = Boolean(settings?.isRTL ?? lang === 'ar');
  const isDark = Boolean(
    settings?.isDark ?? settings?.darkMode ?? settings?.theme === 'dark'
  );
  const t = settings?.t;

  const baseSlides = SLIDES[lang] || SLIDES.ar;

  const [fetchedListings, setFetchedListings] = useState([]);
  const [randomProperties, setRandomProperties] = useState([]);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Use passed listings or fetch real listings from the backend
  useEffect(() => {
    if (Array.isArray(propListings) && propListings.length > 0) {
      setFetchedListings(propListings);
      return;
    }

    let active = true;

    async function loadRealProperties() {
      try {
        let data = await searchListings({ maxDistanceKm: 100 }).catch(() => null);
        let list = Array.isArray(data) ? data : data?.listings;

        if (!Array.isArray(list) || list.length === 0) {
          const unis = await fetchUniversities().catch(() => []);
          if (Array.isArray(unis) && unis.length > 0) {
            const responses = await Promise.all(
              unis.slice(0, 4).map((u) =>
                searchListings({ universityId: u.id, maxDistanceKm: 100 }).catch(
                  () => null
                )
              )
            );
            const uniqueMap = new Map();
            responses.forEach((res) => {
              const items = Array.isArray(res) ? res : res?.listings || [];
              items.forEach((item) => {
                if (item?.id && !uniqueMap.has(item.id)) {
                  uniqueMap.set(item.id, item);
                }
              });
            });
            list = Array.from(uniqueMap.values());
          }
        }

        if (active && Array.isArray(list) && list.length > 0) {
          setFetchedListings(list);
        }
      } catch (err) {
        console.error('Failed to fetch listings for HeroSlider:', err);
      }
    }

    loadRealProperties();
    return () => {
      active = false;
    };
  }, [propListings]);

  // Pick up to 3 random properties whenever the available listings pool updates
  useEffect(() => {
    if (!Array.isArray(fetchedListings) || fetchedListings.length === 0) return;
    const shuffled = [...fetchedListings];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setRandomProperties(shuffled.slice(0, baseSlides.length));
  }, [fetchedListings, baseSlides.length]);

  // Merge base marketing slides with random real properties
  const slides = useMemo(() => {
    if (randomProperties.length === 0) return baseSlides;

    return baseSlides.map((slide, idx) => {
      const prop = randomProperties[idx % randomProperties.length];
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

      let locationText = slide.card.location;
      if (prop.walkMins) {
        locationText = isRTL
          ? `${prop.walkMins} دقيقة مشياً للجامعة${prop.city ? ` • ${prop.city}` : ''}`
          : `${prop.walkMins} mins walk to Campus${prop.city ? ` • ${prop.city}` : ''}`;
      } else if (prop.transitMins) {
        locationText = isRTL
          ? `${prop.transitMins} دقيقة بالمواصلات${prop.city ? ` • ${prop.city}` : ''}`
          : `${prop.transitMins} mins transit${prop.city ? ` • ${prop.city}` : ''}`;
      } else if (prop.address || prop.city) {
        locationText = [prop.address, prop.city].filter(Boolean).join(' • ');
      }

      const rawAmenities =
        Array.isArray(prop.amenities) && prop.amenities.length > 0
          ? prop.amenities.slice(0, 3)
          : null;

      const perks = rawAmenities
        ? rawAmenities.map((amenity) => {
            if (!isRTL) return amenity;
            if (typeof t === 'function') {
              const key = `landlord.amenity.${amenity}`;
              const translated = t(key);
              if (translated && translated !== key) return translated;
            }
            return AMENITY_AR_MAP[amenity] || amenity;
          })
        : slide.card.perks;

      const deterministicRating = (4.7 + ((idx + (prop.title?.length || 0)) % 4) * 0.1).toFixed(
        1
      );

      return {
        ...slide,
        image: coverImage,
        propertyId: prop.id,
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
  }, [baseSlides, randomProperties, isRTL, t]);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const activeSlide = slides[current] || slides[0];

  const scrollToExplorer = () => {
    const el = document.getElementById('explorer-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{ backgroundColor: '#060913', color: '#ffffff' }}
      className="relative w-full h-[550px] sm:h-[590px] lg:h-[640px] overflow-hidden select-none shrink-0"
    >
      {/* Background Images with Cinematic Ken-Burns Zoom */}
      {slides.map((slide, idx) => {
        const isActive = idx === current;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className={`w-full h-full object-cover object-center transition-transform duration-[8000ms] ease-out ${
                isActive ? 'scale-110' : 'scale-100'
              }`}
            />
            {/* Multi-layered luxury dark overlays */}
            <div
              style={{
                background: isRTL
                  ? 'linear-gradient(90deg, rgba(6,9,19,0.5) 0%, rgba(6,9,19,0.8) 50%, rgba(6,9,19,0.95) 100%)'
                  : 'linear-gradient(270deg, rgba(6,9,19,0.5) 0%, rgba(6,9,19,0.8) 50%, rgba(6,9,19,0.95) 100%)',
              }}
              className="absolute inset-0"
            />
            <div
              style={{
                background:
                  'linear-gradient(to top, rgba(6,9,19,0.9) 0%, rgba(6,9,19,0.25) 45%, rgba(6,9,19,0.6) 100%)',
              }}
              className="absolute inset-0"
            />
          </div>
        );
      })}

      {/* Ambient Decorative Glow */}
      <div
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.28) 0%, transparent 70%)' }}
        className="pointer-events-none absolute -top-24 start-1/4 w-96 h-96 rounded-full blur-3xl z-10"
      />

      {/* Main Content Container (padded at the bottom so controls sit cleanly above the page fade) */}
      <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-between pt-8 sm:pt-10 pb-14 sm:pb-16 lg:pb-20">
        <div className="my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Text & CTA Column (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Glowing Badge */}
            <div
              style={{
                backgroundColor: 'rgba(99, 102, 241, 0.16)',
                borderColor: 'rgba(129, 140, 248, 0.35)',
                color: '#e0e7ff',
              }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border backdrop-blur-md text-xs sm:text-sm font-bold shadow-lg"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-400" />
              </span>
              <span>{activeSlide.badge}</span>
            </div>

            {/* Hero Title */}
            <h1
              style={{ color: '#ffffff' }}
              className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold leading-[1.18] tracking-tight"
            >
              {activeSlide.title}{' '}
              <span className="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-300">
                {activeSlide.highlight}
              </span>
            </h1>

            {/* Description */}
            <p
              style={{ color: '#cbd5e1' }}
              className="text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed font-normal"
            >
              {activeSlide.description}
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={scrollToExplorer}
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-500 text-white text-sm sm:text-base font-bold px-7 py-3.5 sm:py-4 rounded-2xl shadow-xl shadow-brand-600/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{activeSlide.cta}</span>
                <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-y-1" />
              </button>

              <Link
                href="/landlord"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                }}
                className="inline-flex items-center gap-2 px-6 py-3.5 sm:py-4 rounded-2xl border backdrop-blur-md hover:bg-white/15 text-sm sm:text-base font-semibold transition"
              >
                <Building2 className="w-4 h-4 text-indigo-300" />
                <span>{isRTL ? 'هل أنت مالك؟ اعرض عقارك' : 'Are you a Landlord? List Property'}</span>
              </Link>
            </div>

            {/* Trust Metrics Bar */}
            <div className="pt-3 flex flex-wrap items-center gap-6 sm:gap-8 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span style={{ color: '#e2e8f0' }} className="font-semibold">
                  {isRTL ? 'عقارات مفحوصة وموثقة 100%' : '100% Verified Listings'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-400 shrink-0" />
                <span style={{ color: '#e2e8f0' }} className="font-semibold">
                  {isRTL ? 'حساب دقيق للمسافة من جامعتك' : 'Exact Campus Distance Engine'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-cyan-400 shrink-0" />
                <span style={{ color: '#e2e8f0' }} className="font-semibold">
                  {isRTL ? 'شامل الإنترنت والفواتير' : 'Bills & Fast Wi-Fi Included'}
                </span>
              </div>
            </div>
          </div>

          {/* Floating Glass Showcase Card (5 Cols - Desktop) */}
          <div className="hidden lg:block lg:col-span-5">
            <div
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.68)',
                borderColor: 'rgba(255, 255, 255, 0.16)',
              }}
              className="relative rounded-3xl border backdrop-blur-xl p-5 shadow-2xl transition-all duration-500 hover:border-indigo-400/40"
            >
              {/* Image Preview inside Floating Card */}
              <div className="relative h-48 rounded-2xl overflow-hidden mb-4">
                <img
                  src={activeSlide.image}
                  alt={activeSlide.card.title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div
                  style={{ backgroundColor: 'rgba(6, 9, 19, 0.78)', color: '#6ee7b7' }}
                  className="absolute top-3 start-3 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-emerald-400/30"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{activeSlide.card.tag}</span>
                </div>
                <div
                  style={{ backgroundColor: 'rgba(79, 70, 229, 0.95)', color: '#ffffff' }}
                  className="absolute bottom-3 end-3 px-3.5 py-1.5 rounded-xl shadow-lg"
                >
                  <span className="text-lg font-extrabold">{activeSlide.card.price}</span>
                  <span className="text-[11px] opacity-90"> {activeSlide.card.period}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {activeSlide.propertyId ? (
                      <Link
                        href={`/properties/${activeSlide.propertyId}`}
                        style={{ color: '#ffffff' }}
                        className="font-extrabold text-lg leading-snug hover:text-indigo-300 transition flex items-center gap-1.5 truncate"
                      >
                        <span className="truncate">{activeSlide.card.title}</span>
                        <ExternalLink className="w-4 h-4 text-indigo-400 shrink-0" />
                      </Link>
                    ) : (
                      <h3
                        style={{ color: '#ffffff' }}
                        className="font-extrabold text-lg leading-snug truncate"
                      >
                        {activeSlide.card.title}
                      </h3>
                    )}
                    <p
                      style={{ color: '#94a3b8' }}
                      className="text-xs flex items-center gap-1.5 mt-1 font-medium truncate"
                    >
                      <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">{activeSlide.card.location}</span>
                    </p>
                  </div>
                  <div
                    style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fcd34d' }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{activeSlide.card.rating}</span>
                  </div>
                </div>

                {/* Perks Pills */}
                <div
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  className="pt-3 border-t grid grid-cols-1 gap-2"
                >
                  {activeSlide.card.perks.map((perk, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span style={{ color: '#e2e8f0' }} className="font-medium truncate">
                        {perk}
                      </span>
                    </div>
                  ))}
                </div>

                {activeSlide.propertyId && (
                  <div className="pt-2">
                    <Link
                      href={`/properties/${activeSlide.propertyId}`}
                      className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <span>{isRTL ? 'عرض تفاصيل العقار' : 'View Property Details'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Bar: Slide Thumbnails & Arrows */}
        <div
          style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}
          className="pt-4 border-t flex items-center justify-between gap-4"
        >
          {/* Interactive Progress Indicators */}
          <div className="flex items-center gap-2.5">
            {slides.map((s, idx) => {
              const isActive = idx === current;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrent(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className="group flex items-center gap-2 py-1 focus:outline-none"
                >
                  <span
                    style={{
                      backgroundColor: isActive ? '#6366f1' : 'rgba(255, 255, 255, 0.28)',
                    }}
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isActive ? 'w-12 sm:w-16' : 'w-3 group-hover:w-5'
                    }`}
                  />
                </button>
              );
            })}
            <span style={{ color: '#94a3b8' }} className="text-xs font-mono font-bold ms-2">
              0{current + 1} / 0{slides.length}
            </span>
          </div>

          {/* Next / Prev Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous slide"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
              }}
              className="w-10 h-10 rounded-xl border backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition active:scale-95"
            >
              {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next slide"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
              }}
              className="w-10 h-10 rounded-xl border backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition active:scale-95"
            >
              {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Smooth Bottom Fade into the Page Background (Adapts to Light & Dark Mode) */}
      <div
        style={{
          background: isDark
            ? 'linear-gradient(to bottom, rgba(6, 9, 19, 0) 0%, rgba(2, 6, 23, 0.65) 55%, #020617 100%)'
            : 'linear-gradient(to bottom, rgba(6, 9, 19, 0) 0%, rgba(248, 250, 252, 0.45) 60%, #f8fafc 100%)',
        }}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-14 sm:h-16 lg:h-20 z-30"
      />
    </section>
  );
}