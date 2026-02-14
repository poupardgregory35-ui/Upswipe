'use client'

import Link from 'next/link'
import { Briefcase, CheckCircle2, ChevronRight, Users } from 'lucide-react'

interface RecruiterSectionProps {
    onRecruiterClick?: () => void
}

export function RecruiterSection({ onRecruiterClick }: RecruiterSectionProps) {
    return (
        <section className="relative w-full md:w-1/2 flex items-center justify-center px-6 md:px-12 py-16 md:py-0 overflow-hidden bg-white">
            {/* Image de fond : bureau moderne flouté */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-md scale-105"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80')",
                }}
            />

            {/* Superposition verre dépoli blanc */}
            <div className="absolute inset-0 bg-slate-50/90 backdrop-blur-[2px]" />

            {/* Filigrane "desk" – motif géométrique ou icône */}
            <div
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '30px 30px',
                }}
            />

            <div className="relative z-10 max-w-lg text-center md:text-left">
                {/* Badge espace recruteur – léger, moderne */}
                <div className="inline-flex items-center gap-2 py-1.5 px-5 rounded-full bg-white/80 border border-slate-200 text-xs font-bold text-slate-700 tracking-widest uppercase mb-8 backdrop-blur-sm shadow-sm">
                    <Briefcase size={14} className="text-blue-600" />
                    Espace Recruteur
                </div>

                {/* Titre principal : texte slate-900, accent en dégradé bleu→cyan */}
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-slate-900 mb-6">
                    Vos futurs talents <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                        à portée d’un swipe
                    </span>
                </h2>

                {/* Description */}
                <p className="text-lg text-slate-600 leading-relaxed mb-10">
                    Publiez une mission en 2 minutes. Visualisez les profils vérifiés en temps réel,
                    géolocalisés et prêts à intervenir.
                </p>

                {/* CTA principal – Dark Slate, premium */}
                <Link
                    href="/login/recruiter?view=signup"
                    onClick={onRecruiterClick}
                    className="group relative inline-flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-900 text-white font-bold py-5 px-10 rounded-xl shadow-lg shadow-slate-900/20 transition-all transform hover:scale-[1.02] hover:-translate-y-1"
                >
                    Publier une mission
                    <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Statistiques / confiance */}
                <div className="mt-8 flex flex-col items-center justify-center md:items-start md:justify-start gap-4 text-sm text-slate-500 font-medium">
                    <div className="flex gap-6">
                        <span className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-blue-600" />
                            Profils 100% vérifiés
                        </span>
                        <span className="flex items-center gap-2">
                            <Users size={16} className="text-blue-600" />
                            +5 000 ambulanciers
                        </span>
                    </div>
                    <Link href="/login/recruiter?view=login" className="text-slate-500 hover:text-blue-600 transition-colors underline decoration-slate-300 hover:decoration-blue-600">
                        Espace Entreprise / Connexion
                    </Link>
                </div>
            </div>
        </section>
    )
}
