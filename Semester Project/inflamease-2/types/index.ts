import { Id } from '@/convex/_generated/dataModel';

export interface FoodLog {
  _id: Id<'foodLogs'>;
  foodId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  servingSize: string;
  servingGrams: number;
  logDate: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  antiInflammatoryScore: number;
  food?: {
    name: string;
    antiInflammatoryScore: number;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  onboardingCompleted: boolean;
  dailyCalorieGoal?: number;
}

export interface Food {
  _id: Id<'foods'>;
  name: string;
  brand?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g?: number;
  sugarPer100g?: number;
  antiInflammatoryScore: number;
  commonServings: Array<{
    name: string;
    grams: number;
  }>;
}