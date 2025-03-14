import { Character } from '../models/character.model';

export const characters: Character[] = [
  {
    _id: 'ascender-template',
    name: 'Ascender',
    level: 1,
    xp: 0,
    xpToNextLevel: 1000,
    avatar: '/assets/ascender-img.jpg',
    class: 'Climber',
    stats: {
      totalWorkouts: 0,
      totalXpGained: 0,
    },
    achievements: [
      {
        name: '🦾 Grip strength',
        description: 'Master your grip power.',
        progress: 0,
        xpReward: 50,
        completed: false,
      },
      {
        name: '🧭 Route master',
        description: 'Conquer different routes.',
        progress: 0,
        xpReward: 60,
        completed: false,
      },
      {
        name: '🧩 Problem solver',
        description: 'Find solutions for routes.',
        progress: 0,
        xpReward: 75,
        completed: false,
      },
      {
        name: '⏱️ Speed climber',
        description: 'Beat your previous times on familiar routes.',
        progress: 0,
        xpReward: 65,
        completed: false,
      },
      {
        name: '🔄 Endurance expert',
        description: 'Maintain climbing stamina for longer sessions.',
        progress: 0,
        xpReward: 80,
        completed: false,
      },
      {
        name: '🧗 Dynamic mover',
        description: 'Master dynamic movements and jumps.',
        progress: 0,
        xpReward: 70,
        completed: false,
      },
      {
        name: '🦶 Footwork finesse',
        description: 'Develop precise foot placement techniques.',
        progress: 0,
        xpReward: 55,
        completed: false,
      },
      {
        name: '🌊 Flow state',
        description: 'Climb with fluid, continuous movements.',
        progress: 0,
        xpReward: 90,
        completed: false,
      },
    ],

    challenges: [
      {
        name: '🌄 Tackle a new climbing route',
        description: 'Complete a new challange route',
        progress: 0,
        xpReward: 100,
      },
    ],
  },
  {
    _id: 'runner-template',
    name: 'Runner',
    level: 1,
    xp: 0,
    xpToNextLevel: 1000,
    avatar: '/assets/running-avatar.jpg',
    class: 'Runner',
    stats: {
      totalWorkouts: 0,
      totalXpGained: 0,
    },
    achievements: [
      {
        name: '🗾 Distance goals',
        description: 'Reach new horizons.',
        progress: 0,
        xpReward: 50,
        completed: false,
      },
      {
        name: '📈 Pace master',
        description: 'Maintain steady speed.',
        progress: 0,
        xpReward: 60,
        completed: false,
      },
      {
        name: '⏱️ Interval training',
        description: 'Master speed variation.',
        progress: 0,
        xpReward: 70,
        completed: false,
      },
      {
        name: '🏃 Sprint champion',
        description: 'Achieve your best speed record.',
        progress: 0,
        xpReward: 65,
        completed: false,
      },
      {
        name: '🌄 Hill conqueror',
        description: 'Master running uphill.',
        progress: 0,
        xpReward: 80,
        completed: false,
      },
      {
        name: '🌱 Trail blazer',
        description: 'Explore off-road running paths.',
        progress: 0,
        xpReward: 75,
        completed: false,
      },
      {
        name: '🏁 Race finisher',
        description: 'Complete a virtual race.',
        progress: 0,
        xpReward: 90,
        completed: false,
      },
      {
        name: '🔄 Consistency champion',
        description: 'Run regularly for a whole week.',
        progress: 0,
        xpReward: 85,
        completed: false,
      },
    ],
    challenges: [
      {
        name: '🌪️ Fast five challenge',
        description: 'Complete a 5km run',
        progress: 0,
        xpReward: 100,
      },
    ],
  },
  {
    _id: 'zen-warrior-template',
    name: 'Zen Warrior',
    level: 1,
    xp: 0,
    xpToNextLevel: 1000,
    avatar: '/assets/yoga-avatar.jpg',
    class: 'Yogi',
    stats: {
      totalWorkouts: 0,
      totalXpGained: 0,
    },
    achievements: [
      {
        name: '✨ Perfect form',
        description: 'Focus on alignment.',
        progress: 0,
        xpReward: 60,
        completed: false,
      },
      {
        name: '🧘 Mind master',
        description: 'Develop inner calm.',
        progress: 0,
        xpReward: 70,
        completed: false,
      },
      {
        name: '🍃 Breath guide',
        description: 'Control your breath.',
        progress: 0,
        xpReward: 55,
        completed: false,
      },
      {
        name: '🌈 Flow sequence',
        description: 'Master flowing between poses.',
        progress: 0,
        xpReward: 75,
        completed: false,
      },
      {
        name: '🧠 Meditation adept',
        description: 'Achieve deeper meditation states.',
        progress: 0,
        xpReward: 80,
        completed: false,
      },
      {
        name: '🌙 Moonlight practice',
        description: 'Complete evening yoga sessions.',
        progress: 0,
        xpReward: 65,
        completed: false,
      },
      {
        name: '☀️ Morning ritual',
        description: 'Establish a consistent morning routine.',
        progress: 0,
        xpReward: 70,
        completed: false,
      },
      {
        name: '🔄 Balanced life',
        description: 'Integrate yoga into daily life.',
        progress: 0,
        xpReward: 90,
        completed: false,
      },
    ],
    challenges: [
      {
        name: '🕊️ Quiet mind',
        description:
          '48 hours without social media or digital devices, focusing on inner calmness',
        progress: 0,
        xpReward: 100,
      },
    ],
  },
];
