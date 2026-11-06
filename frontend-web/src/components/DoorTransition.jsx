"use client";

import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function DoorTransition({ children }) {
  const pathname = usePathname();
  const [stage, setStage] = useState('closed'); // 'closed' | 'opening' | 'open'
  const isFirstMount = useRef(true);

  useEffect(() => {
    const handleLinkClick = (e) => {
      const anchor = e.target.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('http') ||
        anchor.target === '_blank' ||
        href === pathname
      ) {
        return;
      }
      setStage('closed');
    };

    document.addEventListener('click', handleLinkClick, true);
    return () => document.removeEventListener('click', handleLinkClick, true);
  }, [pathname]);

  useEffect(() => {
    setStage('closed');

    const holdTime = isFirstMount.current ? 650 : 480;
    isFirstMount.current = false;

    const openTimer = setTimeout(() => {
      setStage('opening');
    }, holdTime);

    const finishTimer = setTimeout(() => {
      setStage('open');
    }, holdTime + 1150);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(finishTimer);
    };
  }, [pathname]);

  const isShut = stage === 'closed';

  return (
    <>
      <div
        aria-hidden="true"
        dir="ltr"
        className={`fixed inset-0 z-[9999] flex overflow-hidden ${
          stage === 'open' ? 'pointer-events-none invisible' : 'pointer-events-auto visible'
        }`}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #030611 0%, #0b1124 65%, #131c38 100%)',
            transform: isShut ? 'translate3d(0%, 0, 0)' : 'translate3d(-102%, 0, 0)',
            transition: 'transform 1050ms cubic-bezier(0.85, 0, 0.15, 1)',
            willChange: 'transform',
            boxShadow: '25px 0 70px rgba(0, 0, 0, 0.9)',
          }}
          className="relative w-1/2 h-full flex items-center justify-end overflow-hidden"
        >
          <div
            style={{
              background:
                'radial-gradient(circle at 100% 50%, rgba(99, 102, 241, 0.25), transparent 65%)',
            }}
            className="absolute inset-0 pointer-events-none"
          />
          <div
            style={{
              background:
                'linear-gradient(to bottom, transparent 10%, #818cf8 50%, transparent 90%)',
              boxShadow: '0 0 25px #6366f1',
            }}
            className="w-[3px] h-full opacity-90"
          />
        </div>

        <div
          style={{
            background: 'linear-gradient(225deg, #030611 0%, #0b1124 65%, #131c38 100%)',
            transform: isShut ? 'translate3d(0%, 0, 0)' : 'translate3d(102%, 0, 0)',
            transition: 'transform 1050ms cubic-bezier(0.85, 0, 0.15, 1)',
            willChange: 'transform',
            boxShadow: '-25px 0 70px rgba(0, 0, 0, 0.9)',
          }}
          className="relative w-1/2 h-full flex items-center justify-start overflow-hidden"
        >
          <div
            style={{
              background:
                'radial-gradient(circle at 0% 50%, rgba(99, 102, 241, 0.25), transparent 65%)',
            }}
            className="absolute inset-0 pointer-events-none"
          />
          <div
            style={{
              background:
                'linear-gradient(to bottom, transparent 10%, #818cf8 50%, transparent 90%)',
              boxShadow: '0 0 25px #6366f1',
            }}
            className="w-[3px] h-full opacity-90"
          />
        </div>

        <div
          style={{
            transition: 'all 550ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            opacity: isShut ? 1 : 0,
            transform: isShut ? 'scale(1) rotate(0deg)' : 'scale(0.6) rotate(12deg)',
          }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="relative flex flex-col items-center">
            <div
              style={{
                background: 'radial-gradient(circle, rgba(99,102,241,0.55) 0%, transparent 70%)',
              }}
              className="absolute -inset-12 rounded-full blur-2xl animate-pulse"
            />

            <div
              style={{
                backgroundColor: '#090e1f',
                borderColor: 'rgba(129, 140, 248, 0.5)',
                boxShadow: '0 0 50px rgba(79, 70, 229, 0.6), inset 0 0 20px rgba(99, 102, 241, 0.3)',
              }}
              className="relative w-24 h-24 rounded-3xl border-2 flex items-center justify-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-brand-600 to-violet-700 text-white font-extrabold text-4xl flex items-center justify-center shadow-lg">
                U
              </div>
            </div>

            <span
              style={{ color: '#e0e7ff', letterSpacing: '0.32em' }}
              className="mt-4 text-xs font-extrabold uppercase drop-shadow"
            >
              UniHousing
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          transform: isShut ? 'scale(0.96)' : 'scale(1)',
          opacity: isShut ? 0.4 : 1,
          transition:
            'transform 1050ms cubic-bezier(0.22, 1, 0.36, 1), opacity 750ms ease-out',
        }}
      >
        {children}
      </div>
    </>
  );
}
