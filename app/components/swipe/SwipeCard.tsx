'use client'

import React from 'react'
import TinderCard from 'react-tinder-card'
import { MapPin, Building2, Briefcase, DollarSign, Clock } from 'lucide-react'

// Define the Job type based on what we expect from the API
export interface Job {
    id: string
    title: string
    company: string
    city: string
    description: string
    salary_range?: string
    contract_type?: string
    tags?: string[]
    logo_url?: string
    score?: number
    distance?: number
    urgency?: 'immediate' | 'urgent' | 'planned'
    created_at: string
}

interface SwipeCardProps {
    job: Job
    onSwipe: (direction: 'left' | 'right') => void
    onCardLeftScreen: (direction: string) => void
}

export const SwipeCard = React.forwardRef<any, SwipeCardProps>(({ job, onSwipe, onCardLeftScreen }, ref) => {

    const sentimentColor = (score: number) => {
        if (score >= 80) return 'bg-green-500'
        if (score >= 50) return 'bg-blue-500'
        return 'bg-slate-500'
    }

    return (
        <div className="absolute w-full h-full p-4 flex items-center justify-center pointer-events-none">
            <TinderCard
                className="pointer-events-auto w-full max-w-md h-[70vh] relative"
                onSwipe={(dir) => onSwipe(dir as 'left' | 'right')}
                onCardLeftScreen={(dir) => onCardLeftScreen(dir)}
                preventSwipe={['up', 'down']}
                swipeRequirementType="position"
                swipeThreshold={100}
                ref={ref}
            >
                <div
                    className="w-full h-full bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col relative"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1587560699334-cc4da63c2549?auto=format&fit=crop&q=80&w=1000')`, // Placeholder generic medical background if no logo? Or just neat white card
                        // utilizing a subtle gradient overlay to ensure text readability if we use image
                    }}
                >
                    {/* Background Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/10 via-white/50 to-white/95 z-0" />
                    <div className="absolute inset-0 bg-white z-0" /> {/* Just white card for now, cleaner */}

                    {/* Content Container */}
                    <div className="relative z-10 flex flex-col h-full p-6">

                        {/* Header: Score & Urgency */}
                        <div className="flex justify-between items-start mb-6">
                            {(job.score || 0) > 0 && (
                                <div className={`px-3 py-1 rounded-full text-white text-xs font-bold shadow-sm ${sentimentColor(job.score || 0)}`}>
                                    {job.score ? `${job.score}% Match` : 'Nouveau'}
                                </div>
                            )}
                            {job.urgency === 'immediate' && (
                                <div className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200 flex items-center gap-1">
                                    ⚡️ Urgence
                                </div>
                            )}
                        </div>

                        {/* Main Content: Logo, Title, Company */}
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-24 h-24 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center mb-2">
                                {job.logo_url ? (
                                    <img src={job.logo_url} alt={job.company} className="w-20 h-20 object-contain" />
                                ) : (
                                    <Building2 size={40} className="text-slate-300" />
                                )}
                            </div>

                            <div>
                                <h2 className="text-2xl font-black text-slate-900 leading-tight mb-1">{job.title}</h2>
                                <p className="text-lg text-slate-600 font-medium">{job.company}</p>
                            </div>

                            <div className="flex flex-wrap justify-center gap-3 text-sm text-slate-500">
                                <span className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                    <MapPin size={14} className="text-blue-500" />
                                    {job.city} {job.distance ? `(${job.distance}km)` : ''}
                                </span>
                                {job.contract_type && (
                                    <span className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                        <Briefcase size={14} className="text-blue-500" />
                                        {job.contract_type}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Footer: Tags & Actions Hints */}
                        <div className="mt-6">
                            <div className="flex flex-wrap justify-center gap-2 mb-8">
                                {job.tags?.slice(0, 3).map(tag => (
                                    <span key={tag} className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Fake Actions Buttons for Education (Non-interactive) */}
                            <div className="grid grid-cols-2 gap-4 opacity-50">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-12 h-12 rounded-full border-2 border-red-500 flex items-center justify-center text-red-500">
                                        ✕
                                    </div>
                                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Passer</span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-12 h-12 rounded-full border-2 border-green-500 flex items-center justify-center text-green-500">
                                        ♥
                                    </div>
                                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Postuler</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </TinderCard>
        </div>
    )
})

SwipeCard.displayName = 'SwipeCard'
