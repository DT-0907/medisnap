"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Shield, Eye, Lock, Users, ArrowRight } from 'lucide-react';
import LoadingAnimation from '@/components/ui/loading-animation';
import SharedLayout from '@/components/shared-layout';
import { AnimatedGroup, TextEffect } from '@/components/ui/animated-group';

const PolicyPage = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <SharedLayout>
            <AnimatePresence>
                <LoadingAnimation isLoading={isLoading} onComplete={() => setIsLoading(false)} />
            </AnimatePresence>

            <div className="min-h-screen bg-black text-white">
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
                                    Privacy Policy
                                </motion.h1>
                                <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                                    How we protect and handle your personal information
                                </p>
                            </AnimatedGroup>
                        </div>

                        <AnimatedGroup preset="slide" className="max-w-4xl mx-auto">
                            <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8">
                                <div className="space-y-8">
                                    {/* Header */}
                                    <AnimatedGroup preset="fade" className="text-center border-b border-purple-500/20 pb-6">
                                        <h2 className="text-3xl font-bold text-white mb-2">Osiris Privacy Policy</h2>
                                        <p className="text-gray-400">Last Updated: August 7, 2025</p>
                                    </AnimatedGroup>

                                    {/* Introduction */}
                                    <AnimatedGroup preset="blur" className="space-y-4">
                                        <p className="text-gray-300 leading-relaxed">
                                            Osiris AI ("we," "us," or "our") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website [spotlessscrubbers.com], use our services, or interact with us via SMS or other channels. By using our services or providing your information, you consent to the practices described in this policy.
                                        </p>
                                        <p className="text-gray-300 leading-relaxed">
                                            If you do not agree with this Privacy Policy, please do not access our website or use our services.
                                        </p>
                                    </AnimatedGroup>

                                    {/* Section 1 */}
                                    <AnimatedGroup preset="slide" className="space-y-4">
                                        <h3 className="text-2xl font-semibold text-white">1. Information We Collect</h3>
                                        <p className="text-gray-300 leading-relaxed">
                                            We collect personal information that you voluntarily provide to us, such as when you book a cleaning service, sign up for SMS notifications, contact us, or interact with our website. This may include:
                                        </p>
                                        <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                                            <li><strong>Contact Information:</strong> Name, email address, phone number, and mailing address.</li>
                                            <li><strong>Service-Related Information:</strong> Details about your cleaning requests, preferences, job history, and payment information (processed securely via third-party providers).</li>
                                            <li><strong>Device and Usage Information:</strong> IP address, browser type, device identifiers, and usage data collected automatically when you visit our site (e.g., via cookies or similar technologies).</li>
                                            <li><strong>SMS-Specific Information:</strong> When you opt in to receive text messages, we collect your mobile phone number and any responses you provide.</li>
                                        </ul>
                                        <p className="text-gray-300 leading-relaxed">
                                            We do not collect sensitive personal information (e.g., health data) unless necessary for your service request and with your explicit consent.
                                        </p>
                                    </AnimatedGroup>

                                    {/* Section 2 */}
                                    <AnimatedGroup preset="slide" className="space-y-4">
                                        <h3 className="text-2xl font-semibold text-white">2. How We Collect Information</h3>
                                        <p className="text-gray-300 leading-relaxed">
                                            We collect information through:
                                        </p>
                                        <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                                            <li>Direct interactions, such as forms on our website, email inquiries, or phone calls.</li>
                                            <li>SMS opt-in: By texting a keyword (e.g., "YES") to our number or checking a box on our site/form, you provide consent.</li>
                                            <li>Automated technologies: Cookies, web beacons, and server logs on our website.</li>
                                            <li>Third-party sources: Payment processors or scheduling tools, but only with your consent.</li>
                                        </ul>
                                        <p className="text-gray-300 leading-relaxed">
                                            For SMS: We use your phone number solely for the purposes you consented to, such as appointment reminders, follow-ups, and exclusive offers. Message frequency varies but is typically 2-4 per month. Message and data rates may apply.
                                        </p>
                                    </AnimatedGroup>

                                    {/* Section 3 */}
                                    <AnimatedGroup preset="slide" className="space-y-4">
                                        <h3 className="text-2xl font-semibold text-white">3. How We Use Your Information</h3>
                                        <p className="text-gray-300 leading-relaxed">We use your information to:</p>
                                        <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                                            <li>Provide and improve our cleaning services, including scheduling, confirmations, and customer support.</li>
                                            <li>Send SMS notifications (appointment reminders, follow-ups, exclusive offers) if you opted in.</li>
                                            <li>Process payments and maintain financial records.</li>
                                            <li>Communicate with you about services, updates, and promotions.</li>
                                            <li>Improve our website and services.</li>
                                            <li>Comply with legal obligations.</li>
                                        </ul>
                                        <p className="text-gray-300 leading-relaxed">
                                            We do not use your information for purposes beyond what is described here without your consent.
                                        </p>
                                    </AnimatedGroup>

                                    {/* Section 4 */}
                                    <AnimatedGroup preset="slide" className="space-y-4">
                                        <h3 className="text-2xl font-semibold text-white">4. Sharing Your Information</h3>
                                        <p className="text-gray-300 leading-relaxed">We may share your information with:</p>
                                        <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                                            <li>Service providers (e.g., payment processors, scheduling software) who help us operate our business, but only as necessary and under strict confidentiality agreements.</li>
                                            <li>Legal authorities if required by law, subpoena, or to protect our rights.</li>
                                        </ul>
                                        <p className="text-gray-300 leading-relaxed">
                                            <strong>Important:</strong> We do not share, sell, rent, or trade your mobile phone number or other mobile information with third parties or affiliates for their own marketing or promotional purposes. Your mobile information is used solely for the SMS communications you opted into with us.
                                        </p>
                                    </AnimatedGroup>

                                    {/* Section 5 */}
                                    <AnimatedGroup preset="slide" className="space-y-4">
                                        <h3 className="text-2xl font-semibold text-white">5. Data Security and Storage</h3>
                                        <p className="text-gray-300 leading-relaxed">
                                            We implement reasonable security measures to protect your information from unauthorized access, loss, or disclosure, including encryption, firewalls, and secure servers. Your data is stored in the United States on compliant servers.
                                        </p>
                                        <p className="text-gray-300 leading-relaxed">
                                            However, no system is completely secure, so we cannot guarantee absolute security. We retain your information only as long as necessary for the purposes described (e.g., up to 7 years for legal/tax reasons) or as required by law.
                                        </p>
                                    </AnimatedGroup>

                                    {/* Section 6 */}
                                    <AnimatedGroup preset="slide" className="space-y-4">
                                        <h3 className="text-2xl font-semibold text-white">6. Your Rights and Choices</h3>
                                        <p className="text-gray-300 leading-relaxed">You have the right to:</p>
                                        <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                                            <li>Access, update, or delete your personal information by contacting us.</li>
                                            <li>Opt out of SMS communications by replying "STOP" to any message or contacting us.</li>
                                            <li>Opt out of marketing emails by clicking unsubscribe or contacting us.</li>
                                            <li>Manage cookies via your browser settings.</li>
                                        </ul>
                                        <p className="text-gray-300 leading-relaxed">
                                            If you opt out, we may still send non-promotional messages (e.g., service confirmations).
                                        </p>
                                        <p className="text-gray-300 leading-relaxed">
                                            For California residents (under CCPA) or others with similar rights: You may request details about your data, deletion, or non-sale (though we do not sell data).
                                        </p>
                                    </AnimatedGroup>

                                    {/* Section 7 */}
                                    <AnimatedGroup preset="slide" className="space-y-4">
                                        <h3 className="text-2xl font-semibold text-white">7. Children's Privacy</h3>
                                        <p className="text-gray-300 leading-relaxed">
                                            Our services are not intended for children under 13. We do not knowingly collect information from children. If we learn we have, we will delete it promptly.
                                        </p>
                                    </AnimatedGroup>

                                    {/* Section 8 */}
                                    <AnimatedGroup preset="slide" className="space-y-4">
                                        <h3 className="text-2xl font-semibold text-white">8. International Transfers</h3>
                                        <p className="text-gray-300 leading-relaxed">
                                            If you are outside the U.S., your data may be transferred to and processed in the U.S., where privacy laws may differ. By using our services, you consent to this.
                                        </p>
                                    </AnimatedGroup>

                                    {/* Section 9 */}
                                    <AnimatedGroup preset="slide" className="space-y-4">
                                        <h3 className="text-2xl font-semibold text-white">9. Changes to This Privacy Policy</h3>
                                        <p className="text-gray-300 leading-relaxed">
                                            We may update this policy periodically. Changes will be posted here with the updated date. Continued use of our services after changes constitutes acceptance.
                                        </p>
                                    </AnimatedGroup>

                                    {/* Section 10 */}
                                    <AnimatedGroup preset="slide" className="space-y-4">
                                        <h3 className="text-2xl font-semibold text-white">10. Contact Us</h3>
                                        <p className="text-gray-300 leading-relaxed">
                                            If you have questions about this Privacy Policy or your information, contact us at:
                                        </p>
                                        <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                                            <li><strong>Email:</strong> Dominic@theosirisai.com</li>
                                            <li><strong>Phone:</strong> +1 (424) 677-1146</li>
                                        </ul>
                                    </AnimatedGroup>
                                </div>
                            </div>
                        </AnimatedGroup>
                    </motion.div>
                </motion.div>
            </div>
        </SharedLayout>
    );
};

export default PolicyPage;
