'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/app/components/ui/Button'
import { Logo } from '@/app/components/ui/Logo'
import { motion, AnimatePresence } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { MapPin, Clock, Award, X, Heart, Play, Volume2, VolumeX, Briefcase, Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { RecruiterBackground } from '@/app/components/ui/RecruiterBackground'
import { MatchModal } from '@/app/components/ui/MatchModal'

export default function RecruiterSwipePage() {
    const router = useRouter()
    const supabase = createClientComponentClient()
    const [candidates, setCandidates] = useState<any[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState<'left' | 'right' | null>(null)
    const [recruiter, setRecruiter] = useState<any>(null)
    const [currentJob, setCurrentJob] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    // Match Modal State
    const [showMatchModal, setShowMatchModal] = useState(false)
    const [matchData, setMatchData] = useState<{ title: string, subtitle: string, image: string } | null>(null)

    useEffect(() => {
        checkAuthAndFetch()
    }, [])

    const checkAuthAndFetch = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
            return
        }

        // 1. Get Recruiter Profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'recruiter') {
            router.push('/dashboard')
            return
        }
        setRecruiter(profile)

        // 2. Get Latest Active Job (to know what we are recruiting for)
        const { data: job } = await supabase
            .from('jobs')
            .select('*')
            .eq('recruiter_id', user.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (!job) {
            alert("Veuillez d'abord publier une offre pour voir des candidats.")
            router.push('/recruteur/offres/nouvelle')
            return
        }
        setCurrentJob(job)

        // 3. Fetch Candidates matching Job Requirements
        // Using 'candidate_diploma' column based on job 'required_diplomas'
        // If job has no diplomas, default to 'DEA' just in case
        const requiredDiplomas = job.required_diplomas && job.required_diplomas.length > 0
            ? job.required_diplomas
            : ['DEA', 'Auxiliaire']

        const { data: candidatesData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'candidate')
            .in('candidate_diploma', requiredDiplomas)
            // .neq('id', alreadySwipedIds) // Todo: exclude swiped
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) {
            console.error('Error fetching candidates:', error)
        } else {
            // Filter out candidates without photos if desired, or keep them
            setCandidates(candidatesData || [])
        }
        setLoading(false)
    }

    const toggleVideo = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause()
            else videoRef.current.play()
            setIsPlaying(!isPlaying)
        }
    }

    const handleSwipe = async (dir: 'left' | 'right') => {
        if (!recruiter || !currentJob || !candidates[currentIndex]) return
        setDirection(dir)
        const candidate = candidates[currentIndex]

        // Optimistic UI update: Wait for animation then process
        setTimeout(async () => {
            try {
                // Save swipe
                // Note: Ensure 'swipes' table exists and has RLS allowing insert
                const { error: swipeError } = await supabase.from('swipes').insert({
                    job_id: currentJob.id,
                    candidate_id: candidate.id,
                    // recruiter_id: recruiter.id, // Column might not exist in simple schema, but job_id links to recruiter
                    direction: dir
                })

                if (swipeError) {
                    console.warn("Swipe save error (might be benign if duplicate):", swipeError)
                }

                if (dir === 'right') {
                    // Check for mutual match logic here if implemented on backend
                    // For now, we simulate or check if candidate liked ONLY IF we had that data.
                    // MVP: Just swipe.

                    // If we want instant match demo:
                    // const { data: candidateSwipe } = ...
                }
            } catch (err) {
                console.error("Swipe Error:", err)
            }

            setCandidates(prev => prev.slice(1))
            setCurrentIndex(0)
            setDirection(null)
            setIsPlaying(false)
        }, 300)
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    const currentCandidate = candidates[0]

    return (
        <div className="min-h-screen font-sans overflow-hidden flex flex-col relative">
            <RecruiterBackground />

            {/* Match Modal Integration */}
            <MatchModal
                isOpen={showMatchModal}
                onClose={() => setShowMatchModal(false)}
                matchData={matchData}
                redirectUrl="/recruteur/matchs"
            />

            {/* Header */}
            <div className="p-4 flex justify-between items-center z-10">
                <Logo size="sm" />
                <Button
                    variant="ghost"
                    className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                    onClick={() => router.push('/dashboard-recruteur')}
                >
                    <Briefcase className="mr-2 h-4 w-4" /> Dashboard
                </Button>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex items-center justify-center p-4">
                <AnimatePresence>
                    {currentCandidate ? (
                        <motion.div
                            key={currentCandidate.id}
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                y: 0,
                                x: direction === 'left' ? -200 : direction === 'right' ? 200 : 0,
                                rotate: direction === 'left' ? -5 : direction === 'right' ? 5 : 0
                            }}
                            exit={{
                                x: direction === 'left' ? -500 : 500,
                                opacity: 0,
                                transition: { duration: 0.2 }
                            }}
                            className="w-full max-w-sm aspect-[3/4] absolute cursor-grab active:cursor-grabbing"
                        >
                            <div className="h-full w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col relative border border-slate-200">

                                {/* Photo / Video Section (Top 65%) */}
                                <div className="h-[65%] relative bg-slate-100">
                                    {currentCandidate.video_url ? (
                                        <div className="w-full h-full relative" onClick={toggleVideo}>
                                            <video
                                                ref={videoRef}
                                                src={currentCandidate.video_url}
                                                className="w-full h-full object-cover"
                                                loop
                                                muted={isMuted}
                                                playsInline
                                            />
                                            {!isPlaying && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                    <Play size={48} className="text-white drop-shadow-lg" fill="currentColor" />
                                                </div>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                                                className="absolute top-4 right-4 p-2 bg-black/30 rounded-full text-white backdrop-blur-md"
                                            >
                                                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full relative">
                                            {currentCandidate.candidate_photo_url ? (
                                                <img
                                                    src={currentCandidate.candidate_photo_url}
                                                    className="w-full h-full object-cover"
                                                    alt="Candidat"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 gap-3">
                                                    <div className="w-24 h-24 rounded-full bg-slate-300 flex items-center justify-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-slate-400" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                                                        </svg>
                                                    </div>
                                                    <span className="text-slate-400 text-sm font-medium">Pas de photo</span>
                                                </div>
                                            )}

                                        </div>
                                    )}

                                    {/* Badge Overlay */}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/90 backdrop-blur-md text-slate-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                                            <Award size={12} className="text-blue-600" /> {currentCandidate.candidate_diploma}
                                        </span>
                                    </div>
                                </div>

                                {/* Info Section (Bottom 35%) */}
                                <div className="h-[35%] p-5 flex flex-col justify-between bg-white relative z-10">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 mb-1">
                                            {currentCandidate.full_name || "Candidat"}, <span className="text-slate-400 font-normal">{currentCandidate.age || 28}</span>
                                        </h2>
                                        <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-3">
                                            "{currentCandidate.description || "Disponible immédiatement."}"
                                        </p>

                                        <div className="flex gap-2">
                                            <div className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                                                <MapPin size={12} /> {currentCandidate.candidate_city || currentCandidate.city || "France"}
                                            </div>
                                            <div className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                                                <Clock size={12} /> {currentCandidate.is_available ? "Dispo" : "En poste"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Swipe Overlay Feedback */}
                            {direction === 'right' && (
                                <div className="absolute top-10 left-10 transform -rotate-12 border-4 border-emerald-500 rounded-xl px-4 py-2 text-emerald-500 font-black text-4xl uppercase bg-white/90 backdrop-blur-md shadow-xl z-50">
                                    VIVIER
                                </div>
                            )}
                            {direction === 'left' && (
                                <div className="absolute top-10 right-10 transform rotate-12 border-4 border-red-500 rounded-xl px-4 py-2 text-red-500 font-black text-4xl uppercase bg-white/90 backdrop-blur-md shadow-xl z-50">
                                    PASSER
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-sm">
                            <div className="w-16 h-16 bg-blue-50 rounded-full mx-auto flex items-center justify-center mb-4 text-blue-600">
                                <Filter size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Plus de profils</h3>
                            <p className="text-slate-500 mb-6 text-sm">
                                Vous avez vu tous les candidats correspondant à votre offre <strong>{currentJob?.title}</strong>.
                            </p>
                            <Button onClick={() => window.location.reload()} variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50">
                                Recharger
                            </Button>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer Actions */}
            <div className="p-8 pb-10 flex justify-center gap-6 z-10">
                <button
                    onClick={() => handleSwipe('left')}
                    className="w-16 h-16 rounded-full bg-white text-slate-400 shadow-xl flex items-center justify-center hover:text-red-500 hover:bg-red-50 transition-all transform hover:scale-110 active:scale-95 border border-slate-100"
                >
                    <X size={32} />
                </button>
                <button
                    onClick={() => handleSwipe('right')}
                    className="w-16 h-16 rounded-full bg-blue-600 text-white shadow-xl shadow-blue-600/30 flex items-center justify-center hover:bg-blue-700 transition-all transform hover:scale-110 active:scale-95"
                >
                    <Heart size={32} fill="currentColor" />
                </button>
            </div>
        </div>
    )
}
