'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/app/components/ui/Button'
import { Card } from '@/app/components/ui/Card'
import { Heart, MessageCircle, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MatchModalProps {
    isOpen: boolean
    onClose: () => void
    matchData: {
        title: string
        subtitle: string
        image: string
    } | null
    redirectUrl: string
}

export function MatchModal({ isOpen, onClose, matchData, redirectUrl }: MatchModalProps) {
    const router = useRouter()

    if (!isOpen || !matchData) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-[#0f1729]/90 backdrop-blur-md"
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.5, opacity: 0, y: 50 }}
                    className="relative w-full max-w-sm"
                >
                    <Card className="bg-gradient-to-br from-[#1a1040] to-[#0f1729] border-cyan-400/30 overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.3)]">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

                        <div className="p-8 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1, rotate: 360 }}
                                transition={{ type: "spring", delay: 0.2 }}
                                className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full mx-auto flex items-center justify-center mb-6 shadow-xl"
                            >
                                <Heart className="w-10 h-10 text-white fill-current" />
                            </motion.div>

                            <h2 className="text-4xl font-black text-white italic mb-2 tracking-tighter">
                                IT'S A <span className="text-cyan-400">MATCH!</span>
                            </h2>

                            <p className="text-gray-300 mb-8 text-lg">
                                {matchData.title}
                            </p>

                            {/* Avatars meeting */}
                            <div className="flex justify-center items-center -space-x-4 mb-8">
                                <div className="w-16 h-16 rounded-full border-4 border-[#0f1729] overflow-hidden bg-gray-700">
                                    <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
                                </div>
                                <div className="w-16 h-16 rounded-full border-4 border-[#0f1729] overflow-hidden bg-gray-700 z-10">
                                    <img src={matchData.image || "https://ui-avatars.com/api/?background=random"} className="w-full h-full object-cover" alt="Match" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Button
                                    onClick={() => router.push(redirectUrl)}
                                    className="w-full py-6 text-lg bg-cyan-400 hover:bg-cyan-500 text-black font-bold"
                                >
                                    <MessageCircle className="mr-2 w-5 h-5" />
                                    Envoyer un message
                                </Button>

                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Continuer à swiper
                                </Button>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
