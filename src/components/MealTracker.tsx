import React, { useState, useRef, useEffect } from 'react';
import { MealCategory, MealAnalysisResult, MealEntry } from '../types/nutrition';
import { estimateMealLocally } from '../utils/localEstimator';
import {
  Camera,
  UploadCloud,
  Sparkles,
  Pencil,
  Zap,
  Loader2,
  Info,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  X,
} from 'lucide-react';

interface MealTrackerProps {
  onAnalysisSuccess: (
    result: MealAnalysisResult,
    mealType: MealCategory,
    mealName?: string,
    photoDataUrl?: string | null
  ) => void;
  onDirectLog: (meal: MealEntry) => void;
  onShowToast: (msg: string) => void;
  selectedTab?: 'text' | 'photo' | 'manual';
  onTabChange?: (tab: 'text' | 'photo' | 'manual') => void;
}

export const MealTracker: React.FC<MealTrackerProps> = ({
  onAnalysisSuccess,
  onDirectLog,
  onShowToast,
  selectedTab,
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'photo' | 'manual'>(selectedTab || 'text');
  const [mealType, setMealType] = useState<MealCategory>('lunch');

  useEffect(() => {
    if (selectedTab) {
      setActiveTab(selectedTab);
    }
  }, [selectedTab]);

  // Text state
  const [mealText, setMealText] = useState('');

  // Photo state
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoMimeType, setPhotoMimeType] = useState<string>('image/jpeg');
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const [photoNotes, setPhotoNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Manual state
  const [manualName, setManualName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sample quick chips for fast testing
  const quickMealChips = [
    { label: '2 Boiled Eggs & 1 Roti', text: '2 boiled eggs, 1 medium roti, 1 cup of chai with milk' },
    { label: 'Chicken Biryani + Raita', text: '1 plate chicken biryani (~1.5 cups) with 1 small bowl cucumber raita' },
    { label: 'Daal Chana & Rice', text: '1 bowl daal chana (tadka) and 1 cup cooked basmati rice' },
    { label: 'Paratha & Omelette + Chai', text: '1 plain paratha, 2 egg omelette with onions, 1 cup doodh patti chai' },
    { label: 'Chicken Karahi & 2 Rotis', text: '1 serving chicken karahi (approx 180g) and 2 whole wheat rotis' },
    { label: 'Oatmeal & Banana + Whey', text: '1 bowl oatmeal cooked in milk, 1 medium banana, 1 scoop whey protein' },
  ];

  // Handle Photo selection
  const handlePhotoSelect = (file: File) => {
    setErrorMsg(null);
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Please select a valid image file (JPG, PNG, or WEBP).');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 12MB. Please upload a smaller photo.');
      return;
    }

    setPhotoMimeType(file.type);
    setPhotoFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoDataUrl(e.target?.result as string);
      onShowToast('Photo loaded! Review notes or tap Analyze with AI.');
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => {
    setPhotoDataUrl(null);
    setPhotoFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Run AI Analysis via Server
  const handleAnalyzeWithAI = async (mode: 'text' | 'photo') => {
    setErrorMsg(null);

    if (mode === 'text' && !mealText.trim()) {
      setErrorMsg('Please describe what you ate before analyzing.');
      return;
    }

    if (mode === 'photo' && !photoDataUrl) {
      setErrorMsg('Please select or capture a photo of your meal first.');
      return;
    }

    setIsLoading(true);
    setLoadingStep(
      mode === 'photo'
        ? 'Scanning meal photo with Gemini Vision AI...'
        : 'Interpreting foods & verified food composition data...'
    );

    try {
      const payload: any = {
        mealType,
      };

      if (mode === 'photo') {
        payload.imageBase64 = photoDataUrl;
        payload.mimeType = photoMimeType;
        payload.userNotes = photoNotes.trim() || undefined;
      } else {
        payload.text = mealText.trim();
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 28000);

      try {
        const response = await fetch('/api/analyze-meal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const json = await response.json();

        if (!response.ok || !json.success) {
          throw new Error(json.error || 'Server could not analyze meal.');
        }

        const successToast =
          json.data?.source === 'fallback'
            ? 'Estimated using verified regional food composition tables.'
            : 'Meal analyzed with Gemini AI! Review and confirm.';
        onShowToast(successToast);
        onAnalysisSuccess(
          json.data,
          mealType,
          mode === 'text' ? mealText.slice(0, 60) : photoNotes.slice(0, 60) || 'Scanned Meal',
          mode === 'photo' ? photoDataUrl : null
        );
      } catch (fetchErr: any) {
        clearTimeout(timeoutId);
        // If aborted or server error, offer instant local estimation fallback
        console.warn('AI analysis request issue, falling back:', fetchErr);
        const fallbackText = mode === 'text' ? mealText.trim() : photoNotes.trim() || 'Meal item';
        const fallbackResult = estimateMealLocally(fallbackText);
        onShowToast('Estimated using verified regional food composition tables.');
        onAnalysisSuccess(
          fallbackResult,
          mealType,
          fallbackText.slice(0, 60),
          mode === 'photo' ? photoDataUrl : null
        );
      }
    } catch (err: any) {
      console.warn('AI analysis request failed:', err);
      const errMessage = err?.message || 'Could not reach AI service.';
      setErrorMsg(
        `${errMessage} You can estimate locally using our verified food database or enter values manually.`
      );
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // Instant Local Estimation Fallback
  const handleEstimateLocally = () => {
    setErrorMsg(null);
    const targetText = activeTab === 'photo' ? photoNotes.trim() : mealText.trim();

    if (!targetText) {
      setErrorMsg('Please enter a description for local estimation.');
      return;
    }

    const localResult = estimateMealLocally(targetText);
    onShowToast('Estimated using verified regional food composition standards.');
    onAnalysisSuccess(
      localResult,
      mealType,
      targetText.slice(0, 60),
      activeTab === 'photo' ? photoDataUrl : null
    );
  };

  // Direct manual logging
  const handleDirectManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    const name = manualName.trim();
    const cal = Number(manualCalories);
    const prot = Number(manualProtein);
    const carb = manualCarbs ? Number(manualCarbs) : Math.round((cal * 0.45) / 4);
    const fat = manualFat ? Number(manualFat) : Math.round((cal * 0.25) / 9);

    if (!name) {
      setErrorMsg('Please enter a meal name.');
      return;
    }

    if (!manualCalories || isNaN(cal) || cal < 0) {
      setErrorMsg('Please enter valid calories.');
      return;
    }

    if (!manualProtein || isNaN(prot) || prot < 0) {
      setErrorMsg('Please enter valid protein.');
      return;
    }

    const now = new Date();
    const newMeal: MealEntry = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      mealType,
      foods: [
        {
          id: `manual-food-${Date.now()}`,
          name,
          quantity: 1,
          portion_description: '1 meal portion',
          calories_kcal: Math.round(cal),
          protein_g: Math.round(prot * 10) / 10,
          carbs_g: Math.round(carb * 10) / 10,
          fat_g: Math.round(fat * 10) / 10,
          confidence: 'high',
        },
      ],
      calories: Math.round(cal),
      protein: Math.round(prot * 10) / 10,
      carbs: Math.round(carb * 10) / 10,
      fat: Math.round(fat * 10) / 10,
      timestamp: now.toISOString(),
      timeString: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dateString: now.toISOString().slice(0, 10),
      source: 'manual',
    };

    onDirectLog(newMeal);
    setManualName('');
    setManualCalories('');
    setManualProtein('');
    setManualCarbs('');
    setManualFat('');
    onShowToast('Meal added directly to today’s log!');
  };

  return (
    <section className="bg-white border border-[#e5e8df] rounded-[24px] sm:rounded-[28px] p-4.5 sm:p-7 shadow-xl">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#eff5e2] text-[#4f5d3e] font-extrabold grid place-items-center text-sm">
            ➕
          </span>
          <h3 className="m-0 text-base sm:text-lg font-black text-[#171a16] tracking-tight">
            Log a Meal
          </h3>
        </div>

        {/* Meal Category Switcher */}
        <div className="flex items-center bg-[#f0f2ec] p-1 rounded-xl">
          {(['breakfast', 'lunch', 'dinner', 'snack'] as MealCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setMealType(cat)}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition capitalize cursor-pointer border-0 ${
                mealType === cat
                  ? 'bg-white text-[#171a16] shadow-2xs font-extrabold'
                  : 'text-[#72796b] hover:text-[#171a16] bg-transparent'
              }`}
            >
              {cat === 'breakfast' ? '🍳' : cat === 'lunch' ? '🍛' : cat === 'dinner' ? '🍲' : '🍎'}{' '}
              <span className="hidden xs:inline">{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-3 gap-1.5 bg-[#f0f2ec] p-1.5 rounded-[16px] mb-5">
        <button
          type="button"
          onClick={() => {
            setActiveTab('text');
            setErrorMsg(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-[12px] text-xs sm:text-sm font-extrabold transition cursor-pointer border-0 ${
            activeTab === 'text'
              ? 'bg-white text-[#171a16] shadow-sm'
              : 'text-[#72796b] hover:text-[#171a16] bg-transparent'
          }`}
        >
          <Pencil className="w-3.5 h-3.5 text-[#739a30]" />
          <span>Describe Meal</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('photo');
            setErrorMsg(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-[12px] text-xs sm:text-sm font-extrabold transition cursor-pointer border-0 ${
            activeTab === 'photo'
              ? 'bg-white text-[#171a16] shadow-sm'
              : 'text-[#72796b] hover:text-[#171a16] bg-transparent'
          }`}
        >
          <Camera className="w-3.5 h-3.5 text-[#739a30]" />
          <span>Photo Scanner</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('manual');
            setErrorMsg(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-[12px] text-xs sm:text-sm font-extrabold transition cursor-pointer border-0 ${
            activeTab === 'manual'
              ? 'bg-white text-[#171a16] shadow-sm'
              : 'text-[#72796b] hover:text-[#171a16] bg-transparent'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-[#739a30]" />
          <span>Quick Manual</span>
        </button>
      </div>

      {/* ERROR BANNER */}
      {errorMsg && (
        <div className="bg-[#fff1f1] border border-[#f5c6c6] text-[#a52a2a] rounded-2xl p-3.5 mb-4 text-xs sm:text-sm flex items-start justify-between gap-2.5 animate-in fade-in">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#d32f2f]" />
            <div className="leading-snug">{errorMsg}</div>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-[#a52a2a] hover:opacity-75 cursor-pointer border-0 bg-transparent p-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB A: TEXT ENTRY */}
      {activeTab === 'text' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-[#171a16] mb-1.5 uppercase tracking-wide">
              What did you eat?
            </label>
            <textarea
              value={mealText}
              onChange={(e) => setMealText(e.target.value)}
              placeholder="e.g. 2 boiled eggs, 2 medium potatoes and 1 cup of chai with milk"
              rows={3}
              className="w-full border border-[#dfe3d9] rounded-2xl p-3.5 text-sm sm:text-base text-[#171a16] bg-[#fafbf8] placeholder:text-[#9aa192] focus:bg-white focus:outline-none focus:border-[#739a30] focus:ring-3 focus:ring-[#c8f169]/30 transition resize-y"
            />
            <div className="text-[11px] text-[#73796f] mt-1.5 flex items-center justify-between">
              <span>Tip: specify count, portion, and cooking method (e.g. boiled, fried with ghee).</span>
              {mealText && (
                <button
                  type="button"
                  onClick={() => setMealText('')}
                  className="text-[#73796f] hover:text-[#171a16] underline bg-transparent border-0 cursor-pointer p-0"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Quick Pakistani & healthy dish chips */}
          <div>
            <span className="block text-[11px] font-bold text-[#73796f] mb-1.5 uppercase tracking-wide">
              Quick Pakistani & everyday meal presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickMealChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMealText(chip.text)}
                  className="text-xs bg-[#f4f6ef] hover:bg-[#e9eee0] active:scale-98 text-[#414d33] font-semibold px-2.5 py-1.5 rounded-full border border-[#dce3d2] transition cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr] gap-2.5 pt-2">
            <button
              type="button"
              disabled={isLoading || !mealText.trim()}
              onClick={() => handleAnalyzeWithAI('text')}
              className="flex items-center justify-center gap-2 bg-[#11140f] hover:bg-[#20251e] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 px-5 rounded-2xl font-extrabold text-sm transition shadow-sm cursor-pointer border-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#c8f169]" />
                  <span>{loadingStep || 'Analyzing with AI...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#c8f169]" />
                  <span>Analyze Meal with AI ↗</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isLoading || !mealText.trim()}
              onClick={handleEstimateLocally}
              className="flex items-center justify-center gap-1.5 bg-[#f4f6ef] hover:bg-[#e9eee0] disabled:opacity-50 text-[#171a16] py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm border border-[#d6dbcf] transition cursor-pointer"
            >
              <span>Instant Local Estimate</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB B: PHOTO SCANNER */}
      {activeTab === 'photo' && (
        <div className="space-y-4">
          {/* Hidden file inputs */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePhotoSelect(file);
            }}
            className="hidden"
          />
          <input
            type="file"
            ref={cameraInputRef}
            accept="image/*"
            capture="environment"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePhotoSelect(file);
            }}
            className="hidden"
          />

          {!photoDataUrl ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handlePhotoSelect(file);
              }}
              className="border-2 border-dashed border-[#cbd2c1] hover:border-[#91b94b] bg-[#fafbf8] rounded-2xl p-6 sm:p-8 text-center transition flex flex-col items-center justify-center gap-3 relative cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-14 h-14 rounded-2xl bg-[#eff5e2] text-[#4f5d3e] grid place-items-center text-2xl shadow-2xs">
                📷
              </div>
              <div>
                <strong className="block text-sm sm:text-base font-bold text-[#171a16]">
                  Tap to upload a meal photo
                </strong>
                <p className="text-xs text-[#73796f] mt-1 mb-0">
                  JPG, PNG or WEBP · Smartphone cameras supported
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-full bg-white border border-[#d6dbcf] hover:border-[#171a16] text-xs font-bold text-[#171a16] transition cursor-pointer shadow-2xs"
                >
                  Browse gallery
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-full bg-[#11140f] hover:bg-[#20251e] text-xs font-bold text-white transition cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <Camera className="w-3.5 h-3.5 text-[#c8f169]" />
                  <span>Take photo</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#fafbf8] border border-[#dfe3d9] rounded-2xl p-3.5 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-full sm:w-36 h-36 rounded-xl overflow-hidden bg-black shrink-0 border border-[#cbd2c1]">
                <img
                  src={photoDataUrl}
                  alt="Selected meal preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 hover:bg-black text-white grid place-items-center text-xs transition cursor-pointer border-0"
                  title="Remove image"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 w-full text-left">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-extrabold text-[#171a16] truncate">
                    {photoFileName || 'Photo selected'}
                  </span>
                  <button
                    type="button"
                    onClick={clearPhoto}
                    className="text-xs text-[#912525] hover:underline bg-transparent border-0 p-0 cursor-pointer"
                  >
                    Change photo
                  </button>
                </div>
                <p className="text-[11px] text-[#73796f] m-0 mb-2">
                  Image ready for Gemini Vision analysis. You can add notes below to guide portion estimates.
                </p>

                <input
                  type="text"
                  value={photoNotes}
                  onChange={(e) => setPhotoNotes(e.target.value)}
                  placeholder="Optional notes (e.g. 1 plate chicken biryani, medium bowl raita)"
                  className="w-full bg-white border border-[#dfe3d9] rounded-xl px-3 py-2 text-xs font-medium text-[#171a16] focus:outline-none focus:border-[#739a30]"
                />
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-1">
            <button
              type="button"
              disabled={isLoading || !photoDataUrl}
              onClick={() => handleAnalyzeWithAI('photo')}
              className="w-full flex items-center justify-center gap-2 bg-[#11140f] hover:bg-[#20251e] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 px-5 rounded-2xl font-extrabold text-sm sm:text-base transition shadow-sm cursor-pointer border-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-[#c8f169]" />
                  <span>{loadingStep || 'Scanning meal with Gemini Vision...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-[#c8f169]" />
                  <span>Scan Meal with Gemini AI ↗</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-[#fff8e5] border border-[#f3d995] rounded-xl p-3 text-[11px] text-[#76602b] flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 text-[#b07d0f] mt-0.5" />
            <div>
              <strong>Transparent by design:</strong> Vision models estimate portions from visual cues and standard recipe composition. You can review and adjust any number before logging.
            </div>
          </div>
        </div>
      )}

      {/* TAB C: QUICK MANUAL LOG */}
      {activeTab === 'manual' && (
        <form onSubmit={handleDirectManualLog} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-[#171a16] mb-1 uppercase tracking-wide">
              Meal Name
            </label>
            <input
              type="text"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              placeholder="e.g. 2 Boiled Eggs & Chai"
              className="w-full border border-[#dfe3d9] rounded-xl p-2.5 text-sm bg-[#fafbf8] text-[#171a16] focus:bg-white focus:outline-none focus:border-[#739a30]"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-[11px] font-extrabold text-[#171a16] mb-1">
                Calories (kcal) *
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={manualCalories}
                onChange={(e) => setManualCalories(e.target.value)}
                placeholder="e.g. 320"
                className="w-full border border-[#dfe3d9] rounded-xl p-2.5 text-sm bg-white font-bold text-[#171a16] focus:outline-none focus:border-[#739a30]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-extrabold text-[#171a16] mb-1">
                Protein (g) *
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={manualProtein}
                onChange={(e) => setManualProtein(e.target.value)}
                placeholder="e.g. 18.5"
                className="w-full border border-[#dfe3d9] rounded-xl p-2.5 text-sm bg-white font-bold text-[#171a16] focus:outline-none focus:border-[#739a30]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-extrabold text-[#171a16] mb-1">
                Carbs (g)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={manualCarbs}
                onChange={(e) => setManualCarbs(e.target.value)}
                placeholder="e.g. 35"
                className="w-full border border-[#dfe3d9] rounded-xl p-2.5 text-sm bg-white font-bold text-[#171a16] focus:outline-none focus:border-[#739a30]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-extrabold text-[#171a16] mb-1">
                Fat (g)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={manualFat}
                onChange={(e) => setManualFat(e.target.value)}
                placeholder="e.g. 12"
                className="w-full border border-[#dfe3d9] rounded-xl p-2.5 text-sm bg-white font-bold text-[#171a16] focus:outline-none focus:border-[#739a30]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#c8f169] hover:bg-[#b9e655] active:scale-99 text-[#171a16] py-3.5 px-5 rounded-2xl font-extrabold text-sm sm:text-base transition shadow-sm cursor-pointer border-0 flex items-center justify-center gap-2 mt-2"
          >
            <span>Log Meal Directly +</span>
          </button>
        </form>
      )}
    </section>
  );
};
