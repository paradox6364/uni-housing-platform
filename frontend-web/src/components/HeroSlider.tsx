"use client";

import React, { useState, useEffect, useCallback } from "react";

interface Slide {
  id: number;
  tag: string;
  title: string;
  highlight: string;
  description: string;
  image: string;
  stats: { label: string; value: string }[];
  ctaText: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    tag: "🎓 السكن الطلابي الأول الموثق",
    title: "اسكن على بُعد خطوات من",
    highlight: "حرم جامعتك",
    description:
      "اكتشف مئات الغرف والشقق الطلابية الموثقة بالقرب من جامعتك باستخدام محرك البحث الجغرافي الدقيق، واحجز سكنك بأمان تام.",
    image:
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop",
    stats: [
      { label: "شقق موثقة", value: "+500" },
      { label: "متوسط المسافة", value: "5 دقائق" },
      { label: "تقييم الطلاب", value: "4.9/5 ⭐" },
    ],
    ctaText: "استكشف السكن على الخريطة",
  },
  {
    id: 2,
    tag: "✨ بيئة مجهزة للنجاح",
    title: "غرف عصرية مجهزة بالكامل",
    highlight: "لراحتك ومذاكرتك",
    description:
      "لا تشغل بالك بالتجهيزات؛ جميع الوحدات تأتي مع مكاتب دراسية مريحة، إنترنت فائق السرعة، وخدمات صيانة دورية.",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop",
    stats: [
      { label: "إنترنت فايبر", value: "مشمول" },
      { label: "أمان وحراسة", value: "24/7" },
      { label: "عمولة خفية", value: "0%" },
    ],
    ctaText: "تصفح الغرف المتاحة",
  },
  {
    id: 3,
    tag: "⚡ حجز فوري وآمن",
    title: "قارن الأسعار والمواقع",
    highlight: "واحجز بضغطة زر",
    description:
      "تواصل مباشر مع أصحاب العقارات الموثقين، شاهد الموقع الفعلي على الخريطة التفاعلية، وأرسل طلب حجزك في ثوانٍ.",
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2080&auto=format&fit=crop",
    stats: [
      { label: "تأكيد الحجز", value: "فوري" },
      { label: "جامعات مدعومة", value: "+20" },
      { label: "دعم طلابي", value: "متواصل" },
    ],
    ctaText: "ابدأ رحلة البحث الآن",
  },
];

interface HeroSliderProps {
  onExploreClick?: () => void;
}

export default function HeroSlider({ onExploreClick }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, 5500);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const handleAction = () => {
    if (onExploreClick) {
      onExploreClick();
    } else {
      const searchSection = document.getElementById("main-search-section");
      if (searchSection) {
        searchSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section
      dir="rtl"
      className="relative w-full h-[520px] md:h-[600px] overflow-hidden bg-slate-950 select-none shadow-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* خلفيات الصور مع تأثير التقريب البطيء */}
      {SLIDES.map((slide, index) => {
        const isActive = index === current;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className={`w-full h-full object-cover object-center transition-transform duration-[6000ms] ease-out ${
                isActive ? "scale-110" : "scale-100"
              }`}
            />
            {/* طبقات التدرج اللوني لضمان وضوح النصوص */}
            <div className="absolute inset-0 bg-gradient-to-l from-slate-950/90 via-slate-900/75 to-slate-950/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />
          </div>
        );
      })}

      {/* المحتوى الرئيسي للسلايدر */}
      <div className="relative z-20 max-w-7xl mx-auto h-full px-6 sm:px-10 flex flex-col justify-center">
        <div className="max-w-2xl space-y-6">
          {/* الشارة العلوية (Tag) */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-sm font-medium shadow-lg animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{SLIDES[current].tag}</span>
          </div>

          {/* العنوان الرئيسي */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight transition-all duration-500">
            {SLIDES[current].title}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              {SLIDES[current].highlight}
            </span>
          </h1>

          {/* الوصف */}
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl font-normal">
            {SLIDES[current].description}
          </p>

          {/* أزرار التفاعل (CTA) */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={handleAction}
              className="group relative inline-flex items-center gap-3 px-7 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-base shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <span>{SLIDES[current].ctaText}</span>
              <svg
                className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>

            <a
              href="/landlord"
              className="px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-white font-semibold text-base transition-all duration-200"
            >
              هل أنت مالك عقار؟ أضف سكنك
            </a>
          </div>

          {/* الإحصائيات الزجاجية السفلية */}
          <div className="pt-6 grid grid-cols-3 gap-3 sm:gap-6 max-w-lg border-t border-white/10">
            {SLIDES[current].stats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-center sm:text-right"
              >
                <div className="text-xl sm:text-2xl font-extrabold text-white">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* أزرار التنقل (يمين ويسار) */}
      <div className="hidden md:flex absolute left-8 bottom-8 z-30 items-center gap-3">
        <button
          onClick={prevSlide}
          aria-label="الشريحة السابقة"
          className="p-3.5 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white transition-all hover:scale-105 active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          aria-label="الشريحة التالية"
          className="p-3.5 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white transition-all hover:scale-105 active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* مؤشرات الشرائح السفلية (Progress Bars) */}
      <div className="absolute bottom-6 right-6 sm:right-10 z-30 flex items-center gap-3">
        {SLIDES.map((slide, index) => {
          const isActive = index === current;
          return (
            <button
              key={slide.id}
              onClick={() => setCurrent(index)}
              aria-label={`الانتقال إلى الشريحة ${index + 1}`}
              className="group py-2 focus:outline-none"
            >
              <div
                className={`h-1.5 rounded-full transition-all duration-500 overflow-hidden ${
                  isActive ? "w-14 bg-emerald-400" : "w-6 bg-white/30 group-hover:bg-white/50"
                }`}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
