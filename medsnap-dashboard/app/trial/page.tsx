"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, PhoneCall, ArrowRight, Zap, Clock, Users, TrendingUp, Shield, Globe, Star, Brain, Rocket } from "lucide-react";
import { AnimatedButton } from "@/components/ui/animated-button";
import SharedLayout from "@/components/shared-layout";

function TrialHero() {
    const [titleNumber, setTitleNumber] = useState(0);

    const titles = useMemo(
        () => [
            { verb: "be amazed", description: "by the power of AI automation" },
            { verb: "save time", description: "on repetitive daily tasks" },
            { verb: "scale faster", description: "than you ever thought possible" },
            { verb: "boost revenue", description: "through intelligent optimization" },
            { verb: "reduce costs", description: "while improving quality" },
            { verb: "work smarter", description: "not harder, with AI assistance" },
            { verb: "grow confidently", description: "knowing automation has your back" },
            { verb: "innovate freely", description: "while we handle the routine" },
            { verb: "compete fiercely", description: "with enterprise-level automation" },
            { verb: "transform completely", description: "your business operations" }
        ],
        []
    );

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (titleNumber === titles.length - 1) {
                setTitleNumber(0);
            } else {
                setTitleNumber(titleNumber + 1);
            }
        }, 2000);
        return () => clearTimeout(timeoutId);
    }, [titleNumber, titles]);


    return (
        <div className="w-full">
            <div className="container mx-auto">
                <div className="flex gap-10 py-20 lg:py-40 items-center justify-center flex-col">
                    <div className="flex gap-0 flex-col">
                        <h1 className="text-5xl md:text-7xl max-w-4xl tracking-tighter text-center font-display">
                            <span className="text-purple-400">With Osiris, prepare to</span>
                            <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-2 md:pt-1">
                                &nbsp;
                                {titles.map((title, index) => (
                                    <motion.span
                                        key={index}
                                        className="absolute font-semibold text-white"
                                        initial={{ opacity: 0, y: -100 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 60,
                                            damping: 25
                                        }}
                                        animate={
                                            titleNumber === index
                                                ? {
                                                    y: 0,
                                                    opacity: 1,
                                                }
                                                : {
                                                    y: titleNumber > index ? 100 : -100,
                                                    opacity: 0,
                                                }
                                        }
                                    >
                                        {title.verb}
                                    </motion.span>
                                ))}
                            </span>
                        </h1>

                        <motion.p
                            key={titleNumber}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-lg md:text-xl leading-relaxed tracking-tight text-gray-300 max-w-3xl text-center font-semibold mt-2"
                        >
                            {titles[titleNumber].description}
                        </motion.p>
                    </div>

                    {/* Google Form Embed */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="w-full max-w-4xl"
                    >
                        <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
                            <iframe
                                src="https://docs.google.com/forms/d/e/1FAIpQLSdeIKXS2_FJMQsF4FJxh-UnJsXsDT8RJtykN5IonS_mGbNwRA/viewform?embedded=true"
                                width="100%"
                                height="600"
                                frameBorder="0"
                                marginHeight="0"
                                marginWidth="0"
                                className="rounded-lg"
                                title="OSIRIS AI Demo Form"
                            >
                                Loading…
                            </iframe>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

const TrialPage = () => {
    return (
        <SharedLayout>
            <div className="min-h-screen bg-black text-white">
                <TrialHero />
            </div>
        </SharedLayout>
    );
};

export default TrialPage;
