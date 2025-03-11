import { Workout } from 'backend/models/character';

// Данные упражнений для разных классов
export const runnerWorkouts: Workout = {
  exercises: [
    {
      name: '🏃‍♂️ Running session',
      description: 'Run for 10-15 minutes at a comfortable pace',
      xpReward: 'XP + 50',
      xpValue: 50,
    },
    {
      name: 'Stretching',
      description: 'Stretch your legs and back',
      xpReward: 'XP + 40',
      xpValue: 40,
    },
    {
      name: 'Interval sprints',
      description: '30 seconds sprint, 1 minute rest (x5)',
      xpReward: 'XP + 60',
      xpValue: 60,
    },
    {
      name: 'Cool down',
      description: 'Walk for 5 minutes to cool down',
      xpReward: 'XP + 30',
      xpValue: 30,
    },
  ],

  challenges: [
    {
      name: '🌪️ Fast Five Challenge',
      description: 'Complete a 5km run',
      progress: 0,
      xpReward: 100,
    },
  ],
  achievements: [
    {
      name: '🗾 Distance goals',
      description: 'Reach new horizons',
      progressDescription: 'Achievement progress: +50',
      progress: 0,
      xpReward: 50,
      target: 20,
      currentValue: 0,
      unit: 'km',
      completed: false,
    },
    {
      name: '📈 Pace master',
      description: 'Maintain steady speed',
      progressDescription: 'Achievement progress: +50',
      progress: 0,
      xpReward: 60,
      target: 30,
      currentValue: 0,
      unit: 'minutes',
      completed: false,
    },
    {
      name: '⏱️ Interval training',
      description: 'Master speed variation',
      progressDescription: 'Achievement progress: +50',
      progress: 0,
      xpReward: 50,
      target: 30,
      currentValue: 0,
      unit: 'minutes',
      completed: false,
    },
    {
      name: '🏃 Sprint champion',
      description: 'Achieve your best speed record',
      progressDescription: 'Achievement progress: +50',
      progress: 0,
      xpReward: 65,
      target: 30,
      currentValue: 0,
      unit: 'minutes',
      completed: false,
    },
    {
      name: '🌄 Hill conqueror',
      description: 'Master running uphill',
      progressDescription: 'Achievement progress: +50',
      progress: 0,
      xpReward: 80,
      target: 30,
      currentValue: 0,
      unit: 'minutes',
      completed: false,
    },
    {
      name: '🌱 Trail blazer',
      description: 'Explore off-road running paths',
      progressDescription: 'Achievement progress: +50',
      progress: 0,
      xpReward: 75,
      target: 30,
      currentValue: 0,
      unit: 'minutes',
      completed: false,
    },
    {
      name: '🏁 Race finisher',
      description: 'Complete a virtual race',
      progressDescription: 'Achievement progress: +50',
      progress: 0,
      xpReward: 90,
      target: 30,
      currentValue: 0,
      unit: 'minutes',
      completed: false,
    },
    {
      name: '🔄 Consistency champion',
      description: 'Run regularly for a whole week',
      progressDescription: 'Achievement progress: +50',
      progress: 0,
      xpReward: 85,
      target: 30,
      currentValue: 0,
      unit: 'minutes',
      completed: false,
    },
  ],

  progress: {
    routesCompleted: 0,
    totalXpGained: 0,
  },
};

export const ascenderWorkouts: Workout = {
  exercises: [
    {
      name: '🧗🏼 Climbing session',
      description: 'Focus on basic routes',
      xpReward: 'XP + 50',
      xpValue: 50,
    },
    {
      name: 'Plank',
      description: 'Hold for 30 seconds',
      xpReward: 'XP + 40',
      xpValue: 40,
    },
    {
      name: 'Rest between attempts',
      description: '',
      xpReward: 'XP + 50',
      xpValue: 50,
    },
    {
      name: 'Different wall angles',
      description: '',
      xpReward: 'XP + 50',
      xpValue: 50,
    },
  ],

  challenges: [
    {
      name: '🌄 Tackle a New Climbing Route',
      description: 'Complete a new challange route',
      progress: 0,
      xpReward: 100,
    },
  ],

  achievements: [
    {
      name: '🦾 Grip strength',
      description: 'Master your grip power',
      progressDescription: 'Achievement progress: +50',
      progress: 0,
      xpReward: 50,
      target: 30,
      currentValue: 0,
      unit: 'minutes',
      completed: false,
    },
    {
      name: '🧭 Route master',
      description: 'Conquer different routes',
      progressDescription: 'Achievement progress: +50',
      progress: 0,
      xpReward: 60,
      target: 30,
      currentValue: 0,
      unit: 'minutes',
      completed: false,
    },
    {
      name: '🧩 Problem solver',
      description: 'Find solutions for routes',
      progressDescription: 'Achievement progress: +50',
      progress: 0,
      xpReward: 75,
      target: 30,
      currentValue: 0,
      unit: 'minutes',
      completed: false,
    },
    {
      name: '⏱️ Speed climber',
      description: 'Beat your previous times on familiar routes',
      progressDescription: 'Achievement progress: +50',
      progress: 0,
      xpReward: 65,
      target: 30,
      currentValue: 0,
      unit: 'minutes',
      completed: false,
    },
    {
      name: '🔄 Endurance expert',
      description: 'Maintain climbing stamina for longer sessions',
      progressDescription: 'Achievement progress + 50',
      progress: 0,
      xpReward: 80,
      target: 30,
      currentValue: 0,
      unit: 'minutes',
      completed: false,
    },
    {
      name: '🧗 Dynamic mover',
      description: 'Master dynamic movements and jumps',
      progressDescription: 'Achievement progress: +50',
      progress: 0,
      xpReward: 70,
      target: 30,
      currentValue: 0,
      unit: 'minutes',
      completed: false,
    },
    {
      name: '🦶 Footwork finesse',
      description: 'Develop precise foot placement techniques',
      progressDescription: 'Achievement progress: +50',
      progress: 0,
      xpReward: 55,
      target: 30,
      currentValue: 0,
      unit: 'minutes',
      completed: false,
    },
    {
      name: '🌊 Flow state',
      description: 'Climb with fluid, continuous movements',
      progressDescription: 'Achievement progress: +50',
      progress: 0,
      xpReward: 90,
      target: 30,
      currentValue: 0,
      unit: 'minutes',
      completed: false,
    },
  ],

  progress: {
    routesCompleted: 0,
    totalXpGained: 0,
  },
};

export const zenWarriorWorkouts: Workout = {
  exercises: [
    {
      name: '🧘‍♀️ Yoga session',
      description: 'Begin with basic poses',
      xpReward: 'XP + 50',
      xpValue: 50,
    },
    {
      name: 'Breathing exercise',
      description: 'Focus on deep breathing for 2 minutes',
      xpReward: 'XP + 40',
      xpValue: 40,
    },
    {
      name: 'Sun salutation sequence',
      description: 'Complete 5 rounds',
      xpReward: 'XP + 60',
      xpValue: 60,
    },
    {
      name: 'Meditation',
      description: 'Quiet your mind for 5 minutes',
      xpReward: 'XP + 50',
      xpValue: 50,
    },
  ],

  challenges: [
    {
      name: '🕊️ Quiet Mind',
      description:
        '48 hours without social media or digital devices, focusing on inner calmness',
      progress: 0,
      xpReward: 100,
    },
  ],

  achievements: [
    {
      name: '✨ Perfect form',
      description: 'Focus on alignment',
      progressDescription: 'Achievement progress: +50',
      progress: 0,
      xpReward: 60,
      target: 30,
      currentValue: 0,
      unit: 'minutes',
      completed: false,
    },
    {
      name: '🧘 Mind master',
      description: 'Develop inner calm',
      progressDescription: 'Achievement progress: +50',
      progress: 0,
      xpReward: 70,
      target: 30,
      currentValue: 0,
      unit: 'minutes',
      completed: false,
    },
    {
      name: '🍃 Breath guide',
      description: 'Control your breath',
      progressDescription: 'Achievement progress: +50',
      progress: 0,
      xpReward: 55,
      target: 30,
      currentValue: 0,
      unit: 'minutes',
      completed: false,
    },
    {
      name: '🌈 Flow sequence',
      description: 'Master flowing between poses',
      progressDescription: 'Achievement progress: +50',
      progress: 0,
      xpReward: 75,
      target: 30,
      currentValue: 0,
      unit: 'minutes',
      completed: false,
    },
    {
      name: '🧠 Meditation adept',
      description: 'Achieve deeper meditation states',
      progressDescription: 'Achievement progress: +50',
      progress: 0,
      xpReward: 80,
      target: 30,
      currentValue: 0,
      unit: 'minutes',
      completed: false,
    },
    {
      name: '🌙 Moonlight practice',
      description: 'Complete evening yoga sessions',
      progressDescription: 'Achievement progress: +50',
      progress: 0,
      xpReward: 65,
      target: 30,
      currentValue: 0,
      unit: 'minutes',
      completed: false,
    },
    {
      name: '☀️ Morning ritual',
      description: 'Establish a consistent morning routine',
      progressDescription: 'Achievement progress: +50',
      progress: 0,
      xpReward: 70,
      target: 30,
      currentValue: 0,
      unit: 'minutes',
      completed: false,
    },
    {
      name: '🔄 Balanced life',
      description: 'Integrate yoga into daily life',
      progressDescription: 'Achievement progress: +50',
      progress: 0,
      xpReward: 90,
      target: 30,
      currentValue: 0,
      unit: 'minutes',
      completed: false,
    },
  ],

  progress: {
    routesCompleted: 0,
    totalXpGained: 0,
  },
};
