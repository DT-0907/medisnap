"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface LoadingAnimationProps {
    isLoading: boolean;
    onComplete: () => void;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ isLoading, onComplete }) => {
    useEffect(() => {
        if (isLoading) {
            const timer = setTimeout(onComplete, 2000);
            return () => clearTimeout(timer);
        }
    }, [isLoading, onComplete]);

    if (!isLoading) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center"
        >
            <div className="relative mb-8">
                <motion.div
                    className="w-32 h-32 border-4 border-purple-500/20 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className="absolute inset-0 w-32 h-32 border-4 border-transparent border-t-purple-500 rounded-full"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className="absolute inset-4 w-24 h-24 bg-purple-500/10 rounded-full flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                >
                    <Zap className="w-8 h-8 text-purple-400" />
                </motion.div>
            </div>

            <motion.div
                className="text-center -mt-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-lg font-semibold text-white mb-2">Loading OSIRIS</div>
                <div className="flex space-x-1 justify-center">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 bg-purple-500 rounded-full"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default LoadingAnimation;
