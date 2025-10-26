'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Target, Award, Globe, ArrowRight, Zap, Shield, Star, Brain, Rocket } from 'lucide-react';
import LoadingAnimation from '@/components/ui/loading-animation';
import SharedLayout from '@/components/shared-layout';
import { AnimatedButton } from '@/components/ui/animated-button';
import { AnimatedGroup } from '@/components/ui/animated-group';
import { SplineScene } from '@/components/ui/spline';
import { Card } from '@/components/ui/card';
import { Spotlight } from '@/components/ui/spotlight';
import Link from 'next/link';

const AboutUsPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleLoadingComplete = () => {
        setIsLoading(false);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    const features = [
        "AI-Powered Automation Solutions",
        "Custom Workflow Integration",
        "Real-time Data Processing",
        "Scalable Cloud Infrastructure",
        "Advanced Machine Learning Models",
        "24/7 System Monitoring",
        "Comprehensive Analytics Dashboard",
        "Multi-platform Compatibility",
        "Enterprise Security & Compliance"
    ];

    if (isLoading) {
        return <LoadingAnimation isLoading={isLoading} onComplete={handleLoadingComplete} />;
    }

    return (
        <SharedLayout>
            <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-blue-950/20 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent"></div>

                {/* Main Content */}
                <div className="relative z-10">
                    {/* Hero Section with 3D Robot */}
                    <section className="min-h-screen relative">
                        <Card className="w-full h-screen bg-black/[0.96] relative overflow-hidden border-0 rounded-none">
                            <Spotlight
                                className="-top-40 left-0 md:left-60 md:-top-20"
                                fill="white"
                            />

                            <div className="flex h-full">
                                {/* Left content - About Us Information */}
                                <div className="flex-1 p-8 md:p-16 relative z-20 flex flex-col justify-center">
                                    <AnimatedGroup preset="zoom" className="space-y-8 pointer-events-auto">
                                        <motion.h1
                                            className="text-5xl md:text-7xl font-display bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            About OSIRIS
                                        </motion.h1>
                                        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl leading-relaxed font-display">
                                            We are a forward-thinking technology company dedicated to revolutionizing industries through innovative AI solutions and cutting-edge digital transformation.
                                        </p>
                                    </AnimatedGroup>

                                    <AnimatedGroup preset="slide" className="mt-12 grid md:grid-cols-2 gap-8 pointer-events-auto">
                                        {[
                                            { icon: <Users className="w-8 h-8" />, title: "Expert Team", description: "World-class professionals with deep industry expertise" },
                                            { icon: <Target className="w-8 h-8" />, title: "Clear Vision", description: "Focused on delivering measurable business impact" },
                                            { icon: <Award className="w-8 h-8" />, title: "Proven Results", description: "Track record of successful transformations" },
                                            { icon: <Globe className="w-8 h-8" />, title: "Global Reach", description: "Serving clients across multiple continents" }
                                        ].map((item, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.8 + index * 0.1 }}
                                                className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-105"
                                            >
                                                <div className="text-purple-400 mb-4 flex justify-center">
                                                    {item.icon}
                                                </div>
                                                <h3 className="text-xl font-semibold mb-2 text-white">{item.title}</h3>
                                                <p className="text-gray-400">{item.description}</p>
                                            </motion.div>
                                        ))}
                                    </AnimatedGroup>

                                    <AnimatedGroup preset="fade" className="mt-12 pointer-events-auto">
                                        <Link href="/trial">
                                            <AnimatedButton
                                                variant="primary"
                                                className="group w-full h-16 text-lg"
                                            >
                                                <span className="relative z-10 flex items-center justify-center w-full">
                                                    Book a Trial Call
                                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                                </span>
                                            </AnimatedButton>
                                        </Link>
                                    </AnimatedGroup>
                                </div>

                                {/* Right content - 3D Robot Scene */}
                                <div className="flex-1 relative z-50">
                                    <SplineScene
                                        scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                                        className="w-full h-full"
                                    />
                                </div>
                            </div>
                        </Card>
                    </section>

                    {/* Additional Content Sections */}
                    <section className="px-6 py-20 bg-black/50">
                        <div className="mx-auto max-w-6xl">
                            <AnimatedGroup preset="slide" className="grid md:grid-cols-3 gap-8">
                                {features.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 1.2 + index * 0.1 }}
                                        className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-purple-500/20 text-center"
                                    >
                                        <div className="flex items-start space-x-3 justify-center">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                                            <p className="text-gray-300">{feature}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatedGroup>
                        </div>
                    </section>

                    {/* Mission & Vision Section */}
                    <section className="px-6 py-20">
                        <div className="mx-auto max-w-6xl">
                            <AnimatedGroup preset="zoom" className="text-center mb-16">
                                <h2 className="text-4xl md:text-6xl font-display bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-6">
                                    Our Mission & Vision
                                </h2>
                                <p className="text-xl text-gray-300 max-w-4xl mx-auto">
                                    To democratize AI technology and make advanced automation accessible to businesses of all sizes
                                </p>
                            </AnimatedGroup>

                            <AnimatedGroup preset="slide" className="grid md:grid-cols-2 gap-12">
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="p-8 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20"
                                >
                                    <div className="text-purple-400 mb-6">
                                        <Brain className="w-12 h-12" />
                                    </div>
                                    <h3 className="text-2xl font-semibold text-white mb-4">Mission</h3>
                                    <p className="text-gray-300 leading-relaxed">
                                        To revolutionize business operations through intelligent automation, enabling companies to focus on innovation and growth while we handle the repetitive tasks.
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="p-8 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20"
                                >
                                    <div className="text-blue-400 mb-6">
                                        <Rocket className="w-12 h-12" />
                                    </div>
                                    <h3 className="text-2xl font-semibold text-white mb-4">Vision</h3>
                                    <p className="text-gray-300 leading-relaxed">
                                        To become the global leader in AI-powered business automation, creating a future where every business can operate at peak efficiency through intelligent technology.
                                    </p>
                                </motion.div>
                            </AnimatedGroup>
                        </div>
                    </section>
                </div>
            </div>
        </SharedLayout>
    );
};

export default AboutUsPage;
