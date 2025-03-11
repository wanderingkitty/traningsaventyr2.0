export interface SpecialAbility {
  name: string;
  unlockedAtLevel?: number; // Опциональное поле
  requiredLevel?: number; // Добавлено новое свойство
  unlocked: boolean;
}

// Общие интерфейсы для тренировок и персонажа
// Добавьте их в отдельный файл models/common.model.ts

export interface Exercise {
  name: string;
  description: string;
  xpReward: string;
  xpValue?: number;
  completed?: boolean;
}

// Общий интерфейс для достижений, который будет использоваться везде
export interface Achievement {
  name: string;
  description: string;
  progress: number;
  completed?: boolean;
  xpReward: number;
  current?: number;
  // Дополнительные поля из WorkoutAchievement
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
  achievements: Achievement[]; // Используем общий интерфейс Achievement
  progress: WorkoutProgress;
  challenges: Challenge[];
}

export interface WorkoutStats {
  workoutsCompleted: number;
  exercisesCompleted: number;
  achievementsCompleted: number;
  xpGained: number;
}

// Добавьте другие необходимые интерфейсы из модели персонажа
export interface CharacterStats {
  totalWorkouts: number;
  totalXpGained: number;
}

export interface SpecialAbility {
  name: string;
  unlockedAtLevel?: number;
  requiredLevel?: number;
  unlocked: boolean;
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
  achievements: Achievement[]; // Используем общий интерфейс Achievement
  challenges: Challenge[];
  specialAbilities: SpecialAbility[];
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
