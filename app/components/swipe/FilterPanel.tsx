'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, X, Check, Globe, Map as MapIcon, Navigation } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface FilterPanelProps {
    isOpen: boolean
    onClose: () => void
    onApply: () => void
}

type GeoFilter = 'department' | 'region' | 'france'

export function FilterPanel({ isOpen, onClose, onApply }: FilterPanelProps) {
    const supabase = createClientComponentClient()
    const [geoFilter, setGeoFilter] = useState<GeoFilter>('region')
    const [departmentCode, setDepartmentCode] = useState<string>('')
    const [preferredCities, setPreferredCities] = useState<number[]>([]) // Array of city IDs
    const [availableCities, setAvailableCities] = useState<any[]>([]) // Cities in current dept
    const [loading, setLoading] = useState(false)

    // Load current filters
    useEffect(() => {
        if (isOpen) {
            loadFilters()
        }
    }, [isOpen])

    const loadFilters = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch Profile
        const { data: profile } = await supabase
            .from('profiles')
            .select(`
                candidate_geo_filter,
                candidate_preferred_cities,
                candidate_city_id,
                villes_france!candidate_city_id (department_code)
            `)
            .eq('id', user.id)
            .single()

        if (profile) {
            setGeoFilter(profile.candidate_geo_filter || 'region')
            setPreferredCities(profile.candidate_preferred_cities || [])
            if (profile.villes_france?.department_code) {
                setDepartmentCode(profile.villes_france.department_code)
                // Load cities for this department
                fetchCities(profile.villes_france.department_code)
            }
        }
        setLoading(false)
    }

    const fetchCities = async (deptCode: string) => {
        const { data } = await supabase
            .from('villes_france')
            .select('id, name, postal_code, is_major')
            .eq('department_code', deptCode)
            .eq('is_major', true) // Only major cities for checklist to keep it simple
            .order('name')

        if (data) setAvailableCities(data)
    }

    const handleSave = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            await supabase
                .from('profiles')
                .update({
                    candidate_geo_filter: geoFilter,
                    candidate_preferred_cities: geoFilter === 'department' ? preferredCities : [] // Clear specific cities if filter is broader
                })
                .eq('id', user.id)

            onApply()
            onClose()
        }
        setLoading(false)
    }

    const toggleCity = (cityId: number) => {
        if (preferredCities.includes(cityId)) {
            setPreferredCities(prev => prev.filter(id => id !== cityId))
        } else {
            setPreferredCities(prev => [...prev, cityId])
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black z-40"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 flex flex-col max-h-[85vh]"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <MapPin className="text-blue-600" />
                                Zone de recherche
                            </h2>
                            <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-6">

                            {/* Filter Options */}
                            <div className="space-y-3">
                                {/* Option 1: Department */}
                                <button
                                    onClick={() => setGeoFilter('department')}
                                    className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${geoFilter === 'department' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${geoFilter === 'department' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                                        }`}>
                                        <MapIcon size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">Mon département ({departmentCode})</div>
                                        <div className="text-xs text-slate-500">Offres à proximité immédiate</div>
                                    </div>
                                    {geoFilter === 'department' && <Check className="ml-auto text-blue-600" size={20} />}
                                </button>

                                {/* Sub-option: City Checklist (Only if Dept selected) */}
                                {geoFilter === 'department' && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className="ml-4 pl-4 border-l-2 border-blue-100 space-y-2 overflow-hidden"
                                    >
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Villes préférées (Optionnel)</p>
                                        {availableCities.map(city => (
                                            <button
                                                key={city.id}
                                                onClick={() => toggleCity(city.id)}
                                                className="flex items-center gap-3 w-full py-2 hover:bg-slate-50 rounded-lg px-2 transition-colors"
                                            >
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${preferredCities.includes(city.id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                                                    }`}>
                                                    {preferredCities.includes(city.id) && <Check size={12} />}
                                                </div>
                                                <span className={`text-sm ${preferredCities.includes(city.id) ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                                                    {city.name}
                                                </span>
                                            </button>
                                        ))}
                                        {preferredCities.length === 0 && (
                                            <p className="text-xs text-slate-400 italic px-2">Tout le département est sélectionné par défaut.</p>
                                        )}
                                    </motion.div>
                                )}

                                {/* Option 2: Region */}
                                <button
                                    onClick={() => setGeoFilter('region')}
                                    className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${geoFilter === 'region' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${geoFilter === 'region' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                                        }`}>
                                        <Navigation size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">Ma région + voisins</div>
                                        <div className="text-xs text-slate-500">Zone élargie (≈ 100km)</div>
                                    </div>
                                    {geoFilter === 'region' && <Check className="ml-auto text-blue-600" size={20} />}
                                </button>

                                {/* Option 3: France */}
                                <button
                                    onClick={() => setGeoFilter('france')}
                                    className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${geoFilter === 'france' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${geoFilter === 'france' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                                        }`}>
                                        <Globe size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">Toute la France</div>
                                        <div className="text-xs text-slate-500">Pour les mobiles</div>
                                    </div>
                                    {geoFilter === 'france' && <Check className="ml-auto text-blue-600" size={20} />}
                                </button>
                            </div>

                        </div>

                        <div className="pt-6 mt-6 border-t border-slate-100">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/20 active:scale-95 transition-transform"
                            >
                                {loading ? 'Enregistrement...' : 'Appliquer les filtres'}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
