"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff } from "lucide-react"

export function VoiceAgentButton() {
  const [isActive, setIsActive] = useState(false)

  return (
    <button
      onClick={() => {
        setIsActive(!isActive)
        console.log('Voice agent toggled:', !isActive)
      }}
      className={`fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center ${
        isActive 
          ? "bg-yellow-500 hover:bg-yellow-600 text-white scale-110 shadow-yellow-500/50" 
          : "bg-yellow-500/80 hover:bg-yellow-500 text-white shadow-yellow-500/30"
      }`}
    >
      {isActive ? (
        <MicOff className="h-7 w-7 animate-pulse" />
      ) : (
        <Mic className="h-7 w-7" />
      )}
    </button>
  )
}
