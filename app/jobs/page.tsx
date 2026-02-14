'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/app/components/BottomNav'
import { Card } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) setJobs(data)
  }

  const handleCreateJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const { error } = await supabase.from('jobs').insert({
      recruiter_id: null,
      title: formData.get('title'),
      type: formData.get('type'),
      location: formData.get('location'),
      diploma: formData.get('diploma'),
      status: 'active'
    })

    if (!error) {
      setShowForm(false)
      loadJobs()
    } else {
      alert('Erreur : ' + error.message)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (confirm('Supprimer cette offre ?')) {
      const { error } = await supabase.from('jobs').delete().eq('id', jobId)
      if (!error) loadJobs()
    }
  }

  return (
    <div className="min-h-screen p-6 pb-24 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8 pt-8">
        <div>
          <a
            href="/dashboard"
            className="text-cyan-400 font-bold hover:underline text-sm mb-2 block"
          >
            ← Mon profil
          </a>
          <h1 className="text-3xl font-black text-white">Mes Offres</h1>
          <p className="text-cyan-400 mt-2">{jobs.length} offre(s)</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 border-0"
        >
          {showForm ? 'Annuler' : '+ Nouvelle offre'}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <Card className="p-8 backdrop-blur-2xl">
              <form onSubmit={handleCreateJob}>
                <input name="title" type="text" placeholder="Titre *" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white mb-4 focus:border-cyan-400/50 focus:outline-none transition-colors" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <select name="type" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-cyan-400/50 focus:outline-none transition-colors">
                    <option value="CDI" className="bg-[#0f1729]">CDI</option>
                    <option value="CDD" className="bg-[#0f1729]">CDD</option>
                  </select>
                  <select name="diploma" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-cyan-400/50 focus:outline-none transition-colors">
                    <option value="DEA" className="bg-[#0f1729]">DEA</option>
                    <option value="Auxiliaire" className="bg-[#0f1729]">Auxiliaire</option>
                  </select>
                </div>
                <input name="location" type="text" placeholder="Localisation *" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white mb-4 focus:border-cyan-400/50 focus:outline-none transition-colors" />
                <Button type="submit" className="w-full">Publier</Button>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {jobs.map(job => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            layout
          >
            <Card className="hover:border-white/30 transition-colors">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{job.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="px-2 py-1 bg-white/10 rounded-md text-xs font-medium text-gray-300">{job.type}</span>
                    <span className="px-2 py-1 bg-white/10 rounded-md text-xs font-medium text-gray-300">{job.location}</span>
                  </div>
                  <p className="text-gray-400 text-sm">Diplôme requis : <span className="text-cyan-400">{job.diploma}</span></p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <a href={`/swipe?jobId=${job.id}`} className="flex-1 md:flex-initial">
                    <Button size="sm" className="w-full">Swiper</Button>
                  </a>
                  <Button
                    onClick={() => handleDeleteJob(job.id)}
                    variant="ghost"
                    size="sm"
                    className="flex-1 md:flex-initial text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
        {jobs.length === 0 && !showForm && (
          <p className="text-center text-gray-400 py-12">Aucune offre. Créez-en une !</p>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
