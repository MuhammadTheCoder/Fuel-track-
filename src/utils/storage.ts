import {
  MealEntry,
  DailyTargets,
  MealCategory,
  UserProfile,
  UserAccount,
} from '../types/nutrition';
import { calculatePersonalizedTargets } from './nutritionCalculator';

const ACCOUNTS_KEY = 'fueltrack_accounts_v4';
const ACTIVE_ACCOUNT_ID_KEY = 'fueltrack_active_account_id_v4';
const MEALS_PREFIX = 'fueltrack_meals_v4_';

// Legacy keys for automatic migration
const LEGACY_MEALS_KEY = 'fueltrack_meals_v2';
const LEGACY_PROFILE_KEY = 'fueltrack_user_profile_v2';
const LEGACY_TARGETS_KEY = 'fueltrack_targets_v2';

export const DEFAULT_FALLBACK_TARGETS: DailyTargets = {
  calories: 2000,
  protein: 125,
  carbs: 225,
  fat: 65,
  waterMl: 2500,
  isMinor: false,
  methodNote: 'General adult reference guidelines.',
  goalDescription: 'Everyday Balanced Energy',
};

// Date utilities
export function formatLocalDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateStr: string): string {
  const today = formatLocalDate();
  const yesterday = formatLocalDate(new Date(Date.now() - 86400000));

  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';

  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

// ----------------- MULTI-ACCOUNT MANAGEMENT -----------------

export function getAllAccounts(): UserAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    }

    // Check for legacy single-user data to migrate seamlessly
    const legacyProfileRaw = localStorage.getItem(LEGACY_PROFILE_KEY);
    if (legacyProfileRaw) {
      const legacyProfile = JSON.parse(legacyProfileRaw);
      const newId = `user_${Date.now()}_default`;

      const profile: UserProfile = {
        id: newId,
        name: legacyProfile.name || 'Primary User',
        age: Number(legacyProfile.age) || 24,
        weight: Number(legacyProfile.weight) || 70,
        weightUnit: legacyProfile.weightUnit || 'kg',
        height: Number(legacyProfile.height) || 175,
        heightUnit: legacyProfile.heightUnit || 'cm',
        activityLevel: legacyProfile.activityLevel || 'moderate',
        goal: legacyProfile.goal || 'maintain',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const targets = calculatePersonalizedTargets(profile);
      const initialAccount: UserAccount = {
        id: newId,
        name: profile.name,
        profile,
        targets,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save initial account
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([initialAccount]));
      localStorage.setItem(ACTIVE_ACCOUNT_ID_KEY, newId);

      // Migrate legacy meals to this user
      const legacyMealsRaw = localStorage.getItem(LEGACY_MEALS_KEY);
      if (legacyMealsRaw) {
        try {
          const legacyMeals = JSON.parse(legacyMealsRaw);
          if (Array.isArray(legacyMeals)) {
            localStorage.setItem(`${MEALS_PREFIX}${newId}`, JSON.stringify(legacyMeals));
          }
        } catch (_) {}
      }

      return [initialAccount];
    }
  } catch (err) {
    console.error('Error loading accounts:', err);
  }
  return [];
}

export function getActiveAccount(): UserAccount | null {
  const accounts = getAllAccounts();
  if (accounts.length === 0) return null;

  const activeId = localStorage.getItem(ACTIVE_ACCOUNT_ID_KEY);
  if (activeId) {
    const found = accounts.find((a) => a.id === activeId);
    if (found) return found;
  }

  // Fallback to first account
  return accounts[0] || null;
}

export function setActiveAccountId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_ACCOUNT_ID_KEY, id);
  } catch (err) {
    console.error('Error saving active account id:', err);
  }
}

export function saveAccount(account: UserAccount): void {
  try {
    const accounts = getAllAccounts();
    const idx = accounts.findIndex((a) => a.id === account.id);
    if (idx >= 0) {
      accounts[idx] = account;
    } else {
      accounts.push(account);
    }
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    localStorage.setItem(ACTIVE_ACCOUNT_ID_KEY, account.id);
  } catch (err) {
    console.error('Error saving account:', err);
  }
}

export function deleteAccount(id: string): void {
  try {
    const accounts = getAllAccounts().filter((a) => a.id !== id);
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    localStorage.removeItem(`${MEALS_PREFIX}${id}`);

    if (accounts.length > 0) {
      setActiveAccountId(accounts[0].id);
    } else {
      localStorage.removeItem(ACTIVE_ACCOUNT_ID_KEY);
    }
  } catch (err) {
    console.error('Error deleting account:', err);
  }
}

// ----------------- ISOLATED MEAL LOGS PER USER -----------------

export function getMealsForUser(userId: string): MealEntry[] {
  try {
    const raw = localStorage.getItem(`${MEALS_PREFIX}${userId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error(`Error loading meals for user ${userId}:`, err);
  }
  return [];
}

export function saveAllMealsForUser(userId: string, meals: MealEntry[]): void {
  try {
    localStorage.setItem(`${MEALS_PREFIX}${userId}`, JSON.stringify(meals));
  } catch (err) {
    console.error(`Error saving meals for user ${userId}:`, err);
  }
}

export function saveMealForUser(userId: string, meal: MealEntry): MealEntry[] {
  const meals = getMealsForUser(userId);
  const existingIdx = meals.findIndex((m) => m.id === meal.id);
  if (existingIdx >= 0) {
    meals[existingIdx] = { ...meal, userId };
  } else {
    meals.unshift({ ...meal, userId });
  }
  saveAllMealsForUser(userId, meals);
  return meals;
}

export function deleteMealForUser(userId: string, mealId: string): MealEntry[] {
  const meals = getMealsForUser(userId);
  const updated = meals.filter((m) => m.id !== mealId);
  saveAllMealsForUser(userId, updated);
  return updated;
}

export function clearMealsForUserAndDate(userId: string, dateString: string): MealEntry[] {
  const meals = getMealsForUser(userId);
  const updated = meals.filter((m) => m.dateString !== dateString);
  saveAllMealsForUser(userId, updated);
  return updated;
}

// ----------------- WATER TRACKING PER USER & DATE -----------------
const WATER_PREFIX = 'fueltrack_water_v4_';

export function getWaterForUserAndDate(userId: string, dateString: string): number {
  try {
    const raw = localStorage.getItem(`${WATER_PREFIX}${userId}_${dateString}`);
    if (raw !== null) {
      const val = Number(raw);
      return isNaN(val) ? 0 : Math.max(0, val);
    }
  } catch (err) {
    console.error(`Error loading water for user ${userId} on ${dateString}:`, err);
  }
  return 0;
}

export function setWaterForUserAndDate(userId: string, dateString: string, amountMl: number): number {
  const safeAmount = Math.max(0, Math.round(amountMl));
  try {
    localStorage.setItem(`${WATER_PREFIX}${userId}_${dateString}`, safeAmount.toString());
  } catch (err) {
    console.error(`Error saving water for user ${userId} on ${dateString}:`, err);
  }
  return safeAmount;
}

export function addWaterForUserAndDate(userId: string, dateString: string, deltaMl: number): number {
  const current = getWaterForUserAndDate(userId, dateString);
  const next = Math.max(0, current + deltaMl);
  return setWaterForUserAndDate(userId, dateString, next);
}

// ----------------- 7-DAY SUMMARY & WEEKLY REPORT -----------------

export interface DaySummary {
  dateString: string;
  displayLabel: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterMl: number;
  mealCount: number;
  targetCalories: number;
  targetProtein: number;
  targetWaterMl: number;
}

export function getUserPast7Days(userId: string, customTargets?: DailyTargets): DaySummary[] {
  const meals = getMealsForUser(userId);
  const accounts = getAllAccounts();
  const acc = accounts.find((a) => a.id === userId);
  const targets = customTargets || acc?.targets || DEFAULT_FALLBACK_TARGETS;
  const targetWater = targets.waterMl || 2500;

  const summaries: DaySummary[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = formatLocalDate(d);
    const dayMeals = meals.filter((m) => m.dateString === dateStr);

    const calories = dayMeals.reduce((accM, m) => accM + (Number(m.calories) || 0), 0);
    const protein = Math.round(dayMeals.reduce((accM, m) => accM + (Number(m.protein) || 0), 0) * 10) / 10;
    const carbs = Math.round(dayMeals.reduce((accM, m) => accM + (Number(m.carbs) || 0), 0) * 10) / 10;
    const fat = Math.round(dayMeals.reduce((accM, m) => accM + (Number(m.fat) || 0), 0) * 10) / 10;
    const waterMl = getWaterForUserAndDate(userId, dateStr);

    summaries.push({
      dateString: dateStr,
      displayLabel: i === 0 ? 'Today' : i === 1 ? 'Yest' : d.toLocaleDateString(undefined, { weekday: 'short' }),
      calories,
      protein,
      carbs,
      fat,
      waterMl,
      mealCount: dayMeals.length,
      targetCalories: targets.calories,
      targetProtein: targets.protein,
      targetWaterMl: targetWater,
    });
  }

  return summaries;
}

export interface WeeklyReportData {
  startDate: string;
  endDate: string;
  days: DaySummary[];
  daysWithLogs: number;
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFat: number;
  averageWaterMl: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  targetWaterMl: number;
  calorieAdherencePercent: number;
  proteinAdherencePercent: number;
  waterAdherencePercent: number;
  daysMetCalorieRange: number;
  daysMetProtein: number;
  daysMetWater: number;
  insights: string[];
}

export function generateWeeklyReport(userId: string, targets: DailyTargets): WeeklyReportData {
  const days = getUserPast7Days(userId, targets);
  const loggedDays = days.filter((d) => d.mealCount > 0 || d.waterMl > 0);
  const count = loggedDays.length || 1;

  const totalCals = loggedDays.reduce((acc, d) => acc + d.calories, 0);
  const totalProtein = loggedDays.reduce((acc, d) => acc + d.protein, 0);
  const totalCarbs = loggedDays.reduce((acc, d) => acc + d.carbs, 0);
  const totalFat = loggedDays.reduce((acc, d) => acc + d.fat, 0);
  const totalWater = loggedDays.reduce((acc, d) => acc + d.waterMl, 0);

  const avgCalories = Math.round(totalCals / count);
  const avgProtein = Math.round((totalProtein / count) * 10) / 10;
  const avgCarbs = Math.round((totalCarbs / count) * 10) / 10;
  const avgFat = Math.round((totalFat / count) * 10) / 10;
  const avgWater = Math.round(totalWater / count);

  // Calorie range: within 10% of target
  const calMargin = targets.calories * 0.12;
  const daysMetCalorieRange = loggedDays.filter(
    (d) => Math.abs(d.calories - targets.calories) <= calMargin && d.calories > 0
  ).length;

  const daysMetProtein = loggedDays.filter((d) => d.protein >= targets.protein * 0.9).length;
  const daysMetWater = loggedDays.filter((d) => d.waterMl >= (targets.waterMl || 2500) * 0.9).length;

  const insights: string[] = [];

  // Calorie insight
  if (loggedDays.length === 0) {
    insights.push('Start tracking meals and hydration to see personalized weekly nutritional insights.');
  } else {
    const calDiff = avgCalories - targets.calories;
    if (Math.abs(calDiff) <= 120) {
      insights.push(`🎯 Excellent energy calibration! Your 7-day average of ${avgCalories} kcal closely matches your daily target of ${targets.calories} kcal.`);
    } else if (calDiff < -250) {
      insights.push(`⚠️ Running low on energy: You averaged ${avgCalories} kcal/day (${Math.abs(calDiff)} kcal below target). Make sure you fuel sufficiently to support recovery and daily metabolism.`);
    } else if (calDiff > 250) {
      insights.push(`📈 Slightly over target: You averaged ${avgCalories} kcal/day (+${calDiff} kcal above target). Check high-energy extras such as cooking oils, sauces, or sweetened drinks.`);
    }

    // Protein insight
    const protDiff = avgProtein - targets.protein;
    if (protDiff >= 0) {
      insights.push(`💪 Strong protein intake: Averaging ${avgProtein}g/day (Target: ${targets.protein}g). Excellent for lean muscle recovery and satiety.`);
    } else if (protDiff < -25) {
      insights.push(`🍗 Protein boost recommended: Averaged ${avgProtein}g/day vs your target of ${targets.protein}g. Consider adding eggs, daal, chicken, yogurt, or legumes.`);
    }

    // Hydration insight
    const waterTarget = targets.waterMl || 2500;
    if (avgWater >= waterTarget * 0.9) {
      insights.push(`💧 Great hydration habit: Averaging ${avgWater} ml/day, meeting your optimal daily hydration baseline.`);
    } else {
      insights.push(`💧 Increase fluids: You drank ~${avgWater} ml/day (target: ${waterTarget} ml). Aim for 1-2 more glasses of water across your training hours.`);
    }
  }

  return {
    startDate: days[0]?.dateString || '',
    endDate: days[days.length - 1]?.dateString || '',
    days,
    daysWithLogs: loggedDays.length,
    averageCalories: avgCalories,
    averageProtein: avgProtein,
    averageCarbs: avgCarbs,
    averageFat: avgFat,
    averageWaterMl: avgWater,
    targetCalories: targets.calories,
    targetProtein: targets.protein,
    targetCarbs: targets.carbs,
    targetFat: targets.fat,
    targetWaterMl: targets.waterMl || 2500,
    calorieAdherencePercent: Math.min(100, Math.round((avgCalories / Math.max(1, targets.calories)) * 100)),
    proteinAdherencePercent: Math.min(100, Math.round((avgProtein / Math.max(1, targets.protein)) * 100)),
    waterAdherencePercent: Math.min(100, Math.round((avgWater / Math.max(1, targets.waterMl || 2500)) * 100)),
    daysMetCalorieRange,
    daysMetProtein,
    daysMetWater,
    insights,
  };
}

// Export user data
export function exportUserDataJSON(userId: string, accountName: string): void {
  const meals = getMealsForUser(userId);
  const accounts = getAllAccounts();
  const account = accounts.find((a) => a.id === userId);

  const data = {
    exportDate: new Date().toISOString(),
    account: account || null,
    meals,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fueltrack_${accountName.toLowerCase().replace(/\s+/g, '_')}_${formatLocalDate()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ----------------- ACTIVE ACCOUNT CONVENIENCE & COMPATIBILITY HELPERS -----------------

export function hasCompletedOnboarding(): boolean {
  return getAllAccounts().length > 0;
}

export const hasCompletedQuiz = hasCompletedOnboarding;

export function loadAllMeals(): MealEntry[] {
  const active = getActiveAccount();
  if (!active) return [];
  return getMealsForUser(active.id);
}

export function saveMeal(meal: MealEntry): MealEntry[] {
  const active = getActiveAccount();
  const userId = active ? active.id : 'default';
  return saveMealForUser(userId, meal);
}

export function deleteMeal(mealId: string): MealEntry[] {
  const active = getActiveAccount();
  if (!active) return [];
  return deleteMealForUser(active.id, mealId);
}

export function clearMealsForDate(dateString: string): MealEntry[] {
  const active = getActiveAccount();
  if (!active) return [];
  return clearMealsForUserAndDate(active.id, dateString);
}

export function loadTargets(): DailyTargets {
  const active = getActiveAccount();
  if (active && active.targets) {
    return active.targets;
  }
  return DEFAULT_FALLBACK_TARGETS;
}

export function saveTargets(targets: DailyTargets): void {
  const active = getActiveAccount();
  if (active) {
    active.targets = targets;
    saveAccount(active);
  }
}

export function loadUserProfile(): UserProfile | null {
  const active = getActiveAccount();
  return active ? active.profile : null;
}

export function saveUserProfile(profile: UserProfile): void {
  const active = getActiveAccount();
  if (active) {
    active.profile = profile;
    saveAccount(active);
  }
}

export function getPast7DaysSummaries(): DaySummary[] {
  const active = getActiveAccount();
  const userId = active ? active.id : 'default';
  return getUserPast7Days(userId);
}
