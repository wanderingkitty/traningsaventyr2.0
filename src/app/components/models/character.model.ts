export interface Character {
  name: string;
  class: string;
  level?: number;
  experience?: number;
  experienceToNextLevel?: number;
  workoutStats?: {
    totalWorkouts: number;
    totalExercisesCompleted: number;
    totalAchievementsCompleted: number;
    totalXpGained: number;
  };
}

export interface CharacterProfile {
  userId: string;
  username: string;
  selectedCharacterName: string;
  characterData: Character;
  progress: {
    level: number;
    experience: number;
    experienceToNextLevel: number;
  };
}

export interface Achievement {
  name: string;
  description: string;
  xpReward: number;
  progress: number;
  current?: number;
  completed?: boolean;
}
