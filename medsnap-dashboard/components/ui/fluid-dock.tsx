"use client";

import {
    motion,
    MotionValue,
    useMotionValue,
    useSpring,
    useTransform,
    type SpringOptions,
    AnimatePresence,
} from "framer-motion";
import React, {
    Children,
    cloneElement,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type DockItemData = {
    icon: React.ReactNode;
    label: React.ReactNode;
    path: string;
    className?: string;
};

export type FluidDockProps = {
    items: DockItemData[];
    className?: string;
    distance?: number;
    panelHeight?: number;
    baseItemSize?: number;
    dockHeight?: number;
    magnification?: number;
    spring?: SpringOptions;
    isVisible?: boolean;
};

type DockItemProps = {
    className?: string;
    children: React.ReactNode;
    onClick?: () => void;
    mouseX: MotionValue;
    spring: SpringOptions;
    distance: number;
    baseItemSize: number;
    magnification: number;
    isActive?: boolean;
};

function DockItem({
    children,
    className = "",
    onClick,
    mouseX,
    spring,
    distance,
    magnification,
    baseItemSize,
    isActive = false,
}: DockItemProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isHovered = useMotionValue(0);

    const mouseDistance = useTransform(mouseX, (val) => {
        const rect = ref.current?.getBoundingClientRect() ?? {
            x: 0,
            width: baseItemSize,
        };
        return val - rect.x - baseItemSize / 2;
    });

    const targetSize = useTransform(
        mouseDistance,
        [-distance, 0, distance],
        [baseItemSize, magnification, baseItemSize]
    );
    const size = useSpring(targetSize, spring);

    return (
        <motion.div
            ref={ref}
            style={{
                width: size,
                height: size,
            }}
            onHoverStart={() => isHovered.set(1)}
            onHoverEnd={() => isHovered.set(0)}
            onFocus={() => isHovered.set(1)}
            onBlur={() => isHovered.set(0)}
            onClick={onClick}
            className={`relative inline-flex items-center justify-center rounded-full bg-[#060010] border-neutral-700 border-2 shadow-md transition-all duration-300 ${isActive
                ? 'border-yellow-500 shadow-yellow-500 shadow-lg'
                : 'hover:border-yellow-500 hover:shadow-yellow-500 hover:shadow-lg'
                } ${className}`}
            tabIndex={0}
            role="button"
            aria-haspopup="true"
        >
            {isActive && (
                <motion.div
                    className="absolute inset-0 rounded-full"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        boxShadow: '0 0 20px rgba(234, 179, 8, 0.6), 0 0 40px rgba(234, 179, 8, 0.3), 0 0 60px rgba(234, 179, 8, 0.1)',
                        background: 'radial-gradient(circle, rgba(234, 179, 8, 0.1) 0%, transparent 70%)'
                    }}
                />
            )}
            {Children.map(children, (child) =>
                cloneElement(child as React.ReactElement, { isHovered })
            )}
        </motion.div>
    );
}

type DockLabelProps = {
    className?: string;
    children: React.ReactNode;
};

function DockLabel({ children, className = "", ...rest }: DockLabelProps) {
    const { isHovered } = rest as { isHovered: MotionValue<number> };
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const unsubscribe = isHovered.on("change", (latest) => {
            setIsVisible(latest === 1);
        });
        return () => unsubscribe();
    }, [isHovered]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: -10 }}
                    exit={{ opacity: 0, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`${className} absolute -top-6 left-1/2 w-fit whitespace-pre rounded-md border border-neutral-700 bg-[#060010] px-2 py-0.5 text-xs text-white`}
                    role="tooltip"
                    style={{ x: "-50%" }}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

type DockIconProps = {
    className?: string;
    children: React.ReactNode;
};

function DockIcon({ children, className = "" }: DockIconProps) {
    return (
        <div className={`flex items-center justify-center text-white ${className}`}>
            {children}
        </div>
    );
}

export default function FluidDock({
    items,
    className = "",
    spring = { mass: 0.01, stiffness: 1200, damping: 25 },
    magnification = 70,
    distance = 200,
    panelHeight = 68,
    dockHeight = 256,
    baseItemSize = 50,
    isVisible = true,
}: FluidDockProps) {
    const mouseX = useMotionValue(Infinity);
    const isHovered = useMotionValue(0);
    const pathname = usePathname();

    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed bottom-4 left-0 right-0 z-50 flex justify-center"
        >
            <motion.div
                style={{ height: panelHeight, scrollbarWidth: "none" }}
                className="flex items-center justify-center"
            >
                <motion.div
                    onMouseMove={({ pageX }) => {
                        isHovered.set(1);
                        mouseX.set(pageX);
                    }}
                    onMouseLeave={() => {
                        isHovered.set(0);
                        mouseX.set(Infinity);
                    }}
                    className={`${className} flex items-center justify-center w-fit gap-4 rounded-2xl border-neutral-700 border-2 pt-2 pb-2 px-4 bg-[#060010]`}
                    style={{ height: panelHeight }}
                    role="toolbar"
                    aria-label="Application dock"
                >
                    {items.map((item, index) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link key={index} href={item.path}>
                                <DockItem
                                    onClick={item.onClick}
                                    className={item.className}
                                    mouseX={mouseX}
                                    spring={spring}
                                    distance={distance}
                                    magnification={magnification}
                                    baseItemSize={baseItemSize}
                                    isActive={isActive}
                                >
                                    <DockIcon>{item.icon}</DockIcon>
                                    <DockLabel>{item.label}</DockLabel>
                                </DockItem>
                            </Link>
                        );
                    })}
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
