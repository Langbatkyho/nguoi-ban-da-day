export enum Condition {
  Ulcer = "Viêm loét dạ dày",
  Reflux = "Trào ngược dạ dày thực quản",
  Other = "Khác",
}

export enum DietaryGoal {
  PainRelief = "Giảm đau",
  HeartburnRelief = "Giảm ợ nóng",
  Recovery = "Phục hồi",
}

export interface UserProfile {
  condition: Condition;
  painLevel: number;
  triggerFoods: string;
  dietaryGoal: DietaryGoal;
}

export interface SymptomLog {
  id: string;
  painLevel: number;
  painLocation: string;
  startTime: string;
  endTime: string;
  eatenFoods: string;
  physicalActivity: string;
  timestamp: Date;
}

export interface Meal {
  name: string;
  time: string;
  portion: string;
  note: string;
}

export interface DailyPlan {
  day: string;
  meals: Meal[];
}

export type MealPlan = DailyPlan[];

export enum FoodSafety {
  Safe = "An toàn",
  Limit = "Hạn chế",
  Avoid = "Tránh",
}

export interface FoodCheckResult {
  safetyLevel: FoodSafety;
  reason: string;
  scientificEvidence?: string;
}

export interface Recipe {
  title: string;
  description: string;
  category: 'Giảm đau' | 'Chống ợ nóng' | 'Phục hồi' | 'AI Tùy chỉnh';
  cookTime: string;
  ingredients: string[];
  instructions: string;
}
