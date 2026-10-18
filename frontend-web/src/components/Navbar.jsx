'use client';
import Link from 'next/link';
import { GraduationCap, Building2, Search } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="bg-brand-600 text-white p-2 rounded-lg">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900">Uni</span>
          <span className="font-extrabold text-xl tracking-tight text-brand-600">Housing</span>
        </div>
      </Link>

      <div className="flex items-center gap-3 text-sm font-medium">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-slate-600 hover:text-brand-600 px-3 py-2 rounded-lg transition"
        >
          <Search className="w-4 h-4" />
          <span>Explore Map</span>
        </Link>
        <Link
          href="/landlord"
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-full transition"
        >
          <Building2 className="w-4 h-4" />
          <span>Landlord Portal</span>
        </Link>
      </div>
    </header>
  );
}
