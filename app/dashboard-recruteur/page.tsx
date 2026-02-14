'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function DashboardRecruteurPage() {
    const supabase = createClientComponentClient()
    const [jobs, setJobs] = useState<any[]>([])
    const [applications, setApplications] = useState<any[]>([])

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Mes offres
        const { data: jobsData } = await supabase
            .from('jobs')
            .select('*')
            .eq('recruiter_id', user.id)
            .order('created_at', { ascending: false })

        setJobs(jobsData || [])

        // Candidatures reçues with related data
        // Note: This relies on foreign key relationships being correct in Supabase
        const { data: appsData } = await supabase
            .from('applications')
            .select('*, jobs(*), profiles(*)')
            .in('job_id', jobsData?.map(j => j.id) || [])
            .order('created_at', { ascending: false })

        // Note: If the relationship names are different (e.g. applications_candidate_id_fkey), this might fail.
        // But based on standard Supabase generation from the schema I used, 'profiles' and 'jobs' should be correct 
        // if the FK is defined properly.

        //   .select(`
        //     *,
        //     jobs (title),
        //     profiles (full_name, candidate_photo_url, candidate_diploma, phone)
        //   `)

        setApplications(appsData || [])
    }

    const toggleJobActive = async (jobId: string, currentStatus: boolean) => {
        await supabase
            .from('jobs')
            .update({ is_active: !currentStatus })
            .eq('id', jobId)

        loadData()
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
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
                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="text-3xl font-black text-blue-600">{jobs.length}</div>
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

                {/* Mes Offres */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">Mes Offres</h2>
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
                                    <span>👁️ {job.views} vues</span>
                                    <span>👍 {job.likes} candidatures</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Candidatures */}
                <section>
                    <h2 className="text-2xl font-bold mb-6">Candidatures Reçues</h2>
                    <div className="space-y-4">
                        {applications.map(app => (
                            <div key={app.id} className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {app.profiles.candidate_photo_url && (
                                        <img
                                            src={app.profiles.candidate_photo_url}
                                            alt="Photo"
                                            className="w-16 h-16 rounded-full object-cover"
                                        />
                                    )}
                                    <div>
                                        <h3 className="font-bold text-lg">{app.profiles.full_name}</h3>
                                        <p className="text-gray-600">
                                            {app.profiles.candidate_diploma} • Pour : {app.jobs.title}
                                        </p>
                                    </div>
                                </div>

                                <a
                                    href={`tel:${app.profiles.phone}`}
                                    className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700"
                                >
                                    📞 Appeler
                                </a>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    )
}
