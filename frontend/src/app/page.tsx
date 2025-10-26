'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const texts = [
    'Revolutionary AR Medical Assistant',
    'AI-Powered Patient Care',
    'Next-Generation Healthcare Technology',
    'Smart Medical Diagnostics'
  ];

  useEffect(() => {
    // Loading animation
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const currentText = texts[currentIndex];
    if (typedText.length < currentText.length) {
      const timeout = setTimeout(() => {
        setTypedText(currentText.slice(0, typedText.length + 1));
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setTypedText('');
        setCurrentIndex((prev) => (prev + 1) % texts.length);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [typedText, currentIndex, texts, isLoaded]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-40">
          <img
            src="/background2.svg"
            alt="Medical background"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Constellation stars */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-300 rounded-full animate-pulse"
              style={{
                left: `${10 + (i * 4)}%`,
                top: `${20 + (i * 3)}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${2 + (i % 3)}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        {/* Loading Animation */}
        {!isLoaded && (
          <div className="flex justify-center items-center mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400"></div>
          </div>
        )}

        {/* Logo with hover effect and loading animation */}
        <div
          className={`mb-12 transition-all duration-1000 ${isHovered ? 'scale-110 drop-shadow-2xl' : 'scale-100'} ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <h1 className="text-7xl md:text-9xl font-bold text-white mb-6 tracking-tight">
            MedSnap
          </h1>
          <div className={`w-32 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto transition-all duration-500 ${isHovered ? 'w-40' : 'w-32'}`} />
        </div>

        {/* Typing Animation */}
        <div className={`mb-12 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl md:text-5xl text-blue-100 font-light mb-4 min-h-[4rem] flex items-center justify-center">
            {typedText}
            <span className="animate-pulse text-blue-300 ml-2">|</span>
          </h2>
        </div>

        {/* Subtitle */}
        <div className={`mb-16 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-2xl md:text-3xl text-blue-200 max-w-5xl mx-auto leading-relaxed">
            Transform healthcare with AI-powered AR diagnostics.
            MedSnap provides intelligent medical assistance through
            augmented reality technology.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className={`flex flex-col sm:flex-row gap-6 justify-center items-center transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <button className="px-10 py-5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-full hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg">
            Get Started
          </button>
          <button className="px-10 py-5 border-2 border-blue-400 text-blue-300 font-semibold rounded-full hover:bg-blue-400 hover:text-white transition-all duration-300 transform hover:scale-105 text-lg">
            Learn More
          </button>
        </div>

        {/* Stats */}
        <div className={`mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 transition-all duration-1000 delay-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-white mb-3">99.2%</div>
            <div className="text-blue-200 text-lg">Diagnostic Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-white mb-3">50+</div>
            <div className="text-blue-200 text-lg">Medical Conditions</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-white mb-3">24/7</div>
            <div className="text-blue-200 text-lg">AI Assistance</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce transition-all duration-1000 delay-1200 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-6 h-10 border-2 border-blue-300 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-blue-300 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}