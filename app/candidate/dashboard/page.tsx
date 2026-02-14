'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { MapPin, Euro, Award, Check, Briefcase, Search, AlertCircle } from 'lucide-react' // Added icons
import { useRouter } from 'next/navigation'
import { toast } from 'sonner' // Added toast
import { JobCardSkeleton } from '@/app/components/ui/Skeleton' // Added Skeleton
import Link from 'next/link'

interface Job {
    id: string
    title: string
    company: string
    city: string
    salary: number
    type: string
    required_license: string
}

export default function CandidateDashboard() {
    const router = useRouter()
    const [jobs, setJobs] = useState<Job[]>([])
    const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)
    const [applying, setApplying] = useState<string | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            // 1. Fetch Jobs
            const { data: jobsData, error: jobsError } = await supabase
                .from('jobs')
                .select('*')
                .order('created_at', { ascending: false })

            if (jobsError) throw jobsError

            // 2. Fetch User Applications
            const { data: appsData, error: appsError } = await supabase
                .from('applications')
                .select('job_id')
                .eq('candidate_id', user.id)

            if (appsError) throw appsError

            setJobs(jobsData || [])
            setAppliedIds(new Set(appsData?.map(app => app.job_id) || []))

        } catch (error) {
            console.error('Error fetching data:', error)
            toast.error("Erreur de chargement des offres")
        } finally {
            // Simulate slight delay to show skeleton animation for demo feel
            setTimeout(() => setLoading(false), 800)
        }
    }

    const handleApply = async (jobId: string) => {
        if (appliedIds.has(jobId)) return

        setApplying(jobId)
        // toast.loading("Envoi de la candidature...", { id: 'apply-toast' }) // Optional: Loading toast

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase
                .from('applications')
                .insert({
                    job_id: jobId,
                    candidate_id: user.id,
                    status: 'pending'
                })

            if (error) throw error

            setAppliedIds(prev => new Set(prev).add(jobId))
            toast.success("Candidature envoyée !", { id: 'apply-toast' })

        } catch (error) {
            console.error('Error applying:', error)
            toast.error("Erreur lors de la candidature.", { id: 'apply-toast' })
        } finally {
            setApplying(null)
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 p-4 pb-24 font-sans">
            <header className="mb-6 pt-4">
                <h1 className="text-2xl font-bold text-white mb-1">Offres disponibles</h1>
                <p className="text-slate-400 text-sm">Trouvez votre mission idéale.</p>
            </header>

            <div className="space-y-4 max-w-md mx-auto">
                {loading ? (
                    <>
                        <JobCardSkeleton />
                        <JobCardSkeleton />
                        <JobCardSkeleton />
                    </>
                ) : jobs.length === 0 ? (
                    // EMPTY STATE
                    <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <Search size={32} className="text-slate-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            Aucune mission pour le moment
                        </h3>
                        <p className="text-slate-400 mb-6 px-6 text-sm">
                            Élargissez votre zone de recherche ou validez plus de permis sur votre profil.
                        </p>
                        <Link
                            href="/candidate/profile"
                            className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors"
                        >
                            Modifier mes critères →
                        </Link>
                    </div>
                ) : (
                    jobs.map((job) => {
                        const isApplied = appliedIds.has(job.id)
                        const isApplying = applying === job.id

                        return (
                            <div
                                key={job.id}
                                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg hover:border-white/20 transition-all hover:scale-[1.01]"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-lg font-bold text-white mb-1">{job.title}</h2>
                                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                                            <Briefcase size={12} />
                                            <span className="font-semibold">{job.company}</span>
                                            <span className="w-1 h-1 bg-slate-600 rounded-full" />
                                            <span className="text-cyan-400 font-medium">{job.type}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Badges */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <div className="flex items-center gap-1 bg-white/10 text-gray-300 px-3 py-1 rounded-full text-xs">
                                        <MapPin size={10} />
                                        {job.city}
                                    </div>
                                    <div className="flex items-center gap-1 bg-cyan-400/20 text-cyan-400 font-bold px-3 py-1 rounded-full text-xs">
                                        <Euro size={10} />
                                        {job.salary}€
                                    </div>
                                    <div className="flex items-center gap-1 bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-xs">
                                        <Award size={10} />
                                        Permis {job.required_license}
                                    </div>
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={() => handleApply(job.id)}
                                    disabled={isApplied || isApplying}
                                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${isApplied
                                            ? 'bg-green-600/20 text-green-400 border border-green-600/50 cursor-default'
                                            : 'bg-cyan-500 hover:bg-cyan-400 text-slate-900 shadow-lg shadow-cyan-500/20'
                                        }`}
                                >
                                    {isApplied ? (
                                        <>
                                            <Check size={18} /> Candidature envoyée
                                        </>
                                    ) : (
                                        'Postuler'
                                    )}
                                </button>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
