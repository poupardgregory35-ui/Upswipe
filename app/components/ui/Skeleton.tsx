export function JobCardSkeleton() {
    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-pulse mb-4">
            <div className="flex justify-between items-start mb-4">
                <div className="w-full">
                    <div className="h-6 bg-white/10 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-white/10 rounded w-1/2 mb-4"></div>
                </div>
            </div>

            <div className="flex gap-2 mb-6">
                <div className="h-6 bg-white/10 rounded w-16"></div>
                <div className="h-6 bg-white/10 rounded w-20"></div>
                <div className="h-6 bg-white/10 rounded w-24"></div>
            </div>

            <div className="h-12 bg-white/10 rounded-xl w-full"></div>
        </div>
    )
}
