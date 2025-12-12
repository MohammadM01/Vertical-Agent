import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function Button({ className, variant = "primary", size = "md", children, ...props }) {
    const variants = {
        primary: "bg-teal-600 text-white hover:bg-teal-700 shadow-teal-200",
        secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200",
        ghost: "bg-transparent hover:bg-slate-100 text-slate-600",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base"
    };

    return (
        <button
            className={cn(
                "rounded-xl font-medium transition-all duration-200 active:scale-95 flex items-center justify-center gap-2",
                "focus:outline-none focus:ring-2 focus:ring-teal-500/20",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}

export function Card({ className, children, ...props }) {
    return (
        <div className={cn("bg-white rounded-2xl border border-slate-100 shadow-sm p-5", className)} {...props}>
            {children}
        </div>
    );
}
