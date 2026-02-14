'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SwipePage() {
    const supabase = createClientComponentClient()
    const router = useRouter()
    const [jobs, setJobs] = useState<any[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadJobs()
    }, [])

    const loadJobs = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
            return
        }

        const { data, error } = await supabase
            .rpc('get_swipe_jobs', { p_candidate_id: user.id })

        if (error) console.error('Erreur:', error)
        if (data) setJobs(data)
        setLoading(false)
    }

    const handleSwipe = async (direction: 'left' | 'right') => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const currentJob = jobs[currentIndex]

        console.log('🎯 Swipe', direction, 'sur job:', currentJob.job_id)

        // Insert swipe
        await supabase.from('swipes').insert({
            candidate_id: user.id,
            job_id: currentJob.job_id,
            direction
        })

        // Si swipe right → créer application
        if (direction === 'right') {
            const { data, error } = await supabase
                .from('applications')
                .insert({
                    candidate_id: user.id,
                    job_id: currentJob.job_id,
                    source: 'swipe'
                })
                .select()

            if (error) {
                console.error('❌ ERREUR:', error)
                alert('Erreur: ' + error.message)
            } else {
                console.log('✅ Candidature créée:', data)
                alert('✅ Candidature envoyée !')
            }
        }

        setCurrentIndex(i => i + 1)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white">Chargement...</div>
            </div>
        )
    }

    if (currentIndex >= jobs.length) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
                <div className="text-center text-white">
                    <div className="text-6xl mb-4">🎯</div>
                    <h2 className="text-3xl font-bold mb-4">Tu as tout vu !</h2>
                    <button
                        onClick={() => router.push('/dashboard-candidat')}
                        className="bg-cyan-400 text-black font-bold px-8 py-4 rounded-xl"
                    >
                        Mes candidatures
                    </button>
                </div>
            </div>
        )
    }

    const currentJob = jobs[currentIndex]

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            <header className="p-4 flex justify-between items-center w-full max-w-md mx-auto">
                <h1 className="text-2xl font-bold text-white">Swipe</h1>
                <button
                    onClick={() => router.push('/dashboard-candidat')}
                    className="bg-white text-blue-600 font-bold px-4 py-2 rounded-xl shadow-lg hover:scale-105 transition"
                >
                    📊 Mon Dashboard
                </button>
            </header>

            <div className="flex-1 flex items-center justify-center p-6">
                <div className="max-w-md w-full">
                    <div className="text-center text-white mb-4">
                        <span>{currentIndex + 1} / {jobs.length}</span>
                    </div>

                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden relative" style={{ height: '600px' }}>
                        <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-6 text-white">
                            <h2 className="text-2xl font-black mb-1">{currentJob.company_name}</h2>
                            <p className="text-sm opacity-90">📍 {currentJob.city_name} • {Math.round(currentJob.distance_km)} km</p>
                            <h3 className="text-xl font-bold mt-4">{currentJob.job_title}</h3>
                        </div>

                        <div className="p-6 space-y-4 overflow-y-auto" style={{ maxHeight: '350px' }}>
                            {currentJob.description && (
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                                    <div className="font-bold text-gray-900 mb-2">📋 Description</div>
                                    <div className="text-gray-700 text-sm whitespace-pre-line">
                                        {currentJob.description}
                                    </div>
                                </div>
                            )}

                            {currentJob.salary && (
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">💰</span>
                                    <div>
                                        <div className="font-bold text-gray-900">{currentJob.salary}€/mois</div>
                                        <div className="text-sm text-gray-500">Salaire proposé</div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <span className="text-3xl">📍</span>
                                <div>
                                    <div className="font-bold text-gray-900">{Math.round(currentJob.distance_km)} km</div>
                                    <div className="text-sm text-gray-500">De chez toi</div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-12">
                            <button
                                onClick={() => handleSwipe('left')}
                                className="w-20 h-20 rounded-full bg-red-500 text-white text-4xl flex items-center justify-center hover:scale-110 transition shadow-xl"
                            >
                                ✕
                            </button>
                            <button
                                onClick={() => handleSwipe('right')}
                                className="w-20 h-20 rounded-full bg-green-500 text-white text-4xl flex items-center justify-center hover:scale-110 transition shadow-xl"
                            >
                                ✓
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
