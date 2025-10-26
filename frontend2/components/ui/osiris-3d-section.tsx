'use client'

import { motion } from 'framer-motion';
import { Brain, Zap, Shield, Globe } from 'lucide-react';

export function Osiris3DSection() {
    return (
        <div className="relative w-full min-h-screen">
            {/* Content that scrolls on the left */}
            <div className="relative z-20 w-full md:w-1/2 min-h-screen flex flex-col justify-center px-8 md:px-16">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="max-w-lg"
                >
                    <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-purple-400 to-blue-400 mb-6">
                        OSIRIS AI
                    </h1>
                    <p className="text-xl text-neutral-300 max-w-lg mb-8 leading-relaxed">
                        Revolutionary artificial intelligence that transforms how businesses operate.
                        Our advanced neural networks and machine learning algorithms create intelligent
                        solutions that adapt, learn, and evolve with your business needs.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="flex items-center space-x-3 text-purple-400">
                            <Brain className="w-5 h-5" />
                            <span className="text-sm font-medium">Neural Networks</span>
                        </div>
                        <div className="flex items-center space-x-3 text-blue-400">
                            <Zap className="w-5 h-5" />
                            <span className="text-sm font-medium">Real-time Processing</span>
                        </div>
                        <div className="flex items-center space-x-3 text-purple-400">
                            <Shield className="w-5 h-5" />
                            <span className="text-sm font-medium">Secure & Reliable</span>
                        </div>
                        <div className="flex items-center space-x-3 text-blue-400">
                            <Globe className="w-5 h-5" />
                            <span className="text-sm font-medium">Global Scale</span>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                    >
                        Explore AI Solutions
                    </motion.button>
                </motion.div>
            </div>
        </div>
    )
}
