"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ChevronDown, Home, Users, Package, FileText } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationBarProps {
    isVisible: boolean;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ isVisible }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [activePage, setActivePage] = useState('home');
    const pathname = usePathname();

    const navigationItems = [
        { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" />, path: '/' },
        { id: 'about', label: 'About Us', icon: <Users className="w-4 h-4" />, path: '/about' },
        { id: 'products', label: 'Products', icon: <Package className="w-4 h-4" />, path: '/products' },
        { id: 'policy', label: 'Policy', icon: <FileText className="w-4 h-4" />, path: '/policy' },
    ];

    useEffect(() => {
        const currentPage = navigationItems.find(item => item.path === pathname);
        if (currentPage) {
            setActivePage(currentPage.id);
        }
    }, [pathname]);

    if (!isVisible) return null;

    return (
        <motion.nav
            className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-purple-500/20"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-center h-16">
                    <div className="flex space-x-1 bg-white/10 rounded-full p-1 backdrop-blur-sm">
                        {navigationItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                className="relative"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + index * 0.1 }}
                            >
                                <Link href={item.path}>
                                    <motion.button
                                        className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${activePage === item.id
                                            ? 'text-white'
                                            : 'text-gray-300 hover:text-white'
                                            }`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {activePage === item.id && (
                                            <motion.div
                                                className="absolute inset-0 bg-purple-600/20 rounded-full"
                                                layoutId="activeTab"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        {activePage === item.id && (
                                            <motion.div
                                                className="absolute inset-0 rounded-full"
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                                style={{
                                                    boxShadow: '0 0 20px rgba(147, 51, 234, 0.6), 0 0 40px rgba(147, 51, 234, 0.3), 0 0 60px rgba(147, 51, 234, 0.1)',
                                                    background: 'radial-gradient(circle, rgba(147, 51, 234, 0.1) 0%, transparent 70%)'
                                                }}
                                            />
                                        )}
                                        <span className="relative z-10">{item.icon}</span>
                                        <span className="relative z-10">{item.label}</span>
                                        {activePage === item.id && (
                                            <motion.div
                                                className="relative z-10"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                <ChevronDown className="w-3 h-3" />
                                            </motion.div>
                                        )}
                                    </motion.button>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};

export default NavigationBar;
