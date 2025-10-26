'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home, Users, Package } from 'lucide-react'
import FluidDock from '@/components/ui/fluid-dock'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const navigationItems = [
        { icon: <Home className="w-5 h-5" />, label: 'Home', path: '/' },
        { icon: <Users className="w-5 h-5" />, label: 'Login', path: '/login' },
        { icon: <Package className="w-5 h-5" />, label: 'Dashboard', path: '/ar-medical-dashboard' },
    ]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Check credentials
        if (email === 'delberttran2007@gmail.com' && password === 'yyyyyyyy') {
            setTimeout(() => {
                setIsLoading(false)
                router.push('/ar-medical-dashboard')
            }, 1000)
        } else {
            setTimeout(() => {
                setIsLoading(false)
                alert('Invalid credentials. Please use: delberttran2007@gmail.com / yyyyyyyy')
            }, 1000)
        }
    }

    return (
        <div className="min-h-screen bg-yellow-100 flex items-center justify-center">
            {/* Navigation */}
            <FluidDock
                items={navigationItems}
                isVisible={true}
            />

            {/* Login Form */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md mx-4 border border-gray-200 shadow-xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-display text-gray-800 mb-2">MedSnap</h1>
                    <p className="text-gray-600">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600 text-sm">
                        Don't have an account?{' '}
                        <Link href="/login" className="text-yellow-600 hover:text-yellow-700 font-medium">
                            Sign up here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
