"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Star, Users, Zap, Shield, Home, Package, FileText, Brain } from "lucide-react"
import { cn } from "@/lib/utils"
import NeuralPathways from "@/components/ui/neural-pathways"
import { GlowingTextReveal } from "@/components/ui/text-reveal"
import TextType from "@/components/ui/text-type"
import FluidDock from "@/components/ui/fluid-dock"
import { TestimonialsSection } from "@/components/ui/testimonials-section";
import { AnimatedButton } from "@/components/ui/animated-button";
import Link from "next/link";
import { AnimatedGroup, TextEffect } from "@/components/ui/animated-group";

interface TextRevealByWordProps {
  text: string
  className?: string
}

const TextRevealByWord: React.FC<TextRevealByWordProps> = ({ text, className }) => {
  const targetRef = useRef<HTMLDivElement | null>(null)

  const { scrollYProgress } = useScroll({
    target: targetRef,
  })

  const words = text.split(" ")

  return (
    <div ref={targetRef} className={cn("relative z-0 h-[200vh]", className)}>
      <div className="sticky top-0 mx-auto flex h-[50%] max-w-4xl items-center justify-center bg-transparent px-[1rem] py-[5rem]">
        <p className="flex flex-wrap justify-center items-center p-5 text-xl font-display text-white md:p-8 md:text-2xl lg:p-10 lg:text-3xl xl:text-4xl text-center">
          {words.map((word, i) => {
            const start = i / words.length
            const end = start + 1 / words.length
            return (
              <Word key={i} progress={scrollYProgress} range={[start, end]}>
                {word}
              </Word>
            )
          })}
        </p>
      </div>
    </div>
  )
}

interface WordProps {
  children: React.ReactNode
  progress: any
  range: [number, number]
}

const Word: React.FC<WordProps> = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0, 1])
  return (
    <span className="xl:lg-3 relative mx-1 lg:mx-2.5 font-display">
      <span className="absolute opacity-30 font-display">{children}</span>
      <motion.span style={{ opacity: opacity }} className="text-white font-display">
        {children}
      </motion.span>
    </span>
  )
}

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => (
  <motion.div
    className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-105"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true }}
  >
    <div className="text-purple-400 mb-4">
      <Icon className="w-8 h-8" />
    </div>
    <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </motion.div>
)

const HeroSection = () => {
  const heroRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [showNeural, setShowNeural] = useState(false)
  const [startTyping, setStartTyping] = useState(false)
  const [showNavigation, setShowNavigation] = useState(false)

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const blur = useTransform(scrollYProgress, [0, 1], [0, 0])

  // Delay the neural pathways component from loading initially
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNeural(true)
    }, 2000) // Wait 2 seconds before allowing neural pathways to show

    return () => clearTimeout(timer)
  }, [])

  // Start typing after MedSnap title finishes
  useEffect(() => {
    const timer = setTimeout(() => {
      setStartTyping(true)
    }, 3000) // Wait 3 seconds (MedSnap finishes at 2s, then 1s delay)

    return () => clearTimeout(timer)
  }, [])

  // Show navigation after MedSnap animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNavigation(true)
    }, 4000) // Wait 4 seconds for full animation sequence

    return () => clearTimeout(timer)
  }, [])

  const navigationItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Home', path: '/' },
    { icon: <Users className="w-5 h-5" />, label: 'Login', path: '/login' },
    { icon: <Package className="w-5 h-5" />, label: 'Dashboard', path: '/ar-medical-dashboard' },
  ]

  return (
    <div ref={heroRef} className="relative h-screen overflow-hidden bg-yellow-300">

      {/* Fluid Dock Navigation */}
      <FluidDock
        items={navigationItems}
        isVisible={showNavigation}
      />

      <motion.div
        className="absolute inset-0 bg-center bg-no-repeat z-10"
        style={{
          backgroundImage: "url('/logo.png')",
          backgroundSize: "35% auto",
          backgroundPosition: "center center",
          scale,
          opacity,
          filter: `blur(${blur}px)`,
        }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/15"
          animate={{
            background: isHovered
              ? "linear-gradient(45deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.2))"
              : "linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.15))",
          }}
          transition={{ duration: 0.3 }}
        />
        <motion.div
          className="absolute inset-0"
          animate={{
            boxShadow: isHovered
              ? "inset 0 0 60px rgba(255, 255, 255, 0.15)"
              : "inset 0 0 30px rgba(255, 255, 255, 0.05)",
          }}
          transition={{ duration: 0.3 }}
        />
        <motion.div
          className="absolute inset-0 bg-black"
          animate={{
            opacity: isHovered ? 0.0 : 0.7
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
        {/* Brightness overlay for hover effect */}
        <motion.div
          className="absolute inset-0 bg-white"
          animate={{
            opacity: isHovered ? 0.0 : 0
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Neural Pathways Background Effect - Only shows after delay and on hover */}
      {showNeural && isHovered && (
        <motion.div
          className="absolute inset-0 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.8,
            ease: "easeInOut"
          }}
        >
          <NeuralPathways />
        </motion.div>
      )}

      <div className="relative z-30 flex h-full items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="max-w-4xl px-6 py-20"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.div
            className="mb-0 cursor-pointer"
            animate={{
              scale: isHovered ? 1.05 : 1,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <GlowingTextReveal
              text="MEDISNAP"
              className="text-6xl font-display text-white md:text-8xl lg:text-9xl"
              delay={0.8}
              duration={1.2}
              fontFamily="'Playfair Display', serif"
            />
          </motion.div>
          <motion.div
            className="mb-4 h-16 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2.5 }}
          >
            {startTyping && (
              <TextType
                key="typing-effect"
                text={[
                  "Revolutionary AR Medical Assistant for Healthcare Professionals",
                  "AI-Powered Patient Care Through Augmented Reality",
                  "Hands-Free Medical Diagnostics with Snap Spectacles",
                  "Next-Generation Healthcare Technology"
                ]}
                className="text-2xl font-display text-yellow-600 md:text-2.5xl text-center"
                typingSpeed={80}
                deletingSpeed={40}
                pauseDuration={3000}
                initialDelay={0}
                loop={true}
                showCursor={true}
                cursorCharacter="▋"
                cursorClassName="text-yellow-400"
                textColors={["#f3f4f6", "#e5e7eb", "#d1d5db"]}
                variableSpeed={{ min: 60, max: 120 }}
                startOnVisible={false}
                fontFamily="'Playfair Display', serif"
              />
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default function MedSnapWebsite() {
  return (
    <div className="min-h-screen bg-yellow-300">
      <HeroSection />

      <div className="relative z-10">
        {/* Text Reveal Section */}
        <TextRevealByWord
          text="At MedSnap, we specialize in creating AI-powered AR medical assistants that revolutionize healthcare delivery. Our intelligent systems provide hands-free medical diagnostics, patient monitoring, and clinical assistance through cutting-edge augmented reality technology."
          className="text-center py-12 font-display"
        />


      </div>
    </div>
  )
}
