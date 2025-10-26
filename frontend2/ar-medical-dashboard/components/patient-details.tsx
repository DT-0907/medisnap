"use client"

import type { Patient } from "@/lib/patients-data"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, Heart, Thermometer, Droplet, Pill, AlertCircle, FileText, Sparkles } from "lucide-react"
import { useState } from "react"

interface PatientDetailsProps {
  patient: Patient
}

export function PatientDetails({ patient }: PatientDetailsProps) {
  const [showAISummary, setShowAISummary] = useState(false)

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Card */}
      <Card className="glass-card ar-glow-strong p-6 border-primary/30">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/30 text-primary font-bold text-2xl ar-glow">
              {patient.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-card-foreground">{patient.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                  {patient.id}
                </Badge>
                <span className="text-muted-foreground">{patient.age} years old</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{patient.sex}</span>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setShowAISummary(!showAISummary)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground ar-glow gap-2"
            size="lg"
          >
            <Sparkles className="h-5 w-5" />
            {showAISummary ? "Hide" : "AI Diagnosis"}
          </Button>
        </div>

        {showAISummary && (
          <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/30 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-card-foreground mb-2">{"AI-Generated Summary"}</h3>
                <p className="text-sm text-card-foreground/80 leading-relaxed">
                  {`Based on the patient's chief complaint of ${patient.chiefComplaint.toLowerCase()} and current symptoms including ${patient.currentSymptoms.slice(0, 2).join(", ").toLowerCase()}, along with vital signs showing ${patient.vitalSigns.temperature > 99 ? "elevated temperature" : "normal temperature"} and ${patient.vitalSigns.heartRate > 90 ? "elevated heart rate" : "normal heart rate"}, the patient may be experiencing ${patient.diagnosisHistory[0] || "an acute condition"}. Consider the patient's history of ${patient.diagnosisHistory.join(", ") || "no prior diagnoses"} and current medications (${patient.medications.join(", ")}) when determining treatment plan. Monitor vital signs closely and consider additional diagnostic tests.`}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Chief Complaint */}
      <Card className="glass-card p-6 border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-card-foreground">{"Chief Complaint"}</h3>
        </div>
        <p className="text-2xl font-medium text-card-foreground">{patient.chiefComplaint}</p>
        <p className="text-sm text-muted-foreground mt-2">
          {"Admitted: "}
          {patient.createdAt.toLocaleDateString()} at {patient.createdAt.toLocaleTimeString()}
        </p>
      </Card>

      {/* Vital Signs */}
      <Card className="glass-card p-6 border-primary/20">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-card-foreground">{"Vital Signs"}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
              <Droplet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{"Blood Pressure"}</p>
              <p className="text-xl font-bold text-card-foreground">{patient.vitalSigns.bloodPressure}</p>
              <p className="text-xs text-muted-foreground">{"mmHg"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{"Heart Rate"}</p>
              <p className="text-xl font-bold text-card-foreground">{patient.vitalSigns.heartRate}</p>
              <p className="text-xs text-muted-foreground">{"bpm"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
              <Thermometer className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{"Temperature"}</p>
              <p className="text-xl font-bold text-card-foreground">{patient.vitalSigns.temperature}°F</p>
              <p className="text-xs text-muted-foreground">{"Fahrenheit"}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Current Symptoms */}
      <Card className="glass-card p-6 border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-card-foreground">{"Current Symptoms"}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {patient.currentSymptoms.map((symptom, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-primary/10 text-card-foreground border-primary/20 px-3 py-1"
            >
              {symptom}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Allergies & Medications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card p-6 border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-card-foreground">{"Allergies"}</h3>
          </div>
          <div className="space-y-2">
            {patient.allergies.map((allergy, index) => (
              <div key={index} className="flex items-center gap-2 p-2 rounded bg-primary/5">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-card-foreground">{allergy}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="glass-card p-6 border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Pill className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-card-foreground">{"Current Medications"}</h3>
          </div>
          <div className="space-y-2">
            {patient.medications.map((medication, index) => (
              <div key={index} className="flex items-center gap-2 p-2 rounded bg-primary/5">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-card-foreground">{medication}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Diagnosis History */}
      <Card className="glass-card p-6 border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-card-foreground">{"Diagnosis History"}</h3>
        </div>
        <div className="space-y-2">
          {patient.diagnosisHistory.map((diagnosis, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-sm">
                {index + 1}
              </div>
              <span className="text-card-foreground font-medium">{diagnosis}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
