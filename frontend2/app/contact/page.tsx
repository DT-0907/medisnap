'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, ArrowRight } from 'lucide-react';
import LoadingAnimation from '@/components/ui/loading-animation';
import SharedLayout from '@/components/shared-layout';
import { AnimatedButton } from '@/components/ui/animated-button';
import { AnimatedGroup } from '@/components/ui/animated-group';

const contactMethods = [
    {
        icon: <Mail className="w-6 h-6" />,
        title: "Email",
        value: "Dominic@theosirisai.com",
        description: "We'll respond within 24 hours"
    },
    {
        icon: <Phone className="w-6 h-6" />,
        title: "Phone",
        value: "+1 (424) 677-1146",
        description: "Available Monday-Friday, 9AM-6PM PST"
    },
    {
        icon: <MapPin className="w-6 h-6" />,
        title: "Location",
        value: "Los Angeles, CA",
        description: "Serving clients worldwide"
    },
    {
        icon: <Clock className="w-6 h-6" />,
        title: "Response Time",
        value: "24-48 hours",
        description: "For urgent matters, call us directly"
    }
];

const ContactPage = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <LoadingAnimation />;
    }

    return (
        <SharedLayout>
            <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-blue-950/20 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent"></div>

                {/* Main Content */}
                <div className="relative z-10 container mx-auto px-6 py-12">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
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
                                    Contact Us
                                </motion.h1>
                                <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                                    Ready to transform your business? Let's discuss how OSIRIS AI can help you achieve your goals.
                                </p>
                            </AnimatedGroup>
                        </div>

                        <AnimatedGroup preset="slide" className="grid lg:grid-cols-2 gap-12">
                            {/* Contact Form */}
                            <div className="space-y-6">
                                <AnimatedGroup preset="fade" className="space-y-6">
                                    <h2 className="text-3xl font-semibold text-white">Send us a message</h2>
                                    <p className="text-gray-300">
                                        Fill out the form below and we'll get back to you within 24 hours.
                                    </p>
                                </AnimatedGroup>

                                <form className="space-y-6">
                                    <AnimatedGroup preset="slide" className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 bg-white/5 border border-purple-500/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                                                placeholder="Enter your first name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 bg-white/5 border border-purple-500/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                                                placeholder="Enter your last name"
                                            />
                                        </div>
                                    </AnimatedGroup>

                                    <AnimatedGroup preset="slide" className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                            <input
                                                type="email"
                                                className="w-full px-4 py-3 bg-white/5 border border-purple-500/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                                                placeholder="Enter your email address"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                                            <input
                                                type="tel"
                                                className="w-full px-4 py-3 bg-white/5 border border-purple-500/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                                                placeholder="Enter your phone number"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 bg-white/5 border border-purple-500/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                                                placeholder="Enter your company name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                                            <textarea
                                                rows={4}
                                                className="w-full px-4 py-3 bg-white/5 border border-purple-500/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors resize-none"
                                                placeholder="Tell us about your project or how we can help..."
                                            />
                                        </div>
                                    </AnimatedGroup>

                                    <AnimatedGroup preset="bounce" className="pt-4">
                                        <AnimatedButton
                                            variant="primary"
                                            className="w-full group"
                                        >
                                            <span className="relative z-10 flex items-center justify-center">
                                                Send Message
                                                <Send className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                            </span>
                                        </AnimatedButton>
                                    </AnimatedGroup>
                                </form>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-8">
                                <AnimatedGroup preset="fade" className="space-y-6">
                                    <h2 className="text-3xl font-semibold text-white">Get in touch</h2>
                                    <p className="text-gray-300">
                                        We're here to help you succeed. Reach out to us through any of these channels.
                                    </p>
                                </AnimatedGroup>

                                <AnimatedGroup preset="slide" className="space-y-6">
                                    {contactMethods.map((method, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.8 + index * 0.1 }}
                                            className="flex items-start space-x-4 p-4 rounded-lg bg-white/5 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
                                        >
                                            <div className="text-purple-400 p-2 rounded-lg bg-purple-500/10">
                                                {method.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-white mb-1">{method.title}</h3>
                                                <p className="text-gray-300">{method.value}</p>
                                                {method.description && (
                                                    <p className="text-sm text-gray-400 mt-1">{method.description}</p>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatedGroup>

                                <AnimatedGroup preset="bounce" className="pt-6">
                                    <div className="p-6 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                                        <h3 className="text-xl font-semibold text-white mb-3">Ready to get started?</h3>
                                        <p className="text-gray-300 mb-4">
                                            Schedule a free consultation to discuss your automation needs and see how OSIRIS AI can transform your business.
                                        </p>
                                        <AnimatedButton
                                            variant="secondary"
                                            className="group"
                                        >
                                            <span className="relative z-10 flex items-center">
                                                Schedule Consultation
                                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                            </span>
                                        </AnimatedButton>
                                    </div>
                                </AnimatedGroup>
                            </div>
                        </AnimatedGroup>
                    </motion.div>
                </div>
            </div>
        </SharedLayout>
    );
};

export default ContactPage;
