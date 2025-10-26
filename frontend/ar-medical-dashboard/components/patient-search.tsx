"use client"

import { useState, useMemo } from "react"
import { Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Patient } from "@/lib/patients-data"

interface PatientSearchProps {
  patients: Patient[]
  selectedPatient: Patient | null
  onSelectPatient: (patient: Patient) => void
}

export function PatientSearch({ patients, selectedPatient, onSelectPatient }: PatientSearchProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients
    const query = searchQuery.toLowerCase()
    return patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(query) ||
        patient.id.toLowerCase().includes(query) ||
        patient.chiefComplaint.toLowerCase().includes(query),
    )
  }, [patients, searchQuery])

  return (
    <div className="w-full max-w-2xl">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-14 glass-card ar-glow text-base font-medium bg-card/80 hover:bg-card/90 border-primary/20"
          >
            {selectedPatient ? (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">
                  {selectedPatient.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-card-foreground">{selectedPatient.name}</span>
                  <span className="text-xs text-muted-foreground">{selectedPatient.id}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Search className="h-5 w-5" />
                <span>{"Search patients by name, ID, or complaint..."}</span>
              </div>
            )}
            <ChevronDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[600px] p-0 glass-card" align="start">
          <Command>
            <CommandInput
              placeholder="Search patients..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="h-12"
            />
            <CommandList>
              <CommandEmpty>{"No patient found."}</CommandEmpty>
              <CommandGroup className="max-h-[400px] overflow-auto">
                {filteredPatients.map((patient) => (
                  <CommandItem
                    key={patient.id}
                    value={patient.id}
                    onSelect={() => {
                      onSelectPatient(patient)
                      setOpen(false)
                    }}
                    className="flex items-center gap-3 p-3 cursor-pointer"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-sm">
                      {patient.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{patient.name}</span>
                        <span className="text-xs text-muted-foreground">{patient.id}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{patient.chiefComplaint}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {patient.age}y • {patient.sex}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
