"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import type { Patient } from "@/lib/patients-data"

interface SimplePatientSearchProps {
    patients: Patient[]
    selectedPatient: Patient | null
    onSelectPatient: (patient: Patient) => void
}

export function SimplePatientSearch({ patients, selectedPatient, onSelectPatient }: SimplePatientSearchProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="w-full max-w-2xl">
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center gap-2 justify-between h-14 bg-white border border-gray-300 rounded-lg text-base font-medium hover:bg-gray-50 shadow-sm px-4"
                >
                    {selectedPatient ? (
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500 text-white font-bold">
                                {selectedPatient.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="font-semibold text-gray-900">{selectedPatient.name}</span>
                                <span className="text-xs text-gray-500">{selectedPatient.id}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-gray-500">
                            <Search className="h-5 w-5" />
                            <span>Search patients by name, ID, or complaint...</span>
                        </div>
                    )}
                    <svg className="ml-2 h-5 w-5 shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
                    </svg>
                </button>

                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-auto">
                        <div className="p-3 border-b border-gray-200">
                            <input
                                type="text"
                                placeholder="Search patients..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="max-h-80 overflow-auto">
                            {filteredPatients.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">No patient found.</div>
                            ) : (
                                filteredPatients.map((patient) => (
                                    <button
                                        key={patient.id}
                                        onClick={() => {
                                            onSelectPatient(patient)
                                            setIsOpen(false)
                                        }}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500 text-white font-bold text-sm">
                                            {patient.name.split(" ").map(n => n[0]).join("")}
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-900">{patient.name}</span>
                                                <span className="text-xs text-gray-500">{patient.id}</span>
                                            </div>
                                            <span className="text-sm text-gray-600">{patient.chiefComplaint}</span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {patient.age}y • {patient.sex}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
