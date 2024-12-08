export interface Goal {
  id: string;
  custom_goal: string;
  preferences: string[];
  session_duration: number;
  days_per_week: number;
  target_weight: number;
  daily_activity_level: string;
}
