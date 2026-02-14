import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    children: React.ReactNode
}

export function Button({
    className,
    variant = 'primary',
    size = 'md',
    children,
    ...props
}: ButtonProps) {
    const variants = {
        primary: "bg-cyan-400 text-white hover:bg-cyan-500 shadow-lg shadow-cyan-400/20",
        secondary: "bg-white/10 text-white hover:bg-white/20 backdrop-blur-md",
        outline: "border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10",
        ghost: "text-gray-400 hover:text-white hover:bg-white/5"
    }

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg"
    }

    return (
        <button
            className={cn(
                "rounded-xl font-bold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
}
