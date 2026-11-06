"use client";

import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const CLOSE_MS = 550;
const HOLD_MS = 280;
const OPEN_MS = 950;

export default function DoorTransition({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [stage, setStage] = useState('closed');
  const timersRef = useRef([]);
  const isNavigatingRef = useRef(false);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => {
    clearTimers();
    const waitTime = isNavigatingRef.current ? HOLD_MS : 550;
    isNavigatingRef.current = false;

    setStage('closed');

    const t1 = setTimeout(() => {
      setStage('opening');
    }, waitTime);

    const t2 = setTimeout(() => {
      setStage('open');
    }, waitTime + OPEN_MS + 50);

    timersRef.current.push(t1, t2);
    return clearTimers;
  }, [pathname]);

  useEffect(() => {
    const handleLinkClick = (e) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      const anchor = e.target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        anchor.target === '_blank'
      ) {
        return;
      }

      const targetPath = href.split('?')[0].split('#')[0];
      if (targetPath === pathname) return;

      e.preventDefault();
      e.stopPropagation();

      if (isNavigatingRef.current) return;
      isNavigatingRef.current = true;

      clearTimers();
      setStage('closing');

      const navTimer = setTimeout(() => {
        router.push(href);
      }, CLOSE_MS);

      const fallbackTimer = setTimeout(() => {
        if (isNavigatingRef.current) {
          isNavigatingRef.current = false;
          setStage('opening');
          const doneTimer = setTimeout(() => setStage('open'), OPEN_MS);
          timersRef.current.push(doneTimer);
        }
      }, CLOSE_MS + 2500);

      timersRef.current.push(navTimer, fallbackTimer);
    };

    document.addEventListener('click', handleLinkClick, true);
    return () => document.removeEventListener('click', handleLinkClick, true);
  }, [pathname, router]);

  const isShut = stage === 'closed' || stage === 'closing';
  const duration = stage === 'closing' ? CLOSE_MS : OPEN_MS;
  const easing =
    stage === 'closing'
      ? 'cubic-bezier(0.7, 0, 0.2, 1)'
      : 'cubic-bezier(0.85, 0, 0.15, 1)';

  return (
    <>
      <div
        aria-hidden="true"
        dir="ltr"
        className={`fixed inset-0 z-[9999] flex overflow-hidden ${
          stage === 'open'
            ? 'pointer-events-none invisible'
            : 'pointer-events-auto visible'
        }`}
      >
        <div
          style={{
            background:
              'linear-gradient(135deg, #050b14 0%, #0f2138 65%, #142B4A 100%)',
            transform: isShut
              ? 'translate3d(0%, 0, 0)'
              : 'translate3d(-102%, 0, 0)',
            transition: `transform ${duration}ms ${easing}`,
            willChange: 'transform',
            boxShadow: '25px 0 70px rgba(0, 0, 0, 0.9)',
          }}
          className="relative w-[calc(50%+1px)] h-full flex items-center justify-end overflow-hidden"
        >
          <div
            style={{
              background:
                'radial-gradient(circle at 100% 50%, rgba(16, 185, 129, 0.2), transparent 65%)',
            }}
            className="absolute inset-0 pointer-events-none"
          />
          <div
            style={{
              background:
                'linear-gradient(to bottom, transparent 10%, #10B981 50%, transparent 90%)',
              boxShadow: '0 0 25px #10B981',
            }}
            className="w-[3px] h-full opacity-90"
          />
        </div>

        <div
          style={{
            background:
              'linear-gradient(225deg, #050b14 0%, #0f2138 65%, #142B4A 100%)',
            transform: isShut
              ? 'translate3d(0%, 0, 0)'
              : 'translate3d(102%, 0, 0)',
            transition: `transform ${duration}ms ${easing}`,
            willChange: 'transform',
            boxShadow: '-25px 0 70px rgba(0, 0, 0, 0.9)',
          }}
          className="relative w-[calc(50%+1px)] -ms-[2px] h-full flex items-center justify-start overflow-hidden"
        >
          <div
            style={{
              background:
                'radial-gradient(circle at 0% 50%, rgba(16, 185, 129, 0.2), transparent 65%)',
            }}
            className="absolute inset-0 pointer-events-none"
          />
          <div
            style={{
              background:
                'linear-gradient(to bottom, transparent 10%, #10B981 50%, transparent 90%)',
              boxShadow: '0 0 25px #10B981',
            }}
            className="w-[3px] h-full opacity-90"
          />
        </div>

        <div
          style={{
            transition: 'all 450ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            opacity: isShut ? 1 : 0,
            transform: isShut
              ? 'scale(1) rotate(0deg)'
              : 'scale(0.6) rotate(12deg)',
          }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="relative flex flex-col items-center">
            <div
              style={{
                background:
                  'radial-gradient(circle, rgba(16,185,129,0.45) 0%, transparent 70%)',
              }}
              className="absolute -inset-12 rounded-full blur-2xl animate-pulse"
            />

            <div
              style={{
                backgroundColor: '#0a1626',
                borderColor: 'rgba(16, 185, 129, 0.5)',
                boxShadow:
                  '0 0 50px rgba(20, 43, 74, 0.8), inset 0 0 20px rgba(16, 185, 129, 0.25)',
              }}
              className="relative w-24 h-24 rounded-3xl border-2 flex items-center justify-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#142B4A] to-[#10B981] text-white font-extrabold text-4xl flex items-center justify-center shadow-lg">
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

      {children}
    </>
  );
}
