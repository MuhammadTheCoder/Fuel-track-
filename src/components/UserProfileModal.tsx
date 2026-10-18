import React, { useState } from 'react';
import {
  UserAccount,
  UserProfile,
  ActivityLevel,
  ExerciseRoutine,
  DietaryPreference,
  MainGoal,
  BiologicalSex,
} from '../types/nutrition';
import { calculatePersonalizedTargets } from '../utils/nutritionCalculator';
import {
  User,
  Users,
  Plus,
  Trash2,
  Check,
  X,
  Target,
  Sparkles,
  Heart,
  Shield,
  RotateCcw,
} from 'lucide-react';

interface UserProfileModalProps {
  activeAccount: UserAccount;
  allAccounts: UserAccount[];
  onSwitchAccount: (accountId: string) => void;
  onUpdateAccount: (updated: UserAccount) => void;
  onAddNewProfile: () => void;
  onDeleteAccount: (accountId: string) => void;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  activeAccount,
  allAccounts,
  onSwitchAccount,
  onUpdateAccount,
  onAddNewProfile,
  onDeleteAccount,
  onClose,
}) => {
  const [name, setName] = useState(activeAccount.profile.name);
  const [age, setAge] = useState(activeAccount.profile.age);
  const [sex, setSex] = useState<BiologicalSex>(activeAccount.profile.sex || 'prefer_not_to_say');
  const [weight, setWeight] = useState(activeAccount.profile.weight);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>(activeAccount.profile.weightUnit);
  const [height, setHeight] = useState(activeAccount.profile.height);
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft_in'>(activeAccount.profile.heightUnit);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(activeAccount.profile.activityLevel || 'moderate');
  const [exerciseRoutine, setExerciseRoutine] = useState<ExerciseRoutine>(activeAccount.profile.exerciseRoutine || '3_4_days');
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>(activeAccount.profile.dietaryPreference || 'no_preference');
  const [goal, setGoal] = useState<MainGoal>(activeAccount.profile.goal);

  const isMinor = age < 18;

  const handleSaveChangesAndRecalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedProfile: UserProfile = {
      ...activeAccount.profile,
      name: name.trim() || 'User Profile',
      age: Number(age),
      sex,
      weight: Number(weight),
      weightUnit,
      height: Number(height),
      heightUnit,
      activityLevel,
      exerciseRoutine,
      dietaryPreference,
      goal,
      updatedAt: new Date().toISOString(),
    };

    // Recalculate targets using Mifflin-St Jeor / pediatric safeguards
    const newTargets = calculatePersonalizedTargets(updatedProfile);

    const updatedAccount: UserAccount = {
      ...activeAccount,
      name: updatedProfile.name,
      profile: updatedProfile,
      targets: newTargets,
      updatedAt: new Date().toISOString(),
    };

    onUpdateAccount(updatedAccount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#11140F]/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-[26px] sm:rounded-[32px] max-w-xl w-full border border-[#E5E8DF] shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#11140F] text-white p-5 sm:p-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C8F169] text-[#11140F] grid place-items-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-[900] text-base sm:text-lg leading-tight text-white m-0 font-heading">
                Profile & Nutrition Calculator
              </h2>
              <p className="text-[#858B80] text-xs m-0 mt-0.5 font-medium">
                Update stats or switch profiles to recalculate personal targets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#A6AD9E] hover:text-white grid place-items-center transition cursor-pointer border-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 max-h-[76vh] overflow-y-auto space-y-6">
          {/* MULTI-USER PROFILE SWITCHER SECTION */}
          <div className="bg-[#FAFBF8] border border-[#E5E8DF] rounded-[22px] p-4 sm:p-4.5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#739A30]" />
                <span className="text-xs font-black uppercase text-[#11140F] tracking-wider">
                  Profiles on this device ({allAccounts.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAddNewProfile();
                }}
                className="text-xs font-bold text-[#11140F] bg-[#C8F169] hover:bg-[#B9E655] px-3 py-1 rounded-full transition cursor-pointer border-0 flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Profile</span>
              </button>
            </div>

            <div className="grid gap-2">
              {allAccounts.map((acc) => {
                const isActive = acc.id === activeAccount.id;
                return (
                  <div
                    key={acc.id}
                    className={`p-3 rounded-xl border flex items-center justify-between transition ${
                      isActive
                        ? 'bg-white border-[#739A30] shadow-xs'
                        : 'bg-white/60 border-[#E5E8DF] hover:border-[#CBD2C1]'
                    }`}
                  >
                    <div
                      onClick={() => !isActive && onSwitchAccount(acc.id)}
                      className="flex items-center gap-2.5 flex-1 cursor-pointer"
                    >
                      <div
                        className={`w-7 h-7 rounded-lg grid place-items-center text-xs font-bold ${
                          isActive ? 'bg-[#11140F] text-[#C8F169]' : 'bg-[#EFF2EA] text-[#858B80]'
                        }`}
                      >
                        {acc.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-[#11140F] block">
                          {acc.name} {isActive && <span className="text-[#739A30] font-normal">(Active)</span>}
                        </strong>
                        <span className="text-[11px] text-[#858B80]">
                          {acc.targets.calories} kcal · {acc.profile.age} yrs · {acc.profile.weight} {acc.profile.weightUnit} · {acc.targets.waterMl || 2500}ml
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isActive && (
                        <button
                          type="button"
                          onClick={() => onSwitchAccount(acc.id)}
                          className="text-xs font-bold text-[#739A30] hover:underline bg-transparent border-0 cursor-pointer p-0"
                        >
                          Switch
                        </button>
                      )}
                      {allAccounts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete profile "${acc.name}" and its saved meals from this device?`)) {
                              onDeleteAccount(acc.id);
                            }
                          }}
                          className="p-1 text-[#858B80] hover:text-[#D32F2F] bg-transparent border-0 cursor-pointer"
                          title="Delete profile"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-[11px] text-[#858B80] mt-2.5 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 shrink-0 text-[#739A30]" />
              <span>Isolated data: Each profile has its own private targets, hydration logs, and meal history.</span>
            </div>
          </div>

          {/* ACTIVE PROFILE EDIT FORM */}
          <form onSubmit={handleSaveChangesAndRecalculate} className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-[#E5E8DF]">
              <span className="text-xs font-black uppercase text-[#11140F] tracking-wider">
                Recalculate for: {activeAccount.name}
              </span>
              <span className="text-[11px] text-[#739A30] font-bold">
                Auto-updates targets
              </span>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-[#11140F] uppercase tracking-wide mb-1">
                Profile Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#FAFBF8] border border-[#DFE3D9] focus:bg-white focus:border-[#739A30] rounded-xl px-3 py-2 text-sm font-semibold text-[#11140F] outline-none"
              />
            </div>

            {/* Age & Sex */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#11140F] uppercase tracking-wide mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="10"
                  max="105"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-[#FAFBF8] border border-[#DFE3D9] focus:bg-white focus:border-[#739A30] rounded-xl px-3 py-2 text-sm font-semibold text-[#11140F] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#11140F] uppercase tracking-wide mb-1">
                  Sex (For MSJ Equation)
                </label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as BiologicalSex)}
                  className="w-full bg-[#FAFBF8] border border-[#DFE3D9] focus:bg-white focus:border-[#739A30] rounded-xl px-3 py-2 text-sm font-semibold text-[#11140F] outline-none"
                >
                  <option value="male">Male (+5 offset)</option>
                  <option value="female">Female (-161 offset)</option>
                  <option value="prefer_not_to_say">Prefer not to say / Skip</option>
                </select>
              </div>
            </div>

            {isMinor && (
              <div className="bg-[#EEF7DB] border border-[#D2E8AA] rounded-xl p-2.5 text-xs text-[#3F571B] flex items-start gap-2">
                <Heart className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#5E8524]" />
                <span>Youth safeguard: Targets prioritize healthy growth and avoid restrictive calorie deficits.</span>
              </div>
            )}

            {/* Weight & Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#11140F] uppercase tracking-wide mb-1">
                  Weight
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full bg-[#FAFBF8] border border-[#DFE3D9] focus:bg-white focus:border-[#739A30] rounded-xl px-3 py-2 text-sm font-semibold text-[#11140F] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#11140F] uppercase tracking-wide mb-1">
                  Weight Unit
                </label>
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value as 'kg' | 'lb')}
                  className="w-full bg-[#FAFBF8] border border-[#DFE3D9] focus:bg-white focus:border-[#739A30] rounded-xl px-3 py-2 text-sm font-semibold text-[#11140F] outline-none"
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="lb">Pounds (lb)</option>
                </select>
              </div>
            </div>

            {/* Height & Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#11140F] uppercase tracking-wide mb-1">
                  Height
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full bg-[#FAFBF8] border border-[#DFE3D9] focus:bg-white focus:border-[#739A30] rounded-xl px-3 py-2 text-sm font-semibold text-[#11140F] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#11140F] uppercase tracking-wide mb-1">
                  Height Unit
                </label>
                <select
                  value={heightUnit}
                  onChange={(e) => setHeightUnit(e.target.value as 'cm' | 'ft_in')}
                  className="w-full bg-[#FAFBF8] border border-[#DFE3D9] focus:bg-white focus:border-[#739A30] rounded-xl px-3 py-2 text-sm font-semibold text-[#11140F] outline-none"
                >
                  <option value="cm">Centimeters (cm)</option>
                  <option value="ft_in">Feet / Inches</option>
                </select>
              </div>
            </div>

            {/* Goal */}
            <div>
              <label className="block text-xs font-bold text-[#11140F] uppercase tracking-wide mb-1">
                Primary Goal
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as MainGoal)}
                className="w-full bg-[#FAFBF8] border border-[#DFE3D9] focus:bg-white focus:border-[#739A30] rounded-xl px-3 py-2 text-sm font-semibold text-[#11140F] outline-none"
              >
                <option value="muscle_strength">Build muscle and strength</option>
                <option value="maintain_fitness">Maintain weight and improve fitness</option>
                <option value="fat_loss_preserve_muscle">Lose body fat while preserving muscle</option>
                <option value="general_health_activity">Support general health and activity</option>
              </select>
            </div>

            {/* Activity Level */}
            <div>
              <label className="block text-xs font-bold text-[#11140F] uppercase tracking-wide mb-1">
                General Daily Activity
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                className="w-full bg-[#FAFBF8] border border-[#DFE3D9] focus:bg-white focus:border-[#739A30] rounded-xl px-3 py-2 text-sm font-semibold text-[#11140F] outline-none"
              >
                <option value="sedentary">Sedentary (mostly sitting, ×1.2)</option>
                <option value="light">Lightly active (light walking, ×1.375)</option>
                <option value="moderate">Moderately active (on feet / active day, ×1.55)</option>
                <option value="very_active">Very active (high step count / physical, ×1.725)</option>
                <option value="extremely_active">Extremely active (heavy labor / intense, ×1.9)</option>
              </select>
            </div>

            {/* Exercise Routine */}
            <div>
              <label className="block text-xs font-bold text-[#11140F] uppercase tracking-wide mb-1">
                Exercise Routine (Structured Workouts)
              </label>
              <select
                value={exerciseRoutine}
                onChange={(e) => setExerciseRoutine(e.target.value as ExerciseRoutine)}
                className="w-full bg-[#FAFBF8] border border-[#DFE3D9] focus:bg-white focus:border-[#739A30] rounded-xl px-3 py-2 text-sm font-semibold text-[#11140F] outline-none"
              >
                <option value="none">No structured workouts</option>
                <option value="1_2_days">1–2 days per week</option>
                <option value="3_4_days">3–4 days per week</option>
                <option value="5_6_days">5–6 days per week</option>
                <option value="daily">Daily training</option>
              </select>
            </div>

            {/* Dietary Preference */}
            <div>
              <label className="block text-xs font-bold text-[#11140F] uppercase tracking-wide mb-1">
                Dietary Preferences
              </label>
              <select
                value={dietaryPreference}
                onChange={(e) => setDietaryPreference(e.target.value as DietaryPreference)}
                className="w-full bg-[#FAFBF8] border border-[#DFE3D9] focus:bg-white focus:border-[#739A30] rounded-xl px-3 py-2 text-sm font-semibold text-[#11140F] outline-none"
              >
                <option value="no_preference">No preference (Omnivore)</option>
                <option value="vegetarian">Vegetarian (Dairy & eggs included)</option>
                <option value="vegan">Vegan (100% plant-based)</option>
                <option value="other">Other preferences / Halal</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-full border border-[#D6DBCF] hover:border-[#11140F] text-xs font-bold text-[#858B80] hover:text-[#11140F] bg-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-full bg-[#11140F] hover:bg-[#20251E] active:scale-99 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border-0 shadow-sm"
              >
                <Check className="w-3.5 h-3.5 text-[#C8F169]" />
                <span>Save & Recalculate Targets</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
