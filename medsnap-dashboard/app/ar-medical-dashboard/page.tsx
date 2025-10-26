'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home, Users, Package, LogOut, Activity } from 'lucide-react'
import FluidDock from '@/components/ui/fluid-dock'
import { patientsDatabase, type Patient } from '@/lib/patients-data'
import { SimplePatientSearch } from '@/components/simple-patient-search'
import { PatientDetails } from '@/components/patient-details'
import { VoiceAgentButton } from '@/components/voice-agent-button'

export default function DashboardPage() {
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

    const navigationItems = [
        { icon: <Home className="w-5 h-5" />, label: 'Home', path: '/' },
        { icon: <Users className="w-5 h-5" />, label: 'Login', path: '/login' },
        { icon: <Package className="w-5 h-5" />, label: 'Dashboard', path: '/ar-medical-dashboard' },
    ]

    const handleLogout = () => {
        // Handle logout logic here
        window.location.href = '/'
    }

    return (
        <div className="min-h-screen bg-yellow-50">
            {/* Navigation */}
            <FluidDock
                items={navigationItems}
                isVisible={true}
            />

            {/* Header */}
            <div className="bg-white/20 backdrop-blur-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/20">
                                <img src="/logo.png" alt="MedSnap Logo" className="h-8 w-8 object-contain" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-display text-gray-800">MedAR Dashboard</h1>
                                <p className="text-gray-600 mt-1">Advanced Patient Information System</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 text-yellow-600 hover:text-yellow-800 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search Section */}
                <div className="mb-8">
                    <SimplePatientSearch
                        patients={patientsDatabase}
                        selectedPatient={selectedPatient}
                        onSelectPatient={setSelectedPatient}
                    />
                </div>

                {/* Patient Details */}
                <div>
                    {selectedPatient ? (
                        <PatientDetails patient={selectedPatient} />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white/30 backdrop-blur-sm rounded-xl border border-gray-200">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-yellow-500/20 mb-4">
                                <Activity className="h-12 w-12 text-yellow-600" />
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Patient Selected</h2>
                            <p className="text-gray-600 text-center max-w-md">
                                Search and select a patient from the dropdown above to view their detailed medical information and AI-powered diagnosis.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Voice Agent Button */}
            <VoiceAgentButton />
        </div>
    )
}