'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User, Briefcase } from 'lucide-react'

export default function OnboardingPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleRoleSelect = async (role: 'candidate' | 'recruiter') => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                // Should not happen if protected, but safe guard
                router.push('/login')
                return
            }

            // Update profile with role
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    email: user.email,
                    role: role,
                    full_name: user.user_metadata.full_name || '',
                    avatar_url: user.user_metadata.avatar_url || ''
                })

            if (error) throw error

            // Redirect based on role
            if (role === 'candidate') router.push('/onboarding/candidate')
            else router.push('/recruteur/onboarding/type')

        } catch (error) {
            console.error(error)
            alert('Erreur lors de la sélection du rôle')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans">
            <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8">

                {/* Candidate Option */}
                <button
                    onClick={() => handleRoleSelect('candidate')}
                    disabled={loading}
                    className="group relative h-[400px] bg-neutral-900 border border-neutral-800 rounded-3xl p-8 flex flex-col items-center justify-center hover:bg-neutral-800 hover:border-cyan-500 transition-all duration-300"
                >
                    <div className="w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors">
                        <User size={48} />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Candidat</h2>
                    <p className="text-gray-400 text-center">
                        Je cherche un poste<br />dans le transport sanitaire.
                    </p>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-3xl" />
                </button>

                {/* Recruiter Option */}
                <button
                    onClick={() => handleRoleSelect('recruiter')}
                    disabled={loading}
                    className="group relative h-[400px] bg-neutral-900 border border-neutral-800 rounded-3xl p-8 flex flex-col items-center justify-center hover:bg-neutral-800 hover:border-purple-500 transition-all duration-300"
                >
                    <div className="w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-colors">
                        <Briefcase size={48} />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Recruteur</h2>
                    <p className="text-gray-400 text-center">
                        Je cherche des talents<br />pour mon entreprise.
                    </p>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-3xl" />
                </button>

            </div>
        </div>
    )
}
