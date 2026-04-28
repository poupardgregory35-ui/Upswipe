'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function DashboardCandidatPage() {
    const router = useRouter()
    const supabase = createClientComponentClient()
    const [profile, setProfile] = useState<any>(null)
    const [applications, setApplications] = useState<any[]>([])
    const [newJobs, setNewJobs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editForm, setEditForm] = useState({
        full_name: '',
        phone: '',
        candidate_pitch: ''
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
            return
        }

        // Charger profil
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profileData?.role !== 'candidate') {
            router.push('/recruteur/dashboard')
            return
        }

        // Guard: if onboarding hasn't been completed (no diploma chosen yet),
        // route the user back into the onboarding flow instead of showing an
        // empty dashboard with a swipe page that returns 0 jobs.
        const onboardingComplete =
            profileData?.onboarding_completed === true ||
            Boolean(profileData?.candidate_diploma)

        if (!onboardingComplete) {
            router.push('/onboarding/candidat')
            return
        }

        setProfile(profileData)
        setEditForm({
            full_name: profileData?.full_name || '',
            phone: profileData?.phone || '',
            candidate_pitch: profileData?.candidate_pitch || ''
        })

        // Charger candidatures
        const { data: appsData } = await supabase
            .from('applications')
            .select(`
        *,
        jobs:job_id (
          id,
          title,
          company,
          salary,
          type,
          description
        )
      `)
            .eq('candidate_id', user.id)
            .order('created_at', { ascending: false })

        setApplications(appsData || [])

        // Charger nouvelles offres (pas encore swipées)
        // Note: If get_swipe_jobs RPC doesn't exist, this might fail or return null. 
        // Ensuring graceful handling if RPC is missing is good, but I'll stick to the user's code.
        const { data: jobsData, error } = await supabase.rpc('get_swipe_jobs', {
            p_candidate_id: user.id
        })

        // Fallback if RPC fails or not exists, maybe fetch all jobs excluding applications?
        // For now, using the provided code which assumes RPC exists.

        setNewJobs(jobsData?.slice(0, 5) || [])
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-2xl">Chargement...</div>
            </div>
        )
    }

    const pendingApps = applications.filter(a => !a.recruiter_response)
    const interestedApps = applications.filter(a => a.recruiter_response === 'interested')
    const rejectedApps = applications.filter(a => a.recruiter_response === 'rejected')

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-blue-100 px-6 py-4 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">
                            Bonjour {profile?.full_name || profile?.email?.split('@')[0]} 👋
                        </h1>
                        <p className="text-gray-600 text-sm">
                            {profile?.candidate_diploma} • {applications.length} candidature(s)
                        </p>
                    </div>
                    <button
                        onClick={() => supabase.auth.signOut()}
                        className="text-red-600 font-bold hover:bg-red-50 px-4 py-2 rounded-xl transition"
                    >
                        Déconnexion
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">

                {/* Mon Profil */}
                <section className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Mon Profil</h2>
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-xl transition"
                        >
                            ✏️ Modifier
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                            <div className="text-sm font-medium text-blue-700 mb-1">Email</div>
                            <div className="font-bold text-gray-900">{profile?.email}</div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                            <div className="text-sm font-medium text-blue-700 mb-1">Diplôme</div>
                            <div className="font-bold text-gray-900">{profile?.candidate_diploma || 'Non renseigné'}</div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                            <div className="text-sm font-medium text-blue-700 mb-1">Téléphone</div>
                            <div className="font-bold text-gray-900">{profile?.phone || 'Non renseigné'}</div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                            <div className="text-sm font-medium text-blue-700 mb-1">Disponibilité</div>
                            <button
                                onClick={async () => {
                                    const newStatus = !profile.is_available
                                    await supabase
                                        .from('profiles')
                                        .update({ is_available: newStatus })
                                        .eq('id', profile.id)
                                    setProfile({ ...profile, is_available: newStatus })
                                }}
                                className={`px-4 py-2 rounded-xl font-bold transition ${profile.is_available
                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                                    }`}
                            >
                                {profile.is_available ? '✅ DISPONIBLE' : '❌ NON DISPONIBLE'}
                            </button>
                        </div>
                    </div>

                    {profile?.candidate_tags && profile.candidate_tags.length > 0 && (
                        <div className="mt-6 bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-xl border border-cyan-100">
                            <div className="text-sm font-medium text-cyan-700 mb-3">🎯 Compétences</div>
                            <div className="flex gap-2 flex-wrap">
                                {profile.candidate_tags.map((tag: string) => (
                                    <span key={tag} className="px-3 py-1 bg-cyan-500 text-white rounded-full text-sm font-medium shadow-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                {/* Nouvelles Offres */}
                <section className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            🔥 Nouvelles Offres ({newJobs.length})
                        </h2>
                        <button
                            onClick={() => router.push('/candidat/swipe')}
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold px-6 py-3 rounded-xl hover:scale-105 transition shadow-lg"
                        >
                            Swiper toutes les offres
                        </button>
                    </div>

                    {newJobs.length === 0 ? (
                        <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                            <div className="text-6xl mb-4">✅</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Aucune nouvelle offre
                            </h3>
                            <p className="text-gray-600">
                                Vous avez vu toutes les offres disponibles !
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {newJobs.map(job => (
                                <div key={job.job_id} className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-lg transition">
                                    <h3 className="font-bold text-lg text-gray-900 mb-1">{job.title}</h3>
                                    <p className="text-gray-600 text-sm mb-3">{job.company}</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                        <span>📍 {job.city_name}</span>
                                        {job.salary && <span>💰 {job.salary}€</span>}
                                    </div>
                                    <span className="inline-block px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-bold">
                                        {job.match_score}% match
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Mes Candidatures */}
                <section className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                        📋 Mes Candidatures ({applications.length})
                    </h2>

                    {applications.length === 0 ? (
                        <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                            <div className="text-6xl mb-4">📭</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Aucune candidature
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Commencez à swiper pour postuler !
                            </p>
                            <button
                                onClick={() => router.push('/candidat/swipe')}
                                className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 shadow-lg"
                            >
                                🔥 Découvrir les offres
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* En attente */}
                            <div>
                                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                                    <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                                    En attente ({pendingApps.length})
                                </h3>
                                <div className="space-y-3">
                                    {pendingApps.map(app => (
                                        <div key={app.id} className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-sm">
                                            <h4 className="font-bold text-gray-900">{app.jobs?.title}</h4>
                                            <p className="text-sm text-gray-600">{app.jobs?.company}</p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {new Date(app.created_at).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                    ))}
                                    {pendingApps.length === 0 && (
                                        <p className="text-gray-400 text-sm">Aucune candidature en attente</p>
                                    )}
                                </div>
                            </div>

                            {/* Intéressé */}
                            <div>
                                <h3 className="font-bold text-green-700 mb-4 flex items-center gap-2">
                                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                    Intéressé ({interestedApps.length})
                                </h3>
                                <div className="space-y-3">
                                    {interestedApps.map(app => (
                                        <div key={app.id} className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4 shadow-lg">
                                            <h4 className="font-bold text-green-900">{app.jobs?.title}</h4>
                                            <p className="text-sm text-green-700">{app.jobs?.company}</p>
                                            <div className="mt-3 pt-3 border-t border-green-200">
                                                <p className="text-xs text-green-600 font-bold">
                                                    🎉 Le recruteur est intéressé !
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {interestedApps.length === 0 && (
                                        <p className="text-gray-400 text-sm">Aucune réponse positive</p>
                                    )}
                                </div>
                            </div>

                            {/* Refusé */}
                            <div>
                                <h3 className="font-bold text-gray-500 mb-4 flex items-center gap-2">
                                    <span className="w-3 h-3 bg-gray-300 rounded-full"></span>
                                    Refusé ({rejectedApps.length})
                                </h3>
                                <div className="space-y-3">
                                    {rejectedApps.map(app => (
                                        <div key={app.id} className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 opacity-60">
                                            <h4 className="font-bold text-gray-700">{app.jobs?.title}</h4>
                                            <p className="text-sm text-gray-500">{app.jobs?.company}</p>
                                        </div>
                                    ))}
                                    {rejectedApps.length === 0 && (
                                        <p className="text-gray-400 text-sm">Aucun refus</p>
                                    )}
                                </div>
                            </div>

                        </div>
                    )}
                </section>

            </main>

            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-blue-100">
                        <h3 className="text-2xl font-bold mb-6 text-gray-900">Modifier mon profil</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-700">Nom complet</label>
                                <input
                                    type="text"
                                    value={editForm.full_name}
                                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                    className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-black focus:border-blue-500 focus:bg-white outline-none transition"
                                    placeholder="Ex: Jean Dupont"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-700">Téléphone</label>
                                <input
                                    type="tel"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                    className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-black focus:border-blue-500 focus:bg-white outline-none transition"
                                    placeholder="Ex: 06 12 34 56 78"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-700">Présentation / Pitch</label>
                                <textarea
                                    value={editForm.candidate_pitch}
                                    onChange={(e) => setEditForm({ ...editForm, candidate_pitch: e.target.value })}
                                    className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-4 py-3 h-24 text-black focus:border-blue-500 focus:bg-white outline-none transition"
                                    placeholder="Parlez-nous de vous..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={async () => {
                                    const { data: { user } } = await supabase.auth.getUser()
                                    if (!user) return

                                    const { error } = await supabase
                                        .from('profiles')
                                        .update({
                                            full_name: editForm.full_name,
                                            phone: editForm.phone,
                                            candidate_pitch: editForm.candidate_pitch
                                        })
                                        .eq('id', user.id)

                                    if (error) {
                                        alert('Erreur lors de la mise à jour: ' + error.message)
                                    } else {
                                        setIsEditModalOpen(false)
                                        loadData() // Rafraîchir les données
                                    }
                                }}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition"
                            >
                                💾 Enregistrer
                            </button>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
