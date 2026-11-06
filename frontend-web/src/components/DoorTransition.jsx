"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function DoorTransition({ children }) {
  const pathname = usePathname();
  const [isClosed, setIsClosed] = useState(true);

  useEffect(() => {
    setIsClosed(true);
    const timer = setTimeout(() => {
      setIsClosed(false);
    }, 320);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[9999] pointer-events-none flex overflow-hidden"
        dir="ltr"
      >
        <div
          style={{
            backgroundColor: '#060913',
            borderColor: 'rgba(99, 102, 241, 0.35)',
            transitionTimingFunction: 'cubic-bezier(0.77, 0, 0.175, 1)',
          }}
          className={`w-1/2 h-full border-r shadow-2xl transition-transform duration-700 ${
            isClosed ? 'translate-x-0' : '-translate-x-full'
          }`}
        />

        <div
          style={{
            backgroundColor: '#060913',
            borderColor: 'rgba(99, 102, 241, 0.35)',
            transitionTimingFunction: 'cubic-bezier(0.77, 0, 0.175, 1)',
          }}
          className={`w-1/2 h-full border-l shadow-2xl transition-transform duration-700 ${
            isClosed ? 'translate-x-0' : 'translate-x-full'
          }`}
        />

        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
            isClosed ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
        >
          <div className="flex flex-col items-center gap-2.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white font-extrabold text-2xl flex items-center justify-center shadow-2xl shadow-brand-600/50 border border-white/20">
              U
            </div>
            <span
              style={{ color: '#ffffff' }}
              className="text-xs font-extrabold tracking-widest uppercase"
            >
              UniHousing
            </span>
          </div>
        </div>
      </div>

      {children}
    </>
  );
}
