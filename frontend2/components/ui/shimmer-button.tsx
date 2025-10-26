import React, { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface ShimmerButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    shimmerColor?: string;
    shimmerSize?: string;
    borderRadius?: string;
    shimmerDuration?: string;
    background?: string;
    className?: string;
    children?: React.ReactNode;
}

const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
    (
        {
            shimmerColor = "#ffffff",
            shimmerSize = "0.05em",
            shimmerDuration = "3s",
            borderRadius = "100px",
            background = "rgba(0, 0, 0, 1)",
            className,
            children,
            ...props
        },
        ref,
    ) => {
        return (
            <button
                style={
                    {
                        "--spread": "90deg",
                        "--shimmer-color": shimmerColor,
                        "--radius": borderRadius,
                        "--speed": shimmerDuration,
                        "--cut": shimmerSize,
                        "--bg": background,
                    } as CSSProperties
                }
                className={cn(
                    "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap px-6 py-3 text-white [background:var(--bg)] [border-radius:var(--radius)] dark:text-black",
                    "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px",
                    className,
                )}
                ref={ref}
                {...props}
            >
                {/* Border shimmer effect */}
                <div className="absolute inset-0 rounded-[var(--radius)] p-[2px]">
                    {/* Always visible purple border */}
                    <div className="absolute inset-0 rounded-[var(--radius)] bg-gradient-to-r from-purple-500/50 via-purple-400/60 to-purple-500/50" />
                    {/* Moving highlight */}
                    <div className="absolute inset-0 rounded-[var(--radius)] bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-70 animate-shimmer-slide" />
                </div>

                {/* Content */}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                    {children}
                </div>

                {/* Backdrop to hide inner shimmer */}
                <div
                    className={cn(
                        "absolute -z-20 [background:var(--bg)] [border-radius:var(--radius)] [inset:2px]",
                    )}
                />
            </button>
        );
    },
);

ShimmerButton.displayName = "ShimmerButton";

export { ShimmerButton };
