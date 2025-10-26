"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface TextRevealProps {
    text: string;
    className?: string;
    delay?: number;
    duration?: number;
    staggerDelay?: number;
    fontFamily?: string;
}

export default function TextReveal({
    text,
    className = "",
    delay = 0,
    duration = 0.8,
    staggerDelay = 0.1
}: TextRevealProps) {
    const [isVisible, setIsVisible] = useState(false);
    const letters = text.split("");

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <div className={`flex flex-wrap justify-center ${className}`}>
            {letters.map((letter, index) => (
                <motion.span
                    key={index}
                    initial={{
                        opacity: 0,
                        y: 50,
                        scale: 0.8,
                        filter: "blur(10px)"
                    }}
                    animate={isVisible ? {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        filter: "blur(0px)"
                    } : {}}
                    transition={{
                        duration,
                        delay: delay + (index * staggerDelay),
                        ease: [0.25, 0.46, 0.45, 0.94],
                        type: "spring",
                        stiffness: 100,
                        damping: 15
                    }}
                    className="inline-block mx-1 md:mx-2"
                >
                    {letter === " " ? "\u00A0" : letter}
                </motion.span>
            ))}
        </div>
    );
}

export function GlowingTextReveal({
    text,
    className = "",
    delay = 0,
    duration = 1.2,
    fontFamily
}: TextRevealProps) {
    const [isVisible, setIsVisible] = useState(false);
    const letters = text.split("");

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    // Determine font family from className or prop
    let finalFontFamily = fontFamily;
    if (!finalFontFamily) {
        if (className.includes('font-display')) {
            finalFontFamily = "'Playfair Display', serif";
        } else if (className.includes('font-elegant')) {
            finalFontFamily = "'Playfair Display', serif";
        }
    }

    // If no font family is specified, default to Playfair Display for fancy look
    if (!finalFontFamily) {
        finalFontFamily = "'Playfair Display', serif";
    }

    return (
        <div className={`flex flex-wrap justify-center ${className}`}>
            {letters.map((letter, index) => (
                <motion.span
                    key={index}
                    initial={{
                        opacity: 0,
                        y: 100,
                        rotateX: 90,
                        filter: "blur(20px)"
                    }}
                    animate={isVisible ? {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        filter: "blur(0px)"
                    } : {}}
                    transition={{
                        duration,
                        delay: delay + (index * 0.08),
                        ease: [0.25, 0.46, 0.45, 0.94],
                        type: "spring",
                        stiffness: 80,
                        damping: 20
                    }}
                    className="inline-block mx-1 md:mx-2 relative"
                >
                    <motion.span
                        animate={isVisible ? {
                            textShadow: [
                                "0 0 5px currentColor",
                                "0 0 20px currentColor",
                                "0 0 40px currentColor",
                                "0 0 20px currentColor",
                                "0 0 5px currentColor"
                            ]
                        } : {}}
                        transition={{
                            duration: 2,
                            delay: delay + (index * 0.08) + 0.5,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                        className="inline-block"
                        style={{
                            fontFamily: finalFontFamily || 'inherit',
                            fontSize: 'inherit',
                            fontWeight: 'inherit',
                            fontStyle: 'inherit',
                            lineHeight: 'inherit'
                        }}
                    >
                        {letter === " " ? "\u00A0" : letter}
                    </motion.span>
                </motion.span>
            ))}
        </div>
    );
}

export function TypewriterReveal({
    text,
    className = "",
    delay = 0,
    duration = 0.05
}: TextRevealProps) {
    const [displayText, setDisplayText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timer = setTimeout(() => {
                setDisplayText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, duration * 1000);
            return () => clearTimeout(timer);
        }
    }, [currentIndex, text, duration]);

    useEffect(() => {
        const timer = setTimeout(() => setCurrentIndex(0), delay * 1000);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <div className={`${className}`}>
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay }}
                className="inline-block"
            >
                {displayText}
                <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block ml-1"
                >
                    |
                </motion.span>
            </motion.span>
        </div>
    );
}