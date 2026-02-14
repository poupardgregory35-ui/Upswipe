'use client'

import Link from 'next/link'
import { Navigation } from 'lucide-react'
import { Logo } from './components/ui/Logo'
import { CandidateSection } from './components/CandidateSection'
import { RecruiterSection } from './components/RecruiterSection'
import { HeaderAuth } from './components/ui/HeaderAuth'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-white selection:bg-yellow-200">
      {/* ----- HEADER : fond blanc, logo en force ----- */}
      <header className="w-full bg-white px-6 md:px-12 py-8 md:py-10 border-b border-gray-100 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col items-center md:items-start group">
            <div className="relative">
              <Logo size="lg" />
            </div>
          </div>

          <nav className="flex gap-4 text-sm font-semibold text-slate-600 items-center mt-4 md:mt-0">
            <HeaderAuth />
          </nav>
        </div>
      </header>

      {/* ----- CONTENU PRINCIPAL : deux blocs centrés verticalement ----- */}
      <div className="flex-1 flex flex-col md:flex-row">

        {/* ---------- BLOC CANDIDAT (Gen Z) – OK, inchangé ---------- */}
        <CandidateSection />

        {/* ---------- BLOC RECRUTEUR : bureau flouté + verre dépoli + filigrane ---------- */}
        <RecruiterSection />

      </div>

      {/* ----- QR CODE SECTION (Mobile App) ----- */}
      <div className="w-full bg-slate-50 border-t border-gray-100 py-8 flex flex-col items-center justify-center gap-4">
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Télécharger l'application</p>
        <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <img src="/qr-upswipe.png" alt="QR Code Application" className="w-24 h-24 object-contain" />
        </div>
      </div>

      {/* ----- FOOTER : signature philosophique ----- */}
      <footer className="w-full bg-white border-t border-gray-100 py-6 px-6 text-center">
        <p className="text-sm text-gray-500 italic max-w-2xl mx-auto">
          « Le futur ne s’anticipe pas, il se construit. »
          <span className="block mt-1 text-xs text-gray-400 not-italic">
            UPSWIPE – Matching Transport Sanitaire
          </span>
        </p>
      </footer >
    </div >
  )
}
