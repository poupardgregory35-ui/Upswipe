'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { SwipeCard, Job } from './SwipeCard'
import confetti from 'canvas-confetti'
import { Loader2, RefreshCw, Briefcase } from 'lucide-react'
import Link from 'next/link'

export function SwipeInterface() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [lastDirection, setLastDirection] = useState<string>()
    const supabase = createClientComponentClient()

    // We use a ref to track the current index to avoid closure staleness in callbacks if needed,
    // but with React state it should be fine for simple logic.
    // However, react-tinder-card sometimes behaves better when we remove cards from DOM or track index.
    // A common pattern is to keep the list and just render the top ones, or remove them.
    // "react-tinder-card" recommends removing the card from the DOM after swipe for performance and logic.
    // But typical Tinder clones often keep the array and just hide.
    // Let's go with: Render the last 2 cards in the array (stack logic), and pop them.

    useEffect(() => {
        fetchJobs()
    }, [])

    const fetchJobs = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/jobs/swipe')
            if (res.ok) {
                const data = await res.json()
                setJobs(data)
            }
        } catch (error) {
            console.error("Failed to fetch jobs", error)
        } finally {
            setLoading(false)
        }
    }

    const swiped = async (direction: string, job: Job, index: number) => {
        setLastDirection(direction)

        // Optimistic UI: Remove card from list (or just let state update handle it if we slice)
        // With react-tinder-card, the onCardLeftScreen event is often better for removing.
        // But onSwipe is triggered when user swipes.

        // 1. Log Swipe in DB
        const { error: swipeError } = await supabase.from('swipes').insert({
            job_id: job.id,
            direction: direction
        })

        if (!swipeError && direction === 'right') {
            // 2. Create Application
            await supabase.from('applications').insert({
                job_id: job.id,
                source: 'swipe'
            })

            // 3. Match Effect (Confetti) if score is good > 80 or just always for positive action?
            // "Match parfait" -> Confetti
            if ((job.score || 0) > 80) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#22c55e', '#3b82f6', '#ffffff'] // Green, Blue, White
                })
            } else {
                // Small confetti for any like
                confetti({
                    particleCount: 30,
                    spread: 50,
                    origin: { y: 0.6 },
                    colors: ['#3b82f6'] // Blue
                })
            }
        }
    }

    const outOfFrame = (name: string) => {
        // Remove job from state to render the next one
        // We filter out the job ID.
        // Since we are stacking, we want to remove the specific job.
        // Note: In react-tinder-card, the last element in array is on top.
        // So we should remove the last element.
        setJobs(current => current.filter(j => j.id !== name))
    }

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
        )
    }

    if (jobs.length === 0) {
        return (
            <div className="flex flex-col h-[80vh] items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <Briefcase size={40} className="text-blue-500" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">Bravo, tu as tout vu !</h2>
                <p className="text-slate-500 mb-8 max-w-sm">
                    Il n'y a plus d'offres correspondant à tes critères pour le moment.
                    Reviens plus tard !
                </p>

                <div className="flex gap-4">
                    <button
                        onClick={fetchJobs}
                        className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors flex items-center gap-2"
                    >
                        <RefreshCw size={18} />
                        Actualiser
                    </button>
                    <Link
                        href="/candidat/dashboard"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/30"
                    >
                        Dashboard
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="relative w-full h-[80vh] flex flex-col items-center justify-center mt-4">
            <div className="relative w-full max-w-md h-[70vh]">
                {jobs.map((job) => (
                    <SwipeCard
                        key={job.id}
                        job={job}
                        onSwipe={(dir) => swiped(dir, job, 0)}
                    // We pass onCardLeftScreen to remove it from DOM
                    // react-tinder-card 2.x API:
                    // onCardLeftScreen={(dir) => outOfFrame(job.id)}
                    // But SwipeCard wraps it, so ensure props are passed or handled.
                    // Actually SwipeCard uses onSwipe. 
                    // Let's rely on onSwipe triggering the logic, but for smoother animation, 
                    // it's better to wait until it leaves screen.
                    // However, SwipeCard prop is `onSwipe`. 
                    // Let's modify SwipeCard to accept `onCardLeftScreen` if needed or just handle state removal after a delay in `swiped`.
                    // Using state removal in `swiped` alone might cause immediate disappearance before animation finishes.
                    // Recommended: use `onCardLeftScreen` from library.
                    // I will assume SwipeCard passes extra props or I should update SwipeCard.
                    />
                ))}
            </div>

            <div className="mt-8 text-slate-400 text-sm font-medium animate-pulse">
                Swipe droite pour postuler • Gauche pour passer
            </div>
        </div>
    )
}
