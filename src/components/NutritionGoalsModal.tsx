import React, { useState } from 'react';
import { DailyTargets } from '../types/nutrition';
import { X, Target, ShieldCheck, Heart, Sparkles, Check } from 'lucide-react';

interface NutritionGoalsModalProps {
  currentTargets: DailyTargets;
  onSaveTargets: (targets: DailyTargets) => void;
  onClose: () => void;
  onOpenQuiz?: () => void;
}

export const NutritionGoalsModal: React.FC<NutritionGoalsModalProps> = ({
  currentTargets,
  onSaveTargets,
  onClose,
  onOpenQuiz,
}) => {
  const [calories, setCalories] = useState(currentTargets.calories);
  const [protein, setProtein] = useState(currentTargets.protein);
  const [carbs, setCarbs] = useState(currentTargets.carbs);
  const [fat, setFat] = useState(currentTargets.fat);
  const [isUnder18, setIsUnder18] = useState(currentTargets.isUnder18 ?? currentTargets.isMinor ?? false);
  const [goal, setGoal] = useState<DailyTargets['goal']>(currentTargets.goal || currentTargets.userProfile?.goal || 'maintain');

  // Quick preset helper
  const applyPreset = (presetGoal: DailyTargets['goal']) => {
    setGoal(presetGoal);
    if (isUnder18 || presetGoal === 'growth_active') {
      setCalories(2300);
      setProtein(130);
      setCarbs(260);
      setFat(75);
    } else if (presetGoal === 'muscle_gain') {
      setCalories(2400);
      setProtein(150);
      setCarbs(260);
      setFat(75);
    } else if (presetGoal === 'weight_loss') {
      setCalories(1850);
      setProtein(145);
      setCarbs(180);
      setFat(60);
    } else {
      setCalories(2000);
      setProtein(120);
      setCarbs(220);
      setFat(65);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveTargets({
      ...currentTargets,
      calories: Math.max(1200, Number(calories) || 2000),
      protein: Math.max(40, Number(protein) || 120),
      carbs: Math.max(50, Number(carbs) || 220),
      fat: Math.max(20, Number(fat) || 65),
      isUnder18: !!isUnder18,
      isMinor: !!isUnder18,
      goal: goal || 'maintain',
      methodNote: currentTargets.methodNote || 'Customized daily targets.',
      goalDescription: currentTargets.goalDescription || 'Custom targets',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#11140f]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-[26px] max-w-lg w-full border border-[#cbd2c1] shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#11140f] text-white p-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#c8f169] text-[#11140f] grid place-items-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight text-white m-0">
                Daily Nutrition Targets
              </h3>
              <p className="text-[#a6ad9e] text-xs m-0 mt-0.5">
                Customize your daily calorie & macro goals
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#a6ad9e] hover:text-white grid place-items-center transition cursor-pointer border-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {onOpenQuiz && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenQuiz();
              }}
              className="w-full bg-[#f4f7ee] hover:bg-[#e9eee0] border border-[#cbd8b8] text-[#3f571b] rounded-2xl p-3 text-xs font-bold transition flex items-center justify-between gap-2 cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2 text-left">
                <Sparkles className="w-4 h-4 text-[#739a30] shrink-0" />
                <span>Calculate targets using Body Stats Quiz (Weight, Height & Goal)</span>
              </div>
              <span className="text-sm font-black text-[#739a30]">↗</span>
            </button>
          )}

          {/* Age Selection & Youth Nutrition Protection Notice */}
          <div className="bg-[#f5f6f1] border border-[#e5e8df] rounded-2xl p-3.5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isUnder18}
                onChange={(e) => {
                  const under = e.target.checked;
                  setIsUnder18(under);
                  if (under) {
                    applyPreset('growth_active');
                  }
                }}
                className="mt-1 w-4 h-4 accent-[#739a30] rounded cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-extrabold text-[#171a16] block">
                  I am under 18 years old (Youth & Teen Nutrition)
                </span>
                <span className="text-[#73796f] block mt-0.5">
                  Activates growth & strength focused targets without restrictive deficits.
                </span>
              </div>
            </label>

            {isUnder18 && (
              <div className="mt-3 bg-[#eef7db] border border-[#d2e8aa] rounded-xl p-3 text-xs text-[#3f571b] flex items-start gap-2">
                <Heart className="w-4 h-4 shrink-0 mt-0.5 text-[#5e8524]" />
                <div className="leading-relaxed">
                  <strong>Healthy Growth Priority:</strong> As someone under 18, FuelTrack prioritizes adequate food energy, healthy bone/muscle development, regular meals, and steady strength. Restrictive calorie deficits are not recommended.
                </div>
              </div>
            )}
          </div>

          {/* Preset Buttons */}
          <div>
            <label className="block text-xs font-extrabold text-[#171a16] mb-1.5 uppercase tracking-wide">
              Quick Target Presets
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => applyPreset('maintain')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                  goal === 'maintain'
                    ? 'bg-[#11140f] text-white border-[#11140f]'
                    : 'bg-[#fafbf8] text-[#171a16] border-[#dfe3d9] hover:border-[#171a16]'
                }`}
              >
                Maintenance
              </button>
              <button
                type="button"
                onClick={() => applyPreset('muscle_gain')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                  goal === 'muscle_gain'
                    ? 'bg-[#11140f] text-white border-[#11140f]'
                    : 'bg-[#fafbf8] text-[#171a16] border-[#dfe3d9] hover:border-[#171a16]'
                }`}
              >
                Muscle & Strength
              </button>
              <button
                type="button"
                onClick={() => applyPreset('growth_active')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                  goal === 'growth_active'
                    ? 'bg-[#11140f] text-white border-[#11140f]'
                    : 'bg-[#fafbf8] text-[#171a16] border-[#dfe3d9] hover:border-[#171a16]'
                }`}
              >
                Growth / Active
              </button>
            </div>
          </div>

          {/* Numerical Target Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-[#171a16] mb-1">
                Calories (kcal / day)
              </label>
              <input
                type="number"
                min="1000"
                max="6000"
                step="50"
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                className="w-full bg-[#fafbf8] border border-[#dfe3d9] rounded-xl px-3 py-2 text-sm font-bold text-[#171a16] focus:outline-none focus:border-[#739a30]"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#171a16] mb-1">
                Protein (grams / day)
              </label>
              <input
                type="number"
                min="30"
                max="400"
                step="5"
                value={protein}
                onChange={(e) => setProtein(Number(e.target.value))}
                className="w-full bg-[#fafbf8] border border-[#dfe3d9] rounded-xl px-3 py-2 text-sm font-bold text-[#171a16] focus:outline-none focus:border-[#739a30]"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#171a16] mb-1">
                Carbohydrates (g / day)
              </label>
              <input
                type="number"
                min="20"
                max="800"
                step="5"
                value={carbs}
                onChange={(e) => setCarbs(Number(e.target.value))}
                className="w-full bg-[#fafbf8] border border-[#dfe3d9] rounded-xl px-3 py-2 text-sm font-bold text-[#171a16] focus:outline-none focus:border-[#739a30]"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#171a16] mb-1">
                Fat (grams / day)
              </label>
              <input
                type="number"
                min="15"
                max="300"
                step="5"
                value={fat}
                onChange={(e) => setFat(Number(e.target.value))}
                className="w-full bg-[#fafbf8] border border-[#dfe3d9] rounded-xl px-3 py-2 text-sm font-bold text-[#171a16] focus:outline-none focus:border-[#739a30]"
              />
            </div>
          </div>

          {/* Macro Calorie Distribution Info */}
          <div className="bg-[#fafbf8] border border-[#e5e8df] rounded-xl p-3 text-xs text-[#73796f] flex justify-between">
            <span>Calculated Macro Energy:</span>
            <strong className="text-[#171a16]">
              {protein * 4 + carbs * 4 + fat * 9} kcal
            </strong>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-[#d6dbcf] text-xs font-bold text-[#73796f] hover:text-[#171a16] bg-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-[#11140f] hover:bg-[#20251e] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border-0 shadow-sm"
            >
              <Check className="w-3.5 h-3.5 text-[#c8f169]" />
              <span>Save Targets</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
