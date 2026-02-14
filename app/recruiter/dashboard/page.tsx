'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function DashboardRecruteurPage() {
    const router = useRouter()
    const supabase = createClientComponentClient()
    const [jobs, setJobs] = useState<any[]>([])
    const [applications, setApplications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
            return
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'recruiter') {
            router.push('/dashboard')
            return
        }

        // Mes offres
        const { data: jobsData } = await supabase
            .from('jobs')
            .select('*')
            .eq('recruiter_id', user.id)
            .order('created_at', { ascending: false })

        console.log('📌 Offres du recruteur:', jobsData)
        setJobs(jobsData || [])

        // Candidatures avec requête simple
        if (jobsData && jobsData.length > 0) {
            const jobIds = jobsData.map(j => j.id)

            console.log('🔍 Job IDs recherchés:', jobIds)

            // Test 1: Requête simple sans filtre
            const { data: allApps, error: allAppsError } = await supabase
                .from('applications')
                .select('*')

            console.log('📋 TOUTES les applications en BDD:', allApps, allAppsError)

            // Test 2: Requête avec filtre
            const { data: appsData, error: appsError } = await supabase
                .from('applications')
                .select('*')
                .in('job_id', jobIds)

            console.log('📥 Applications filtrées:', appsData, appsError)
            console.log('📊 Comparaison:', {
                'IDs recherchés': jobIds,
                'Applications trouvées': appsData?.map(a => ({ job_id: a.job_id, candidate_id: a.candidate_id }))
            })

            // Charger les détails candidats séparément
            if (appsData && appsData.length > 0) {
                const candidateIds = appsData.map(a => a.candidate_id)

                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('*')
                    .in('id', candidateIds)

                const { data: jobsDataForApps } = await supabase
                    .from('jobs')
                    .select('*')
                    .in('id', appsData.map(a => a.job_id))

                // Enrichir les applications
                const enrichedApps = appsData.map(app => ({
                    ...app,
                    profiles: profilesData?.find(p => p.id === app.candidate_id),
                    jobs: jobsDataForApps?.find(j => j.id === app.job_id)
                }))

                console.log('✅ Applications enrichies:', enrichedApps)
                setApplications(enrichedApps)
            } else {
                setApplications([])
            }
        } else {
            setApplications([])
        }

        setLoading(false)
    }

    const toggleJobActive = async (jobId: string, currentStatus: boolean) => {
        await supabase
            .from('jobs')
            .update({ is_active: !currentStatus })
            .eq('id', jobId)

        loadData()
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-2xl">Chargement...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-black text-gray-900">Dashboard Recruteur</h1>
                    <button
                        onClick={() => supabase.auth.signOut()}
                        className="text-red-600 font-bold hover:underline"
                    >
                        Déconnexion
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="text-3xl font-black text-blue-600">{jobs.filter(j => j.is_active).length}</div>
                        <div className="text-gray-600">Offres actives</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="text-3xl font-black text-green-600">{applications.length}</div>
                        <div className="text-gray-600">Candidatures reçues</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="text-3xl font-black text-orange-600">
                            {applications.filter(a => !a.viewed_by_recruiter).length}
                        </div>
                        <div className="text-gray-600">Non lues</div>
                    </div>
                </div>

                <section className="mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Candidatures Reçues</h2>
                        <button
                            onClick={() => router.push('/recruteur/offres/nouvelle')}
                            className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700"
                        >
                            + Nouvelle offre
                        </button>
                    </div>

                    {applications.length === 0 ? (
                        <div className="bg-white p-12 rounded-xl shadow-sm text-center">
                            <div className="text-6xl mb-4">📭</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune candidature</h3>
                            <p className="text-gray-600">Les candidats intéressés apparaîtront ici</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {applications.map(app => (
                                <div key={app.id} className="bg-white p-6 rounded-xl shadow-sm">
                                    <div className="flex items-start gap-6">
                                        {/* Photo */}
                                        <div className="flex-shrink-0">
                                            {app.profiles?.candidate_photo_url ? (
                                                <img
                                                    src={app.profiles.candidate_photo_url}
                                                    alt="Photo"
                                                    className="w-32 h-32 rounded-xl object-cover border-4 border-blue-100"
                                                />
                                            ) : (
                                                <div className="w-32 h-32 rounded-xl bg-blue-100 flex items-center justify-center text-5xl">
                                                    👤
                                                </div>
                                            )}
                                        </div>

                                        {/* Infos */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="text-2xl font-bold text-gray-900">
                                                        {app.profiles?.full_name || app.profiles?.email || 'Candidat'}
                                                    </h3>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded-full text-sm">
                                                            {app.profiles?.candidate_diploma}
                                                        </span>
                                                        <span className="text-gray-500">
                                                            Pour : {app.jobs?.title}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Boutons action */}
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={async () => {
                                                            await supabase
                                                                .from('applications')
                                                                .update({ recruiter_response: 'interested' })
                                                                .eq('id', app.id)
                                                            loadData()
                                                        }}
                                                        className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700"
                                                    >
                                                        ✓ Intéressé
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            await supabase
                                                                .from('applications')
                                                                .update({ recruiter_response: 'rejected' })
                                                                .eq('id', app.id)
                                                            loadData()
                                                        }}
                                                        className="px-6 py-3 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200"
                                                    >
                                                        ✕ Pas intéressé
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            {app.profiles?.candidate_pitch && (
                                                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                                    <div className="font-bold text-gray-700 mb-1">📋 À propos</div>
                                                    <p className="text-gray-600">{app.profiles.candidate_pitch}</p>
                                                </div>
                                            )}

                                            {/* Tags */}
                                            {app.profiles?.candidate_tags && app.profiles.candidate_tags.length > 0 && (
                                                <div className="mb-4">
                                                    <div className="font-bold text-gray-700 mb-2">🎯 Compétences</div>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {app.profiles.candidate_tags.map((tag: string) => (
                                                            <span key={tag} className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Contact */}
                                            <div className="flex gap-3 pt-4 border-t">
                                                {app.profiles?.phone && (
                                                    <a
                                                        href={`tel:${app.profiles.phone}`}
                                                        className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700"
                                                    >
                                                        📞 Appeler
                                                    </a>
                                                )}
                                                {app.profiles?.email && (
                                                    <a
                                                        href={`mailto:${app.profiles.email}`}
                                                        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
                                                    >
                                                        ✉️ Email
                                                    </a>
                                                )}
                                                {app.profiles?.candidate_cv_url && (
                                                    <a
                                                        href={app.profiles.candidate_cv_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-6 py-3 bg-gray-600 text-white font-bold rounded-xl hover:bg-gray-700"
                                                    >
                                                        📄 Voir CV
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Badge statut */}
                                    {app.recruiter_response && (
                                        <div className="mt-4 pt-4 border-t">
                                            {app.recruiter_response === 'interested' && (
                                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-bold">
                                                    ✓ Marqué comme intéressé
                                                </div>
                                            )}
                                            {app.recruiter_response === 'rejected' && (
                                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full font-bold">
                                                    ✕ Candidature écartée
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-6">Mes Offres</h2>
                    {jobs.length === 0 ? (
                        <div className="bg-white p-12 rounded-xl shadow-sm text-center">
                            <div className="text-6xl mb-4">📝</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune offre</h3>
                            <button
                                onClick={() => router.push('/recruteur/offres/nouvelle')}
                                className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 mt-4"
                            >
                                Créer ma première offre
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {jobs.map(job => (
                                <div key={job.id} className="bg-white p-6 rounded-xl shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold">{job.title}</h3>
                                            <p className="text-gray-500">{job.company}</p>
                                        </div>
                                        <button
                                            onClick={() => toggleJobActive(job.id, job.is_active)}
                                            className={`px-4 py-2 rounded-full font-bold text-sm ${job.is_active
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-600'
                                                }`}
                                        >
                                            {job.is_active ? '🟢 ACTIF' : '🔴 INACTIF'}
                                        </button>
                                    </div>
                                    <div className="flex gap-4 text-sm text-gray-600">
                                        <span>👁️ {job.views || 0} vues</span>
                                        <span>👍 {applications.filter(a => a.job_id === job.id).length} candidatures</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}
