import React, { useState } from 'react';
import { MealEntry, DailyTargets, MealCategory } from '../types/nutrition';
import { formatLocalDate, formatDisplayDate, DaySummary, exportUserDataJSON } from '../utils/storage';
import { WaterTracker } from './WaterTracker';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  Dumbbell,
  Clock,
  Trash2,
  Pencil,
  Download,
  Eye,
  Camera,
  PenTool,
  Zap,
  Plus,
  Heart,
  TrendingUp,
  Award,
  Droplet,
} from 'lucide-react';

interface DailyDashboardProps {
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  meals: MealEntry[];
  targets: DailyTargets;
  past7Days: DaySummary[];
  onDeleteMeal: (mealId: string) => void;
  onEditMeal: (meal: MealEntry) => void;
  onClearDateMeals: () => void;
  onQuickAction: (tab: 'photo' | 'text' | 'manual') => void;
  userName?: string;
  userId?: string;
  waterMl?: number;
  onAddWater?: (deltaMl: number) => void;
  onResetWater?: () => void;
  onOpenWeeklyReport?: () => void;
}

export const DailyDashboard: React.FC<DailyDashboardProps> = ({
  selectedDate,
  onSelectDate,
  meals,
  targets,
  past7Days,
  onDeleteMeal,
  onEditMeal,
  onClearDateMeals,
  onQuickAction,
  userName = 'My Profile',
  userId = '',
  waterMl = 0,
  onAddWater,
  onResetWater,
  onOpenWeeklyReport,
}) => {
  const [photoModalUrl, setPhotoModalUrl] = useState<string | null>(null);

  // Compute daily totals - ensure no double counting by strict set of meal IDs
  const uniqueMeals = Array.from(new Map(meals.map((m) => [m.id, m])).values());

  const totalCalories = uniqueMeals.reduce((acc, m) => acc + (Number(m.calories) || 0), 0);
  const totalProtein = Math.round(uniqueMeals.reduce((acc, m) => acc + (Number(m.protein) || 0), 0) * 10) / 10;
  const totalCarbs = Math.round(uniqueMeals.reduce((acc, m) => acc + (Number(m.carbs) || 0), 0) * 10) / 10;
  const totalFat = Math.round(uniqueMeals.reduce((acc, m) => acc + (Number(m.fat) || 0), 0) * 10) / 10;

  // Percentage calculations
  const calPercent = Math.min(100, Math.round((totalCalories / Math.max(1, targets.calories)) * 100));
  const proteinPercent = Math.min(100, Math.round((totalProtein / Math.max(1, targets.protein)) * 100));
  const carbsPercent = Math.min(100, Math.round((totalCarbs / Math.max(1, targets.carbs)) * 100));
  const fatPercent = Math.min(100, Math.round((totalFat / Math.max(1, targets.fat)) * 100));

  // Dynamic remaining amounts: Remaining = max(0, daily target - amount consumed)
  const calRemaining = Math.max(0, targets.calories - totalCalories);
  const proteinRemaining = Math.max(0, Math.round((targets.protein - totalProtein) * 10) / 10);
  const carbsRemaining = Math.max(0, Math.round((targets.carbs - totalCarbs) * 10) / 10);
  const fatRemaining = Math.max(0, Math.round((targets.fat - totalFat) * 10) / 10);

  // Overage if consumption exceeds target
  const calOverage = Math.max(0, totalCalories - targets.calories);
  const proteinOverage = Math.max(0, Math.round((totalProtein - targets.protein) * 10) / 10);
  const carbsOverage = Math.max(0, Math.round((totalCarbs - targets.carbs) * 10) / 10);
  const fatOverage = Math.max(0, Math.round((totalFat - targets.fat) * 10) / 10);

  // Date shifting
  const shiftDate = (deltaDays: number) => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + deltaDays);
    onSelectDate(formatLocalDate(date));
  };

  const isToday = selectedDate === formatLocalDate();

  // Group meals by category
  const categories: { key: MealCategory; label: string; icon: string }[] = [
    { key: 'breakfast', label: 'Breakfast', icon: '🍳' },
    { key: 'lunch', label: 'Lunch', icon: '🍛' },
    { key: 'dinner', label: 'Dinner', icon: '🍲' },
    { key: 'snack', label: 'Snacks', icon: '🍎' },
  ];

  const mealsByCategory: Record<MealCategory, MealEntry[]> = {
    breakfast: uniqueMeals.filter((m) => m.mealType === 'breakfast'),
    lunch: uniqueMeals.filter((m) => m.mealType === 'lunch'),
    dinner: uniqueMeals.filter((m) => m.mealType === 'dinner'),
    snack: uniqueMeals.filter((m) => m.mealType === 'snack'),
  };

  return (
    <div className="space-y-6">
      {/* Date Navigation & Controls */}
      <div className="bg-white border border-[#E5E8DF] rounded-[22px] p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shiftDate(-1)}
            className="w-8 h-8 rounded-full border border-[#D6DBCF] hover:border-[#11140F] text-[#11140F] grid place-items-center transition cursor-pointer bg-white"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F5F6F1] rounded-xl text-xs sm:text-sm font-extrabold text-[#11140F]">
            <Calendar className="w-4 h-4 text-[#739A30]" />
            <span>{formatDisplayDate(selectedDate)}</span>
            <span className="text-xs text-[#858B80] font-normal hidden sm:inline">
              ({selectedDate})
            </span>
          </div>

          <button
            type="button"
            onClick={() => shiftDate(1)}
            disabled={isToday}
            className="w-8 h-8 rounded-full border border-[#D6DBCF] hover:border-[#11140F] text-[#11140F] disabled:opacity-30 disabled:cursor-not-allowed grid place-items-center transition cursor-pointer bg-white"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {!isToday && (
            <button
              type="button"
              onClick={() => onSelectDate(formatLocalDate())}
              className="text-xs font-bold text-[#4F5D3E] bg-[#EFF5E2] hover:bg-[#E4EBD7] px-2.5 py-1.5 rounded-lg transition cursor-pointer border-0"
            >
              Today
            </button>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {onOpenWeeklyReport && (
            <button
              type="button"
              onClick={onOpenWeeklyReport}
              className="px-3.5 py-1.5 rounded-xl bg-[#11140F] text-[#C8F169] hover:bg-[#20251E] text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer border-0 shadow-2xs"
              title="Open 7-day nutritional summary report"
            >
              <Award className="w-3.5 h-3.5 text-[#C8F169]" />
              <span>Weekly Summary</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => exportUserDataJSON(userId, userName)}
            className="px-3 py-1.5 rounded-xl border border-[#D6DBCF] hover:border-[#11140F] text-xs font-bold text-[#858B80] hover:text-[#11140F] transition bg-white flex items-center gap-1 cursor-pointer"
            title="Export this profile data as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {uniqueMeals.length > 0 && (
            <button
              type="button"
              onClick={onClearDateMeals}
              className="px-3 py-1.5 rounded-xl border border-[#F0C2C2] hover:bg-[#FFF5F5] text-xs font-bold text-[#B92A2A] transition bg-white flex items-center gap-1 cursor-pointer"
              title="Clear meals for this date"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Day</span>
            </button>
          )}
        </div>
      </div>

      {/* Prominent Action Bar: Scan a Meal, Describe a Meal, Log Manually */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={() => onQuickAction('photo')}
          className="bg-[#11140F] hover:bg-[#20251E] active:scale-99 text-white p-3.5 sm:p-4 rounded-[18px] transition shadow-sm flex items-center justify-between cursor-pointer border-0 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C8F169] text-[#11140F] grid place-items-center">
              <Camera className="w-4 h-4" />
            </div>
            <div className="text-left">
              <strong className="block text-sm font-bold text-white group-hover:text-[#C8F169] transition">
                Scan a Meal
              </strong>
              <span className="text-[11px] text-[#A6AD9E]">Photo AI vision estimate</span>
            </div>
          </div>
          <span className="text-[#C8F169] font-black text-sm">↗</span>
        </button>

        <button
          type="button"
          onClick={() => onQuickAction('text')}
          className="bg-white hover:bg-[#FAFBF8] border border-[#E5E8DF] hover:border-[#CBD2C1] active:scale-99 text-[#11140F] p-3.5 sm:p-4 rounded-[18px] transition shadow-2xs flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EFF5E2] text-[#4F5D3E] grid place-items-center">
              <PenTool className="w-4 h-4" />
            </div>
            <div className="text-left">
              <strong className="block text-sm font-bold text-[#11140F]">
                Describe a Meal
              </strong>
              <span className="text-[11px] text-[#858B80]">Natural plain language</span>
            </div>
          </div>
          <span className="text-[#739A30] font-black text-sm">↗</span>
        </button>

        <button
          type="button"
          onClick={() => onQuickAction('manual')}
          className="bg-white hover:bg-[#FAFBF8] border border-[#E5E8DF] hover:border-[#CBD2C1] active:scale-99 text-[#11140F] p-3.5 sm:p-4 rounded-[18px] transition shadow-2xs flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F0F2EC] text-[#11140F] grid place-items-center">
              <Zap className="w-4 h-4 text-[#739A30]" />
            </div>
            <div className="text-left">
              <strong className="block text-sm font-bold text-[#11140F]">
                Log Food Manually
              </strong>
              <span className="text-[11px] text-[#858B80]">Direct calorie entry</span>
            </div>
          </div>
          <span className="text-[#739A30] font-black text-sm">↗</span>
        </button>
      </div>

      {/* ---------------- 4 PRIMARY NUTRITION CARDS ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Calories Consumed / Target */}
        <div className="bg-white border border-[#E5E8DF] rounded-[24px] p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-black uppercase text-[#858B80] tracking-wider">
              Daily Calories
            </span>
            <span className="text-xs font-black text-[#11140F] bg-[#F0F2EC] px-2 py-0.5 rounded-full">
              {calPercent}%
            </span>
          </div>

          <div className="text-2xl sm:text-3xl font-[900] text-[#11140F] tracking-tight font-heading">
            {totalCalories.toLocaleString()}
            <span className="text-xs text-[#858B80] font-normal ml-1">/ {targets.calories.toLocaleString()} kcal</span>
          </div>

          {/* Progress Indicator */}
          <div className="h-2.5 bg-[#F0F2EC] rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                totalCalories > targets.calories ? 'bg-[#E58A2D]' : 'bg-[#C8F169]'
              }`}
              style={{ width: `${Math.max(4, calPercent)}%` }}
            />
          </div>

          <div className="text-xs text-[#858B80] mt-3 flex justify-between items-center">
            <span>Remaining:</span>
            {calOverage > 0 ? (
              <span className="text-[#E58A2D] font-bold">+{calOverage.toLocaleString()} kcal over</span>
            ) : (
              <strong className="text-[#11140F] font-bold">
                {calRemaining.toLocaleString()} kcal
              </strong>
            )}
          </div>
        </div>

        {/* Card 2: Protein Consumed / Target */}
        <div className="bg-white border border-[#E5E8DF] rounded-[24px] p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-black uppercase text-[#858B80] tracking-wider">
              Protein
            </span>
            <span className="text-xs font-black text-[#4F5D3E] bg-[#EFF5E2] px-2 py-0.5 rounded-full">
              {proteinPercent}%
            </span>
          </div>

          <div className="text-2xl sm:text-3xl font-[900] text-[#11140F] tracking-tight font-heading">
            {totalProtein}g
            <span className="text-xs text-[#858B80] font-normal ml-1">/ {targets.protein}g</span>
          </div>

          {/* Progress Indicator */}
          <div className="h-2.5 bg-[#F0F2EC] rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-[#8FB83F] rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, proteinPercent)}%` }}
            />
          </div>

          <div className="text-xs text-[#858B80] mt-3 flex justify-between items-center">
            <span>Remaining:</span>
            {proteinOverage > 0 ? (
              <span className="text-[#4F5D3E] font-bold">+{proteinOverage}g over</span>
            ) : (
              <strong className="text-[#11140F] font-bold">
                {proteinRemaining}g
              </strong>
            )}
          </div>
        </div>

        {/* Card 3: Carbohydrates Consumed / Target */}
        <div className="bg-white border border-[#E5E8DF] rounded-[24px] p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-black uppercase text-[#858B80] tracking-wider">
              Carbohydrates
            </span>
            <span className="text-xs font-black text-[#2B6077] bg-[#EAF4F9] px-2 py-0.5 rounded-full">
              {carbsPercent}%
            </span>
          </div>

          <div className="text-2xl sm:text-3xl font-[900] text-[#11140F] tracking-tight font-heading">
            {totalCarbs}g
            <span className="text-xs text-[#858B80] font-normal ml-1">/ {targets.carbs}g</span>
          </div>

          {/* Progress Indicator */}
          <div className="h-2.5 bg-[#F0F2EC] rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-[#75B8D1] rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, carbsPercent)}%` }}
            />
          </div>

          <div className="text-xs text-[#858B80] mt-3 flex justify-between items-center">
            <span>Remaining:</span>
            {carbsOverage > 0 ? (
              <span className="text-[#2B6077] font-bold">+{carbsOverage}g over</span>
            ) : (
              <strong className="text-[#11140F] font-bold">
                {carbsRemaining}g
              </strong>
            )}
          </div>
        </div>

        {/* Card 4: Fat Consumed / Target */}
        <div className="bg-white border border-[#E5E8DF] rounded-[24px] p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-black uppercase text-[#858B80] tracking-wider">
              Healthy Fat
            </span>
            <span className="text-xs font-black text-[#856404] bg-[#FFF3CD] px-2 py-0.5 rounded-full">
              {fatPercent}%
            </span>
          </div>

          <div className="text-2xl sm:text-3xl font-[900] text-[#11140F] tracking-tight font-heading">
            {totalFat}g
            <span className="text-xs text-[#858B80] font-normal ml-1">/ {targets.fat}g</span>
          </div>

          {/* Progress Indicator */}
          <div className="h-2.5 bg-[#F0F2EC] rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-[#E5B53A] rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, fatPercent)}%` }}
            />
          </div>

          <div className="text-xs text-[#858B80] mt-3 flex justify-between items-center">
            <span>Remaining:</span>
            {fatOverage > 0 ? (
              <span className="text-[#856404] font-bold">+{fatOverage}g over</span>
            ) : (
              <strong className="text-[#11140F] font-bold">
                {fatRemaining}g
              </strong>
            )}
          </div>
        </div>
      </div>

      {/* ---------------- WATER TRACKER CARD ---------------- */}
      {onAddWater && onResetWater && (
        <WaterTracker
          currentMl={waterMl}
          targetMl={targets.waterMl || 2500}
          onAddWater={onAddWater}
          onResetWater={onResetWater}
        />
      )}

      {/* 7-Day Trend Chart */}
      <div className="bg-white border border-[#E5E8DF] rounded-[22px] p-4.5 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#739A30]" />
            <h4 className="text-xs font-black text-[#11140F] uppercase tracking-wider m-0 font-heading">
              7-Day Fuel Activity
            </h4>
          </div>
          {onOpenWeeklyReport && (
            <button
              type="button"
              onClick={onOpenWeeklyReport}
              className="text-xs font-bold text-[#739A30] hover:text-[#11140F] hover:underline flex items-center gap-1 bg-transparent border-0 cursor-pointer"
            >
              <span>View Full Summary Report</span>
              <span>↗</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center pt-2">
          {past7Days.map((day) => {
            const isSelected = day.dateString === selectedDate;
            const barHeightPct = Math.min(100, Math.max(8, Math.round((day.calories / targets.calories) * 100)));

            return (
              <button
                key={day.dateString}
                type="button"
                onClick={() => onSelectDate(day.dateString)}
                className={`flex flex-col items-center justify-end p-2 rounded-xl transition cursor-pointer border-0 ${
                  isSelected ? 'bg-[#11140F] text-white shadow-sm' : 'bg-[#FAFBF8] hover:bg-[#EFF2EA] text-[#11140F]'
                }`}
              >
                <span className={`text-[10px] font-extrabold ${isSelected ? 'text-[#C8F169]' : 'text-[#858B80]'}`}>
                  {day.calories > 0 ? `${day.calories}` : '—'}
                </span>

                {/* Vertical bar representation */}
                <div className="w-full h-16 sm:h-20 bg-black/5 dark:bg-white/10 rounded-lg flex items-end my-1.5 overflow-hidden p-0.5">
                  <div
                    className={`w-full rounded-md transition-all duration-300 ${
                      isSelected ? 'bg-[#C8F169]' : day.calories > 0 ? 'bg-[#8FB83F]' : 'bg-transparent'
                    }`}
                    style={{ height: `${barHeightPct}%` }}
                  />
                </div>

                <span className="text-[11px] font-bold block truncate w-full">
                  {day.displayLabel}
                </span>
                <span className={`text-[9px] block ${isSelected ? 'text-[#A6AD9E]' : 'text-[#858B80]'}`}>
                  {day.protein > 0 ? `${day.protein}g P` : '0g'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grouped Meals by Category */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-[#11140F] uppercase tracking-wider m-0 font-heading">
            Meals Logged for {formatDisplayDate(selectedDate)} ({uniqueMeals.length})
          </h4>
          <button
            type="button"
            onClick={() => onQuickAction('text')}
            className="text-xs font-bold text-[#4F5D3E] hover:text-[#11140F] flex items-center gap-1 bg-transparent border-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add another meal</span>
          </button>
        </div>

        {uniqueMeals.length === 0 ? (
          <div className="bg-white border border-[#E5E8DF] rounded-2xl p-8 text-center text-[#858B80]">
            <div className="w-12 h-12 rounded-2xl bg-[#F0F4E8] text-[#4F5D3E] grid place-items-center text-xl mx-auto mb-3">
              🍽️
            </div>
            <strong className="text-base font-bold text-[#11140F] block mb-1">
              No meals logged yet for this date
            </strong>
            <p className="text-xs max-w-sm mx-auto mb-5 leading-relaxed">
              Scan a photo or describe your meal in plain English or Urdu/Hindi terms to start filling today's fuel breakdown.
            </p>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => onQuickAction('photo')}
                className="bg-[#11140F] hover:bg-[#20251E] text-white px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border-0"
              >
                <Camera className="w-3.5 h-3.5 text-[#C8F169]" />
                <span>Scan Photo</span>
              </button>
              <button
                type="button"
                onClick={() => onQuickAction('text')}
                className="bg-[#EFF5E2] hover:bg-[#E4EBD7] text-[#4F5D3E] px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border-0"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Text Entry</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((cat) => {
              const catMeals = mealsByCategory[cat.key];
              if (catMeals.length === 0) return null;

              const catCals = catMeals.reduce((acc, m) => acc + m.calories, 0);
              const catProtein = Math.round(catMeals.reduce((acc, m) => acc + m.protein, 0) * 10) / 10;

              return (
                <div
                  key={cat.key}
                  className="bg-white border border-[#E5E8DF] rounded-[22px] overflow-hidden shadow-sm"
                >
                  {/* Category Header */}
                  <div className="bg-[#FAFBF8] border-b border-[#E5E8DF] px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{cat.icon}</span>
                      <strong className="text-xs sm:text-sm font-extrabold text-[#11140F] uppercase tracking-wide">
                        {cat.label}
                      </strong>
                      <span className="text-xs text-[#858B80]">
                        ({catMeals.length})
                      </span>
                    </div>
                    <div className="text-xs font-extrabold text-[#11140F]">
                      {catCals} kcal <span className="text-[#858B80] font-normal">· {catProtein}g protein</span>
                    </div>
                  </div>

                  {/* Meal list */}
                  <div className="divide-y divide-[#E5E8DF]">
                    {catMeals.map((meal) => (
                      <div
                        key={meal.id}
                        className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#FAFBF8] transition"
                      >
                        {/* Photo Thumbnail if saved */}
                        {meal.photoUrl && (
                          <button
                            type="button"
                            onClick={() => setPhotoModalUrl(meal.photoUrl || null)}
                            className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#CBD2C1] cursor-pointer p-0 relative group"
                            title="View meal photo"
                          >
                            <img
                              src={meal.photoUrl}
                              alt={meal.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                            />
                            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                              <Eye className="w-3.5 h-3.5 text-white" />
                            </div>
                          </button>
                        )}

                        {/* Meal details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <strong className="text-sm font-bold text-[#11140F] truncate">
                              {meal.name}
                            </strong>
                            {meal.source === 'ai' && (
                              <span className="text-[10px] font-extrabold uppercase bg-[#EFF5E2] text-[#4F5D3E] px-2 py-0.5 rounded-full">
                                AI Vision
                              </span>
                            )}
                            {meal.source === 'fallback' && (
                              <span className="text-[10px] font-extrabold uppercase bg-[#FFF3CD] text-[#856404] px-2 py-0.5 rounded-full">
                                Local Estimate
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-[#858B80] mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{meal.timeString}</span>
                            </span>
                            <span>·</span>
                            <span>{meal.foods.length} item(s)</span>
                            {meal.carbs > 0 && <span>· {meal.carbs}g C</span>}
                            {meal.fat > 0 && <span>· {meal.fat}g F</span>}
                          </div>

                          {/* Food items chip preview */}
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {meal.foods.map((food) => (
                              <span
                                key={food.id}
                                className="text-[11px] bg-[#F5F6F1] text-[#11140F] px-2 py-0.5 rounded-md"
                              >
                                {food.name} ({food.portion_description})
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Nutrition values */}
                        <div className="text-right shrink-0">
                          <div className="text-sm font-black text-[#11140F] font-heading">
                            {meal.calories} kcal
                          </div>
                          <div className="text-xs text-[#858B80] font-semibold">
                            {meal.protein}g P
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 ml-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => onEditMeal(meal)}
                            className="p-1.5 text-[#858B80] hover:text-[#11140F] rounded-lg hover:bg-[#EFF2EA] transition cursor-pointer border-0 bg-transparent"
                            title="Edit meal"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteMeal(meal.id)}
                            className="p-1.5 text-[#9AA192] hover:text-[#D33] rounded-lg hover:bg-[#FFF0F0] transition cursor-pointer border-0 bg-transparent"
                            title="Delete meal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox for meal photos */}
      {photoModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setPhotoModalUrl(null)}
        >
          <div className="relative max-w-lg w-full max-h-[85vh] bg-black rounded-2xl overflow-hidden flex items-center justify-center">
            <img
              src={photoModalUrl}
              alt="Meal preview enlarged"
              className="max-w-full max-h-[80vh] object-contain rounded-xl"
            />
            <button
              onClick={() => setPhotoModalUrl(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white grid place-items-center cursor-pointer border-0"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
