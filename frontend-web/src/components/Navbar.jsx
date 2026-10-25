"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = { LANDLORD: 'Landlord', STUDENT: 'Student', ADMIN: 'Admin' };

export default function Navbar() {
  const { user, logout, isLandlord, isStudent } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: '/', label: 'Explore Map', visible: true },
    { href: '/student', label: 'My Bookings', visible: isStudent },
    { href: '/landlord', label: 'Landlord Dashboard', visible: isLandlord },
  ].filter((link) => link.visible);

  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  const desktopLinkClass = (href) =>
    `px-3 py-2 rounded-lg transition ${
      isActive(href)
        ? 'bg-brand-50 text-brand-700'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const mobileLinkClass = (href) =>
    `block px-3 py-2.5 rounded-lg text-sm font-medium transition ${
      isActive(href)
        ? 'bg-brand-50 text-brand-700'
        : 'text-slate-700 hover:bg-slate-100'
    }`;

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    closeMenu();
    logout();
    router.push('/');
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : '?';
  const roleLabel = user ? ROLE_LABELS[user.role] || user.role : '';

  return (
    <nav className="bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" onClick={closeMenu} className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-brand-500 text-white font-bold flex items-center justify-center shadow-sm">
              U
            </span>
            <span className="text-xl font-bold text-slate-900">UniHousing</span>
          </Link>

          <div className="hidden md:flex items-center gap-1 text-sm font-medium">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={desktopLinkClass(link.href)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-slate-100">
                <span className="w-7 h-7 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">
                  {initial}
                </span>
                <span className="text-sm font-semibold text-slate-800 max-w-[160px] truncate">
                  {user.name}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    isLandlord ? 'bg-amber-100 text-amber-800' : 'bg-brand-100 text-brand-700'
                  }`}
                >
                  {roleLabel}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-slate-600 hover:text-red-600 px-3 py-2 font-medium transition"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-slate-700 hover:text-brand-500 px-3 py-2 transition"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg transition shadow-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-lg">
          {user && (
            <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-slate-50">
              <span className="w-9 h-9 rounded-full bg-brand-500 text-white text-sm font-bold flex items-center justify-center shrink-0">
                {initial}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                <p className="text-xs text-slate-500">{roleLabel}</p>
              </div>
            </div>
          )}

          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={mobileLinkClass(link.href)}
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-2 mt-2 border-t border-slate-100">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
              >
                Log Out
              </button>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="flex-1 text-center text-sm font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-lg transition"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="flex-1 text-center text-sm font-medium bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-lg transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
