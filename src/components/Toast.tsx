import React from 'react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#11140f] text-white px-5 py-3 rounded-full text-xs sm:text-sm font-semibold shadow-2xl border border-[#343a30] flex items-center gap-2 pointer-events-none animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <span className="w-2 h-2 rounded-full bg-[#c8f169] animate-ping" />
      <span>{message}</span>
    </div>
  );
};
