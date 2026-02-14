'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import BottomNav from '@/app/components/BottomNav'

export default function MatchDetailPage() {
  const params = useParams()
  const [match, setMatch] = useState<any>(null)

  useEffect(() => {
    loadMatch()
  }, [])

  const loadMatch = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        candidate:profiles!matches_candidate_id_fkey(*),
        job:jobs!matches_job_id_fkey(*)
      `)
      .eq('id', params.id)
      .single()
    
    if (!error && data) setMatch(data)
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1729] via-[#1a1040] to-[#0a0e1a] flex items-center justify-center">
        <p className="text-white">Chargement...</p>
      </div>
    )
  }

  const candidate = match.candidate
  const job = match.job

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1729] via-[#1a1040] to-[#0a0e1a] p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        
        <div className="pt-8 mb-6">
          <a href="/matches" className="text-cyan-400 hover:text-white transition">
            ← Retour aux matchs
          </a>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 mb-6">
          
          <div className="flex items-center gap-6 mb-6">
            <img 
              src={candidate.avatar_url || 'https://i.pravatar.cc/150'} 
              alt={candidate.full_name}
              className="w-24 h-24 rounded-full border-4 border-cyan-400 object-cover"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-black text-white mb-2">{candidate.full_name}</h1>
              <p className="text-xl text-cyan-400 mb-2">{candidate.candidate_job_title}</p>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-cyan-400/20 text-cyan-400 rounded-full text-sm font-bold">
                  {candidate.candidate_diploma}
                </span>
                <span className="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-sm">
                  {candidate.candidate_location}
                </span>
              </div>
            </div>
          </div>

          {candidate.candidate_experience_years !== null && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Expérience</h3>
              <p className="text-white text-lg">
                {candidate.candidate_experience_years} an(s) d'expérience professionnelle
              </p>
            </div>
          )}

          {candidate.candidate_bio && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">À propos</h3>
              <p className="text-gray-300 leading-relaxed">{candidate.candidate_bio}</p>
            </div>
          )}

          <div className="pt-6 border-t border-white/10 mb-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Contact</h3>
            <div className="space-y-2">
              <p className="text-white">
                📧 <span className="text-cyan-400">{candidate.email}</span>
              </p>
              {candidate.candidate_phone && (
                <p className="text-white">
                  📱 <span className="text-cyan-400">{candidate.candidate_phone}</span>
                </p>
              )}
            </div>
          </div>

          {(candidate.candidate_cv_url || candidate.candidate_cover_letter_url) && (
            <div className="pt-6 border-t border-white/10">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Documents</h3>
              <div className="space-y-3">
                {candidate.candidate_cv_url && (
                  <a 
                    href={candidate.candidate_cv_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-cyan-400/10 hover:bg-cyan-400/20 rounded-xl transition border border-cyan-400/20"
                  >
                    <span className="text-2xl">📄</span>
                    <div>
                      <p className="font-bold text-white">Curriculum Vitae</p>
                      <p className="text-sm text-gray-400">Cliquez pour télécharger</p>
                    </div>
                  </a>
                )}
                {candidate.candidate_cover_letter_url && (
                  <a 
                    href={candidate.candidate_cover_letter_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-cyan-400/10 hover:bg-cyan-400/20 rounded-xl transition border border-cyan-400/20"
                  >
                    <span className="text-2xl">✉️</span>
                    <div>
                      <p className="font-bold text-white">Lettre de motivation</p>
                      <p className="text-sm text-gray-400">Cliquez pour télécharger</p>
                    </div>
                  </a>
                )}
              </div>
            </div>
          )}

        </div>

        {job && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Poste correspondant</h3>
            <h4 className="text-xl font-bold text-white mb-2">{job.title}</h4>
            <p className="text-gray-300">{job.type} - {job.location}</p>
            <div className="mt-4">
              <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl font-bold text-sm">
                Match {match.score}%
              </span>
            </div>
          </div>
        )}

      </div>
      <BottomNav />
    </div>
  )
}
