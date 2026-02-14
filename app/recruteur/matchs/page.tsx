'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { Logo } from '@/app/components/ui/Logo'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Phone, MessageCircle, MapPin, Award, Search, CheckCircle, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { RecruiterBackground } from '@/app/components/ui/RecruiterBackground'

export default function RecruiterMatchesPage() {
    const router = useRouter()
    const [matches, setMatches] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const stored = localStorage.getItem('upswipe_recruiter')
        if (!stored) {
            router.push('/recruteur/offre')
            return
        }
        const user = JSON.parse(stored)
        loadMatches(user.id)
    }, [])

    const loadMatches = async (recruiterId: string) => {
        try {
            const { data, error } = await supabase
                .from('matches')
                .select(`
          *,
          candidate:profiles!matches_candidate_id_fkey (*)
        `)
                .eq('recruiter_id', recruiterId)
                .order('created_at', { ascending: false })

            if (error) throw error
            setMatches(data || [])
        } catch (err) {
            console.error('Error loading matches:', err)
        } finally {
            setLoading(false)
        }
    }

    const toggleHired = async (matchId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'hired' ? 'pending' : 'hired'
        setMatches(prev => prev.map(m =>
            m.id === matchId ? { ...m, status: newStatus } : m
        ))
        await supabase.from('matches').update({ status: newStatus }).eq('id', matchId)
    }

    return (
        <div className="min-h-screen p-6 pb-24 max-w-2xl mx-auto font-sans">
            <RecruiterBackground />

            <div className="flex justify-center mb-8 pt-4">
                <Logo size="sm" />
            </div>

            <div className="mb-8 flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Vivier</h1>
                    <p className="text-slate-400">Vos candidats sélectionnés</p>
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-full text-white font-bold backdrop-blur-sm border border-white/10">
                    {matches.length} <span className="text-sm font-normal opacity-70"> Profils</span>
                </div>
            </div>

            <div className="space-y-4">
                {matches.map((match, index) => (
                    <motion.div
                        key={match.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className={`bg-white rounded-2xl p-5 shadow-sm border transition-all ${match.status === 'hired'
                                ? 'border-emerald-500 shadow-emerald-500/10'
                                : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                            }`}>
                            <div className="flex items-start gap-4 mb-5">
                                <div className="relative">
                                    <img
                                        src={match.candidate?.photo_url || `https://ui-avatars.com/api/?name=${match.candidate?.first_name}&background=random`}
                                        className="w-16 h-16 rounded-xl object-cover bg-slate-100"
                                        alt={match.candidate?.first_name}
                                    />
                                    {match.status === 'hired' && (
                                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-1 border-2 border-white">
                                            <CheckCircle size={12} fill="currentColor" className="text-white" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-bold text-slate-900">
                                            {match.candidate?.first_name}
                                        </h3>
                                        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-md">
                                            {match.candidate?.badge}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1 mt-1">
                                        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                                            <MapPin size={12} /> {match.candidate?.zone_city} ({match.candidate?.zone_radius_km}km)
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                                            <Clock size={12} /> Dispo: {match.candidate?.availability?.[0]}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <a
                                    href={`tel:${match.candidate?.phone}`}
                                    className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-50 text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors"
                                >
                                    <Phone size={16} className="text-blue-600" /> Appeler
                                </a>
                                <a
                                    href={`https://wa.me/${match.candidate?.phone}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-50 text-green-700 font-bold text-sm hover:bg-green-100 transition-colors"
                                >
                                    <MessageCircle size={16} className="text-green-600" /> WhatsApp
                                </a>
                            </div>

                            <button
                                onClick={() => toggleHired(match.id, match.status)}
                                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm ${match.status === 'hired'
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : 'bg-slate-900 text-white hover:bg-slate-800'
                                    }`}
                            >
                                {match.status === 'hired' ? 'Validé & Embauché' : 'Valider ce recrutement'}
                            </button>
                        </div>
                    </motion.div>
                ))}

                {!loading && matches.length === 0 && (
                    <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                            <Search size={28} />
                        </div>
                        <p className="text-white mb-6 font-medium">Aucun candidat dans votre vivier.</p>
                        <Button onClick={() => router.push('/recruteur/swipe')} className="bg-blue-600 hover:bg-blue-700 border-none text-white">
                            Trouver des candidats
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
