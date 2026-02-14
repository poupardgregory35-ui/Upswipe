'use client'

import Link from 'next/link'
import { ChevronRight, Clock, ShieldCheck, Smartphone } from 'lucide-react'

interface CandidateSectionProps {
    onCandidateClick?: () => void
}

export function CandidateSection({ onCandidateClick }: CandidateSectionProps) {
    return (
        <section className="relative w-full md:w-1/2 bg-slate-950 flex items-center justify-center px-6 md:px-12 py-16 md:py-0 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[140px]" />

            <div className="relative z-10 max-w-lg text-center md:text-left">
                <div className="inline-flex items-center gap-2 py-1.5 px-5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-green-400 tracking-widest uppercase mb-8 backdrop-blur-md">
                    <Smartphone size={14} />
                    Espace Candidat
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-white mb-6">
                    Swipe ton job, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                        demain commence ici
                    </span>
                </h2>
                <p className="text-lg text-slate-400 leading-relaxed mb-10">
                    Crée ton profil en 60 secondes. Active ta position et reçois des missions
                    qui matchent avec tes dispos et ton tarif.
                </p>
                <Link
                    href="/login/candidate?view=signup"
                    onClick={onCandidateClick}
                    className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-5 px-10 rounded-2xl shadow-xl shadow-green-900/30 transition-all transform hover:scale-[1.02] hover:-translate-y-1"
                >
                    Créer mon profil
                    <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <div className="mt-8 flex flex-col items-center justify-center md:items-start md:justify-start gap-4 text-sm text-slate-500 font-medium">
                    <div className="flex gap-6">
                        <span className="flex items-center gap-2">
                            <Clock size={16} className="text-green-500" />
                            Inscription 2 min
                        </span>
                        <span className="flex items-center gap-2">
                            <ShieldCheck size={16} className="text-green-500" />
                            Gratuit
                        </span>
                    </div>
                    <Link href="/login/candidate?view=login" className="text-slate-400 hover:text-green-400 transition-colors underline decoration-slate-700 hover:decoration-green-400">
                        Déjà inscrit ? Me connecter
                    </Link>
                </div>
            </div>
        </section>
    )
}
