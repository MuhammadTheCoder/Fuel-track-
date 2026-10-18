export interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  portion_description: string;
  calories_kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface MealAnalysisResult {
  foods: FoodItem[];
  total_calories_kcal: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  assumptions: string[];
  needs_confirmation: boolean;
  follow_up_question?: string | null;
  source?: 'ai' | 'fallback' | 'manual';
}

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealEntry {
  id: string;
  userId?: string;
  name: string;
  mealType: MealCategory;
  foods: FoodItem[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string; // ISO 8601 string
  timeString: string; // e.g. "01:45 PM"
  dateString: string; // e.g. "2026-10-13"
  photoUrl?: string; // Optional user-saved image data URL
  assumptions?: string[];
  source?: 'ai' | 'fallback' | 'manual';
}

export type BiologicalSex = 'male' | 'female' | 'prefer_not_to_say';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'very_active'
  | 'extremely_active';

export type ExerciseRoutine =
  | 'none'
  | '1_2_days'
  | '3_4_days'
  | '5_6_days'
  | 'daily';

export type DietaryPreference =
  | 'no_preference'
  | 'vegetarian'
  | 'vegan'
  | 'other';

export type MainGoal =
  | 'muscle_gain'
  | 'maintain'
  | 'weight_loss'
  | 'growth_active'
  | 'muscle_strength'
  | 'maintain_fitness'
  | 'fat_loss_preserve_muscle'
  | 'general_health_activity';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  sex?: BiologicalSex;
  weight: number;
  weightUnit: 'kg' | 'lb';
  height: number; // in cm
  heightUnit: 'cm' | 'ft_in';
  heightFt?: number;
  heightIn?: number;
  activityLevel: ActivityLevel;
  exerciseRoutine?: ExerciseRoutine;
  dietaryPreference?: DietaryPreference;
  goal: MainGoal;
  waterTargetMl?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DailyTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterMl: number;
  isMinor: boolean;
  isUnder18?: boolean;
  rmr?: number;
  tdee?: number;
  methodNote: string;
  goalDescription: string;
  goal?: MainGoal;
  userProfile?: UserProfile;
}

export interface UserAccount {
  id: string;
  name: string;
  profile: UserProfile;
  targets: DailyTargets;
  createdAt: string;
  updatedAt: string;
}

export interface WaterLog {
  dateString: string;
  amountMl: number;
  targetMl: number;
  updatedAt: string;
}

export interface AnalyzeMealRequest {
  text?: string;
  imageBase64?: string;
  mimeType?: string;
  userNotes?: string;
}

export interface AnalyzeMealResponse {
  success: boolean;
  data?: MealAnalysisResult;
  error?: string;
  canUseFallback?: boolean;
}
