'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

function AuthDispatchContent() {
    const supabase = createClientComponentClient()
    const router = useRouter()
    const searchParams = useSearchParams()
    const roleParam = searchParams.get('role') // 'candidate' or 'recruiter'

    useEffect(() => {
        const handleDispatch = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    router.push('/login/candidat') // Default fallback
                    return
                }

                // Check Profile
                let { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                // Create Profile if missing (Self-Healing)
                if (!profile) {
                    // We need a role to create a profile.
                    // If we came from a role-specific login, we have it in URL params if we passed it.
                    // If not, we might be stuck.
                    // STRATEGY: Default to 'candidate' if unknown, but better to force user selection if ambiguous?
                    // The user said "Init dès que l'utilisateur est créé... avec son id et son role".
                    // Google Auth callback needs to pass this role. 
                    // If we are here, it means we probably just logged in.

                    const newRole = roleParam === 'recruiter' ? 'recruiter' : 'candidate'

                    const { error: insertError } = await supabase
                        .from('profiles')
                        .insert({
                            id: user.id,
                            role: newRole,
                            email: user.email,
                            onboarding_completed: false
                        })

                    if (insertError) {
                        console.error('Profile creation error:', insertError)
                        toast.error("Erreur création profil")
                        return
                    }

                    // Re-fetch to confirm
                    const { data: newProfile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single()
                    profile = newProfile
                }

                // Smart Redirect
                if (profile?.role === 'recruiter') {
                    if (profile.recruiter_onboarding_completed) {
                        router.push('/recruteur/dashboard')
                    } else {
                        router.push('/recruteur/onboarding/type')
                    }
                } else {
                    // Candidate : route to onboarding if profile is incomplete,
                    // otherwise to dashboard. We use candidate_diploma as the
                    // primary completion marker (mandatory step 1 of the flow).
                    const onboardingComplete =
                        profile?.onboarding_completed === true ||
                        Boolean(profile?.candidate_diploma)

                    if (onboardingComplete) {
                        router.push('/candidat/dashboard')
                    } else {
                        router.push('/onboarding/candidat')
                    }
                }

            } catch (error) {
                console.error("Dispatch error:", error)
                router.push('/')
            }
        }

        handleDispatch()
    }, [supabase, router, roleParam])

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <Loader2 className="animate-spin text-green-500" size={48} />
        </div>
    )
}

export default function AuthDispatchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-green-500" size={48} /></div>}>
            <AuthDispatchContent />
        </Suspense>
    )
}
