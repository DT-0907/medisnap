"use client";
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface NeuralNetworkBackgroundProps {
    nodeCount?: number;
    connectionDistance?: number;
    animationSpeed?: number;
    nodeColor?: string;
    connectionColor?: string;
    backgroundColor?: string;
    pulseIntensity?: number;
    className?: string;
    children?: React.ReactNode;
}

interface Node {
    x: number;
    y: number;
    vx: number;
    vy: number;
    pulse: number;
    pulseDirection: number;
}

const NeuralNetworkBackground: React.FC<NeuralNetworkBackgroundProps> = ({
    nodeCount = 80,
    connectionDistance = 120,
    animationSpeed = 0.5,
    nodeColor = "#ffffff",
    connectionColor = "#ffffff",
    backgroundColor = "transparent",
    pulseIntensity = 0.8,
    className = "",
    children
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const nodesRef = useRef<Node[]>([]);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };

        const initNodes = () => {
            nodesRef.current = Array.from({ length: nodeCount }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * animationSpeed,
                vy: (Math.random() - 0.5) * animationSpeed,
                pulse: Math.random() * Math.PI * 2,
                pulseDirection: Math.random() > 0.5 ? 1 : -1
            }));
        };

        const updateNodes = () => {
            nodesRef.current.forEach(node => {
                node.x += node.vx;
                node.y += node.vy;
                node.pulse += 0.02 * node.pulseDirection;

                if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
                if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

                node.x = Math.max(0, Math.min(canvas.width, node.x));
                node.y = Math.max(0, Math.min(canvas.height, node.y));
            });
        };

        const drawConnections = () => {
            ctx.strokeStyle = connectionColor;
            ctx.lineWidth = 0.5;

            for (let i = 0; i < nodesRef.current.length; i++) {
                for (let j = i + 1; j < nodesRef.current.length; j++) {
                    const nodeA = nodesRef.current[i];
                    const nodeB = nodesRef.current[j];
                    const distance = Math.sqrt(
                        Math.pow(nodeA.x - nodeB.x, 2) + Math.pow(nodeA.y - nodeB.y, 2)
                    );

                    if (distance < connectionDistance) {
                        const opacity = 1 - distance / connectionDistance;
                        const pulseEffect = (Math.sin(nodeA.pulse) + Math.sin(nodeB.pulse)) * 0.5;
                        const finalOpacity = opacity * (0.3 + pulseEffect * pulseIntensity * 0.3);

                        ctx.globalAlpha = Math.max(0, finalOpacity);
                        ctx.beginPath();
                        ctx.moveTo(nodeA.x, nodeA.y);
                        ctx.lineTo(nodeB.x, nodeB.y);
                        ctx.stroke();

                        // Neural firing effect
                        if (Math.random() < 0.001) {
                            ctx.shadowBlur = 10;
                            ctx.shadowColor = connectionColor;
                            ctx.lineWidth = 2;
                            ctx.globalAlpha = 0.8;
                            ctx.stroke();
                            ctx.shadowBlur = 0;
                            ctx.lineWidth = 0.5;
                        }
                    }
                }
            }
        };

        const drawNodes = () => {
            nodesRef.current.forEach(node => {
                const pulseSize = 2 + Math.sin(node.pulse) * pulseIntensity;
                const pulseOpacity = 0.6 + Math.sin(node.pulse) * 0.4;

                // Outer glow
                ctx.globalAlpha = pulseOpacity * 0.3;
                ctx.fillStyle = nodeColor;
                ctx.beginPath();
                ctx.arc(node.x, node.y, pulseSize * 3, 0, Math.PI * 2);
                ctx.fill();

                // Main node
                ctx.globalAlpha = pulseOpacity;
                ctx.beginPath();
                ctx.arc(node.x, node.y, pulseSize, 0, Math.PI * 2);
                ctx.fill();

                // Core
                ctx.globalAlpha = 1;
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(node.x, node.y, pulseSize * 0.3, 0, Math.PI * 2);
                ctx.fill();
            });
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (backgroundColor !== "transparent") {
                ctx.fillStyle = backgroundColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            updateNodes();
            drawConnections();
            drawNodes();

            ctx.globalAlpha = 1;
            animationRef.current = requestAnimationFrame(animate);
        };

        resizeCanvas();
        initNodes();
        animate();

        const handleResize = () => {
            resizeCanvas();
            initNodes();
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [nodeCount, connectionDistance, animationSpeed, nodeColor, connectionColor, backgroundColor, pulseIntensity]);

    return (
        <div className={`relative w-full h-full ${className}`}>
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ background: backgroundColor }}
            />
            {children && (
                <div className="relative z-10 w-full h-full">
                    {children}
                </div>
            )}
        </div>
    );
};

const FuturisticGrid: React.FC = () => {
    return (
        <div className="absolute inset-0 opacity-20">
            <div
                className="w-full h-full"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
                    backgroundSize: '50px 50px'
                }}
            />
        </div>
    );
};

const FloatingParticles: React.FC = () => {
    const particles = Array.from({ length: 20 }, (_, i) => (
        <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                opacity: 0
            }}
            animate={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                opacity: [0, 1, 0]
            }}
            transition={{
                duration: Math.random() * 10 + 5,
                repeat: Infinity,
                ease: "linear"
            }}
        />
    ));

    return <div className="absolute inset-0 pointer-events-none">{particles}</div>;
};

export { NeuralNetworkBackground, FuturisticGrid, FloatingParticles };
