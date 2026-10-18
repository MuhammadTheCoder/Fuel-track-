import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface ApproachSectionProps {
  onScrollToTracker: () => void;
}

export const ApproachSection: React.FC<ApproachSectionProps> = ({ onScrollToTracker }) => {
  return (
    <section className="max-w-[1180px] mx-auto px-4 sm:px-6 py-10 sm:py-16" id="about">
      <div className="bg-[#11140f] text-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl relative overflow-hidden border border-[#2b3327]">
        {/* Glow */}
        <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-[#c8f169]/10 blur-3xl pointer-events-none" />

        <div className="max-w-xl relative">
          <h2 className="text-2xl sm:text-4xl font-[900] tracking-[-0.05em] leading-[1.1] text-white m-0 mb-3">
            Consistency beats<br />complicated.
          </h2>
          <p className="text-[#b4bbae] text-sm sm:text-base leading-relaxed m-0 font-normal">
            Start with your next meal. Learn your real portion habits over time. Make progress one day at a time without guilt or restrictive dieting.
          </p>
        </div>

        <button
          onClick={onScrollToTracker}
          className="relative bg-[#c8f169] hover:bg-[#b9e655] active:scale-98 text-[#11140f] px-6 py-3.5 rounded-full text-sm sm:text-base font-extrabold transition shadow-md whitespace-nowrap cursor-pointer border-0 flex items-center gap-2"
        >
          <span>Log a meal now</span>
          <ArrowUpRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </section>
  );
};
