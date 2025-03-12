export interface Exercise {
  name: string;
  description: string;
  xpReward: string;
  xpValue?: number;
  completed?: boolean;
}

export interface Achievement {
  name: string;
  description: string;
  progress: number;
  completed?: boolean;
  xpReward: number;
  current?: number;
  progressDescription?: string;
  target?: number;
  currentValue?: number;
  unit?: string;
}

export interface WorkoutProgress {
  routesCompleted: number;
  totalXpGained: number;
}

export interface Workout {
  exercises: Exercise[];
  achievements: Achievement[];
  progress: WorkoutProgress;
  challenges: Challenge[];
}

export interface WorkoutStats {
  workoutsCompleted: number;
  exercisesCompleted: number;
  achievementsCompleted: number;
  xpGained: number;
}

export interface CharacterStats {
  totalWorkouts: number;
  totalXpGained: number;
}

export interface Challenge {
  name: string;
  description: string;
  progress: number;
  xpReward?: number;
}

export interface Character {
  _id: string;
  name: string;
  level: number;
  xp: number;
  avatar: string;
  class?: string;
  xpToNextLevel: number;
  stats?: CharacterStats;
  achievements: Achievement[];
  challenges: Challenge[];
}

export interface CharacterProfile {
  _id?: string;
  userId: string;
  username?: string;
  selectedCharacterName: string;
  characterData: Character;
  progress: {
    level: number;
    experience: number;
    experienceToNextLevel: number;
  };
}
