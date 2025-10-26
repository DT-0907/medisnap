"use client";

import { motion } from 'framer-motion';
import FluidDock from '@/components/ui/fluid-dock';
import { Home, Users, Package, FileText } from 'lucide-react';

interface SharedLayoutProps {
    children: React.ReactNode;
    showNavigation?: boolean;
}

const SharedLayout: React.FC<SharedLayoutProps> = ({ children, showNavigation = true }) => {
    const navigationItems = [
        { icon: <Home className="w-5 h-5" />, label: 'Home', path: '/' },
        { icon: <Users className="w-5 h-5" />, label: 'About Us', path: '/about' },
        { icon: <Package className="w-5 h-5" />, label: 'Products', path: '/products' },
        { icon: <FileText className="w-5 h-5" />, label: 'Policy', path: '/policy' },
    ];

    return (
        <div className="min-h-screen bg-black">
            {/* Fluid Dock Navigation */}
            {showNavigation && (
                <FluidDock
                    items={navigationItems}
                    isVisible={true}
                />
            )}

            {/* Main Content */}
            <div>
                {children}
            </div>
        </div>
    );
};

export default SharedLayout;
