"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useSettings();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'STUDENT',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const newUser = await register(formData);
      if (newUser.role === 'LANDLORD') {
        router.push('/landlord');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(err.message || t('register.errorDefault'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {t('register.title')}
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            {t('register.subtitle')}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Account Role Toggle */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'STUDENT' })}
              className={`py-2.5 text-sm font-semibold rounded-lg transition ${
                formData.role === 'STUDENT'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('register.roleStudent')}
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'LANDLORD' })}
              className={`py-2.5 text-sm font-semibold rounded-lg transition ${
                formData.role === 'LANDLORD'
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('register.roleLandlord')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('register.fullNameLabel')}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={
                  formData.role === 'LANDLORD'
                    ? t('register.namePlaceholderLandlord')
                    : t('register.namePlaceholderStudent')
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('register.emailLabel')}
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t('register.emailPlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('register.phoneLabel')}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder={t('register.phonePlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('register.passwordLabel')}
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={t('register.passwordPlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition text-sm"
            >
              {submitting
                ? t('register.creatingAccount')
                : formData.role === 'LANDLORD'
                ? t('register.submitLandlord')
                : t('register.submitStudent')}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-6">
            {t('register.hasAccount')}{' '}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
              {t('register.logIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}