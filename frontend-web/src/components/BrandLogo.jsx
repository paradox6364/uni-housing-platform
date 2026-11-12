'use client';
import Link from 'next/link';
import { useId } from 'react';

export default function BrandLogo({ className = '', showText = true }) {
  const uid = useId();
  const bgGradId = `oxfordBg-${uid}`;
  const houseGradId = `steelTint-${uid}`;

  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 select-none focus:outline-none ${className}`}
    >
      {/* Oxford Navy & Steel Blue SVG Mark */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        className="w-10 h-10 shrink-0 rounded-[10px] shadow-sm transition-transform duration-200 group-hover:scale-105"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={bgGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334E68" />
            <stop offset="50%" stopColor="#142B4A" />
            <stop offset="100%" stopColor="#0A1626" />
          </linearGradient>
          <linearGradient id={houseGradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F0F4F8" />
            <stop offset="100%" stopColor="#BCCCDC" />
          </linearGradient>
        </defs>

        {/* Badge Background */}
        <rect width="512" height="512" rx="112" fill={`url(#${bgGradId})`} />

        {/* Subtle Inner Border */}
        <rect
          x="16"
          y="16"
          width="480"
          height="480"
          rx="96"
          fill="none"
          stroke="#9FB3C8"
          strokeOpacity="0.22"
          strokeWidth="6"
        />

        {/* Graduation Mortarboard Roof */}
        <path d="M256 124 L388 190 L256 256 L124 190 Z" fill="#FFFFFF" />

        {/* Tassel Cord & Active Pin Emerald Accent */}
        <path
          d="M358 205 V264"
          stroke="#9FB3C8"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <circle cx="358" cy="274" r="15" fill="#10B981" />

        {/* House Facade with Arched Doorway */}
        <path
          d="M168 228 L256 272 L344 228 V346 A30 30 0 0 1 314 376 H284 V322 A28 28 0 0 0 228 322 V376 H198 A30 30 0 0 1 168 346 Z"
          fill={`url(#${houseGradId})`}
        />
      </svg>

      {/* Wordmark synced with globals.css dark mode & RTL fonts */}
      {showText && (
        <span
          dir="ltr"
          className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 transition-colors"
        >
          Uni<span className="text-brand-600">Housing</span>
        </span>
      )}
    </Link>
  );
}