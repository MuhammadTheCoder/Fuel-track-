import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onFinish: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onFinish }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Minimal launch transition while initializing, without artificial long waiting time
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(onFinish, 280);
    }, 450);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-100 bg-[#11140F] text-white flex flex-col items-center justify-center p-6 select-none transition-opacity duration-300 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle Lime Ambient Light */}
      <div className="absolute w-80 h-80 rounded-full bg-[#C8F169]/8 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col items-center text-center max-w-sm">
        {/* Brand Mark */}
        <div className="w-14 h-14 bg-[#C8F169] text-[#11140F] rounded-[18px] grid place-items-center font-[950] text-2xl shadow-lg mb-5 animate-pulse">
          F
        </div>

        {/* Title & Slogan */}
        <h1 className="text-3xl font-[900] tracking-[-0.05em] text-white m-0 font-heading">
          FuelTrack
        </h1>
        <p className="text-xs font-black tracking-[0.16em] text-[#C8F169] uppercase mt-2.5 m-0">
          NUTRITION, MADE SIMPLE.
        </p>

        {/* Minimal Subtle Loader */}
        <div className="w-16 h-1 bg-[#20251E] rounded-full mt-7 overflow-hidden">
          <div className="w-full h-full bg-[#C8F169] rounded-full animate-indeterminate" />
        </div>
      </div>
    </div>
  );
};
