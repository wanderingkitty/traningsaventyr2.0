export interface Exercise {
  name: string;
  description: string;
  xpReward: string;
  xpValue?: number;
  completed?: boolean;
}

export interface WorkoutAchievement {
  name: string;
  description: string;
  progress: number;
  progressDescription: string;
  xpValue?: number;
  xpReward: number;
  completed?: boolean;
  target: number;
  currentValue: number;
  unit: string;
}

export interface WorkoutProgress {
  routesCompleted: number;
  totalXpGained: number;
}

export interface Workout {
  exercises: Exercise[];
  achievements: WorkoutAchievement[];
  progress: WorkoutProgress;
}

export interface WorkoutStats {
  workoutsCompleted: number;
  exercisesCompleted: number;
  achievementsCompleted: number;
  xpGained: number;
}
