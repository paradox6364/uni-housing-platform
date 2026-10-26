"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import SettingsToggles from './SettingsToggles';

const ROLE_LABELS = { LANDLORD: 'Landlord', STUDENT: 'Student', ADMIN: 'Admin' };

export default function Navbar() {
  const { user, logout, isLandlord, isStudent } = useAuth();
  const { t } = useSettings();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // الروابط الرئيسية: تتغير حسب نوع المستخدم (زائر / طالب / مالك)
  const links = [
    { href: '/', label: t('nav.explore'), visible: true },
    { href: '/student', label: t('nav.myBookings'), visible: isStudent },
    { href: '/landlord', label: t('nav.landlordDashboard'), visible: isLandlord },
  ].filter((link) => link.visible);

  // الرابط النشط = الصفحة اللي أنت فيها الآن
  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  const desktopLinkClass = (href) =>
    `px-3 py-2 rounded-lg transition ${
      isActive(href)
        ? 'bg-brand-50 text-brand-700'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const mobileLinkClass = (href) =>
    `block px-3 py-2.5 rounded-lg text-sm font-medium transition ${
      isActive(href) ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-100'
    }`;

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    closeMenu();
    logout();
    router.push('/');
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : '?';
  const roleLabel = user ? t(`role.${user.role}`) : '';

  return (
    <nav className="bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* الشعار + الروابط (شاشة كبيرة) */}
        <div className="flex items-center gap-6">
          <Link href="/" onClick={closeMenu} className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white font-extrabold flex items-center justify-center shadow-sm">
              U
            </span>
            <span className="text-xl font-extrabold text-slate-900">UniHousing</span>
          </Link>

          <div className="hidden md:flex items-center gap-1 text-sm font-semibold">
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

        {/* الإعدادات + حساب المستخدم (شاشة كبيرة) */}
        <div className="hidden md:flex items-center gap-2">
          <SettingsToggles />
          <span className="w-px h-6 bg-slate-200 mx-1" aria-hidden="true" />

          {user ? (
            <>
              <div className="flex items-center gap-2 ps-1 pe-3 py-1 rounded-full bg-slate-100">
                <span className="w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">
                  {initial}
                </span>
                <span className="text-sm font-semibold text-slate-800 max-w-[160px] truncate">
                  {user.name}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    isLandlord ? 'bg-amber-100 text-amber-800' : 'bg-brand-100 text-brand-700'
                  }`}
                >
                  {roleLabel}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-slate-600 hover:text-red-600 px-3 py-2 font-semibold transition"
              >
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-700 hover:text-brand-600 px-3 py-2 transition"
              >
                {t('nav.login')}
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition shadow-sm"
              >
                {t('nav.signup')}
              </Link>
            </>
          )}
        </div>

        {/* الإعدادات + زر القائمة (موبايل فقط) */}
        <div className="md:hidden flex items-center gap-1">
          <SettingsToggles />
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={t('nav.menu')}
            aria-expanded={menuOpen}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* قائمة الموبايل */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-lg">
          {user && (
            <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-slate-50">
              <span className="w-9 h-9 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
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
                className="w-full text-start px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition"
              >
                {t('nav.logout')}
              </button>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="flex-1 text-center text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-lg transition"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="flex-1 text-center text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-lg transition"
                >
                  {t('nav.signup')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
