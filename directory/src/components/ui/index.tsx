import { ReactNode } from "react";

export function Badge({ children, variant = "default", className = "" }: { children: ReactNode, variant?: string, className?: string }) {
    const variants: Record<string, string> = {
        default: "bg-primary text-white",
        outline: "border border-border text-foreground",
        success: "bg-success/10 text-success border-success/20",
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant] || variants.default} ${className}`}>
            {children}
        </span>
    );
}

export function Card({ children, className = "" }: { children: ReactNode, className?: string }) {
    return (
        <div className={`rounded-xl border bg-card text-card-foreground shadow-sm ${className}`}>
            {children}
        </div>
    );
}

export function CardContent({ children, className = "" }: { children: ReactNode, className?: string }) {
    return (
        <div className={`p-6 pt-0 ${className}`}>
            {children}
        </div>
    );
}
