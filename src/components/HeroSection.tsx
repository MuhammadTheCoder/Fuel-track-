import React from 'react';
import { MealEntry, DailyTargets } from '../types/nutrition';
import { Sparkles, ArrowUpRight, Flame, ShieldCheck } from 'lucide-react';

interface HeroSectionProps {
  todayMeals: MealEntry[];
  targets: DailyTargets;
  onTrackClick: () => void;
  onHowClick: () => void;
  onOpenQuiz?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  todayMeals,
  targets,
  onTrackClick,
  onHowClick,
  onOpenQuiz,
}) => {
  const totalCalories = todayMeals.reduce((acc, m) => acc + m.calories, 0);
  const totalProtein = Math.round(todayMeals.reduce((acc, m) => acc + m.protein, 0) * 10) / 10;
  const totalCarbs = Math.round(todayMeals.reduce((acc, m) => acc + m.carbs, 0) * 10) / 10;
  const totalFat = Math.round(todayMeals.reduce((acc, m) => acc + m.fat, 0) * 10) / 10;

  const calPercent = Math.min(100, Math.round((totalCalories / Math.max(1, targets.calories)) * 100));
  const latestMeal = todayMeals[0] || null;

  const goalBadge =
    targets.goal === 'muscle_gain'
      ? 'MUSCLE & STRENGTH'
      : targets.goal === 'growth_active'
      ? 'GROWTH & ATHLETIC'
      : targets.goal === 'weight_loss'
      ? 'LEAN & FAT LOSS'
      : 'DAILY SNAPSHOT';

  return (
    <section className="max-w-[1180px] mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-12 sm:pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 sm:gap-12 items-center">
        {/* Left Column: Hero Copy */}
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 border border-[#dce2d1] bg-white px-3 py-1.5 rounded-full text-[#4f5d3e] text-xs font-black tracking-wide shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#8fb83f] animate-pulse"></span>
            <span>SIMPLE NUTRITION · AI VISION & TEXT</span>
          </div>

          <h1 className="text-[40px] sm:text-[56px] lg:text-[68px] font-[900] tracking-[-0.06em] leading-[1.0] text-[#171a16] mt-5 mb-4">
            Know what you eat.<br />
            <span className="text-[#739a30]">Fuel your goals.</span>
          </h1>

          <p className="text-[#73796f] text-base sm:text-lg leading-[1.65] mb-7 font-normal">
            Track calories and protein without tedious spreadsheets. Describe your meal in plain English or Urdu/Hindi terms, snap a photo, and watch Gemini AI accurately estimate your nutrition.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onTrackClick}
              className="bg-[#11140f] hover:bg-[#20251e] active:scale-98 text-white px-5 sm:px-6 py-3.5 sm:py-4 rounded-full text-sm sm:text-base font-bold transition shadow-sm flex items-center gap-2"
            >
              <span>Track my meal</span>
              <ArrowUpRight className="w-4 h-4 text-[#c8f169]" />
            </button>
            <button
              onClick={onHowClick}
              className="bg-transparent hover:bg-white text-[#171a16] border border-[#d6dbcf] hover:border-[#b0b8a4] px-5 sm:px-6 py-3.5 sm:py-4 rounded-full text-sm sm:text-base font-bold transition shadow-2xs"
            >
              See how it works
            </button>
          </div>

          <div className="mt-5 text-xs text-[#858b80] flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>Made for Pakistani & everyday meals</span>
            <span>·</span>
            <span>Works smoothly on mobile</span>
            <span>·</span>
            <span>Local private storage</span>
          </div>
        </div>

        {/* Right Column: Live Interactive Dashboard Snapshot */}
        <div className="relative bg-[#11140f] text-white rounded-[28px] sm:rounded-[32px] p-5 sm:p-7 shadow-2xl overflow-hidden border border-[#2b3327]">
          {/* Ambient Glow */}
          <div className="absolute -right-20 -top-20 w-56 h-56 rounded-full bg-[#c8f169]/15 blur-2xl pointer-events-none" />

          <div className="relative flex justify-between items-center mb-5">
            <div>
              <div className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#c8f169]" />
                <span>Today's fuel status</span>
              </div>
              <small className="text-[#a6ad9e] text-xs">Real-time daily progress</small>
            </div>
            <button
              onClick={onOpenQuiz}
              className="text-[11px] font-bold text-[#c8f169] bg-[#c8f169]/15 border border-[#c8f169]/30 hover:bg-[#c8f169]/25 px-2.5 py-1 rounded-full uppercase tracking-wider transition cursor-pointer"
              title="Personalize your daily fuel plan"
            >
              {goalBadge}
            </button>
          </div>

          {/* Calorie Card */}
          <div className="bg-[#20251e] border border-[#343a30] rounded-[20px] p-4.5 sm:p-5 relative">
            <div className="flex items-end justify-between gap-2">
              <div>
                <span className="text-xs text-[#a8afa1] font-semibold uppercase tracking-wider">
                  Calories logged
                </span>
                <div className="text-3xl sm:text-4xl font-[900] tracking-tight text-white mt-1">
                  {totalCalories.toLocaleString()}
                  <span className="text-xs text-[#a8afa1] font-normal ml-1.5">/ {targets.calories} kcal</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-[#c8f169]">
                  {calPercent}%
                </span>
                <span className="block text-[11px] text-[#a8afa1]">of target</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2.5 bg-[#3b4136] rounded-full mt-3.5 overflow-hidden">
              <div
                className="h-full bg-[#c8f169] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.max(4, calPercent)}%` }}
              />
            </div>

            <div className="flex justify-between items-center mt-2 text-[11px] text-[#a8afa1]">
              <span>Remaining: {Math.max(0, targets.calories - totalCalories)} kcal</span>
              <span>Daily goal: {targets.calories} kcal</span>
            </div>
          </div>

          {/* Macro Grid */}
          <div className="grid grid-cols-3 gap-2.5 mt-3">
            <div className="bg-[#20251e] border border-[#343a30] rounded-[16px] p-3 sm:p-3.5">
              <span className="text-[11px] font-bold text-[#a6ad9e] tracking-wider">PROTEIN</span>
              <strong className="block text-xl sm:text-2xl font-black text-white my-1">
                {totalProtein}g
              </strong>
              <small className="text-[#a6ad9e] text-[10px] block">
                Target: {targets.protein}g
              </small>
            </div>

            <div className="bg-[#20251e] border border-[#343a30] rounded-[16px] p-3 sm:p-3.5">
              <span className="text-[11px] font-bold text-[#a6ad9e] tracking-wider">CARBS</span>
              <strong className="block text-xl sm:text-2xl font-black text-white my-1">
                {totalCarbs}g
              </strong>
              <small className="text-[#a6ad9e] text-[10px] block">
                Target: {targets.carbs}g
              </small>
            </div>

            <div className="bg-[#20251e] border border-[#343a30] rounded-[16px] p-3 sm:p-3.5">
              <span className="text-[11px] font-bold text-[#a6ad9e] tracking-wider">FATS</span>
              <strong className="block text-xl sm:text-2xl font-black text-white my-1">
                {totalFat}g
              </strong>
              <small className="text-[#a6ad9e] text-[10px] block">
                Target: {targets.fat}g
              </small>
            </div>
          </div>

          {/* Latest Meal Preview or Default Sample */}
          {latestMeal ? (
            <div className="bg-white text-[#171a16] rounded-[18px] p-3.5 mt-3.5 flex items-center gap-3 shadow-md">
              <div className="w-11 h-11 bg-[#eff5e2] rounded-[13px] grid place-items-center text-xl shrink-0 overflow-hidden">
                {latestMeal.photoUrl ? (
                  <img
                    src={latestMeal.photoUrl}
                    alt={latestMeal.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {latestMeal.mealType === 'breakfast' ? '🍳' : latestMeal.mealType === 'lunch' ? '🍛' : latestMeal.mealType === 'dinner' ? '🍲' : '🍎'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <strong className="text-sm font-bold block truncate">{latestMeal.name}</strong>
                <small className="text-[#73796f] text-xs">
                  {latestMeal.mealType.toUpperCase()} · {latestMeal.timeString}
                </small>
              </div>
              <div className="text-sm font-[850] text-[#171a16] shrink-0 text-right">
                <div>{latestMeal.calories} kcal</div>
                <div className="text-[11px] text-[#73796f] font-normal">{latestMeal.protein}g protein</div>
              </div>
            </div>
          ) : (
            <div className="bg-white text-[#171a16] rounded-[18px] p-3.5 mt-3.5 flex items-center gap-3 shadow-md opacity-90">
              <div className="w-11 h-11 bg-[#eff5e2] rounded-[13px] grid place-items-center text-xl shrink-0">
                🥚
              </div>
              <div className="flex-1 min-w-0">
                <strong className="text-sm font-bold block">2 Boiled Eggs & 1 Roti</strong>
                <small className="text-[#73796f] text-xs">Sample meal preview</small>
              </div>
              <div className="text-sm font-[850] text-[#171a16] shrink-0 text-right">
                <div>270 kcal</div>
                <div className="text-[11px] text-[#73796f] font-normal">16.1g protein</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
