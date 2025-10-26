'use client'

import { Suspense, lazy, useEffect, useRef, useState } from 'react'
const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
    scene: string
    className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
    const splineRef = useRef<any>(null)
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        if (!isLoaded) return

        const handleMouseMove = (event: MouseEvent) => {
            if (splineRef.current) {
                // Find the Spline canvas element
                const splineCanvas = splineRef.current.querySelector('canvas')
                if (splineCanvas) {
                    // Create a new mouse event that's properly positioned
                    const rect = splineCanvas.getBoundingClientRect()
                    const relativeX = event.clientX - rect.left
                    const relativeY = event.clientY - rect.top

                    // Create a new mouse event with relative coordinates
                    const newEvent = new MouseEvent('mousemove', {
                        clientX: relativeX,
                        clientY: relativeY,
                        bubbles: true,
                        cancelable: true
                    })

                    splineCanvas.dispatchEvent(newEvent)
                }
            }
        }

        // Add global mouse move listener
        document.addEventListener('mousemove', handleMouseMove)

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
        }
    }, [isLoaded])

    const handleSplineLoad = () => {
        setIsLoaded(true)
    }

    return (
        <Suspense
            fallback={
                <div className="w-full h-full flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            }
        >
            <div ref={splineRef} className={className}>
                <Spline
                    scene={scene}
                    className="w-full h-full"
                    onLoad={handleSplineLoad}
                />
            </div>
        </Suspense>
    )
}
