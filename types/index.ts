export type Profile = {
    id: string
    email: string
    role: 'candidate' | 'recruiter'

    // Candidate
    photo_url?: string
    first_name?: string
    phone?: string
    badge?: 'DEA' | 'Auxiliaire' | 'VSL' | 'Régulateur'
    video_url?: string

    // Criteria
    zone_city?: string
    zone_radius_km?: number
    availability?: string[]
    experience_level?: 'junior' | 'confirmé' | 'senior'

    // Recruiter
    company_name?: string
    company_city?: string

    created_at: string
}

export type Job = {
    id: string
    recruiter_id: string
    badge_required: 'DEA' | 'Auxiliaire' | 'VSL' | 'Régulateur'
    schedule: 'jour' | 'nuit' | 'mixte'
    salary: number
    city: string
    created_at: string
}

export type Swipe = {
    id: string
    job_id?: string
    candidate_id?: string
    recruiter_id?: string
    direction: 'left' | 'right'
    created_at: string
}

export type Match = {
    id: string
    job_id: string
    candidate_id: string
    recruiter_id: string
    status: 'pending' | 'hired'
    score?: number
    candidate?: Profile // Join
    job?: Job // Join
    created_at: string
}
