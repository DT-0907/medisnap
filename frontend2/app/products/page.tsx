"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Zap, Shield, Cpu, Cloud, ArrowRight, Users, MessageSquare, Route, CreditCard, Star, Brain } from 'lucide-react';
import LoadingAnimation from '@/components/ui/loading-animation';
import SharedLayout from '@/components/shared-layout';
import { AnimatedButton } from '@/components/ui/animated-button';
import { AnimatedGroup, TextEffect } from '@/components/ui/animated-group';
import Link from 'next/link';

const ProductsPage = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const products = [
        {
            icon: <Users className="w-8 h-8" />,
            title: "LOS - Lead Outreach System",
            subtitle: "Proactive Prospecting Engine",
            description: "Transform your sales process with our intelligent lead generation system. We automatically find and reach out to your ideal customers across email, SMS, and LinkedIn, so you never run out of qualified prospects.",
            overview: "Stop spending hours on manual prospecting. Our system continuously builds your pipeline with warm, qualified leads while you focus on closing deals.",
            coreFunctions: [
                "We automatically discover and research your ideal customers using advanced targeting",
                "Our AI crafts personalized outreach messages that get real responses",
                "We handle all follow-ups and engagement across multiple channels",
                "Every interested prospect gets instantly routed to your sales team",
                "We track performance and optimize your outreach strategy automatically",
                "Scale your prospecting from 10 to 1000+ leads without adding staff"
            ],
            keyTools: [
                "Advanced prospect discovery and enrichment technology",
                "Multi-channel outreach automation (email, SMS, LinkedIn)",
                "AI-powered personalization and message optimization",
                "Intelligent follow-up sequences and engagement tracking",
                "Seamless integration with your existing CRM and tools"
            ],
            businessImpact: "Our clients typically see 5-10x more qualified leads in their pipeline while saving 15-20 hours per week on prospecting. You'll have a constant flow of warm prospects ready to buy, dramatically increasing your sales velocity and revenue."
        },
        {
            icon: <MessageSquare className="w-8 h-8" />,
            title: "LES - Lead Engagement System",
            subtitle: "Universal Engagement Brain",
            description: "Never lose another lead again. Our system instantly responds to every inquiry, qualifies prospects with intelligent conversations, and books appointments automatically - all while maintaining a personal touch.",
            overview: "We ensure every lead gets the attention they deserve, converting more prospects into customers while you focus on what you do best.",
            coreFunctions: [
                "We instantly respond to every new lead within seconds, not hours",
                "Our AI conducts natural conversations to qualify prospects for you",
                "We nurture leads with perfectly timed follow-ups and personalized content",
                "We offer instant booking options that fit your prospect's schedule",
                "We keep your CRM updated automatically with every interaction",
                "We escalate urgent leads directly to your team when needed"
            ],
            keyTools: [
                "Instant response technology across all communication channels",
                "AI-powered conversation management and lead qualification",
                "Intelligent scheduling and booking automation",
                "Seamless CRM integration and real-time updates",
                "Advanced lead scoring and prioritization"
            ],
            businessImpact: "Our clients see 3-5x faster response times and 25-40% higher conversion rates. You'll never miss a hot lead again, and your team can focus on closing deals instead of chasing prospects."
        },
        {
            icon: <Route className="w-8 h-8" />,
            title: "RAS - Routing & Assignment System",
            subtitle: "Automated Job Scheduling",
            description: "Eliminate scheduling headaches forever. Our system automatically assigns the perfect team member to every job, considering location, skills, and availability - ensuring optimal service delivery every time.",
            overview: "We handle all the complex scheduling logic so you can focus on growing your business and serving your customers.",
            coreFunctions: [
                "We automatically match the best team member to every job based on multiple factors",
                "We handle all scheduling confirmations and escalations automatically",
                "We optimize routes to minimize travel time and maximize efficiency",
                "We ensure every job gets confirmed quickly with backup plans in place",
                "We provide real-time updates to both your team and customers",
                "We learn from patterns to continuously improve scheduling decisions"
            ],
            keyTools: [
                "Intelligent matching algorithms for optimal job assignments",
                "Automated communication and confirmation systems",
                "Real-time scheduling optimization and route planning",
                "Seamless integration with your existing scheduling tools",
                "Advanced analytics and performance tracking"
            ],
            businessImpact: "Our clients typically save 8-12 hours per week on scheduling while improving customer satisfaction by 30-50%. Your team will be more productive, your customers will be happier, and you'll have complete visibility into your operations."
        },
        {
            icon: <CreditCard className="w-8 h-8" />,
            title: "PAS - Payment Automation System",
            subtitle: "Seamless Financial Transactions",
            description: "Get paid faster and eliminate payment headaches. Our system automatically processes payments, sends invoices, and handles all the financial admin so you can focus on delivering great service.",
            overview: "We ensure you get paid on time, every time, while providing your customers with a seamless payment experience.",
            coreFunctions: [
                "We automatically process payments as soon as jobs are completed",
                "We send professional invoices and payment reminders automatically",
                "We handle multiple payment methods and currencies seamlessly",
                "We integrate with your accounting software for effortless bookkeeping",
                "We provide real-time payment tracking and reporting",
                "We handle payment disputes and refunds efficiently"
            ],
            keyTools: [
                "Secure payment processing and fraud protection",
                "Automated invoicing and payment collection",
                "Multi-platform accounting integration",
                "Advanced financial reporting and analytics",
                "Customer payment portal and self-service options"
            ],
            businessImpact: "Our clients typically see 40-60% faster payment collection and save 5-8 hours per week on financial admin. You'll have better cash flow, happier customers, and complete financial visibility without the manual work."
        },
        {
            icon: <Brain className="w-8 h-8" />,
            title: "AICC - AI Customer Care",
            subtitle: "Intelligent Customer Support",
            description: "Provide 24/7 customer support without hiring more staff. Our AI handles common inquiries, resolves issues, and escalates complex problems to your team - all while maintaining your brand voice.",
            overview: "We ensure every customer gets instant, helpful support while reducing your support workload and improving satisfaction scores.",
            coreFunctions: [
                "We provide instant responses to common customer questions 24/7",
                "We resolve routine issues automatically without human intervention",
                "We escalate complex problems to your team with full context",
                "We learn from every interaction to continuously improve",
                "We maintain consistent brand voice and service quality",
                "We provide detailed analytics on customer satisfaction and support metrics"
            ],
            keyTools: [
                "Advanced AI language processing and understanding",
                "Intelligent issue classification and routing",
                "Seamless human handoff with full conversation context",
                "Multi-language support and cultural adaptation",
                "Comprehensive support analytics and reporting"
            ],
            businessImpact: "Our clients typically see 70-80% of support inquiries resolved automatically, reducing support costs by 40-60% while improving customer satisfaction scores by 25-35%. Your team can focus on complex issues while customers get instant help."
        }
    ];

    return (
        <SharedLayout>
            <AnimatePresence>
                <LoadingAnimation isLoading={isLoading} onComplete={() => setIsLoading(false)} />
            </AnimatePresence>

            <div className="min-h-screen bg-black text-white pb-18">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="container mx-auto px-6 py-12"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="space-y-12"
                    >
                        <div className="text-center space-y-6">
                            <AnimatedGroup preset="zoom" className="space-y-6">
                                <motion.h1
                                    className="text-5xl md:text-7xl font-display bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    Our Products
                                </motion.h1>
                                <TextEffect
                                    preset="blur"
                                    per="word"
                                    className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
                                >
                                    Discover our comprehensive suite of AI automation solutions designed to transform your business operations and drive unprecedented growth.
                                </TextEffect>
                            </AnimatedGroup>
                        </div>

                        <AnimatedGroup preset="slide" className="space-y-16">
                            {products.map((product, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 + index * 0.1 }}
                                    className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
                                >
                                    <div className="flex items-start space-x-6 mb-8">
                                        <div className="text-purple-400 p-4 rounded-xl bg-purple-500/10">
                                            {product.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-3xl font-semibold mb-2">{product.title}</h3>
                                            <p className="text-xl text-purple-400 mb-4">{product.subtitle}</p>
                                            <p className="text-gray-300 text-lg leading-relaxed mb-4">{product.description}</p>
                                            <p className="text-gray-400 leading-relaxed">{product.overview}</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                                        <div>
                                            <h4 className="text-xl font-semibold text-white mb-4">What We Do</h4>
                                            <ul className="space-y-3">
                                                {product.coreFunctions.map((function_, funcIndex) => (
                                                    <li key={funcIndex} className="flex items-start space-x-3">
                                                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                                                        <span className="text-gray-300 text-sm leading-relaxed">{function_}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-semibold text-white mb-4">What You Get</h4>
                                            <ul className="space-y-3">
                                                {product.keyTools.map((tool, toolIndex) => (
                                                    <li key={toolIndex} className="flex items-start space-x-3">
                                                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                                                        <span className="text-gray-300 text-sm leading-relaxed">{tool}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                                        <h4 className="text-xl font-semibold text-white mb-3">Your Results</h4>
                                        <p className="text-gray-300 leading-relaxed">{product.businessImpact}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatedGroup>

                        <AnimatedGroup preset="fade" className="text-center mt-16 mb-48">
                            <TextEffect
                                preset="blur"
                                per="word"
                                className="text-lg text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed"
                            >
                                Get in touch with our team to discuss how OSIRIS AI systems can revolutionize your operations and drive unprecedented growth.
                            </TextEffect>
                            <div className="flex flex-col gap-6 sm:flex-row sm:justify-center mb-16">
                                <Link href="/trial">
                                    <AnimatedButton
                                        variant="primary"
                                        className="group"
                                    >
                                        <span className="relative z-10 flex items-center">
                                            Get Started with OSIRIS
                                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                        </span>
                                    </AnimatedButton>
                                </Link>

                                <Link href="/trial">
                                    <AnimatedButton
                                        variant="secondary"
                                        className="group"
                                    >
                                        <span className="relative z-10 flex items-center">
                                            Schedule a Demo
                                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                        </span>
                                    </AnimatedButton>
                                </Link>
                            </div>
                        </AnimatedGroup>
                    </motion.div>
                </motion.div>
            </div>
        </SharedLayout>
    );
};

export default ProductsPage;
