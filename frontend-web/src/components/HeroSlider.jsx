"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  MapPin,
  Wifi,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const SLIDES = {
  ar: [
    {
      id: 1,
      badge: 'المنصة الأولى للسكن الطلابي الموثق',
      title: 'اسكن على بُعد خطوات من',
      highlight: 'حرم جامعتك',
      description:
        'قارن بين مئات الغرف والشقق الطلابية الموثقة، واعرف المسافة الفعلية بالدقائق والكم عبر الخريطة التفاعلية قبل الحجز.',
      image:
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1600&q=80',
      cta: 'استكشف السكن المتاح',
      stats: [
        { icon: ShieldCheck, value: '100%', label: 'عقارات موثقة' },
        { icon: MapPin, value: '5 دقائق', label: 'متوسط المسافة' },
        { icon: Sparkles, value: '4.9/5', label: 'تقييم الطلاب' },
      ],
    },
    {
      id: 2,
      badge: 'بيئة مثالية للدراسة والراحة',
      title: 'غرف عصرية مجهزة بالكامل',
      highlight: 'لنجاحك الدراسي',
      description:
        'جميع الوحدات تأتي مفروشة بالكامل مع مكاتب دراسية مريحة، إنترنت فائق السرعة، شاملة الفواتير والخدمات الأمنية على مدار الساعة.',
      image:
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80',
      cta: 'تصفح الغرف والاستوديوهات',
      stats: [
        { icon: Wifi, value: 'فايبر', label: 'إنترنت مجاني' },
        { icon: ShieldCheck, value: '24/7', label: 'أمن وحراسة' },
        { icon: Building2, value: '0%', label: 'عمولة خفية' },
      ],
    },
    {
      id: 3,
      badge: 'حجز فوري وتواصل مباشر',
      title: 'اختر غرفتك وقارن الأسعار',
      highlight: 'واحجز بضغطة زر',
      description:
        'تواصل مباشرة مع ملاك العقارات الموثقين، شاهد الموقع الدقيق على الخريطة، وأرسل طلب حجزك في ثوانٍ بدون وسطاء.',
      image:
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80',
      cta: 'ابدأ البحث الآن',
      stats: [
        { icon: Sparkles, value: 'فوري', label: 'تأكيد الحجز' },
        { icon: MapPin, value: 'دقيق', label: 'تحديد الموقع' },
        { icon: ShieldCheck, value: 'آمن', label: 'عقود موثقة' },
      ],
    },
  ],
  en: [
    {
      id: 1,
      badge: '#1 Verified Student Housing Platform',
      title: 'Live Just Steps Away From',
      highlight: 'Your Campus',
      description:
        'Compare hundreds of verified student rooms and studios. Check exact walking minutes and distance on the interactive map before booking.',
      image:
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1600&q=80',
      cta: 'Explore Available Housing',
      stats: [
        { icon: ShieldCheck, value: '100%', label: 'Verified Listings' },
        { icon: MapPin, value: '5 Mins', label: 'Avg. Walk Time' },
        { icon: Sparkles, value: '4.9/5', label: 'Student Rating' },
      ],
    },
    {
      id: 2,
      badge: 'Built for Study & Comfort',
      title: 'Modern Fully Furnished Rooms',
      highlight: 'For Your Success',
      description:
        'Move-in ready spaces equipped with dedicated study desks, high-speed Wi-Fi, all-inclusive utility bills, and 24/7 CCTV security.',
      image:
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80',
      cta: 'Browse Rooms & Studios',
      stats: [
        { icon: Wifi, value: 'High-Speed', label: 'Free Wi-Fi' },
        { icon: ShieldCheck, value: '24/7', label: 'CCTV Security' },
        { icon: Building2, value: '0%', label: 'Booking Fees' },
      ],
    },
    {
      id: 3,
      badge: 'Instant & Direct Booking',
      title: 'Compare Prices, Pick a Pin',
      highlight: 'Book in One Click',
      description:
        'Connect directly with verified landlords, inspect exact street locations on the map, and send your booking request in seconds.',
      image:
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80',
      cta: 'Start Searching Now',
      stats: [
        { icon: Sparkles, value: 'Fast', label: 'Approval Process' },
        { icon: MapPin, value: 'Exact', label: 'Map Coordinates' },
        { icon: ShieldCheck, value: 'Safe', label: 'Verified Hosts' },
      ],
    },
  ],
};

export default function HeroSlider({ onExplore }) {
  const { lang, isRTL } = useSettings();
  const slides = SLIDES[lang] || SLIDES.ar;

  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, 5500);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const activeSlide = slides[current] || slides[0];
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const handleExploreClick = () => {
    if (onExplore) {
      onExplore();
      return;
    }
    const target = document.getElementById('listings-heading');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{ backgroundColor: '#090d16', color: '#ffffff' }}
      className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200/60 select-none mb-2"
    >
      {/* Background Slides with Smooth Zoom */}
      {slides.map((slide, idx) => {
        const isActive = idx === current;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className={`w-full h-full object-cover object-center transition-transform duration-[6000ms] ease-out ${
                isActive ? 'scale-110' : 'scale-100'
              }`}
            />
            <div
              style={{
                background: isRTL
                  ? 'linear-gradient(to left, rgba(9,13,22,0.94) 15%, rgba(9,13,22,0.78) 55%, rgba(9,13,22,0.35) 100%)'
                  : 'linear-gradient(to right, rgba(9,13,22,0.94) 15%, rgba(9,13,22,0.78) 55%, rgba(9,13,22,0.35) 100%)',
              }}
              className="absolute inset-0"
            />
          </div>
        );
      })}

      {/* Slide Content */}
      <div className="relative z-20 p-5 sm:p-7 flex flex-col justify-between min-h-[290px] sm:min-h-[320px]">
        <div className="max-w-xl space-y-3">
          {/* Top Pill Badge */}
          <div
            style={{
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              borderColor: 'rgba(129, 140, 248, 0.35)',
              color: '#c7d2fe',
            }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border backdrop-blur-md text-xs font-bold"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span>{activeSlide.badge}</span>
          </div>

          {/* Main Heading */}
          <h2
            style={{ color: '#ffffff' }}
            className="text-2xl sm:text-3xl font-extrabold leading-tight"
          >
            {activeSlide.title}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300">
              {activeSlide.highlight}
            </span>
          </h2>

          {/* Subtitle */}
          <p
            style={{ color: '#cbd5e1' }}
            className="text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3"
          >
            {activeSlide.description}
          </p>

          {/* CTA Buttons */}
          <div className="pt-1 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExploreClick}
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-md shadow-brand-900/40 transition transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{activeSlide.cta}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>

            <Link
              href="/landlord"
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderColor: 'rgba(255,255,255,0.2)',
                color: '#f8fafc',
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border backdrop-blur-sm hover:bg-white/20 text-xs sm:text-sm font-semibold transition"
            >
              {isRTL ? 'أضف عقارك كمالك' : 'List Your Property'}
            </Link>
          </div>
        </div>

        {/* Bottom Bar: Glass Stats + Navigation Controls */}
        <div
          style={{ borderColor: 'rgba(255,255,255,0.12)' }}
          className="mt-5 pt-3.5 border-t flex flex-wrap items-center justify-between gap-3"
        >
          {/* Quick Stats */}
          <div className="flex items-center gap-4 sm:gap-6">
            {activeSlide.stats.map((stat, i) => {
              const IconComp = stat.icon;
              return (
                <div key={i} className="flex items-center gap-2">
                  <div
                    style={{ backgroundColor: 'rgba(99, 102, 241, 0.25)', color: '#a5b4fc' }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  >
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div style={{ color: '#ffffff' }} className="text-xs font-extrabold leading-none">
                      {stat.value}
                    </div>
                    <div style={{ color: '#94a3b8' }} className="text-[10px] mt-0.5">
                      {stat.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Slide Indicators & Prev/Next Arrows */}
          <div className="flex items-center gap-2 ms-auto">
            <div className="flex items-center gap-1.5 me-1">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrent(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className="py-1 focus:outline-none"
                >
                  <span
                    style={{
                      backgroundColor:
                        idx === current ? '#818cf8' : 'rgba(255,255,255,0.3)',
                    }}
                    className={`block h-1.5 rounded-full transition-all duration-300 ${
                      idx === current ? 'w-7' : 'w-2 hover:w-3'
                    }`}
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous slide"
              style={{
                backgroundColor: 'rgba(255,255,255,0.12)',
                borderColor: 'rgba(255,255,255,0.2)',
                color: '#ffffff',
              }}
              className="w-7 h-7 rounded-lg border flex items-center justify-center hover:bg-white/25 transition"
            >
              {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next slide"
              style={{
                backgroundColor: 'rgba(255,255,255,0.12)',
                borderColor: 'rgba(255,255,255,0.2)',
                color: '#ffffff',
              }}
              className="w-7 h-7 rounded-lg border flex items-center justify-center hover:bg-white/25 transition"
            >
              {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
