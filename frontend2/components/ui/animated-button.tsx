import { cn } from "@/lib/utils"
import { ElementType, ComponentPropsWithoutRef } from "react"

interface AnimatedButtonProps<T extends ElementType> {
    as?: T
    className?: string
    children: React.ReactNode
    variant?: "primary" | "secondary"
}

export function AnimatedButton<T extends ElementType = "button">({
    as,
    className,
    children,
    variant = "primary",
    ...props
}: AnimatedButtonProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof AnimatedButtonProps<T>>) {
    const Component = as || "button"

    return (
        <Component
            className={cn(
                "group relative inline-block py-[1px] overflow-hidden rounded-full transition-all duration-300 hover:scale-105",
                className
            )}
            {...props}
        >
            {/* Animated border effect */}
            <div
                className={cn(
                    "absolute inset-0 rounded-full transition-all duration-300",
                    "border-2",
                    variant === "primary"
                        ? "border-purple-500"
                        : "border-purple-500/50"
                )}
            />

            {/* White animation that travels around */}
            <div
                className={cn(
                    "absolute w-[300%] h-[50%] bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0",
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                )}
                style={{
                    background: "radial-gradient(circle, rgba(255,255,255,0.8), transparent 10%)",
                    animationDuration: "6s",
                }}
            />
            <div
                className={cn(
                    "absolute w-[300%] h-[50%] top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0",
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                )}
                style={{
                    background: "radial-gradient(circle, rgba(255,255,255,0.8), transparent 10%)",
                    animationDuration: "6s",
                }}
            />

            {/* Button content with transparent background */}
            <div className={cn(
                "relative z-10 text-center text-base py-4 px-6 rounded-full transition-all duration-300",
                "bg-transparent backdrop-blur-sm border border-transparent",
                "group-hover:border-white/30",
                variant === "primary"
                    ? "text-white"
                    : "text-white border-purple-500/50"
            )}>
                {children}
            </div>
        </Component>
    )
}
