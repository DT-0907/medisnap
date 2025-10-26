"use client";

import { useState, useEffect, useRef } from "react";

interface NeuralNode {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    connections: number[];
    activity: number;
    lastFired: number;
    type: 'input' | 'hidden' | 'output';
    charge: number;
}

interface NeuralConnection {
    from: number;
    to: number;
    weight: number;
    active: boolean;
    lastSignal: number;
}

function NeuralPathwaysBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const nodesRef = useRef<NeuralNode[]>([]);
    const connectionsRef = useRef<NeuralConnection[]>([]);
    const [isActive, setIsActive] = useState(true);
    const [intensity, setIntensity] = useState(0.7);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeCanvas = () => {
            const container = canvas.parentElement;
            if (!container) return;

            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            initializeNetwork();
        };

        const initializeNetwork = () => {
            const nodeCount = 120;
            const nodes: NeuralNode[] = [];
            const connections: NeuralConnection[] = [];

            // Create nodes with different types
            for (let i = 0; i < nodeCount; i++) {
                let type: 'input' | 'hidden' | 'output';
                if (i < nodeCount * 0.2) type = 'input';
                else if (i > nodeCount * 0.8) type = 'output';
                else type = 'hidden';

                nodes.push({
                    id: i,
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    radius: type === 'input' ? 4 : type === 'output' ? 5 : 3,
                    connections: [],
                    activity: Math.random(),
                    lastFired: 0,
                    type,
                    charge: 0
                });
            }

            // Create connections between nearby nodes
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                const maxConnections = node.type === 'hidden' ? 6 : 4;
                let connectionCount = 0;

                for (let j = 0; j < nodes.length && connectionCount < maxConnections; j++) {
                    if (i === j) continue;

                    const other = nodes[j];
                    const distance = Math.sqrt(
                        Math.pow(node.x - other.x, 2) + Math.pow(node.y - other.y, 2)
                    );

                    if (distance < 150 && Math.random() < 0.3) {
                        const weight = Math.random() * 0.8 + 0.2;
                        connections.push({
                            from: i,
                            to: j,
                            weight,
                            active: false,
                            lastSignal: 0
                        });

                        node.connections.push(j);
                        connectionCount++;
                    }
                }
            }

            nodesRef.current = nodes;
            connectionsRef.current = connections;
        };

        const animate = (timestamp: number) => {
            if (!ctx || !isActive) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const nodes = nodesRef.current;
            const connections = connectionsRef.current;

            // Update node positions and activity
            nodes.forEach((node, index) => {
                // Gentle floating movement
                node.x += node.vx;
                node.y += node.vy;

                // Bounce off edges
                if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
                if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

                // Keep nodes in bounds
                node.x = Math.max(0, Math.min(canvas.width, node.x));
                node.y = Math.max(0, Math.min(canvas.height, node.y));

                // Neural activity simulation
                if (Math.random() < 0.02 * intensity) {
                    node.activity = 1;
                    node.lastFired = timestamp;
                    node.charge = 1;

                    // Propagate signal to connected nodes
                    node.connections.forEach(connectedId => {
                        const connection = connections.find(c => c.from === index && c.to === connectedId);
                        if (connection && Math.random() < connection.weight) {
                            connection.active = true;
                            connection.lastSignal = timestamp;

                            // Activate target node with delay
                            setTimeout(() => {
                                if (nodes[connectedId]) {
                                    nodes[connectedId].charge = Math.min(1, nodes[connectedId].charge + 0.3);
                                }
                            }, 50);
                        }
                    });
                }

                // Decay activity
                node.activity *= 0.95;
                node.charge *= 0.98;
            });

            // Draw connections
            connections.forEach(connection => {
                const fromNode = nodes[connection.from];
                const toNode = nodes[connection.to];

                if (!fromNode || !toNode) return;

                const timeSinceSignal = timestamp - connection.lastSignal;
                const signalActive = timeSinceSignal < 500;

                if (signalActive) {
                    const progress = timeSinceSignal / 500;
                    const opacity = (1 - progress) * connection.weight;

                    // Draw connection line
                    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.6})`;
                    ctx.lineWidth = 1 + opacity * 2;
                    ctx.beginPath();
                    ctx.moveTo(fromNode.x, fromNode.y);
                    ctx.lineTo(toNode.x, toNode.y);
                    ctx.stroke();

                    // Draw signal pulse
                    const pulseX = fromNode.x + (toNode.x - fromNode.x) * (1 - progress);
                    const pulseY = fromNode.y + (toNode.y - fromNode.y) * (1 - progress);

                    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                    ctx.beginPath();
                    ctx.arc(pulseX, pulseY, 2, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    // Dim connection
                    ctx.strokeStyle = `rgba(255, 255, 255, ${connection.weight * 0.1})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(fromNode.x, fromNode.y);
                    ctx.lineTo(toNode.x, toNode.y);
                    ctx.stroke();
                }

                // Reset connection activity
                if (timeSinceSignal > 500) {
                    connection.active = false;
                }
            });

            // Draw nodes
            nodes.forEach(node => {
                const baseOpacity = 0.6;
                const activityOpacity = node.activity * 0.4;
                const chargeOpacity = node.charge * 0.5;
                const totalOpacity = Math.min(1, baseOpacity + activityOpacity + chargeOpacity);

                // Node colors based on type
                let color = 'rgba(255, 255, 255, ';
                if (node.type === 'input') color = 'rgba(255, 255, 255, ';
                else if (node.type === 'output') color = 'rgba(255, 255, 255, ';

                // Draw node glow
                if (node.charge > 0.1) {
                    const glowRadius = node.radius + node.charge * 8;
                    const gradient = ctx.createRadialGradient(
                        node.x, node.y, 0,
                        node.x, node.y, glowRadius
                    );
                    gradient.addColorStop(0, color + (node.charge * 0.3) + ')');
                    gradient.addColorStop(1, color + '0)');

                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Draw main node
                ctx.fillStyle = color + totalOpacity + ')';
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                ctx.fill();

                // Draw node border
                ctx.strokeStyle = color + '0.8)';
                ctx.lineWidth = 1;
                ctx.stroke();
            });

            if (isActive) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        animationRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationRef.current);
        };
    }, [isActive, intensity]);

    return (
        <div className="absolute inset-0 overflow-hidden">
            <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ background: 'transparent' }}
            />
        </div>
    );
}

export default function NeuralPathways() {
    return <NeuralPathwaysBackground />;
}
