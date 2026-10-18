import React, { useState } from 'react';
import {
  UserProfile,
  DailyTargets,
  ActivityLevel,
  ExerciseRoutine,
  DietaryPreference,
  MainGoal,
  BiologicalSex,
  UserAccount,
} from '../types/nutrition';
import { calculatePersonalizedTargets } from '../utils/nutritionCalculator';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Heart,
  Sparkles,
  Dumbbell,
  Scale,
  Zap,
  Sprout,
  Droplet,
  Info,
  ShieldCheck,
  User,
} from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: (account: UserAccount) => void;
  onCancel?: () => void;
  isAddingProfile?: boolean;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  onCancel,
  isAddingProfile = false,
}) => {
  // 1: Age, 2: Sex, 3: Height, 4: Weight, 5: Goal, 6: Daily Activity, 7: Exercise Routine, 8: Dietary Preferences, 9: Results Plan
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9>(1);

  // Profile fields — NEVER pre-filled with someone else's personal measurements
  const [name, setName] = useState('');
  const [ageStr, setAgeStr] = useState('');

  const [sex, setSex] = useState<BiologicalSex | null>(null);

  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft_in'>('cm');
  const [heightCmStr, setHeightCmStr] = useState('');
  const [heightFtStr, setHeightFtStr] = useState('');
  const [heightInStr, setHeightInStr] = useState('');

  const [weightStr, setWeightStr] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');

  const [goal, setGoal] = useState<MainGoal | null>(null);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);
  const [exerciseRoutine, setExerciseRoutine] = useState<ExerciseRoutine | null>(null);
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>('no_preference');

  const [calculatedTargets, setCalculatedTargets] = useState<DailyTargets | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const age = Number(ageStr);
  const isMinor = age > 0 && age < 18;

  // ----------------- STEP HANDLERS & VALIDATION -----------------

  const handleNextFromAge = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    const parsedAge = Number(ageStr);
    if (!ageStr || isNaN(parsedAge) || parsedAge < 10 || parsedAge > 105) {
      setValidationError('Please enter a valid age between 10 and 105 years.');
      return;
    }
    setCurrentStep(2);
  };

  const handleNextFromSex = (selectedSex?: BiologicalSex) => {
    setValidationError(null);
    const choice = selectedSex || sex || 'prefer_not_to_say';
    setSex(choice);
    setCurrentStep(3);
  };

  const handleNextFromHeight = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (heightUnit === 'cm') {
      const parsedCm = Number(heightCmStr);
      if (!heightCmStr || isNaN(parsedCm) || parsedCm < 80 || parsedCm > 250) {
        setValidationError('Please enter a valid height between 80 and 250 cm.');
        return;
      }
    } else {
      const parsedFt = Number(heightFtStr);
      const parsedIn = Number(heightInStr || '0');
      if (!heightFtStr || isNaN(parsedFt) || parsedFt < 3 || parsedFt > 8 || parsedIn < 0 || parsedIn >= 12) {
        setValidationError('Please enter a valid height in feet and inches (e.g. 5 ft 10 in).');
        return;
      }
    }
    setCurrentStep(4);
  };

  const handleNextFromWeight = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    const parsedWeight = Number(weightStr);
    if (!weightStr || isNaN(parsedWeight) || parsedWeight <= 0) {
      setValidationError('Please enter a valid weight.');
      return;
    }
    if (weightUnit === 'kg' && (parsedWeight < 25 || parsedWeight > 350)) {
      setValidationError('Please enter a realistic weight in kg (between 25 and 350 kg).');
      return;
    }
    if (weightUnit === 'lb' && (parsedWeight < 55 || parsedWeight > 770)) {
      setValidationError('Please enter a realistic weight in lb (between 55 and 770 lb).');
      return;
    }
    setCurrentStep(5);
  };

  const handleNextFromGoal = () => {
    setValidationError(null);
    if (!goal) {
      setValidationError('Please select your primary nutrition goal.');
      return;
    }
    setCurrentStep(6);
  };

  const handleNextFromActivity = () => {
    setValidationError(null);
    if (!activityLevel) {
      setValidationError('Please select your general daily activity level.');
      return;
    }
    setCurrentStep(7);
  };

  const handleNextFromRoutine = () => {
    setValidationError(null);
    if (!exerciseRoutine) {
      setValidationError('Please select your typical weekly workout routine.');
      return;
    }
    setCurrentStep(8);
  };

  const handleCalculateAndReview = () => {
    setValidationError(null);

    let finalHeightCm: number;
    if (heightUnit === 'cm') {
      finalHeightCm = Number(heightCmStr);
    } else {
      finalHeightCm = Math.round((Number(heightFtStr) * 12 + Number(heightInStr || '0')) * 2.54);
    }

    const newProfile: UserProfile = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim() || (isAddingProfile ? `Profile ${Date.now().toString().slice(-3)}` : 'My Profile'),
      age: Number(ageStr),
      sex: sex || 'prefer_not_to_say',
      weight: Number(weightStr),
      weightUnit,
      height: finalHeightCm,
      heightUnit,
      heightFt: heightUnit === 'ft_in' ? Number(heightFtStr) : undefined,
      heightIn: heightUnit === 'ft_in' ? Number(heightInStr || '0') : undefined,
      activityLevel: activityLevel || 'moderate',
      exerciseRoutine: exerciseRoutine || '3_4_days',
      dietaryPreference: dietaryPreference || 'no_preference',
      goal: goal || 'maintain_fitness',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const targets = calculatePersonalizedTargets(newProfile);
    setCalculatedTargets(targets);
    setCurrentStep(9);
  };

  const handleBuildDashboard = () => {
    if (!calculatedTargets || !calculatedTargets.userProfile) return;

    const account: UserAccount = {
      id: calculatedTargets.userProfile.id,
      name: calculatedTargets.userProfile.name,
      profile: calculatedTargets.userProfile,
      targets: calculatedTargets,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onComplete(account);
  };

  // Option sets
  const goalOptions: {
    id: MainGoal;
    title: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'muscle_strength',
      title: 'Build muscle and strength',
      description: 'Modest energy surplus paired with high protein (1.8–2.0 g/kg) to maximize muscle hypertrophy and tissue recovery.',
      icon: <Dumbbell className="w-5 h-5 text-[#11140F]" />,
    },
    {
      id: 'maintain_fitness',
      title: 'Maintain weight and improve fitness',
      description: 'Calibrated maintenance energy balance to sustain current bodyweight while supporting consistent training performance.',
      icon: <Zap className="w-5 h-5 text-[#11140F]" />,
    },
    {
      id: 'fat_loss_preserve_muscle',
      title: 'Lose body fat while preserving muscle',
      description: isMinor
        ? 'Healthy body composition through active movement and wholesome nutrition without restrictive calorie deficits.'
        : 'Controlled, sustainable calorie deficit with high protein to protect lean muscle tissue.',
      icon: <Scale className="w-5 h-5 text-[#11140F]" />,
    },
    {
      id: 'general_health_activity',
      title: 'Support general health and activity',
      description: 'Balanced daily energy intake prioritizing endurance, vitality, natural physical development, and regular meals.',
      icon: <Sprout className="w-5 h-5 text-[#426117]" />,
    },
  ];

  const activityOptions: {
    id: ActivityLevel;
    title: string;
    factor: number;
    description: string;
  }[] = [
    {
      id: 'sedentary',
      title: 'Sedentary',
      factor: 1.2,
      description: 'Mostly sitting with little or no intentional movement during the workday.',
    },
    {
      id: 'light',
      title: 'Lightly active',
      factor: 1.375,
      description: 'Desk work with daily light walking, standing chores, or strolls.',
    },
    {
      id: 'moderate',
      title: 'Moderately active',
      factor: 1.55,
      description: 'Regular movement throughout the day or active jobs (walking, on your feet).',
    },
    {
      id: 'very_active',
      title: 'Very active',
      factor: 1.725,
      description: 'Physical labor or high daily step counts with active daily movement.',
    },
    {
      id: 'extremely_active',
      title: 'Extremely active',
      factor: 1.9,
      description: 'Heavy physical work, double training days, or rigorous physical endurance.',
    },
  ];

  const routineOptions: {
    id: ExerciseRoutine;
    title: string;
    description: string;
  }[] = [
    {
      id: 'none',
      title: 'No structured workouts',
      description: 'Focusing on general health, daily steps, and dietary quality.',
    },
    {
      id: '1_2_days',
      title: '1–2 days per week',
      description: 'Occasional gym sessions, weekend sports, or introductory routine.',
    },
    {
      id: '3_4_days',
      title: '3–4 days per week',
      description: 'Consistent strength training, regular workouts, or athletic classes.',
    },
    {
      id: '5_6_days',
      title: '5–6 days per week',
      description: 'Dedicated resistance training split or high-volume athletic regimen.',
    },
    {
      id: 'daily',
      title: 'Daily training',
      description: 'Competitive athletes, daily conditioning, or structured two-a-days.',
    },
  ];

  const dietaryOptions: {
    id: DietaryPreference;
    title: string;
    desc: string;
  }[] = [
    { id: 'no_preference', title: 'No preference (Omnivore)', desc: 'Include chicken, beef, fish, eggs, dairy, and plant foods.' },
    { id: 'vegetarian', title: 'Vegetarian', desc: 'Plant-based with dairy, eggs, daal, paneer, and whey.' },
    { id: 'vegan', title: 'Vegan', desc: '100% plant foods, tofu, lentils, beans, and plant protein.' },
    { id: 'other', title: 'Other preferences / Halal / Custom', desc: 'Custom lifestyle preferences respected in food tracking.' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#11140F]/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-[26px] sm:rounded-[32px] max-w-xl w-full border border-[#E5E8DF] shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header & Progress */}
        <div className="bg-[#11140F] text-white p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 bg-[#C8F169] text-[#11140F] rounded-lg grid place-items-center font-black text-xs font-heading">
                F
              </span>
              <span className="text-xs font-black tracking-wider uppercase text-white/90">
                Personalized Setup
              </span>
            </div>
            {currentStep <= 8 ? (
              <span className="text-xs font-bold text-[#C8F169]">
                Step {currentStep} of 8
              </span>
            ) : (
              <span className="text-xs font-bold text-[#C8F169]">
                Ready to Fuel
              </span>
            )}
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-[#858B80] hover:text-white transition bg-transparent border-0 cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#20251E] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#C8F169] h-full rounded-full transition-all duration-300"
              style={{ width: `${(Math.min(8, currentStep) / 8) * 100}%` }}
            />
          </div>
        </div>

        {/* Validation Alert */}
        {validationError && (
          <div className="bg-[#FFF1F1] border-b border-[#F5C6C6] text-[#A52A2A] px-5 py-2.5 text-xs font-semibold flex items-center justify-between">
            <span>{validationError}</span>
            <button
              onClick={() => setValidationError(null)}
              className="text-[#A52A2A] bg-transparent border-0 cursor-pointer text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* ----------------- QUESTION 1: AGE & TITLE ----------------- */}
        {currentStep === 1 && (
          <form onSubmit={handleNextFromAge} className="p-6 sm:p-7 space-y-5">
            <div>
              <span className="text-xs font-extrabold uppercase text-[#739A30] tracking-wider block mb-1">
                Question 1 of 8
              </span>
              <h1 className="text-2xl sm:text-3xl font-[900] text-[#11140F] m-0 font-heading leading-tight">
                Fuel Your Body. Track Your Progress.
              </h1>
              <p className="text-xs sm:text-sm text-[#858B80] mt-1.5 leading-relaxed m-0">
                Tell us a little about yourself so we can estimate the daily nutrition your body needs.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-[#11140F] uppercase tracking-wide mb-1.5">
                  How old are you? (Years) *
                </label>
                <input
                  type="number"
                  min="10"
                  max="105"
                  value={ageStr}
                  onChange={(e) => setAgeStr(e.target.value)}
                  placeholder="e.g. 23"
                  autoFocus
                  required
                  className="w-full bg-[#FAFBF8] border border-[#DFE3D9] focus:bg-white focus:border-[#739A30] rounded-2xl p-4 text-xl font-bold text-[#11140F] outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#858B80] uppercase tracking-wide mb-1.5">
                  Your Profile Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full bg-[#FAFBF8] border border-[#DFE3D9] focus:bg-white focus:border-[#739A30] rounded-2xl p-3 text-sm font-semibold text-[#11140F] outline-none transition"
                />
              </div>

              {isMinor && (
                <div className="bg-[#EEF7DB] border border-[#D2E8AA] rounded-2xl p-3.5 text-xs text-[#3F571B] flex items-start gap-2.5">
                  <Heart className="w-4 h-4 shrink-0 mt-0.5 text-[#5E8524]" />
                  <div className="leading-relaxed">
                    <strong>Youth & Growth Mode Active:</strong> For users under 18, Fuel Track automatically prioritizes healthy growth, bone/muscle development, and adequate nutrition rather than restrictive calorie deficits.
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-[#11140F] hover:bg-[#20251E] active:scale-99 text-white py-4 px-6 rounded-full font-bold text-sm sm:text-base transition shadow-sm cursor-pointer border-0 flex items-center justify-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 text-[#C8F169]" />
              </button>
            </div>
          </form>
        )}

        {/* ----------------- QUESTION 2: BIOLOGICAL SEX ----------------- */}
        {currentStep === 2 && (
          <div className="p-6 sm:p-7 space-y-5">
            <div>
              <span className="text-xs font-extrabold uppercase text-[#739A30] tracking-wider block mb-1">
                Question 2 of 8
              </span>
              <h2 className="text-2xl sm:text-3xl font-[900] text-[#11140F] m-0 font-heading">
                Sex used for calorie equation
              </h2>
              <p className="text-xs sm:text-sm text-[#858B80] mt-1.5 leading-relaxed m-0">
                Resting energy equations (Mifflin–St Jeor) use biological sex to estimate resting metabolic rate. You may also skip or seek professional guidance if you prefer not to provide it.
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              {[
                { id: 'male' as BiologicalSex, label: 'Male', note: 'Uses MSJ male resting equation (+5 offset)' },
                { id: 'female' as BiologicalSex, label: 'Female', note: 'Uses MSJ female resting equation (-161 offset)' },
                { id: 'prefer_not_to_say' as BiologicalSex, label: 'Prefer not to say / Skip', note: 'Uses a neutral metabolic midpoint without assumptions' },
              ].map((opt) => {
                const isSelected = sex === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setSex(opt.id)}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#F4F7EE] border-[#739A30] shadow-xs'
                        : 'bg-[#FAFBF8] border-[#E5E8DF] hover:border-[#CBD2C1]'
                    }`}
                  >
                    <div>
                      <strong className="text-sm font-bold text-[#11140F] block">
                        {opt.label}
                      </strong>
                      <span className="text-xs text-[#858B80]">{opt.note}</span>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border grid place-items-center shrink-0 ${
                        isSelected
                          ? 'border-[#739A30] bg-[#739A30] text-white'
                          : 'border-[#CBD2C1] bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-3.5 rounded-full border border-[#D6DBCF] hover:border-[#11140F] text-xs sm:text-sm font-bold text-[#858B80] hover:text-[#11140F] bg-white transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => handleNextFromSex()}
                className="flex-1 bg-[#11140F] hover:bg-[#20251E] active:scale-99 text-white py-4 px-6 rounded-full font-bold text-sm sm:text-base transition shadow-sm cursor-pointer border-0 flex items-center justify-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 text-[#C8F169]" />
              </button>
            </div>
          </div>
        )}

        {/* ----------------- QUESTION 3: HEIGHT ----------------- */}
        {currentStep === 3 && (
          <form onSubmit={handleNextFromHeight} className="p-6 sm:p-7 space-y-5">
            <div>
              <span className="text-xs font-extrabold uppercase text-[#739A30] tracking-wider block mb-1">
                Question 3 of 8
              </span>
              <h2 className="text-2xl sm:text-3xl font-[900] text-[#11140F] m-0 font-heading">
                How tall are you?
              </h2>
              <p className="text-xs sm:text-sm text-[#858B80] mt-1.5 leading-relaxed m-0">
                Height calculates your lean body surface area and basal energy output.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex justify-end">
                <div className="bg-[#F0F2EC] rounded-xl p-1 flex items-center">
                  <button
                    type="button"
                    onClick={() => setHeightUnit('cm')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      heightUnit === 'cm' ? 'bg-white text-[#11140F] shadow-xs' : 'text-[#858B80]'
                    }`}
                  >
                    Centimeters (cm)
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeightUnit('ft_in')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      heightUnit === 'ft_in' ? 'bg-white text-[#11140F] shadow-xs' : 'text-[#858B80]'
                    }`}
                  >
                    Feet / Inches (ft/in)
                  </button>
                </div>
              </div>

              {heightUnit === 'cm' ? (
                <div className="relative">
                  <input
                    type="number"
                    min="80"
                    max="250"
                    value={heightCmStr}
                    onChange={(e) => setHeightCmStr(e.target.value)}
                    placeholder="e.g. 175"
                    autoFocus
                    required
                    className="w-full bg-[#FAFBF8] border border-[#DFE3D9] focus:bg-white focus:border-[#739A30] rounded-2xl p-4 text-xl font-bold text-[#11140F] outline-none transition"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#858B80]">
                    cm
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="number"
                      min="3"
                      max="8"
                      value={heightFtStr}
                      onChange={(e) => setHeightFtStr(e.target.value)}
                      placeholder="e.g. 5"
                      autoFocus
                      required
                      className="w-full bg-[#FAFBF8] border border-[#DFE3D9] focus:bg-white focus:border-[#739A30] rounded-2xl p-4 text-xl font-bold text-[#11140F] outline-none transition"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#858B80]">
                      ft
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="11"
                      value={heightInStr}
                      onChange={(e) => setHeightInStr(e.target.value)}
                      placeholder="e.g. 9"
                      className="w-full bg-[#FAFBF8] border border-[#DFE3D9] focus:bg-white focus:border-[#739A30] rounded-2xl p-4 text-xl font-bold text-[#11140F] outline-none transition"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#858B80]">
                      in
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-3.5 rounded-full border border-[#D6DBCF] hover:border-[#11140F] text-xs sm:text-sm font-bold text-[#858B80] hover:text-[#11140F] bg-white transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#11140F] hover:bg-[#20251E] active:scale-99 text-white py-4 px-6 rounded-full font-bold text-sm sm:text-base transition shadow-sm cursor-pointer border-0 flex items-center justify-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 text-[#C8F169]" />
              </button>
            </div>
          </form>
        )}

        {/* ----------------- QUESTION 4: WEIGHT ----------------- */}
        {currentStep === 4 && (
          <form onSubmit={handleNextFromWeight} className="p-6 sm:p-7 space-y-5">
            <div>
              <span className="text-xs font-extrabold uppercase text-[#739A30] tracking-wider block mb-1">
                Question 4 of 8
              </span>
              <h2 className="text-2xl sm:text-3xl font-[900] text-[#11140F] m-0 font-heading">
                What is your current weight?
              </h2>
              <p className="text-xs sm:text-sm text-[#858B80] mt-1.5 leading-relaxed m-0">
                Weight calibrates your baseline resting metabolism and daily protein requirements in grams.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex justify-end">
                <div className="bg-[#F0F2EC] rounded-xl p-1 flex items-center">
                  <button
                    type="button"
                    onClick={() => setWeightUnit('kg')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      weightUnit === 'kg' ? 'bg-white text-[#11140F] shadow-xs' : 'text-[#858B80]'
                    }`}
                  >
                    Kilograms (kg)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeightUnit('lb')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      weightUnit === 'lb' ? 'bg-white text-[#11140F] shadow-xs' : 'text-[#858B80]'
                    }`}
                  >
                    Pounds (lb)
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="25"
                  max="400"
                  value={weightStr}
                  onChange={(e) => setWeightStr(e.target.value)}
                  placeholder={weightUnit === 'kg' ? 'e.g. 70' : 'e.g. 154'}
                  autoFocus
                  required
                  className="w-full bg-[#FAFBF8] border border-[#DFE3D9] focus:bg-white focus:border-[#739A30] rounded-2xl p-4 text-xl font-bold text-[#11140F] outline-none transition"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#858B80]">
                  {weightUnit}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-4 py-3.5 rounded-full border border-[#D6DBCF] hover:border-[#11140F] text-xs sm:text-sm font-bold text-[#858B80] hover:text-[#11140F] bg-white transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#11140F] hover:bg-[#20251E] active:scale-99 text-white py-4 px-6 rounded-full font-bold text-sm sm:text-base transition shadow-sm cursor-pointer border-0 flex items-center justify-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 text-[#C8F169]" />
              </button>
            </div>
          </form>
        )}

        {/* ----------------- QUESTION 5: PRIMARY GOAL ----------------- */}
        {currentStep === 5 && (
          <div className="p-6 sm:p-7 space-y-5">
            <div>
              <span className="text-xs font-extrabold uppercase text-[#739A30] tracking-wider block mb-1">
                Question 5 of 8
              </span>
              <h2 className="text-2xl sm:text-3xl font-[900] text-[#11140F] m-0 font-heading">
                What is your primary goal?
              </h2>
              <p className="text-xs sm:text-sm text-[#858B80] mt-1.5 leading-relaxed m-0">
                Select your focus to calibrate daily caloric surplus, maintenance, or deficit and protein targets.
              </p>
            </div>

            <div className="space-y-2.5">
              {goalOptions.map((opt) => {
                const isSelected = goal === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setGoal(opt.id)}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-[#F4F7EE] border-[#739A30] shadow-xs'
                        : 'bg-[#FAFBF8] border-[#E5E8DF] hover:border-[#CBD2C1]'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${
                        isSelected ? 'bg-[#C8F169]' : 'bg-[#EFF2EA]'
                      }`}
                    >
                      {opt.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <strong className="text-sm font-bold text-[#11140F] block">
                        {opt.title}
                      </strong>
                      <p className="text-xs text-[#858B80] leading-relaxed m-0 mt-0.5">
                        {opt.description}
                      </p>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border grid place-items-center shrink-0 mt-1 ${
                        isSelected
                          ? 'border-[#739A30] bg-[#739A30] text-white'
                          : 'border-[#CBD2C1] bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-4 py-3.5 rounded-full border border-[#D6DBCF] hover:border-[#11140F] text-xs sm:text-sm font-bold text-[#858B80] hover:text-[#11140F] bg-white transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNextFromGoal}
                className="flex-1 bg-[#11140F] hover:bg-[#20251E] active:scale-99 text-white py-4 px-6 rounded-full font-bold text-sm sm:text-base transition shadow-sm cursor-pointer border-0 flex items-center justify-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 text-[#C8F169]" />
              </button>
            </div>
          </div>
        )}

        {/* ----------------- QUESTION 6: GENERAL DAILY ACTIVITY ----------------- */}
        {currentStep === 6 && (
          <div className="p-6 sm:p-7 space-y-5">
            <div>
              <span className="text-xs font-extrabold uppercase text-[#739A30] tracking-wider block mb-1">
                Question 6 of 8
              </span>
              <h2 className="text-2xl sm:text-3xl font-[900] text-[#11140F] m-0 font-heading">
                General daily activity
              </h2>
              <p className="text-xs sm:text-sm text-[#858B80] mt-1.5 leading-relaxed m-0">
                How active is your typical day outside of structured workouts? (Factor: 1.2 to 1.9)
              </p>
            </div>

            <div className="space-y-2">
              {activityOptions.map((opt) => {
                const isSelected = activityLevel === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setActivityLevel(opt.id)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-[#F4F7EE] border-[#739A30] shadow-xs'
                        : 'bg-[#FAFBF8] border-[#E5E8DF] hover:border-[#CBD2C1]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border grid place-items-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'border-[#739A30] bg-[#739A30] text-white'
                          : 'border-[#CBD2C1] bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <strong className="text-sm font-bold text-[#11140F]">
                          {opt.title}
                        </strong>
                        <span className="text-[11px] font-semibold text-[#858B80]">
                          ×{opt.factor}
                        </span>
                      </div>
                      <p className="text-xs text-[#858B80] leading-relaxed m-0 mt-0.5">
                        {opt.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="px-4 py-3.5 rounded-full border border-[#D6DBCF] hover:border-[#11140F] text-xs sm:text-sm font-bold text-[#858B80] hover:text-[#11140F] bg-white transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNextFromActivity}
                className="flex-1 bg-[#11140F] hover:bg-[#20251E] active:scale-99 text-white py-4 px-6 rounded-full font-bold text-sm sm:text-base transition shadow-sm cursor-pointer border-0 flex items-center justify-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 text-[#C8F169]" />
              </button>
            </div>
          </div>
        )}

        {/* ----------------- QUESTION 7: EXERCISE ROUTINE ----------------- */}
        {currentStep === 7 && (
          <div className="p-6 sm:p-7 space-y-5">
            <div>
              <span className="text-xs font-extrabold uppercase text-[#739A30] tracking-wider block mb-1">
                Question 7 of 8
              </span>
              <h2 className="text-2xl sm:text-3xl font-[900] text-[#11140F] m-0 font-heading">
                Exercise routine
              </h2>
              <p className="text-xs sm:text-sm text-[#858B80] mt-1.5 leading-relaxed m-0">
                How many days per week do you perform structured resistance training or athletic workouts?
              </p>
            </div>

            <div className="space-y-2">
              {routineOptions.map((opt) => {
                const isSelected = exerciseRoutine === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setExerciseRoutine(opt.id)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-[#F4F7EE] border-[#739A30] shadow-xs'
                        : 'bg-[#FAFBF8] border-[#E5E8DF] hover:border-[#CBD2C1]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border grid place-items-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'border-[#739A30] bg-[#739A30] text-white'
                          : 'border-[#CBD2C1] bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <strong className="text-sm font-bold text-[#11140F] block">
                        {opt.title}
                      </strong>
                      <p className="text-xs text-[#858B80] leading-relaxed m-0 mt-0.5">
                        {opt.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(6)}
                className="px-4 py-3.5 rounded-full border border-[#D6DBCF] hover:border-[#11140F] text-xs sm:text-sm font-bold text-[#858B80] hover:text-[#11140F] bg-white transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNextFromRoutine}
                className="flex-1 bg-[#11140F] hover:bg-[#20251E] active:scale-99 text-white py-4 px-6 rounded-full font-bold text-sm sm:text-base transition shadow-sm cursor-pointer border-0 flex items-center justify-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 text-[#C8F169]" />
              </button>
            </div>
          </div>
        )}

        {/* ----------------- QUESTION 8: DIETARY PREFERENCES ----------------- */}
        {currentStep === 8 && (
          <div className="p-6 sm:p-7 space-y-5">
            <div>
              <span className="text-xs font-extrabold uppercase text-[#739A30] tracking-wider block mb-1">
                Question 8 of 8
              </span>
              <h2 className="text-2xl sm:text-3xl font-[900] text-[#11140F] m-0 font-heading">
                Optional dietary preferences
              </h2>
              <p className="text-xs sm:text-sm text-[#858B80] mt-1.5 leading-relaxed m-0">
                Helps tailor food logging suggestions and protein recommendations.
              </p>
            </div>

            <div className="space-y-2">
              {dietaryOptions.map((opt) => {
                const isSelected = dietaryPreference === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setDietaryPreference(opt.id)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-[#F4F7EE] border-[#739A30] shadow-xs'
                        : 'bg-[#FAFBF8] border-[#E5E8DF] hover:border-[#CBD2C1]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border grid place-items-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'border-[#739A30] bg-[#739A30] text-white'
                          : 'border-[#CBD2C1] bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <strong className="text-sm font-bold text-[#11140F] block">
                        {opt.title}
                      </strong>
                      <p className="text-xs text-[#858B80] leading-relaxed m-0 mt-0.5">
                        {opt.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(7)}
                className="px-4 py-3.5 rounded-full border border-[#D6DBCF] hover:border-[#11140F] text-xs sm:text-sm font-bold text-[#858B80] hover:text-[#11140F] bg-white transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleCalculateAndReview}
                className="flex-1 bg-[#11140F] hover:bg-[#20251E] active:scale-99 text-white py-4 px-6 rounded-full font-bold text-sm sm:text-base transition shadow-sm cursor-pointer border-0 flex items-center justify-center gap-2"
              >
                <span>Calculate My Targets</span>
                <Sparkles className="w-4 h-4 text-[#C8F169]" />
              </button>
            </div>
          </div>
        )}

        {/* ----------------- STEP 9: PERSONALIZED NUTRITION RESULTS ----------------- */}
        {currentStep === 9 && calculatedTargets && (
          <div className="p-6 sm:p-8 space-y-6 animate-in fade-in">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#EFF5E2] rounded-2xl grid place-items-center mx-auto mb-3 text-xl">
                🎯
              </div>
              <h2 className="text-2xl sm:text-3xl font-[900] text-[#11140F] m-0 font-heading tracking-tight uppercase">
                YOUR PERSONALIZED NUTRITION PLAN
              </h2>
              <p className="text-xs sm:text-sm text-[#858B80] mt-1.5 leading-relaxed max-w-sm mx-auto m-0">
                Calibrated for {calculatedTargets.userProfile?.name || 'you'} ({weightStr} {weightUnit}, {ageStr} yrs) to support {calculatedTargets.goalDescription}.
              </p>
            </div>

            {/* Nutrition Targets Grid */}
            <div className="bg-[#11140F] text-white rounded-[24px] p-5 sm:p-6 shadow-xl border border-[#2B3327]">
              <div className="text-center pb-4 mb-4 border-b border-[#2B3327]">
                <span className="text-xs font-extrabold uppercase text-[#A6AD9E] tracking-wider block">
                  Daily Energy Needs (TDEE)
                </span>
                <div className="text-4xl sm:text-5xl font-[900] text-[#C8F169] mt-1 tracking-tight font-heading">
                  {calculatedTargets.calories.toLocaleString()}
                  <span className="text-sm font-normal text-white/80 ml-1.5">kcal / day</span>
                </div>
                {calculatedTargets.rmr && (
                  <span className="text-[11px] text-[#A6AD9E] block mt-1">
                    Estimated RMR: {calculatedTargets.rmr} kcal · TDEE: {calculatedTargets.tdee} kcal
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="bg-[#20251E] border border-[#343A30] rounded-xl p-3">
                  <span className="text-[10px] font-bold text-[#A6AD9E] tracking-wider block">
                    PROTEIN
                  </span>
                  <strong className="text-xl sm:text-2xl font-black text-white mt-1 block font-heading">
                    {calculatedTargets.protein}g
                  </strong>
                  <small className="text-[10px] text-[#A6AD9E] block mt-0.5">
                    {calculatedTargets.protein * 4} kcal
                  </small>
                </div>

                <div className="bg-[#20251E] border border-[#343A30] rounded-xl p-3">
                  <span className="text-[10px] font-bold text-[#A6AD9E] tracking-wider block">
                    CARBS
                  </span>
                  <strong className="text-xl sm:text-2xl font-black text-white mt-1 block font-heading">
                    {calculatedTargets.carbs}g
                  </strong>
                  <small className="text-[10px] text-[#A6AD9E] block mt-0.5">
                    {calculatedTargets.carbs * 4} kcal
                  </small>
                </div>

                <div className="bg-[#20251E] border border-[#343A30] rounded-xl p-3">
                  <span className="text-[10px] font-bold text-[#A6AD9E] tracking-wider block">
                    HEALTHY FATS
                  </span>
                  <strong className="text-xl sm:text-2xl font-black text-white mt-1 block font-heading">
                    {calculatedTargets.fat}g
                  </strong>
                  <small className="text-[10px] text-[#A6AD9E] block mt-0.5">
                    {calculatedTargets.fat * 9} kcal
                  </small>
                </div>
              </div>

              {/* Hydration target banner */}
              <div className="mt-3 pt-3 border-t border-[#2B3327] flex items-center justify-between text-xs text-[#A6AD9E]">
                <span className="flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-[#38BDF8] fill-[#38BDF8]" />
                  <span>Daily Hydration Target:</span>
                </span>
                <strong className="text-white font-bold font-heading text-sm">
                  {calculatedTargets.waterMl || 2500} ml / day (~{Math.round((calculatedTargets.waterMl || 2500) / 250)} glasses)
                </strong>
              </div>
            </div>

            {/* Scientific Explanation & Advisory Note */}
            <div className="bg-[#FAFBF8] border border-[#E5E8DF] rounded-2xl p-4 text-xs text-[#858B80] leading-relaxed space-y-1.5">
              <div className="text-[#11140F] font-bold">Calculation Method:</div>
              <p className="m-0">{calculatedTargets.methodNote}</p>
              <p className="m-0 text-[11px] text-[#858B80]/90 pt-1 border-t border-[#E5E8DF]">
                Note: These figures are estimated nutrition targets, not medical advice. They can be updated or recalculated anytime in your profile settings.
              </p>
            </div>

            {/* BUILD MY DASHBOARD Button */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setCurrentStep(8)}
                className="px-4 py-3.5 rounded-full border border-[#D6DBCF] hover:border-[#11140F] text-xs sm:text-sm font-bold text-[#858B80] hover:text-[#11140F] bg-white transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={handleBuildDashboard}
                className="flex-1 bg-[#C8F169] hover:bg-[#B9E655] active:scale-99 text-[#11140F] py-4 px-6 rounded-full font-[900] text-sm sm:text-base tracking-wide transition shadow-md cursor-pointer border-0 flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>BUILD MY DASHBOARD</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
