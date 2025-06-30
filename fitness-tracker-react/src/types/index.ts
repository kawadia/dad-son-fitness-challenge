export interface WorkoutSession {
  exercise: string;
  reps: number;
  time: string;
  timestamp: string;
}

export interface DayData {
  sessions: WorkoutSession[];
  totalReps: number;
  goalMet: boolean;
}

export interface UserData {
  [date: string]: DayData;
}

export interface WorkoutData {
  Dad: UserData;
  Son: UserData;
  lastUpdated?: string;
}

export type UserType = 'Dad' | 'Son';

export interface ExerciseEmojis {
  [key: string]: string;
}

export interface ChartData {
  dates: string[];
  dadData: number[];
  sonData: number[];
}