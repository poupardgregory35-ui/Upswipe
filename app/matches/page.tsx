'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/app/components/BottomNav'
import { Card } from '@/app/components/ui/Card'
import { motion } from 'framer-motion'

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([])

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        candidate:profiles!matches_candidate_id_fkey(*)
      `)
      .order('created_at', { ascending: false })

    if (!error && data) setMatches(data)
  }

  return (
    <div className="min-h-screen p-6 pb-24 max-w-4xl mx-auto">
      <div className="mb-8 pt-8">
        <h1 className="text-3xl font-black text-white mb-2">Mes Matchs</h1>
        <p className="text-cyan-400">{matches.length} candidat(s) intéressé(s)</p>
      </div>

      <div className="space-y-4">
        {matches.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <a href={`/matches/${match.id}`} className="block group">
              <Card className="hover:border-cyan-400/50 group-hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <img
                    src={match.candidate?.avatar_url || 'https://i.pravatar.cc/150'}
                    alt={match.candidate?.full_name}
                    className="w-16 h-16 rounded-full border-2 border-cyan-400 object-cover group-hover:scale-110 transition-transform"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{match.candidate?.full_name}</h3>
                    <p className="text-gray-300">{match.candidate?.candidate_job_title}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="px-3 py-1 bg-cyan-400/20 text-cyan-400 rounded-full text-xs font-bold">
                        {match.candidate?.candidate_diploma}
                      </span>
                      <span className="text-gray-400 text-sm">{match.candidate?.candidate_location}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl font-bold text-sm border border-green-500/20">
                      {match.score}%
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(match.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>
            </a>
          </motion.div>
        ))}

        {matches.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">Aucun match pour le moment.</p>
            <p className="text-sm mt-2 opacity-50">Continuez à swiper !</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
