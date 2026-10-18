import React from 'react';
import { Droplet, Plus, Minus, RotateCcw, CheckCircle2, Sparkles } from 'lucide-react';

interface WaterTrackerProps {
  currentMl: number;
  targetMl: number;
  onAddWater: (deltaMl: number) => void;
  onResetWater: () => void;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({
  currentMl,
  targetMl,
  onAddWater,
  onResetWater,
}) => {
  const safeTarget = Math.max(1000, targetMl || 2500);
  const percentage = Math.min(100, Math.round((currentMl / safeTarget) * 100));
  const remainingMl = Math.max(0, safeTarget - currentMl);
  const glassesConsumed = Math.round((currentMl / 250) * 10) / 10;
  const targetGlasses = Math.round(safeTarget / 250);
  const isGoalReached = currentMl >= safeTarget;

  return (
    <div className="bg-white border border-[#E5E8DF] rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-sm relative overflow-hidden transition-all">
      {/* Subtle blue accent glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-[#E0F2FE]/60 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#E0F2FE] text-[#0284C7] grid place-items-center font-black">
            <Droplet className="w-5 h-5 fill-[#0284C7]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#11140F] m-0 font-heading tracking-tight flex items-center gap-1.5">
              <span>Daily Hydration</span>
              {isGoalReached && (
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3" />
                  Met
                </span>
              )}
            </h3>
            <span className="text-xs text-[#858B80] font-medium block">
              Optimal fluid balance for recovery & digestion
            </span>
          </div>
        </div>

        {currentMl > 0 && (
          <button
            type="button"
            onClick={onResetWater}
            className="text-xs text-[#858B80] hover:text-[#11140F] p-1.5 rounded-lg hover:bg-[#F5F6F1] transition cursor-pointer border-0 bg-transparent flex items-center gap-1"
            title="Reset water intake for today"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>

      {/* Main Hydration Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_0.8fr] gap-4 items-center mb-5 relative z-10">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-[900] text-[#11140F] font-heading tracking-tight">
              {currentMl.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-[#858B80]">
              / {safeTarget.toLocaleString()} ml
            </span>
          </div>

          <div className="text-xs text-[#858B80] mt-1 font-medium flex items-center gap-2">
            <span>~{glassesConsumed} of {targetGlasses} standard glasses (250 ml)</span>
            <span>·</span>
            {remainingMl > 0 ? (
              <span className="text-[#0284C7] font-bold">{remainingMl.toLocaleString()} ml remaining</span>
            ) : (
              <span className="text-[#15803D] font-bold">Target completed! 🎉</span>
            )}
          </div>
        </div>

        {/* Progress Bar & Percentage */}
        <div>
          <div className="flex justify-between items-center text-xs font-bold mb-1.5">
            <span className="text-[#858B80] uppercase tracking-wider text-[11px]">Hydration Progress</span>
            <span className="text-[#0284C7] font-heading font-black">{percentage}%</span>
          </div>
          <div className="w-full bg-[#F0F4F8] rounded-full h-3 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out bg-linear-to-r from-[#38BDF8] to-[#0284C7]"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Log Buttons */}
      <div className="flex flex-wrap items-center gap-2 relative z-10 pt-2 border-t border-[#E5E8DF]/70">
        <span className="text-xs font-bold text-[#858B80] mr-1">Quick Add:</span>

        <button
          type="button"
          onClick={() => onAddWater(250)}
          className="flex-1 min-w-[90px] bg-[#F0F8FF] hover:bg-[#E0F2FE] text-[#0369A1] active:scale-97 border border-[#BAE6FD] py-2 px-3 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+250 ml (1 Cup)</span>
        </button>

        <button
          type="button"
          onClick={() => onAddWater(500)}
          className="flex-1 min-w-[90px] bg-[#F0F8FF] hover:bg-[#E0F2FE] text-[#0369A1] active:scale-97 border border-[#BAE6FD] py-2 px-3 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+500 ml (Bottle)</span>
        </button>

        <button
          type="button"
          onClick={() => onAddWater(100)}
          className="bg-[#FAFBF8] hover:bg-[#F0F2EC] text-[#11140F] active:scale-97 border border-[#DFE3D9] py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+100 ml</span>
        </button>

        {currentMl >= 250 && (
          <button
            type="button"
            onClick={() => onAddWater(-250)}
            className="text-[#858B80] hover:text-[#DC2626] hover:bg-[#FEF2F2] active:scale-97 p-2 rounded-xl text-xs font-bold transition cursor-pointer border border-transparent hover:border-[#FEE2E2]"
            title="Subtract 250 ml"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
