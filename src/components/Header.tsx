import React from 'react';
import { Target, User, Award, Droplet, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenGoals: () => void;
  onOpenProfile: () => void;
  onOpenWeeklyReport?: () => void;
  onScrollToTracker: () => void;
  onScrollToDashboard: () => void;
  activeProfileName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenGoals,
  onOpenProfile,
  onOpenWeeklyReport,
  onScrollToTracker,
  onScrollToDashboard,
  activeProfileName,
}) => {
  return (
    <header className="max-w-[1180px] mx-auto px-4 sm:px-6">
      <nav className="h-18 sm:h-20 flex items-center justify-between gap-4 border-b border-[#E5E8DF]/70">
        <a
          href="#"
          className="flex items-center gap-2.5 text-[20px] font-[900] tracking-[-0.7px] text-[#11140F] no-underline transition hover:opacity-85 font-heading"
        >
          <span className="w-8.5 h-8.5 bg-[#C8F169] rounded-[11px] grid place-items-center font-black text-[#11140F] text-base shadow-sm">
            F
          </span>
          <span>FuelTrack</span>
        </a>

        <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#858B80]">
          <button
            onClick={onScrollToTracker}
            className="hover:text-[#11140F] transition cursor-pointer bg-transparent border-0 p-0"
          >
            Meal Tracker
          </button>
          <button
            onClick={onScrollToDashboard}
            className="hover:text-[#11140F] transition cursor-pointer bg-transparent border-0 p-0"
          >
            Daily Dashboard
          </button>
          {onOpenWeeklyReport && (
            <button
              onClick={onOpenWeeklyReport}
              className="hover:text-[#11140F] transition cursor-pointer bg-transparent border-0 p-0 flex items-center gap-1 text-[#739A30]"
            >
              <Award className="w-4 h-4" />
              <span>Weekly Report</span>
            </button>
          )}
          <button
            onClick={onOpenProfile}
            className="hover:text-[#11140F] transition cursor-pointer bg-transparent border-0 p-0"
          >
            Profile & Targets
          </button>
          <a href="#how" className="hover:text-[#11140F] transition no-underline text-inherit">
            How it works
          </a>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          {onOpenWeeklyReport && (
            <button
              onClick={onOpenWeeklyReport}
              className="flex md:hidden items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#11140F] text-[#C8F169] text-xs font-bold transition shadow-2xs border-0 cursor-pointer"
              title="7-Day Weekly Report"
            >
              <Award className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Report</span>
            </button>
          )}

          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-full border border-[#D6DBCF] hover:border-[#11140F] text-[#11140F] text-xs sm:text-sm font-bold bg-white transition shadow-2xs hover:bg-[#FAFBF8] cursor-pointer"
            title="Profile, Goals & Multi-user Switcher"
          >
            <User className="w-3.5 h-3.5 text-[#739A30]" />
            <span className="max-w-[85px] sm:max-w-[120px] truncate">
              {activeProfileName || 'Profile'}
            </span>
          </button>

          <button
            onClick={onOpenGoals}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 sm:px-3 sm:py-2 rounded-full border border-[#D6DBCF] hover:border-[#11140F] text-[#11140F] text-xs sm:text-sm font-bold bg-white transition shadow-2xs hover:bg-[#FAFBF8] cursor-pointer"
            title="Nutrition Targets Summary"
          >
            <Target className="w-3.5 h-3.5 text-[#739A30]" />
            <span>Targets</span>
          </button>

          <button
            onClick={onScrollToTracker}
            className="flex items-center gap-1.5 bg-[#11140f] hover:bg-[#20251e] active:scale-98 text-white px-3.5 py-2 sm:px-4.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition shadow-sm"
          >
            <span>Track meal</span>
            <span aria-hidden="true" className="text-[#c8f169]">↗</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
