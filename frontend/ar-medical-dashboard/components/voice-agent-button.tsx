"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff } from "lucide-react"

export function VoiceAgentButton() {
  const [isActive, setIsActive] = useState(false)

  return (
    <Button
      onClick={() => setIsActive(!isActive)}
      size="lg"
      className={`fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-2xl transition-all duration-300 ${
        isActive ? "bg-primary hover:bg-primary/90 ar-glow-strong scale-110" : "bg-primary/80 hover:bg-primary ar-glow"
      }`}
    >
      {isActive ? (
        <MicOff className="h-7 w-7 text-primary-foreground animate-pulse" />
      ) : (
        <Mic className="h-7 w-7 text-primary-foreground" />
      )}
    </Button>
  )
}
