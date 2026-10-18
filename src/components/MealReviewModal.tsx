import React, { useState, useEffect } from 'react';
import { MealAnalysisResult, FoodItem, MealCategory, MealEntry } from '../types/nutrition';
import { formatLocalDate } from '../utils/storage';
import {
  Check,
  X,
  AlertCircle,
  Plus,
  Trash2,
  HelpCircle,
  Sparkles,
  Camera,
  Coffee,
  Droplet,
} from 'lucide-react';

interface MealReviewModalProps {
  initialResult: MealAnalysisResult;
  initialMealType: MealCategory;
  initialMealName?: string;
  photoPreviewUrl?: string | null;
  onSaveMeal: (meal: MealEntry) => void;
  onClose: () => void;
}

export const MealReviewModal: React.FC<MealReviewModalProps> = ({
  initialResult,
  initialMealType,
  initialMealName,
  photoPreviewUrl,
  onSaveMeal,
  onClose,
}) => {
  const [mealType, setMealType] = useState<MealCategory>(initialMealType);
  const [mealTitle, setMealTitle] = useState(
    initialMealName ||
      initialResult.foods.map((f) => f.name).join(', ') ||
      'Logged Meal'
  );
  const [foods, setFoods] = useState<FoodItem[]>(initialResult.foods || []);
  const [assumptions, setAssumptions] = useState<string[]>(initialResult.assumptions || []);
  const [keepPhoto, setKeepPhoto] = useState<boolean>(true);
  const [followUpAnswered, setFollowUpAnswered] = useState<string | null>(null);

  // Recalculate totals dynamically from individual foods
  const totalCalories = foods.reduce((acc, f) => acc + (Number(f.calories_kcal) || 0), 0);
  const totalProtein =
    Math.round(foods.reduce((acc, f) => acc + (Number(f.protein_g) || 0), 0) * 10) / 10;
  const totalCarbs =
    Math.round(foods.reduce((acc, f) => acc + (Number(f.carbs_g) || 0), 0) * 10) / 10;
  const totalFat =
    Math.round(foods.reduce((acc, f) => acc + (Number(f.fat_g) || 0), 0) * 10) / 10;

  const handleUpdateFood = (id: string, field: keyof FoodItem, value: any) => {
    setFoods((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        return {
          ...f,
          [field]:
            field === 'calories_kcal' ||
            field === 'protein_g' ||
            field === 'carbs_g' ||
            field === 'fat_g' ||
            field === 'quantity'
              ? Math.max(0, Number(value) || 0)
              : value,
        };
      })
    );
  };

  const handleRemoveFood = (id: string) => {
    setFoods((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAddFood = () => {
    const newItem: FoodItem = {
      id: `custom-item-${Date.now()}`,
      name: 'Additional item',
      quantity: 1,
      portion_description: '1 portion',
      calories_kcal: 100,
      protein_g: 5,
      carbs_g: 12,
      fat_g: 3,
      confidence: 'medium',
    };
    setFoods((prev) => [...prev, newItem]);
  };

  // Quick adjustment handlers for follow-up questions
  const applyAdjustment = (label: string, calDelta: number, fatDelta: number, carbDelta: number) => {
    const adjustmentItem: FoodItem = {
      id: `adj-${Date.now()}`,
      name: label,
      quantity: 1,
      portion_description: 'Adjustment to recipe',
      calories_kcal: calDelta,
      protein_g: 0,
      carbs_g: carbDelta,
      fat_g: fatDelta,
      confidence: 'high',
    };
    setFoods((prev) => [...prev, adjustmentItem]);
    setAssumptions((prev) => [...prev, `Added adjustment: ${label} (+${calDelta} kcal)`]);
    setFollowUpAnswered(label);
  };

  const handleConfirmAndSave = () => {
    if (foods.length === 0) {
      alert('Please have at least one food item in the meal.');
      return;
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = formatLocalDate(now);

    const newMeal: MealEntry = {
      id: `meal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: mealTitle.trim() || 'Logged Meal',
      mealType,
      foods,
      calories: Math.round(totalCalories),
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      timestamp: now.toISOString(),
      timeString,
      dateString,
      photoUrl: keepPhoto && photoPreviewUrl ? photoPreviewUrl : undefined,
      assumptions,
      source: initialResult.source || 'ai',
    };

    onSaveMeal(newMeal);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#11140f]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-[24px] sm:rounded-[28px] max-w-2xl w-full border border-[#cbd2c1] shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#11140f] text-white p-4.5 sm:p-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#c8f169] text-[#11140f] grid place-items-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight text-white m-0">
                Review & Confirm Nutrition
              </h3>
              <p className="text-[#a6ad9e] text-xs m-0 mt-0.5">
                Estimates are approximate. Adjust portions or macros before logging.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#a6ad9e] hover:text-white grid place-items-center transition cursor-pointer border-0"
            aria-label="Close review"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 max-h-[72vh] overflow-y-auto space-y-5">
          {/* Follow-up question banner if prompt needed confirmation */}
          {initialResult.follow_up_question && !followUpAnswered && (
            <div className="bg-[#fff8e5] border border-[#f3d995] rounded-[16px] p-3.5 sm:p-4 text-[#76602b]">
              <div className="flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#b07d0f]" />
                <div className="flex-1 text-xs sm:text-sm">
                  <div className="font-bold text-[#5c4714] mb-1">
                    AI Clarification Question:
                  </div>
                  <p className="m-0 leading-relaxed font-medium">
                    {initialResult.follow_up_question}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => applyAdjustment('Added 1 tsp Cooking Oil/Ghee', 45, 5, 0)}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-[#d8be7c] hover:bg-[#faeed0] text-[#5c4714] transition cursor-pointer flex items-center gap-1"
                    >
                      <Droplet className="w-3 h-3" /> +1 tsp Ghee/Oil (+45 kcal)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyAdjustment('Added 1 tsp Sugar', 20, 0, 5)}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-[#d8be7c] hover:bg-[#faeed0] text-[#5c4714] transition cursor-pointer flex items-center gap-1"
                    >
                      <Coffee className="w-3 h-3" /> +1 tsp Sugar (+20 kcal)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFollowUpAnswered('Standard / No extra additions')}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-[#d8be7c] hover:bg-[#faeed0] text-[#5c4714] transition cursor-pointer"
                    >
                      ✓ Keep current standard estimate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Meal Details Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-[#171a16] mb-1.5 uppercase tracking-wide">
                Meal Name
              </label>
              <input
                type="text"
                value={mealTitle}
                onChange={(e) => setMealTitle(e.target.value)}
                className="w-full bg-[#fafbf8] border border-[#dfe3d9] rounded-xl px-3 py-2 text-sm text-[#171a16] font-semibold focus:outline-none focus:border-[#739a30] focus:ring-2 focus:ring-[#c8f169]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#171a16] mb-1.5 uppercase tracking-wide">
                Category
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as MealCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setMealType(cat)}
                    className={`py-1.5 px-1 rounded-xl text-xs font-bold capitalize transition border text-center ${
                      mealType === cat
                        ? 'bg-[#11140f] text-white border-[#11140f]'
                        : 'bg-[#fafbf8] text-[#73796f] border-[#dfe3d9] hover:border-[#cbd2c1]'
                    }`}
                  >
                    {cat === 'breakfast' ? '🍳 ' : cat === 'lunch' ? '🍛 ' : cat === 'dinner' ? '🍲 ' : '🍎 '}
                    <span className="hidden xs:inline">{cat}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Photo Preview if uploaded */}
          {photoPreviewUrl && (
            <div className="flex items-center gap-3 bg-[#fafbf8] border border-[#e5e8df] rounded-2xl p-2.5">
              <img
                src={photoPreviewUrl}
                alt="Meal uploaded"
                className="w-14 h-14 object-cover rounded-xl border border-[#cbd2c1]"
              />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-[#171a16] block">Meal Photo Scanned</span>
                <label className="flex items-center gap-2 mt-1 text-xs text-[#73796f] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={keepPhoto}
                    onChange={(e) => setKeepPhoto(e.target.checked)}
                    className="accent-[#739a30] rounded"
                  />
                  <span>Save photo preview in today's local log</span>
                </label>
              </div>
            </div>
          )}

          {/* Food Items Breakdown Table/Cards */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-[#171a16] uppercase tracking-wide">
                Detected Food Items ({foods.length})
              </span>
              <button
                type="button"
                onClick={handleAddFood}
                className="text-xs font-bold text-[#4f5d3e] bg-[#f0f4e8] hover:bg-[#e4ebd7] px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer border-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {foods.map((food, idx) => (
                <div
                  key={food.id || idx}
                  className="bg-[#fafbf8] border border-[#e5e8df] rounded-2xl p-3 sm:p-3.5 transition hover:border-[#cbd2c1]"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={food.name}
                        onChange={(e) => handleUpdateFood(food.id, 'name', e.target.value)}
                        placeholder="Food name"
                        className="w-full bg-transparent font-bold text-sm text-[#171a16] border-0 border-b border-transparent focus:border-[#739a30] focus:outline-none px-0 py-0.5"
                      />
                      <input
                        type="text"
                        value={food.portion_description}
                        onChange={(e) =>
                          handleUpdateFood(food.id, 'portion_description', e.target.value)
                        }
                        placeholder="Portion description (e.g. 1 medium roti)"
                        className="w-full bg-transparent text-xs text-[#73796f] border-0 border-b border-transparent focus:border-[#739a30] focus:outline-none px-0 py-0.5"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          food.confidence === 'high'
                            ? 'bg-[#c8f169]/30 text-[#425e17]'
                            : food.confidence === 'medium'
                            ? 'bg-[#fff2c2] text-[#765d13]'
                            : 'bg-[#ffdede] text-[#912525]'
                        }`}
                      >
                        {food.confidence || 'approx'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFood(food.id)}
                        className="text-[#9aa192] hover:text-[#d33] transition p-1 bg-transparent border-0 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Macro Inputs for this Item */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#edf0e9]">
                    <div>
                      <span className="block text-[10px] text-[#73796f] font-semibold mb-0.5">
                        Calories (kcal)
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={food.calories_kcal}
                        onChange={(e) =>
                          handleUpdateFood(food.id, 'calories_kcal', e.target.value)
                        }
                        className="w-full bg-white border border-[#dfe3d9] rounded-lg px-2 py-1 text-xs font-bold text-[#171a16]"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-[#73796f] font-semibold mb-0.5">
                        Protein (g)
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={food.protein_g}
                        onChange={(e) =>
                          handleUpdateFood(food.id, 'protein_g', e.target.value)
                        }
                        className="w-full bg-white border border-[#dfe3d9] rounded-lg px-2 py-1 text-xs font-bold text-[#171a16]"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-[#73796f] font-semibold mb-0.5">
                        Carbs (g)
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={food.carbs_g}
                        onChange={(e) =>
                          handleUpdateFood(food.id, 'carbs_g', e.target.value)
                        }
                        className="w-full bg-white border border-[#dfe3d9] rounded-lg px-2 py-1 text-xs font-bold text-[#171a16]"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-[#73796f] font-semibold mb-0.5">
                        Fat (g)
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={food.fat_g}
                        onChange={(e) =>
                          handleUpdateFood(food.id, 'fat_g', e.target.value)
                        }
                        className="w-full bg-white border border-[#dfe3d9] rounded-lg px-2 py-1 text-xs font-bold text-[#171a16]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assumptions Notice */}
          {assumptions.length > 0 && (
            <div className="bg-[#f5f6f1] border border-[#e5e8df] rounded-2xl p-3 text-xs text-[#73796f]">
              <strong className="text-[#171a16] block mb-1">AI Nutritional Assumptions:</strong>
              <ul className="list-disc list-inside space-y-0.5 m-0 p-0 text-[11px]">
                {assumptions.map((ass, i) => (
                  <li key={i}>{ass}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Dynamic Recalculated Totals Summary */}
          <div className="bg-[#11140f] text-white rounded-2xl p-4">
            <div className="text-xs text-[#a6ad9e] font-bold uppercase tracking-wider mb-2">
              Recalculated Meal Totals
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-[#20251e] rounded-xl p-2">
                <span className="block text-[10px] text-[#a6ad9e]">CALORIES</span>
                <strong className="text-lg font-black text-white">{Math.round(totalCalories)}</strong>
                <span className="block text-[10px] text-[#a6ad9e]">kcal</span>
              </div>
              <div className="bg-[#20251e] rounded-xl p-2">
                <span className="block text-[10px] text-[#a6ad9e]">PROTEIN</span>
                <strong className="text-lg font-black text-[#c8f169]">{totalProtein}</strong>
                <span className="block text-[10px] text-[#a6ad9e]">g</span>
              </div>
              <div className="bg-[#20251e] rounded-xl p-2">
                <span className="block text-[10px] text-[#a6ad9e]">CARBS</span>
                <strong className="text-lg font-black text-white">{totalCarbs}</strong>
                <span className="block text-[10px] text-[#a6ad9e]">g</span>
              </div>
              <div className="bg-[#20251e] rounded-xl p-2">
                <span className="block text-[10px] text-[#a6ad9e]">FAT</span>
                <strong className="text-lg font-black text-white">{totalFat}</strong>
                <span className="block text-[10px] text-[#a6ad9e]">g</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-[#fafbf8] border-t border-[#e5e8df] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-full border border-[#d6dbcf] hover:border-[#171a16] text-[#73796f] hover:text-[#171a16] text-xs sm:text-sm font-bold bg-white transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmAndSave}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#c8f169] hover:bg-[#b9e655] text-[#11140f] px-6 py-2.5 rounded-full text-sm font-extrabold transition shadow-sm cursor-pointer border-0"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Confirm & Add to Today's Log +</span>
          </button>
        </div>
      </div>
    </div>
  );
};
