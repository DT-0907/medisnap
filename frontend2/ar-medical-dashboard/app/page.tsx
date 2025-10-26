"use client"

import { useState } from "react"
import { patientsDatabase, type Patient } from "@/lib/patients-data"
import { PatientSearch } from "@/components/patient-search"
import { PatientDetails } from "@/components/patient-details"
import { VoiceAgentButton } from "@/components/voice-agent-button"
import { Activity } from "lucide-react"

export default function Home() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 ar-glow">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground text-balance">{"MedAR Dashboard"}</h1>
            <p className="text-muted-foreground">{"Advanced Patient Information System"}</p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <PatientSearch
          patients={patientsDatabase}
          selectedPatient={selectedPatient}
          onSelectPatient={setSelectedPatient}
        />
      </div>

      {/* Patient Details */}
      <div className="max-w-7xl mx-auto">
        {selectedPatient ? (
          <PatientDetails patient={selectedPatient} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 glass-card rounded-xl border-primary/20">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 mb-4 ar-glow">
              <Activity className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">{"No Patient Selected"}</h2>
            <p className="text-muted-foreground text-center max-w-md">
              {
                "Search and select a patient from the dropdown above to view their detailed medical information and AI-powered diagnosis."
              }
            </p>
          </div>
        )}
      </div>

      {/* Voice Agent Button */}
      <VoiceAgentButton />
    </main>
  )
}
